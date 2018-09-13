"""
A hub, which simply forwards packets by flooding.

This file serves as an example for how to write routers in our framework.  You
DO NOT need to modify or submit this file.
"""

import sim.api as api
import sim.basics as basics


class Hub(basics.Router):
    """
    A dumb hub.

    This just sends every packet it gets out of every port.  On the plus side,
    if there's a way for the packet to get to the destination, this will find
    it.  On the down side, it's probably pretty wasteful.  On the *very* down
    side, if the topology has loops, very bad things are about to happen.
    """

    def handle_data_packet(self, packet, in_port):
        """
        Called when a data packet arrives at this router.

        You may want to forward the packet, drop the packet, etc. here.

        :param packet: the packet that arrived.
        :param in_port: the port from which the packet arrived.
        :return: nothing.
        """
        # We'll just flood the packet out of every port.  Except the one the
        # packet arrived on, since whatever is out that port has obviously
        # seen the packet already!
        self.send(packet, port=in_port, flood=True)
