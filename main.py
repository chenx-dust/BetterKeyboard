import os
import struct
from typing import Any, List, Optional

import decky
import asyncio
import evdev_mod

logger = decky.logger


class Plugin:
    kb_devs: List[evdev_mod.InputDevice]
    grabbing: bool

    async def _main(self):
        self.kb_devs = []
        self.grabbing = False

    async def _unload(self):
        await self.ungrab_keyboards()

    def find_keyboards(self):
        self.kb_devs = []
        for path in evdev_mod.list_devices():
            try:
                dev = evdev_mod.InputDevice(path)
                caps = dev.capabilities()
                if evdev_mod.ecodes.EV_KEY not in caps:
                    continue
                for code in caps[evdev_mod.ecodes.EV_KEY]:
                    if code <= 88:
                        self.kb_devs.append(dev)
                        logger.info(f"Found keyboard: {dev.name}")
                        break
            except Exception as e:
                logger.exception(f"Error opening {path}: {e}")

    def forward_keyboard_events(self, dev: evdev_mod.InputDevice, loop: asyncio.AbstractEventLoop):
        evs = dev.read()
        for ev in evs:
            if ev.type != evdev_mod.ecodes.EV_KEY:
                continue
            logger.info(f"Event: {ev.code} {ev.value}")
            loop.create_task(decky.emit("keyboard", ev.code, ev.value))

    async def grab_keyboards(self):
        if self.grabbing:
            return
        self.grabbing = True
        logger.info("Grabbing keyboards")
        self.find_keyboards()
        logger.info("Found keyboards: %s", self.kb_devs)
        to_remove = []
        loop = asyncio.get_event_loop()
        for dev in self.kb_devs:
            try:
                dev.grab()
                logger.info("Grabbed keyboard: %s", dev.name)
                loop.add_reader(dev.fd, self.forward_keyboard_events, dev, loop)
            except:
                logger.error(f"Failed to grab keyboard: {dev.name}")
                to_remove.append(dev)
        [self.kb_devs.remove(dev) for dev in to_remove]

    async def ungrab_keyboards(self):
        if not self.grabbing:
            return
        self.grabbing = False
        logger.info("Ungrabbing keyboards")
        loop = asyncio.get_event_loop()
        for dev in self.kb_devs:
            loop.remove_reader(dev.fileno())
            try:
                dev.ungrab()
                logger.info("Ungrabbed keyboard: %s", dev.name)
            except:
                logger.error(f"Failed to ungrab keyboard: {dev.name}")
        self.kb_devs.clear()
