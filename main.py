import os
import struct
from typing import Any, List, Optional

import decky
import asyncio
import evdev_mod

logger = decky.logger


class Plugin:
    kb_devs: List[evdev_mod.InputDevice]
    stop_signal: asyncio.Future[None] | None

    async def _main(self):
        self.kb_devs = []
        self.stop_signal = None

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

    async def forward_loop(self):
        f_to_dev = {dev.async_read(): dev for dev in self.kb_devs}
        futures = [f for f in f_to_dev.keys()]
        if self.stop_signal is None or self.stop_signal.done():
            return
        futures.append(self.stop_signal)

        while self.stop_signal is not None and not self.stop_signal.done():
            f = next(asyncio.as_completed(futures))
            if f is self.stop_signal:
                break
            evs: Optional[List[evdev_mod.events.InputEvent]] = await f
            if evs is None:
                self.stop_signal = None
                return
            for ev in evs:
                if ev.type != evdev_mod.ecodes.EV_KEY:
                    continue
                logger.info(f"Event: {ev.code} {ev.value}")
                await decky.emit("keyboard", ev.code, ev.value)
            new_f = f_to_dev[f].async_read()
            futures.remove(f)
            futures.append(new_f)
            f_to_dev[new_f] = f_to_dev.pop(f)

    async def grab_keyboards(self):
        if self.stop_signal and not self.stop_signal.done():
            return
        if self.stop_signal is not None:
            return
        logger.info("Grabbing keyboards")
        self.find_keyboards()
        logger.info("Found keyboards: %s", self.kb_devs)
        to_remove = []
        for dev in self.kb_devs:
            try:
                dev.grab()
                logger.info("Grabbed keyboard: %s", dev.name)
            except:
                logger.error(f"Failed to grab keyboard: {dev.name}")
                to_remove.append(dev)
        [self.kb_devs.remove(dev) for dev in to_remove]
        self.stop_signal = asyncio.Future()
        asyncio.create_task(self.forward_loop())

    async def ungrab_keyboards(self):
        if self.stop_signal is None:
            return
        logger.info("Ungrabbing keyboards")
        self.stop_signal.set_result(None)
        for dev in self.kb_devs:
            try:
                dev.ungrab()
                logger.info("Ungrabbed keyboard: %s", dev.name)
            except:
                logger.error(f"Failed to ungrab keyboard: {dev.name}")
        self.kb_devs.clear()
