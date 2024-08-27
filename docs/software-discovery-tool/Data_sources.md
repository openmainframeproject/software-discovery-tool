# Software Discovery Tool Back-end Data Sources

The Software Discovery Tool has three options for the back-end data sources. Whatever mechanism you use to generate your series of YAML files, once the files are in the `distro_data/data_files/` directory, they are then used to generate the tables in MariaDB with the `bin/database_build.py` script.

## The three options

### 1. Using the Project's Data Sources

The project maintains a set of data sources in the [software-discovery-tool-data](https://github.com/openmainframeproject/software-discovery-tool-data) repository. To use these data sources, the [Cloning Data Directory](https://github.com/openmainframeproject/software-discovery-tool/blob/master/docs/Installation.md#step-5-cloning-data-directory-only-first-time) section of the Installation.md file can be followed.

### 2. Using bin/package_build.py

Users can generate their own data sources by running the `bin/package_build.py` script. This script retrieves the latest data from the canonical resources for all supported distributions. The exceptions are Ubuntu, RHEL, and SLES, for which the data is pulled from the [PDS/distro_data](https://github.com/linux-on-ibm-z/PDS/tree/master/distro_data) repository. The usage can be seen in the [Using data from PDS](https://github.com/openmainframeproject/software-discovery-tool/blob/master/docs/Installation.md#using-data-from-pds) section in the Installation.md file.

### 3. Using Custom Data Sources

Users do not need to use the project's data sources or scripts, and can instead load their own `.json` files. This option may be useful if the tool is being used for architectures not supported by the project or if it's being used internally within an organization to search for software. The`.json` files will be added in the `distro_data/` directory. 

The files should have the following format, with the description field being optional.

```
[
  {
    "packageName": "name",
    "version": "version",
    "description" : "Software Description" // optional
  },
  {
    "packageName": "name",
    "version": "version",
    "description" : "Software Description" // optional
  },
  .
  .
  .
  {
    "packageName": "name",
    "version": "version",
    "description" : "Software Description" // optional
  },
]
```
