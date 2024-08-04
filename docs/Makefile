# Set the default target to 'help'
.DEFAULT_GOAL := help

# Define variables
PACKAGE_NAME := software-discovery-tool
PYTHON := python3
PIP := pip
PYLINT := pylint
MAKE := make

# Define targets
.PHONY: help
help:
	@echo "Please use 'make <target>' where <target> is one of:"
	@echo "  build        to build the python package"
	@echo "  rebuild      to build the python package"
	@echo "  clean        to remove build artifacts"
	@echo "  install      to install the package and its dependencies"
	@echo "  uninstall    to uninstall the package"
	@echo "  install-dev  to install the package and its dependencies in editable mode"
	@echo "  test         to run the test suite"
	@echo "  lint         to run the linter"



.PHONY: build
build:
	$(PYTHON) setup.py bdist_wheel

.PHONY: rebuild
rebuild:
	$(MAKE) clean
	$(MAKE) build
	$(MAKE) install-dev

.PHONY: clean
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf test_folder

.PHONY: install
install:
	$(PIP) install dist/software-discovery-tool-*py3*.whl

.PHONY: uninstall
uninstall:
	$(PIP) uninstall software-discovery-tool

.PHONY: install-dev
install-dev:
	$(PIP) install -e dist/software-discovery-tool*.whl

.PHONY: test
test:
	$(PYTHON) -m unittest discover tests -v
	@echo "Unit tests passed!"

.PHONY: lint
lint:
	$(PYLINT) .

