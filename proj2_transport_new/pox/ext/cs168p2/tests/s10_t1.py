# Authors:
# James McCauley, 2018
# amaro, 2018

from tcpip.recoco_sockets import SimpleReSocketApp
from tcpip.tcp_sockets import CLOSED, LISTEN, SYN_RECEIVED, ESTABLISHED, \
                              SYN_SENT, FIN_WAIT_1, FIN_WAIT_2, CLOSING, \
                              TIME_WAIT, CLOSE_WAIT, LAST_ACK
from pox.lib.recoco import task_function, Sleep
from pox.core import core
from tcpip.modulo_math import *
from cs168p2.tests import Tester
from tcpip.tcp_sockets import TXWindow
import random
from ast import literal_eval
from cs168p2.student_socket import proj2_survey
import hashlib

def launch (log_name="test", server_isn=None):
  run_time = 2

  def setup ():
    log = core.getLogger(log_name)
    tester = Tester(log)
    topo = core.sim_topo

    c1 = core.sim_topo.get_node("c1")
    s1 = core.sim_topo.get_node("s1")
    r1 = core.sim_topo.get_node("r1")
    r2 = core.sim_topo.get_node("r2")
    tm = core.sim_topo.time

    def do_score ():
      secret_word = proj2_survey()
      hashed = hashlib.sha256(secret_word.encode('utf-8')).hexdigest()
      tester.expect_eq(
        "571e437548ffbac2cccfa26d7026aa7bd84186d79ca5ab7a5924d9026359b9e0",
        hashed,
        "SHA matches")

    def on_end ():
      try:
        do_score()
        tester.finish()
      except Exception:
        log.exception("Exception during scoring")
      core.quit()

    tm.set_timer_at(float(run_time), on_end)

  core.call_when_ready(setup, ["sim_topo"], "test")
