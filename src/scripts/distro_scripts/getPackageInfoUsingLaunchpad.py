import os
import sys
import json
from os import path
# More on launchpad API at https://help.launchpad.net/API/
from launchpadlib.launchpad import Launchpad

from config import DISTROS, MIN_DATA_FILE_SIZE

from classes import PackageSearch, SendEmail

# Using production as we need Live data which is published. Other option is "staging"
launchpad = Launchpad.login_anonymously('Local Package info Caching', 'production')
if len(sys.argv):
    os_name = sys.argv[1]
else:
    os_name = 'ubuntu'

os_obj = launchpad.distributions[os_name]
archive = os_obj.main_archive
final_data = {}

# For each supported distro fetch the data and prepare JSON file
for distro_version in DISTROS[os_name]:
    distro_version = str(float(distro_version))
    series =  os_obj.getSeries(name_or_version=float(distro_version))

    print("Downloading package data for ", series.name)

    pkgs = archive.getPublishedSources(distro_series=series)

    print("Completed Downloading package data for ", series.name)
    print("Data generation to form JSON file starting..")

    # Dump the package name, version and URL in JSON format to a JSON file.
    for i in pkgs:
        key = i.source_package_name
        # Make sure recent version is listed
        if key in final_data and str(i.source_package_version) > str(final_data[key]['version']):
            final_data[key]['version'] = str(i.source_package_version)
        elif key not in final_data:
            final_data[key] = {
                'packageName': str(i.source_package_name),
                'version': str(i.source_package_version)
            }

    print("Data generation to form JSON file ended..")

    package_search = PackageSearch()

    print("Dumping JSON to a local cache")

    temp_file_name = '%s_%s_Package_List.json_temp' % (os_name.upper(), distro_version.replace('.','_'))
    file_name = '%s_%s_Package_List.json' % (os_name.upper(), distro_version.replace('.','_'))
    file_handler = open('%s/%s' % (package_search.getDataFilePath(), temp_file_name), 'w')
    file_handler.write(json.dumps(list(final_data.values())))
    file_handler.close()

    print("Dumping JSON to a local cache complete")

    # Now move the data to actual file, if file size is at least 50KB to avoid incomplete data.
    if os.path.getsize('%s/%s' % (package_search.getDataFilePath(), temp_file_name)) > int(MIN_DATA_FILE_SIZE):
        try:
            # Backup old JSON file with timestamp in archives folder for future reference
            created_on = path.getctime('%s/%s' % (package_search.getDataFilePath(), file_name))
            new_file_name = '%s.%s' % (file_name, str(created_on).replace('.', '_'))
            os.rename('%s/%s' % (package_search.getDataFilePath(), file_name), '%s/archives/%s/%s' % (package_search.getDataFilePath(), os_name.upper(), new_file_name))
        except Exception as ex:
            print(str(ex))
        finally:
            try:
                os.rename('%s/%s' % (package_search.getDataFilePath(), temp_file_name), '%s/%s' % (package_search.getDataFilePath(), file_name))
            except Exception as ex:
                print(str(ex))
