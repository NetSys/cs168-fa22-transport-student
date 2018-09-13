from collections import defaultdict
import itertools
from random import Random
import sys
import weakref

import os
dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(dir_path, "lib"))

import networkx as nx

import sim.api as api
from sim.basics import BasicHost, RoutePacket, Ping
import sim.cable


all_hosts = set()
all_cables = weakref.WeakSet()


class TestHost(BasicHost):
    ENABLE_PONG = False

    def __init__(self):
        super(TestHost,self).__init__()
        self.rxed_pings = defaultdict(list) # src -> list((packet, time))
        self.reset()
        all_hosts.add(self)

    def reset(self):
        self.for_me = 0
        self.not_for_me = 0
        self.unknown = 0
        self.routes = 0
        self.rxed_pings.clear()

    def handle_rx(self, packet, port):
        if isinstance(packet, RoutePacket):
            self.routes += 1
        elif isinstance(packet, Ping):
            self.rxed_pings[packet.src].append((packet, api.current_time()))
            if packet.dst is self:
                self.for_me += 1
            else:
                self.not_for_me += 1
        else:
            self.unknown += 1


DefaultHostType = TestHost


def _set_up_cable_tracking():
    old_new = sim.cable.Cable.__new__
    def new_new(*args, **kw):
        if old_new is object.__new__:
            # This should probably always be the case...
            o = old_new(args[0])
        else:
            o = old_new(*args, **kw)
        all_cables.add(o)
        return o

    sim.cable.Cable.__new__ = staticmethod(new_new)


_set_up_cable_tracking()
sim.cable.BasicCable.DEFAULT_TX_TIME = 0


def pick_action(g, rand):
    """Randomly picks a valid action (add / remove link)."""
    actions = []
    # We can remove any edge as long as the removal doesn't cause a partition.
    actions.extend(("del", u, v) for u, v in set(g.edges) - set(nx.bridges(g)))
    # We can add any router-to-router edge that doesn't exist yet.
    # Hosts are ignored since we can't connect a host to multiple routers.
    actions.extend(
        ("add", u, v) for u, v in nx.non_edges(g)
        if (not isinstance(g.nodes[u]["entity"], api.HostEntity) and
            not isinstance(g.nodes[v]["entity"], api.HostEntity))
    )
    return rand.choice(actions)


def launch(seed=None):
    # Seed the RNG.
    rand = Random()
    if seed is not None:
        rand.seed(float(seed))

    sim.config.default_switch_type.POISON_MODE = True

    # Make sure that each cable has a transmission time of zero.
    for c in all_cables:
        assert c.tx_time == 0, "BUG: cable {} has non-zero transmission time {}".format(c, c.tx_time)

    def comprehensive_test_tasklet():
        """Comprehensive test."""
        try:
            yield 0

            g = nx.Graph()  # Construct a graph for the current topology.
            for c in all_cables:
                assert c.src, "cable {} has no source".format(c)
                assert c.dst, "cable {} has no destination".format(c)

                g.add_node(c.src.entity.name, entity=c.src.entity)
                g.add_node(c.dst.entity.name, entity=c.dst.entity)

                g.add_edge(c.src.entity.name, c.dst.entity.name, latency=c.latency)

            for round in itertools.count():
                api.simlog.info("=== Round %d ===", round+1)
                num_actions = rand.randint(1, 3)
                for i in range(num_actions):
                    yield rand.random() * 2  # Wait 0 to 2 seconds.
                    action, u, v = pick_action(g, rand)
                    if action == "del":
                        api.simlog.info("\tAction %d/%d: remove link %s -- %s" % (i+1, num_actions, u, v))
                        g.remove_edge(u, v)
                        g.nodes[u]["entity"].unlinkTo(g.nodes[v]["entity"])
                    elif action == "add":
                        api.simlog.info("\tAction %d/%d: add link %s -- %s" % (i+1, num_actions, u, v))
                        g.add_edge(u, v)
                        g.nodes[u]["entity"].linkTo(g.nodes[v]["entity"])
                    else:
                        assert False, "unknown action {}".format(action)

                # Wait for convergence.
                max_latency = nx.diameter(g) * 1.05
                yield max_latency

                # Send pair-wise pings.
                assert nx.is_connected(g), "BUG: network partition"
                expected = defaultdict(dict)  # dst -> src -> time

                lengths = dict(nx.shortest_path_length(g))
                for s in all_hosts:
                    for d in all_hosts:
                        if s is d:
                            continue

                        s.ping(d, data=round)
                        latency = lengths[s.name][d.name]
                        when = api.current_time() + latency * 1.05
                        expected[d][s] = when

                # Wait for ping to propagate.
                yield max_latency

                for dst in expected:
                    rxed = dst.rxed_pings
                    for src in set(expected[dst].keys()) | set(rxed.keys()):
                        if src not in rxed:
                            api.simlog.error("\tFAILED: Missing ping: %s -> %s", src, dst)
                            return

                        assert rxed[src]
                        rx_packets = [packet for packet, _ in rxed[src]]
                        if src not in expected[dst]:
                            api.simlog.error("\tFAILED: Extraneous ping(s): %s -> %s %s", src, dst, rx_packets)
                            return

                        if len(rx_packets) > 1:
                            api.simlog.error("\tFAILED: Duplicate ping(s): %s -> %s %s", src, dst, rx_packets)
                            return

                        rx_packet = rx_packets[0]
                        assert isinstance(rx_packet, Ping)
                        if rx_packet.data != round:
                            api.simlog.error("\tFAILED: Ping NOT from current round %d: %s -> %s %s", round, src, dst, rx_packet)
                            return

                        _, actual_time = rxed[src][0]
                        late = actual_time - expected[dst][src]
                        if late > 0:
                            api.simlog.error("\tFAILED: Ping late by %g sec: %s -> %s %s", late, src, dst, rx_packet)
                            return

                    dst.reset()

                api.simlog.info("\tSUCCESS!")

        finally:
            sys.exit()

    api.run_tasklet(comprehensive_test_tasklet)
