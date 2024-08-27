#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
from pathlib import Path
from setuptools import find_packages, setup

# Package meta-data.
NAME = 'software-discovery-tool'
DESCRIPTION = "Software Discovery tool is designed to help you discover open source software for zArchitecture/s390x across various sources and repositories. With the Software Discovery Tool, you can conveniently search for software from any source, any repository, anywhere, all in one place."
HOMEPAGE = ""
DOCS = ""

EMAIL = "abc@xyz.com"
AUTHOR = "Apurv Sonawane"
REQUIRES_PYTHON = ">=3.9.0"

# Load the package's verison file and its content.
ROOT_DIR = Path(__file__).resolve().parent
PACKAGE_DIR = ROOT_DIR / 'software-discovery-tool'
with open(PACKAGE_DIR / "__version__.py") as f:
    version = f.readlines()[-1].split()[-1].strip("\"'")

# ger install_reqs from requirements file, used for setup function later
with open(os.path.join(ROOT_DIR, "requirements.txt")) as f:
    # next(f)
    install_reqs = [line.rstrip() for line in f.readlines()
                    if not line.startswith("#") and not line.startswith("git+")]


# get long description from readme file
# with open(os.path.join(ROOT_DIR, "README.md")) as f:
#     long_description = f.read()


setup(name=NAME,
      version=version,
      description=DESCRIPTION,
      long_description_content_type="text/markdown",
      author=AUTHOR,
      author_email=EMAIL,
      python_requires=REQUIRES_PYTHON,
      install_requires=install_reqs,
      license="MIT License",
      packages=find_packages(),
      include_package_data=True,
      keywords=['basf', 'aistore'],
      project_urls={'Homepage:': HOMEPAGE,
                    'Documentation': DOCS}
      )
