import os
import struct
import subprocess
from typing import Any, List, Optional

import decky
import asyncio
import evdev_mod

from decky import logger
from settings import SettingsManager


class Plugin:
    kb_devs: List[evdev_mod.InputDevice]
    grabbing: bool

    async def _main(self):
        self.settings = SettingsManager(
            name="config", settings_directory=decky.DECKY_PLUGIN_SETTINGS_DIR
        )
        if self.settings.getSetting("debug"):
            logger.setLevel("DEBUG")
        self.blacklist = self.settings.getSetting("blacklist")
        logger.debug(f"Blacklist: {self.blacklist}")
        if not self.blacklist:
            self.blacklist = [
                "Valve Software Steam Controller",  # Steam Deck
                "STEAMOS_POWER_BUTTON=1",
            ]
            self.settings.setSetting("blacklist", self.blacklist)
        self.kb_devs = []
        self.grabbing = False
        self.whitelist = []

    async def _unload(self):
        await self.ungrab_keyboards()

    def find_keyboards(self):
        self.kb_devs = []
        for path in evdev_mod.list_devices():
            try:
                dev = evdev_mod.InputDevice(path)
                if dev.name in self.blacklist:
                    logger.debug("Name blacklisted")
                    continue
                if dev.path in self.blacklist:
                    logger.debug("Path blacklisted")
                    continue
                if dev.phys in self.blacklist:
                    logger.debug("Phys blacklisted")
                    continue
                if dev.uniq in self.blacklist:
                    logger.debug("Uniq blacklisted")
                    continue
                caps = dev.capabilities()
                logger.debug(f"Device capabilities: {caps}")
                if evdev_mod.ecodes.EV_KEY not in caps:
                    continue
                key_cnt = 0
                is_keyboard = False
                for code in caps[evdev_mod.ecodes.EV_KEY]:
                    if code <= 88:
                        key_cnt += 1
                    if key_cnt >= 10:
                        is_keyboard = True
                        break
                if not is_keyboard:
                    continue
                if f"{path}-{dev.phys}" not in self.whitelist:
                    try:
                        props = subprocess.check_output(["/usr/bin/udevadm", "info", "-q", "property", path], env={})
                        logger.debug(f"Udevadm info for {path}: {props}")
                        is_banned = False
                        for prop in props.decode().splitlines():
                            if prop in self.blacklist:
                                is_banned = True
                                break
                        if is_banned:
                            logger.debug(f"Prop blacklisted")
                            continue
                        else:
                            self.whitelist.append(f"{path}-{dev.phys}")
                    except Exception as e:
                        logger.error(f"Error checking udevadm: {dev.path}, {e}")
                logger.info(f"Found keyboard: {dev.name}, path: {dev.path}, phys: {dev.phys}, uniq: {dev.uniq}")
                self.kb_devs.append(dev)
            except Exception as e:
                logger.exception(f"Error opening {path}: {e}")

    def forward_keyboard_events(self, dev: evdev_mod.InputDevice, loop: asyncio.AbstractEventLoop):
        try:
            evs = dev.read()
            for ev in evs:
                if ev.type != evdev_mod.ecodes.EV_KEY:
                    continue
                logger.debug(f"Event: {evdev_mod.ecodes.KEY[ev.code]} => {ev.value}")
                loop.create_task(decky.emit("keyboard", ev.code, ev.value))
        except Exception as e:
            logger.exception(f"Error reading from {dev.name}: {e}")
            self.kb_devs.remove(dev)
            loop.remove_reader(dev.fileno())
            dev.close()

    async def grab_keyboards(self):
        if self.grabbing:
            return
        self.grabbing = True
        logger.info("Grabbing keyboards")
        self.find_keyboards()
        to_remove = []
        loop = asyncio.get_event_loop()
        for dev in self.kb_devs:
            try:
                dev.grab()
                logger.debug("Grabbed keyboard: %s", dev.name)
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
                logger.debug("Ungrabbed keyboard: %s", dev.name)
            except:
                logger.error(f"Failed to ungrab keyboard: {dev.name}")
        self.kb_devs.clear()
