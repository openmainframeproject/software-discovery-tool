import unittest
import requests
import os, sys
modulepath='../config/config.py'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(modulepath))))
from config.config import server_host

class TestFlask(unittest.TestCase):

    routes = ['pds','getSupportedDistros','faq']
    base_route='http://' + server_host + ':80/'

    def test_web_app_running(self):
        try:
             r = requests.get(self.base_route)
        except:
            self.fail("Could not open web app. Not running, or crashed. Test Failed")

    def test_routes(self):
        for i in self.routes:
            try:
                r = requests.get(self.base_route + i)
            except:
                self.fail('Can not render route: {0}'.format(i))


if __name__ == "__main__":
    unittest.main(warnings='ignore', failfast = True)
