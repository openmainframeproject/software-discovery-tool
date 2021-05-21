# Adding new distributions to the tool

This documents details the steps to be performed in order to add a distribution support to software-discovery-tool . 

_**General Notes:**_ 	

 * _A directory `/<DATA_FILE_LOCATION>/` defined in Step 6 of [Installation](Installation.md) document._

 * _A directory `/<SDT_BASE>/` defined in Step 6 of [Installation](Installation.md) document._

### Step 1. Create a JSON file with package data

**The data file should be saved in folder `<DATA_FILE_LOCATION>`:**

    The file name can be preferably named as <DistroName>_<DistroVersion>.json

**Here's sample file naming:**

    Ubuntu_14.04.json

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

### Step 2. Update the SUPPORTED_DISTROS variable in configuration file `/<SDT_BASE>/src/config/config.py`
software-discovery-tool application requires a mapping between each JSON file and relevant Distro Version.  This is done using SUPPORTED_DISTROS object in config file.
SUPPORTED_DISTROS is a dictionary object having the "Distro Name" as the keys.  And each distro name has another dictionary having "Distro Version" has its key and "JSON file as its value"

software-discovery-tool uses the "Distro Name" and "Distro Version" keys to create "Display Names" of check-boxes on the software-discovery-tool main page.  Ensure that there are no duplicate 
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
        'Ubuntu 17.04': 'Ubuntu_17_04.json',
        'Ubuntu 16.10': 'Ubuntu_16_10.json',
        'Ubuntu 16.04': 'Ubuntu_16_04.json'
    }, 
    'SUSE Linux Enterprise Server': {
        'SUSE Linux Enterprise Server 11 SP4': 'Suse_Linux_Enterprise_Server_11_SP4.json',
        'SUSE Linux Enterprise Server 12 SP1': 'Suse_Linux_Enterprise_Server_12_SP1.json',
        'SUSE Linux Enterprise Server 12 SP2': 'Suse_Linux_Enterprise_Server_12_SP2.json'
    }
}
```

### Step 3. Delete the cached data file `<DATA_FILE_LOCATION>/cached_data.json`
In order to search efficiently, the software-discovery-tool caches the data from all JSON files into a single file called as 'cached_data.json'

Cache file maintains the array of following JSON structure...

`{P:<Package Name>, S:<Uppercase variant of P>, V:<Package Version>, B: <Search Flag indicating availability of P in various distro versions>}`

NOTE About `B` search flag field in cache:  software-discovery-tool assigns a binary flag to each distro version when the SUPPORTED_DISTROS is loaded for the first time.  For e.g. referring to the SUPPORTED_DISTROS example given above,
software-discovery-tool may assign following flags to the distros...
```
'Ubuntu_17_04.json' = 1
'Ubuntu_16_10.json' = 2
'Ubuntu_16_04.json' = 4
'Suse_Linux_Enterprise_Server_11_SP4.json' = 8
'Suse_Linux_Enterprise_Server_12_SP1.json' = 16
'Suse_Linux_Enterprise_Server_12_SP2.json' = 32
```
In case the `PackageNameX` is available in in `Ubuntu 16.04` and `Ubuntu 16.10` then the `B` will be set to `6`

Cache file has to be regenerated whenever there is a change in SUPPORTED_DISTROS object.  Hence delete the existing cache as follows:

```
cd <DATA_FILE_LOCATION>
rm -f cached_data.json
```

### Step 4. Restart the server by referring to the steps mentioned in [Installation](Installation.md) document.
