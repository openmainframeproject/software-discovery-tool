Troubleshooting / FAQ
=====================

This page lists common issues users may encounter when running the Software Discovery Tool and how to resolve them.

1. **Python module errors**  
   - **Cause:** Required Python packages are not installed.  
   - **Solution:** Install all dependencies:

    ```
    python3 -m pip install -r requirements.txt
    ```


2. **Cannot generate reports**  
   - **Cause:** Insufficient permissions or invalid report path.  
   - **Solution:**  
   - Make sure you have write permissions to the output folder.  
   - Check the `report_path` in `config.yaml` and ensure it exists.  

3. **Tool exits unexpectedly or crashes**  
   - **Cause:** Missing dependencies, unsupported OS, or corrupted installation.  
   - **Solution:**  
   - Ensure all Python dependencies are installed.  
   - Verify that your operating system is supported.  
   - Re-clone the repository and reinstall requirements if needed.  

4. **Output format is not as expected**  
   - **Cause:** Configuration settings may be incorrect.  
   - **Solution:**  
   - Check `config.yaml` or environment variables for the `output_format` option.  
   - Make sure it is set to one of the supported formats (e.g., `html`, `pdf`).  

5. **Tool does not detect all installed software**  
   - **Cause:** Some software may require elevated permissions or special paths to detect.  
   - **Solution:**  
   - Run the tool with administrator/root permissions if possible.  
   - Ensure that software paths are included in the system PATH.  

6. **Other unexpected issues**  
   - **Solution:**  
   - Check the terminal output for error messages.  
   - Refer to the `config.yaml` for correct settings.  
   - Open an issue on the [GitHub repository](https://github.com/openmainframeproject/software-discovery-tool/issues) with details.
