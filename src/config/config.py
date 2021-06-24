import urllib.request, urllib.error, urllib.parse
import logging

SDT_BASE = '/opt/software-discovery-tool'
DATA_FILE_LOCATION = '%s/distro_data/distro_data' % SDT_BASE
LOG_FILE_LOCATION = '%s/log/sdt.log' % SDT_BASE
MIN_DATA_FILE_SIZE = 50000
MAX_RECORDS_TO_CONCAT = 5000
MAX_RECORDS_TO_SEND = 100
CACHE_SIZE = 10
STATS_FILE_LOCATION = '/opt/software-discovery-tool/stats'
proxy_user = 'proxy_user'
proxy_password = 'proxy_password'
proxy_server = 'proxy_server'
proxy_port = 'proxy_port'

enable_proxy_authentication = False
server_host = '0.0.0.0'
server_port = 5000

DISABLE_PAGINATION = False
STATS_SECRET='new123T'

'''
Following are the various debug levels:
CRITICAL
ERROR
WARNING
INFO
DEBUG
NOTSET
Refer https://docs.python.org/2/library/logging.html for more information.
'''
DEBUG_LEVEL = logging.ERROR

SUPPORTED_DISTROS = {
	'ZOS': {
		'ZOS Software': 'ZOS_Software_List.json'
	}
}

logging.basicConfig(format='%(asctime)s %(message)s', filename=LOG_FILE_LOCATION, level=DEBUG_LEVEL)

LOGGER = logging.getLogger('SDT_SERVER')
   
# In case application is hosted on server with proxy, set "enable_proxy_authentication = True" in config.py 
# and update the proxy details
def proxy_authentication():
    proxy = urllib.request.ProxyHandler({'http': 'http://%s:%s@%s:%s' % (proxy_user, proxy_password, proxy_server, proxy_port),
      'https': 'https://%s:%s@%s:%s' % (proxy_user, proxy_password, proxy_server, proxy_port)}
    )
    auth = urllib.request.HTTPBasicAuthHandler()
    opener = urllib.request.build_opener(proxy, auth, urllib.request.HTTPHandler)
    urllib.request.install_opener(opener)
