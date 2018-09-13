"""
Helper classes for distance vector router.

!!! DO NOT MODIFY THIS FILE !!!
"""
import abc
from collections import namedtuple
from numbers import Number  # Available in Python >= 2.7.
import unittest

from sim.api import HostEntity, get_name


class _ValidatedDict(dict):
    __metaclass__ = abc.ABCMeta

    def __init__(self, *args, **kwargs):
        super(_ValidatedDict, self).__init__(*args, **kwargs)
        for k, v in self.items():
            self.validate(k, v)

    def __setitem__(self, key, value):
        self.validate(key, value)
        return super(_ValidatedDict, self).__setitem__(key, value)

    def update(self, *args, **kwargs):
        super(_ValidatedDict, self).update(*args, **kwargs)
        for k, v in self.items():
            self.validate(k, v)

    @abc.abstractmethod
    def validate(self, key, value):
        """Raises ValueError if (key, value) is invalid."""
        pass


class PeerTable(_ValidatedDict):
    """
    A peer table, storing routes advertised by one neighbor.

    You should use a `PeerTable` instance as a `dict` that maps a
    destination host to a `PeerTableEntry` object.

    You should maintain a peer table for each of the switch's neighbors.
    A peer table should contain all routes advertised by that neighbor.
    """
    def validate(self, dst, entry):
        """Raises ValueError if dst and entry have incorrect types."""
        if not isinstance(dst, HostEntity):
            raise ValueError("destination %s is not a host" % dst)

        if not isinstance(entry, PeerTableEntry):
            raise ValueError("entry %s isn't a peer table entry" % entry)

        if entry.dst != dst:
            raise ValueError("entry destination %s doesn't match key %s" %
                             (entry.dst, dst))

    def __repr__(self):
        if not self:
            return "\t(empty peer table)"

        return ("=== Peer Table ===\n" +
                "\n".join("\t{}".format(v) for v in self.values()))


class PeerTableEntry(namedtuple("PeerTableEntry", ["dst", "latency", "expire_time"])):
    """
    An entry in a peer table, representing a route from a neighbor to some
    destination host.

    Example usage:
        rte = PeerTableEntry(
            dst=h1, latency=10, expire_time=api.current_time()+10
        )
    """

    FOREVER = float("+inf")  # Denotes forever in time.

    def __new__(cls, dst, latency, expire_time):
        """
        Creates a peer table entry, denoting a route advertised by a neighbor.

        A PeerTableEntry is immutable.

        :param dst: the route's destination host.
        :param latency: the route's advertised latency (DO NOT include the link
                        latency to this neighbor).
        :param expire_time: time point (seconds) at which this route expires.
        """
        if not isinstance(dst, HostEntity):
            raise ValueError("Provided destination %s is not a host" % dst)

        if not isinstance(expire_time, Number):
            raise ValueError("Provided expire time %s is not a number"
                             % expire_time)

        if not isinstance(latency, Number):
            raise ValueError("Provided latency %s is not a number" % latency)

        self = super(PeerTableEntry, cls).__new__(cls,
                                                  dst, latency, expire_time)
        return self

    def __repr__(self):
        return "PeerTableEntry(dst={}, latency={}, expire_time={})".format(
            get_name(self.dst), self.latency, self.expire_time
        )


class ForwardingTable(_ValidatedDict):
    """
    A forwarding table for a switch.

    A `ForwardingTable` instance should be used as a `dict` mapping a
    destination host to a ForwardingTableEntry (if any route is known).
    """
    def validate(self, dst, entry):
        """Sets the forwarding table entry for a port."""
        if not isinstance(dst, HostEntity):
            raise ValueError("destination %s is not a host" % dst)

        if not isinstance(entry, ForwardingTableEntry):
            raise ValueError("entry %s isn't a forwarding table entry" % entry)

        if entry.dst != dst:
            raise ValueError("entry destination %s doesn't match key %s" %
                             (entry.dst, dst))

    def __repr__(self):
        if not self:
            return "\t(empty forwarding table)"

        return ("=== Forwarding Table ===\n" +
                "\n".join("\t{}".format(v) for v in self.values()))


class ForwardingTableEntry(namedtuple("ForwardingTableEntry", ["dst", "port", "latency"])):
    """
    An entry in your forwarding table.

    You may compare `ForwardingTableEntry` objects with the `==` and `!=`
    operators.  Two ForwardingTableEntry objects are considered equal if
    they have the same destination, port, and latency.
    """

    def __new__(cls, dst, port, latency):
        """
        Creates an entry, indicating a route from this switch to a host.

        A ForwardingTableEntry is immutable.

        :param dst: destination of this route; MUST be a host.
        :param port: the port that this route takes.
        :param latency: the latency to the destination host from this switch
                        along the route.
        """
        if not isinstance(dst, HostEntity):
            raise ValueError("Provided destination %s is not a host" % dst)

        if not isinstance(port, int):
            raise ValueError("Provided port %s is not an integer" % port)

        if not isinstance(latency, Number):
            raise ValueError("Provided latency %s is not a number" % latency)

        self = super(ForwardingTableEntry, cls).__new__(cls,
                                                        dst, port, latency)
        return self

    def __repr__(self):
        return "ForwardingTableEntry(dst={}, port={}, latency={})".format(
            get_name(self.dst), self.port, self.latency
        )


class TestPeerTableEntry(unittest.TestCase):
    """Unit tests for PeerTableEntry."""
    def test_init_success(self):
        """Ensures __init__ accepts valid arguments."""
        host1 = HostEntity()
        host1.name = "host1"
        PeerTableEntry(dst=host1, latency=10, expire_time=300)
        PeerTableEntry(dst=host1, latency=0.1, expire_time=0.2)
        PeerTableEntry(dst=host1, latency=10,
                       expire_time=PeerTableEntry.FOREVER)

    def test_init_None(self):
        """Ensures __init__ doesn't accept None arguments."""
        host1 = HostEntity()
        host1.name = "host1"

        with self.assertRaises(ValueError):
            PeerTableEntry(dst=None, latency=10, expire_time=300)

        with self.assertRaises(ValueError):
            PeerTableEntry(dst=host1, latency=None, expire_time=300)

        with self.assertRaises(ValueError):
            PeerTableEntry(dst=host1, latency=10, expire_time=None)

    def test_init_types(self):
        """Ensures __init__ rejects incorrectly typed arguments."""
        host1 = HostEntity()
        host1.name = "host1"

        with self.assertRaises(ValueError):
            PeerTableEntry(dst="host1", latency=10, expire_time=300)

        with self.assertRaises(ValueError):
            PeerTableEntry(dst=host1, latency="hi", expire_time=300)

        with self.assertRaises(ValueError):
            PeerTableEntry(dst=host1, latency=10, expire_time="oops")

    def test_equality(self):
        """Tests __eq__, __ne__, and __hash__ implementations."""
        host1 = HostEntity()
        host1.name = "host1"
        host2 = HostEntity()
        host2.name = "host2"

        rte1 = PeerTableEntry(dst=host1, latency=10, expire_time=300)
        rte2 = PeerTableEntry(dst=host1, latency=10, expire_time=300)
        self.assertEqual(rte1, rte2)
        self.assertTrue(rte1 == rte2)
        self.assertFalse(rte1 != rte2)
        self.assertEqual(hash(rte1), hash(rte2))

        rte3 = PeerTableEntry(dst=host2, latency=10, expire_time=300)
        self.assertNotEqual(rte1, rte3)
        self.assertFalse(rte1 == rte3)
        self.assertTrue(rte1 != rte3)

        rte4 = PeerTableEntry(dst=host1, latency=0, expire_time=300)
        self.assertNotEqual(rte1, rte4)
        self.assertFalse(rte1 == rte4)
        self.assertTrue(rte1 != rte4)

        rte5 = PeerTableEntry(dst=host1, latency=10, expire_time=500)
        self.assertNotEqual(rte1, rte5)
        self.assertFalse(rte1 == rte5)
        self.assertTrue(rte1 != rte5)

    def test_equality_forever(self):
        """Makes sure expire_time=FOREVER doesn't mess with equality tests."""
        host1 = HostEntity()
        host1.name = "host1"

        rte1 = PeerTableEntry(dst=host1, latency=10,
                              expire_time=PeerTableEntry.FOREVER)
        rte2 = PeerTableEntry(dst=host1, latency=10,
                              expire_time=PeerTableEntry.FOREVER)
        self.assertEqual(rte1, rte2)
        self.assertTrue(rte1 == rte2)
        self.assertFalse(rte1 != rte2)
        self.assertEqual(hash(rte1), hash(rte2))


class TestForwardingTableEntry(unittest.TestCase):
    """Unit tests for ForwardingTableEntry."""
    def test_init_success(self):
        """Ensures __init__ accepts valid arguments."""
        host1 = HostEntity()
        host1.name = "host1"
        ForwardingTableEntry(dst=host1, port=5, latency=10)
        ForwardingTableEntry(dst=host1, port=1, latency=0.8)

    def test_init_None(self):
        """Ensures __init__ doesn't accept None arguments."""
        host1 = HostEntity()
        host1.name = "host1"

        with self.assertRaises(ValueError):
            ForwardingTableEntry(dst=None, port=5, latency=10)

        with self.assertRaises(ValueError):
            ForwardingTableEntry(dst=host1, port=None, latency=10)

        with self.assertRaises(ValueError):
            ForwardingTableEntry(dst=host1, port=5, latency=None)

    def test_init_types(self):
        """Ensures __init__ rejects incorrectly typed arguments."""
        host1 = HostEntity()
        host1.name = "host1"

        with self.assertRaises(ValueError):
            ForwardingTableEntry(dst="host1", port=5, latency=10)

        with self.assertRaises(ValueError):
            ForwardingTableEntry(dst=host1, port=0.1, latency=10)

        with self.assertRaises(ValueError):
            ForwardingTableEntry(dst=host1, port="hi", latency=10)

        with self.assertRaises(ValueError):
            ForwardingTableEntry(dst=host1, port=5, latency="hi")

    def test_equality(self):
        """Tests __eq__, __ne__, and __hash__ implementations."""
        host1 = HostEntity()
        host1.name = "host1"
        host2 = HostEntity()
        host2.name = "host2"

        fte1 = ForwardingTableEntry(dst=host1, port=5, latency=10)
        fte2 = ForwardingTableEntry(dst=host1, port=5, latency=10)
        self.assertEqual(fte1, fte2)
        self.assertTrue(fte1 == fte2)
        self.assertFalse(fte1 != fte2)
        self.assertEqual(hash(fte1), hash(fte2))

        fte3 = ForwardingTableEntry(dst=host2, port=5, latency=10)
        self.assertNotEqual(fte1, fte3)
        self.assertFalse(fte1 == fte3)
        self.assertTrue(fte1 != fte3)

        fte4 = ForwardingTableEntry(dst=host1, port=1, latency=10)
        self.assertNotEqual(fte1, fte4)
        self.assertFalse(fte1 == fte4)
        self.assertTrue(fte1 != fte4)

        fte5 = ForwardingTableEntry(dst=host1, port=5, latency=100)
        self.assertNotEqual(fte1, fte5)
        self.assertFalse(fte1 == fte5)
        self.assertTrue(fte1 != fte5)
