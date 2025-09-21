import fcntl
import functools
import os
import select
import struct
from typing import Iterator, Union

from . import ecodes
from .events import InputEvent

EVENT_SIZE = 24


# --------------------------------------------------------------------------
class EvdevError(Exception):
    pass


class EventIO:
    """
    Base class for reading and writing input events.

    This class is used by :class:`InputDevice` and :class:`UInput`.

    - On, :class:`InputDevice` it used for reading user-generated events (e.g.
      key presses, mouse movements) and writing feedback events (e.g. leds,
      beeps).

    - On, :class:`UInput` it used for writing user-generated events (e.g.
      key presses, mouse movements) and reading feedback events (e.g. leds,
      beeps).
    """

    fd: int

    def fileno(self):
        """
        Return the file descriptor to the open event device. This makes
        it possible to pass instances directly to :func:`select.select()` and
        :class:`asyncore.file_dispatcher`.
        """
        return self.fd

    def read_loop(self) -> Iterator[InputEvent]:
        """
        Enter an endless :func:`select.select()` loop that yields input events.
        """

        while True:
            r, w, x = select.select([self.fd], [], [])
            for event in self.read():
                yield event

    def read_one(self) -> Union[InputEvent, None]:
        """
        Read and return a single input event as an instance of
        :class:`InputEvent <evdev.events.InputEvent>`.

        Return ``None`` if there are no pending input events.
        """

        # event -> (sec, usec, type, code, val)
        # event = _input.device_read(self.fd)
        try:
            bs = os.read(self.fd, EVENT_SIZE)
            return InputEvent(*struct.unpack("qqHHi", bs))
        except BlockingIOError:
            return None

    def read(self) -> Iterator[InputEvent]:
        """
        Read multiple input events from device. Return a generator object that
        yields :class:`InputEvent <evdev.events.InputEvent>` instances. Raises
        `BlockingIOError` if there are no available events at the moment.
        """

        # events -> ((sec, usec, type, code, val), ...)
        # events = _input.device_read_many(self.fd)
        try:
            bs = os.read(self.fd, EVENT_SIZE * 64)
        except BlockingIOError:
            return

        for i in range(len(bs) // EVENT_SIZE):
            yield InputEvent(*struct.unpack("qqHHi", bs[i*EVENT_SIZE:(i+1)*EVENT_SIZE]))

    def close(self):
        pass
