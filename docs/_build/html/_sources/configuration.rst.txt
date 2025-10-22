Configuration
=============

The Software Discovery Tool can be configured using environment variables or a configuration file. Follow these instructions to customize its behavior.

1. **Default configuration file location**  
   The tool looks for a configuration file named `config.yaml` in the project root directory.


2. **Modify configuration options**  
   Open the `config.yaml` file and change the following options as needed:
```
output_format: html
report_path: reports/
scan_depth: full
```


3. **Environment variables**  
You can override configuration options using environment variables:
```
export SDT_OUTPUT_FORMAT=pdf
export SDT_REPORT_PATH=/path/to/reports
```


4. **Custom modules**  
Add any new module paths in the configuration file:
```
modules:
- module1
- module2
```


5. **Save changes**  
After editing the configuration, save the file and rerun the tool to apply new settings.



