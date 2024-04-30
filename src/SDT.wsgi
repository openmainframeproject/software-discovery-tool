import sys

sys.path.append('/opt/software-discovery-tool/src/')

from main import app as application
from config import DEBUG_LEVEL, server_host, server_port
from classes import PackageSearch

package_search = PackageSearch()