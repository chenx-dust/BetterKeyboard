import os
import struct
import subprocess
from typing import Any, List, Optional, Set

import decky
import asyncio
import evdev_mod

from decky import logger
from settings import SettingsManager


CONFIG_VERSION = 1

class Plugin:
    last_devs: Set[str]
    kb_devs: List[evdev_mod.InputDevice]
    grabbing: bool

    def __init__(self):
        self.settings = SettingsManager(
            name="config", settings_directory=decky.DECKY_PLUGIN_SETTINGS_DIR
        )

    async def _migration(self):
        if self.settings.getSetting("version", 0) < CONFIG_VERSION:
            logger.info("Migrating config")
            self.settings.setSetting("blacklist", [
                "Valve Software Steam Controller",  # Steam Deck
                "Valve Software Steam Deck Controller",  # Steam Deck OLED
                "steamos-manager",
            ])
            self.settings.setSetting("version", CONFIG_VERSION)

    async def _main(self):
        if self.settings.getSetting("debug", False):
            logger.setLevel("DEBUG")
        else:
            self.settings.setSetting("debug", False)
        self.settings.setSetting("version", CONFIG_VERSION)
        self.blacklist = self.settings.getSetting("blacklist")
        logger.info(f"Blacklist: {self.blacklist}")
        self.last_devs = set()
        self.kb_devs = []
        self.grabbing = False
        self.whitelist = []

    async def _unload(self):
        await self.ungrab_keyboards()

    def find_keyboards(self):
        curr_devs = set(evdev_mod.list_devices())
        if curr_devs == self.last_devs:
            logger.debug("No change in devices")
            return
        self.last_devs = curr_devs
        self.kb_devs = []
        for path in evdev_mod.list_devices():
            try:
                dev = evdev_mod.InputDevice(path)
                if dev.name.strip() in self.blacklist:
                    logger.debug("Name blacklisted")
                    continue
                if dev.path.strip() in self.blacklist:
                    logger.debug("Path blacklisted")
                    continue
                if dev.phys.strip() in self.blacklist:
                    logger.debug("Phys blacklisted")
                    continue
                if dev.uniq.strip() in self.blacklist:
                    logger.debug("Uniq blacklisted")
                    continue
                caps = dev.capabilities()
                logger.debug(
                    f"Checking device: {dev.name}, path: {dev.path}, phys: {dev.phys}, uniq: {dev.uniq}, caps: {caps}"
                )
                if evdev_mod.ecodes.EV_KEY not in caps:
                    continue
                key_cnt = 0
                is_keyboard = False
                for code in caps[evdev_mod.ecodes.EV_KEY]:
                    if code < evdev_mod.ecodes.KEY_MACRO:
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
                                logger.debug(f"Prop blacklisted for: {prop}")
                                break
                        if is_banned:
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
                if ev.type not in {evdev_mod.ecodes.EV_KEY, evdev_mod.ecodes.EV_SYN, evdev_mod.ecodes.EV_MSC}:
                    raise Exception(f"Unexpected event type: {ev.type}, maybe not a keyboard?")
                if ev.type != evdev_mod.ecodes.EV_KEY:
                    continue
                if ev.code not in evdev_mod.ecodes.KEY or ev.code >= evdev_mod.ecodes.KEY_MACRO:
                    raise Exception(f"Unusual event code: {ev.code}, let it go")
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
