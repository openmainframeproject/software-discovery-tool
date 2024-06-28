import React from 'react';
import openMainFrameLogo from "../../images/openmainframeproject-color-1.png";

const Footer = () => {
  return (
    <footer className="text-white p-6 bg-gradient-to-r from-blue-900 to-black">
      <div className="container mx-auto flex items-center">
        <img src={openMainFrameLogo} alt="Footer Logo" className="w-100 h-32 mr-4" />
        <p className="text-lg">
          Disclaimer: The package information is provided AS-IS with no representations whatsoever with respect to accuracy and/or completeness. We reserve the right to change the information at any time and without notice. To obtain the most current package information, please visit the official Linux distribution websites or websites for the specific software you're looking into.

          <br /><br />

          Contribute: The source code for the Software Discovery Tool is available here. Some of the source files for the operating systems included in this tool can be found in this data repository. The Software Discovery Tool is a part of the Linux Foundation Open Mainframe Project.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
