#!/usr/bin/python3
import re
import os

SDT_BASE = '/opt/software-discovery-tool'
DATA_FILE_LOCATION = '%s/distro_data/distro_data' % SDT_BASE
SUPPORTED_DISTRO_FILE = '%s/src/config/supported_distros.py' % SDT_BASE

SLES_reg = r'((x?Suse_Linux_Enterprise_Server)|(x?SUSE_Package_Hub)_SLES)_(\d{2})(_(SP\d))?_?.*\.json'
RHEL_reg = r'(x?RHEL)_(\d{1,2})_(\d{1,2}).*\.json'
Ubuntu_reg = r'(x?Ubuntu)_(\d{1,2})_(\d{1,2}).*\.json'
regexes = [
	re.compile(SLES_reg),
	re.compile(RHEL_reg),
	re.compile(Ubuntu_reg)
]

def scan():
	return os.listdir(DATA_FILE_LOCATION)

def packagetype(file):
	global SLES_reg, RHEL_reg, Ubuntu_reg, regexes
	for ind,reg in enumerate(regexes):
		if reg.match(file):
			addfile(file, ind)

def addfile(file, ind):
	global SLES_reg, RHEL_reg, Ubuntu_reg, regexes
	flag = False
	with open(SUPPORTED_DISTRO_FILE) as DATA:
		data = DATA.read()
	groups = regexes[ind].search(file)
	if not ind == 0:
		if groups.group(1) in data and not file in data:
			start = data.index(groups.group(1)) + len(groups.group(1))+7
			new_data = f"\t'{groups.group(1)} {groups.group(2)}.{groups.group(3)}': '{file}',\n"
			flag = True
	else:
		if groups.group(1).replace('_', ' ') in data and not file in data:
			start = data.index(groups.group(1).replace('_', ' ')) + len(groups.group(1))+7
			new_data = f"\t'SLES {groups.group(4)} {'' if groups.group(6)==None else groups.group(6)}': '{file}',\n"
			flag = True

	if flag:
		with open(SUPPORTED_DISTRO_FILE, 'r+') as DATA:
			DATA.seek(start)
			next_data = DATA.read()
			print(f"Found new file: {file}")
			DATA.seek(start)
			DATA.write(new_data)
			DATA.write(next_data)

def format_data():
	duplicate = []
	with open(SUPPORTED_DISTRO_FILE, 'r+') as DATA:
		old_format = DATA.read()
		DATA.truncate(0)
		new_format = re.sub(r"(json',\n})", "json'\n}", old_format)
		DATA.seek(0)
		DATA.write(new_format)

def del_cache():
	try:
		print("Attempting to delete cached_data.json...")
		os.remove(f'{DATA_FILE_LOCATION}/cached_data.json')
	except:
		print("File not found in directory.")

if __name__ == "__main__":
	print("Scanning distro_data directory...")
	files = scan()
	for file in files:
		packagetype(file)
	format_data()
	del_cache()
	print('Done.')
