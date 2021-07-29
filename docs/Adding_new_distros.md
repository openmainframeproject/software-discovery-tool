# Adding new distributions to the tool

This documents details the steps to be performed in order to add a distribution support to Software Discovery tool.

_**General Notes:**_ 	

 * _A directory `/<DATA_FILE_LOCATION>/` defined in Step 5 of [Installation](Installation.md) document._

 * _A directory `/<SDT_BASE>/` defined in Step 5 of [Installation](Installation.md) document._

### Step 1. Create a JSON file with package data

**The data file should be saved in folder `<DATA_FILE_LOCATION>`:**

    The file name can be preferably named as <DistroName>_<DistroVersion>.json

**Here's sample file naming:**

    Ubuntu_20.04.json

NOTE: File should not be named as `cached_data.json`

The Content of the distribution data JSON file has to be in the following format:

```
[{
    "packageName": "<package_name_1>",
    "version": "<package_version_1>"
},{
    "packageName": "<package_name_2>",
    "version": "<package_version_2>"
},{
.
.
.
.
},{
    "packageName": "<package_name_n>",
    "version": "<package_version_n>"
}]
```

**Here's the sample data:**

```
[{
    "packageName": "ImageMagick-devel",
    "version": "6.4.3.6-7.20.1"
}, {
    "packageName": "KhmerOS-fonts",
    "version": "5.0-105.17"
}, {
    "packageName": "KhmerOS-fonts",
    "version": "5.0-105.17"
}, {
    "packageName": "LibVNCServer",
    "version": "0.9.1-156.1"
}]
```

### Step 2. Update the SUPPORTED_DISTROS variable in file `/<SDT_BASE>/src/config/supported_ditros.py`
Software Discovery application requires a mapping between each JSON file and relevant Distro Version.  This is done using SUPPORTED_DISTROS object in supported_distros file.
SUPPORTED_DISTROS is a dictionary object having the "Distro Name" as the keys.  And each distro name has another dictionary having "Distro Version" has its key and "JSON file as its value"

Software Discovery Tool uses an automatic script `config_build.py` to scan the directory and update the SUPPORTED_DISTROS object accordingly. It is highly crucial to follow the naming file scheme,
which is `<DistroName>_<DistroVersion>.json`. This is helpful for the script to parse through the file name and update the object with the correct distro version and name.
To use the script, just follow:
```
sudo -u apache ./bin/config_build.py
```
With this, it also tries to update all data files taken from PDS to keep them working as the latest versions.

Software Discovery Tool also uses the "Distro Name" and "Distro Version" keys to create "Display Names" of check-boxes on the Software Discovery Tool main page.  Ensure that there are no duplicate
"Distro Name" or "Distro Version" entries.

SUPPORTED_DISTROS must have following structure
```
SUPPORTED_DISTROS = {
    '<Distro Name1>': {
        '<Distro Version 1': '<DistroName1>_<DistroVersion1>.json',
        '<Distro Version 2': '<DistroName1>_<DistroVersion2>.json',
        '<Distro Version 3': '<DistroName1>_<DistroVersion3>.json'
    },
    '<Distro Name2>': {
        '<Distro Version XX': '<DistroName2>_<DistroVersionXX>.json',
        '<Distro Version YY': '<DistroName2>_<DistroVersionYY>.json',
        '<Distro Version ZZ': '<DistroName2>_<DistroVersionZZ>.json'
    }
}
```

**Here's an example:**
```
SUPPORTED_DISTROS = {
    'Ubuntu': {
        'Ubuntu 18.04': 'Ubuntu_18_04.json',
        'Ubuntu 19.04': 'Ubuntu_19_04.json',
        'Ubuntu 20.04': 'Ubuntu_20_04.json'
    }, 
    'SUSE Linux Enterprise Server': {
        'SUSE Linux Enterprise Server 11 SP4': 'Suse_Linux_Enterprise_Server_11_SP4.json',
        'SUSE Linux Enterprise Server 12 SP1': 'Suse_Linux_Enterprise_Server_12_SP1.json',
        'SUSE Linux Enterprise Server 12 SP2': 'Suse_Linux_Enterprise_Server_12_SP2.json'
    }
}
```

### Step 3. Delete the cached data file `<DATA_FILE_LOCATION>/cached_data.json`
In order to search efficiently, the Software Discovery Tool caches the data from all JSON files into a single file called as 'cached_data.json'

Cache file maintains the array of following JSON structure...

`{P:<Package Name>, S:<Uppercase variant of P>, V:<Package Version>, B: <Search Flag indicating availability of P in various distro versions>}`

NOTE About `B` search flag field in cache:  Software Discovery Tool assigns a binary flag to each distro version when the SUPPORTED_DISTROS is loaded for the first time.  For e.g. referring to the SUPPORTED_DISTROS example given above,
Software Discovery Tool may assign following flags to the distros...
```
'Ubuntu_20_04.json' = 1
'Ubuntu_19_04.json' = 2
'Ubuntu_18_04.json' = 4
'Suse_Linux_Enterprise_Server_11_SP4.json' = 8
'Suse_Linux_Enterprise_Server_12_SP1.json' = 16
'Suse_Linux_Enterprise_Server_12_SP2.json' = 32
```
In case the `PackageNameX` is available in in `Ubuntu 20.04` and `Ubuntu 20.10` then the `B` will be set to `6`

Cache file has to be regenerated whenever there is a change in `supported_distros.py` file. Fortunately, `bin/config_build.py` does that for you. Incase, it does not find any cached_data.json file, it says so. With this, it also attempts to update all the PDS data sources, if found any in the directory, to the latest version as available on their repository.
```
sudo -u apache ./bin/config_build.py
Scanning distro_data directory...
Found file: xUbuntu_21_04_Package_List.json
Attempting to update PDS data sources...
Updating xUbuntu_21_04_Package_List.json...
Extracting xUbuntu_21_04_Package_List.json from PDS data ...
Saved!
filename: xUbuntu_21_04_Package_List.json
Thanks for using SDT!
Attempting to delete cached_data.json...
File not found in directory.
Done.
```
### Step 4. Restart the server by referring to the steps mentioned in [Installation](Installation.md) document.
