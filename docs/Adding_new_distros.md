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

### Step 2. Update the distribution mapping in `config/distros.json`
Software Discovery application requires a mapping between each JSON file and relevant Distro Version. This is done using the `config/distros.json` file, which is the single source of truth for both the backend and the database build script.

1.  Open `config/distros.json`.
2.  Add your new distribution and its version mapping. The key should be the display name of the distribution, and the value should be another object mapping versions to their corresponding JSON filenames (without the `.json` extension).

Example:
```json
  "Ubuntu": {
    "24.04": "Ubuntu_24.04"
  }
```

### Step 3. Rebuild the Database
After updating the configuration, you must rebuild the SQL database to include the new distribution data:
```bash
# Run the database build script
node bin/database_build.js
```
This script will create the necessary SQL tables and populate them from your JSON files, using the database configuration from `backend/.env`.

### Step 4. Restart the backend and frontend
Refer to the [Installation](Installation.md) document to restart the Node.js backend and React frontend.
