import array
from fcntl import ioctl
import struct
from typing import Dict, List, NamedTuple, Optional, Tuple

from . import ecodes

# Constants for bit sizes
IOC_NRBITS = 8
IOC_TYPEBITS = 8
IOC_SIZEBITS = 14
IOC_DIRBITS = 2

# Masks for each bit field
IOC_NRMASK = (1 << IOC_NRBITS) - 1
IOC_TYPEMASK = (1 << IOC_TYPEBITS) - 1
IOC_SIZEMASK = (1 << IOC_SIZEBITS) - 1
IOC_DIRMASK = (1 << IOC_DIRBITS) - 1

# Bit shift constants
IOC_NRSHIFT = 0
IOC_TYPESHIFT = IOC_NRSHIFT + IOC_NRBITS
IOC_SIZESHIFT = IOC_TYPESHIFT + IOC_TYPEBITS
IOC_DIRSHIFT = IOC_SIZESHIFT + IOC_SIZEBITS

# Direction bits
IOC_NONE = 0
IOC_WRITE = 1
IOC_READ = 2

# Helper functions for creating ioctl command numbers
IOC = lambda dir, type_, nr, size: \
    (dir << IOC_DIRSHIFT) | \
    (ord(type_) << IOC_TYPESHIFT) | \
    (nr << IOC_NRSHIFT) | \
    (size << IOC_SIZESHIFT)

# Specific macros for different types of ioctls
IO = lambda type_, nr: IOC(IOC_NONE, type_, nr, 0)
IOR = lambda type_, nr, argtype_size: IOC(IOC_READ, type_, nr, argtype_size)
IOW = lambda type_, nr, argtype_size: IOC(IOC_WRITE, type_, nr, argtype_size)
IOWR = lambda type_, nr, argtype_size: IOC(IOC_READ | IOC_WRITE, type_, nr, argtype_size)

# Lambdas for decoding ioctl numbers
IOC_DIR = lambda nr: (nr >> IOC_DIRSHIFT) & IOC_DIRMASK
IOC_TYPE = lambda nr: (nr >> IOC_TYPESHIFT) & IOC_TYPEMASK
IOC_NR = lambda nr: (nr >> IOC_NRSHIFT) & IOC_NRMASK
IOC_SIZE = lambda nr: (nr >> IOC_SIZESHIFT) & IOC_SIZEMASK
# Direction macros for input/output
IOC_IN = (IOC_WRITE << IOC_DIRSHIFT)
IOC_OUT = (IOC_READ << IOC_DIRSHIFT)
IOC_INOUT = ((IOC_WRITE | IOC_READ) << IOC_DIRSHIFT)

# Size mask and shift
IOCSIZE_MASK = (IOC_SIZEMASK << IOC_SIZESHIFT)
IOCSIZE_SHIFT = IOC_SIZESHIFT

class InputID(NamedTuple):
    bustype: int    # u16
    vendor: int     # u16
    product: int    # u16
    version: int    # u16

    @classmethod
    def size(cls):
        return 8
    @classmethod
    def unpack(cls, data: bytes):
        return cls(*struct.unpack('HHHH', data))

class InputAbsInfo(NamedTuple):
    value: int      # s32
    minimum: int    # s32
    maximum: int    # s32
    fuzz: int       # s32
    flat: int       # s32
    resolution: int # s32

    @classmethod
    def size(cls):
        return 24

    @classmethod
    def unpack(cls, data: bytes):
        return cls(*struct.unpack("iiiiii", data))

    def pack(self) -> bytes:
        return struct.pack("iiiiii", self.value, self.minimum, self.maximum, self.fuzz, self.flat, self.resolution)

EVIOCGVERSION = IOC(IOC_READ, 'E', 0x01, 4)  # 4 bytes for int
EVIOCGID = IOC(IOC_READ, 'E', 0x02, InputID.size())  # Assuming struct input_id is 16 bytes
EVIOCGREP = IOC(IOC_READ, 'E', 0x03, 8)  # 2 unsigned ints = 8 bytes
EVIOCSREP = IOC(IOC_WRITE, 'E', 0x03, 8)
EVIOCGKEYCODE = IOC(IOC_READ, 'E', 0x04, 8)
# EVIOCGKEYCODE_V2 = IOC(IOC_READ, 'E', 0x04, 32)  # Assuming struct input_keymap_entry is 32 bytes
EVIOCSKEYCODE = IOC(IOC_WRITE, 'E', 0x04, 8)
# EVIOCSKEYCODE_V2 = IOC(IOC_WRITE, 'E', 0x04, 32)
EVIOCGNAME = lambda len_: IOC(IOC_READ, 'E', 0x06, len_)
EVIOCGPHYS = lambda len_: IOC(IOC_READ, 'E', 0x07, len_)
EVIOCGUNIQ = lambda len_: IOC(IOC_READ, 'E', 0x08, len_)
EVIOCGPROP = lambda len_: IOC(IOC_READ, 'E', 0x09, len_)

EVIOCGMTSLOTS = lambda len_: IOC(IOC_READ, 'E', 0x0a, len_)
EVIOCGKEY = lambda len_: IOC(IOC_READ, 'E', 0x18, len_)
EVIOCGLED = lambda len_: IOC(IOC_READ, 'E', 0x19, len_)
EVIOCGSND = lambda len_: IOC(IOC_READ, 'E', 0x1a, len_)
EVIOCGSW = lambda len_: IOC(IOC_READ, 'E', 0x1b, len_)
EVIOCGBIT = lambda ev, len_: IOC(IOC_READ, 'E', 0x20 + ev, len_)
EVIOCGABS = lambda abs: IOC(IOC_READ, 'E', 0x40 + abs, InputAbsInfo.size())
EVIOCSABS = lambda abs: IOC(IOC_WRITE, 'E', 0xc0 + abs, InputAbsInfo.size())
# EVIOCSFF = IOC(IOC_WRITE, 'E', 0x80, 64)  # Assuming struct ff_effect is 64 bytes
EVIOCRMFF = IOC(IOC_WRITE, 'E', 0x81, 4)  # 4 bytes for int
EVIOCGEFFECTS = IOC(IOC_READ, 'E', 0x84, 4)  # 4 bytes for int
EVIOCGRAB = IOC(IOC_WRITE, 'E', 0x90, 4)  # 4 bytes for int
EVIOCREVOKE = IOC(IOC_WRITE, 'E', 0x91, 4)  # 4 bytes for int

MAX_NAME_SIZE = 256

def _test_bit(bitmask: bytearray, bit: int):
    return bitmask[bit // 8] & (1 << (bit % 8))

def ioctl_devinfo(fd: int) -> Tuple[int, int, int, int, str, str, str]:
    iid = bytearray(InputID.size())
    ioctl(fd, EVIOCGID, iid, True)
    iid = InputID.unpack(iid)

    name = bytearray(MAX_NAME_SIZE)
    ioctl(fd, EVIOCGNAME(MAX_NAME_SIZE), name, True)
    name = name.decode()

    try:
        phys = bytearray(MAX_NAME_SIZE)
        ioctl(fd, EVIOCGPHYS(MAX_NAME_SIZE), phys, True)
        phys = phys.decode()
    except:
        phys = ""

    try:
        uniq = bytearray(MAX_NAME_SIZE)
        ioctl(fd, EVIOCGUNIQ(MAX_NAME_SIZE), uniq)
        uniq = uniq.decode()
    except:
        uniq = ""

    return iid.bustype, iid.vendor, iid.product, iid.version, name, phys, uniq

def ioctl_capabilities(fd: int) -> Dict[int, List[int | Tuple[int, tuple]]]:
    ev_bits = bytearray(ecodes.EV_MAX // 8 + 1)
    code_bits = bytearray(ecodes.KEY_MAX // 8 + 1)
    absinfo = bytearray(InputAbsInfo.size())
    capabilities = {}
    ioctl(fd, EVIOCGBIT(0, len(ev_bits)), ev_bits, True)
    for ev_type in range(ecodes.EV_MAX):
        if _test_bit(ev_bits, ev_type):
            eventcodes = []
            try:
                ioctl(fd, EVIOCGBIT(ev_type, len(code_bits)), code_bits, True)
            except:
                pass
            for ev_code in range(ecodes.KEY_MAX):
                if _test_bit(code_bits, ev_code):
                    if ev_type == ecodes.EV_ABS:
                        try:
                            ioctl(fd, EVIOCGABS(ev_code), absinfo, True)
                        except:
                            pass
                        py_absinfo = InputAbsInfo.unpack(absinfo)
                        eventcodes.append((ev_code, (
                            py_absinfo.value,
                            py_absinfo.minimum,
                            py_absinfo.maximum,
                            py_absinfo.fuzz,
                            py_absinfo.flat,
                            py_absinfo.resolution,
                        )))
                    else:
                        eventcodes.append(ev_code)
            capabilities[ev_type] = eventcodes
    return capabilities

def ioctl_EVIOCGVERSION(fd: int) -> int:
    res = array.array("i", [0])
    if ioctl(fd, EVIOCGVERSION, res, True) < 0:
        raise OSError
    return res[0]

def ioctl_EVIOCGEFFECTS(fd: int) -> Optional[int]:
    res = array.array("i", [0])
    if ioctl(fd, EVIOCGVERSION, res, True) == -1:
        return None
    return res[0]

def ioctl_EVIOCGPROP(fd: int) -> Optional[List[int]]:
    bs = bytearray((ecodes.INPUT_PROP_MAX+7)//8)
    try:
        if ioctl(fd, EVIOCGPROP(len(bs)), bs, True) == -1:
            return None
    except:
        return None
    
    res = []
    for i in range(ecodes.INPUT_PROP_MAX):
        if _test_bit(bs, i):
            res.append(i)
    return res

def ioctl_EVIOCG_bits(fd: int, evtype: int) -> Optional[List[int]]:
    max = 0
    match evtype:
        case ecodes.EV_LED:
            max = ecodes.LED_MAX
        case ecodes.EV_SND:
            max = ecodes.SND_MAX
        case ecodes.EV_KEY:
            max = ecodes.KEY_MAX
        case ecodes.EV_SW:
            max = ecodes.SW_MAX
        case _:
            return None
    bs = bytearray((max + 7) // 8)
    try:
        match evtype:
            case ecodes.EV_LED:
                ioctl(fd, EVIOCGLED(len(bs)), bs, True)
            case ecodes.EV_SND:
                ioctl(fd, EVIOCGSND(len(bs)), bs, True)
            case ecodes.EV_KEY:
                ioctl(fd, EVIOCGKEY(len(bs)), bs, True)
            case ecodes.EV_SW:
                ioctl(fd, EVIOCGSW(len(bs)), bs, True)
    except:
        return None
    
    res = []
    for i in range(max):
        if _test_bit(bs, i):
            res.append(i)
    return res

def ioctl_EVIOCGRAB(fd: int, grab: int) -> None:
    ret = ioctl(fd, EVIOCGRAB, grab)
    if ret != 0:
        err = OSError("ioctl_EVIOCGRAB")
        err.errno = ret
        raise err

def ioctl_EVIOCGREP(fd: int) -> Tuple[int, int]:
    rep = array.array('I', [0, 0])
    ioctl(fd, EVIOCGREP(len(rep)), rep, True)
    return rep[ecodes.REP_DELAY], rep[ecodes.REP_PERIOD]

def ioctl_EVIOCSREP(fd: int, a1: int, a2: int) -> Optional[int]:
    rep = array.array('I', [a1, a2])
    try:
        ioctl(fd, EVIOCSREP(len(rep)), rep, True)
    except OSError as e:
        return e.errno
    return 0

def ioctl_EVIOCGABS(fd: int, ev_code: int) -> tuple:
    absinfo = bytearray(InputAbsInfo.size())
    ioctl(fd, EVIOCGABS(ev_code), absinfo, True)
    py_absinfo = InputAbsInfo.unpack(absinfo)
    return \
        py_absinfo.value, \
        py_absinfo.minimum, \
        py_absinfo.maximum, \
        py_absinfo.fuzz, \
        py_absinfo.flat, \
        py_absinfo.resolution

def ioctl_EVIOCSABS(fd: int, ev_code: int, *args):
    absinfo = InputAbsInfo(*args).pack()
    ioctl(fd, EVIOCSABS(ev_code), absinfo, True)
