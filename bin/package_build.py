#!/usr/bin/python3
import requests
import re
import sys
import gzip

DATA = ""
SDT_BASE = '/opt/software-discovery-tool'
DATA_FILE_LOCATION = '%s/distro_data/data_files' % SDT_BASE

def purify(dirty):
	dirty_encode = dirty.encode("ascii", "ignore")
	clean = dirty_encode.decode()
	cleaner = clean.replace('"', '')
	return cleaner

def debian():
	global DATA, DATA_FILE_LOCATION
	q = ['Debian_Buster_List.json', 'Debian_Bullseye_List.json']
	urls = ['http://ftp.debian.org/debian/dists/Debian10.11/main/binary-s390x/Packages.gz', 'http://ftp.debian.org/debian/dists/Debian11.0/main/binary-s390x/Packages.gz']
	file_name = [f'{DATA_FILE_LOCATION}/{x}' for x in q]
	for i in range(2):
		try:
			req = requests.get(urls[i])
			data = req.content
			if req.status_code == 404:
				raise Exception("404 File not found")
		except Exception as e:
			print("Couldn't pull. Error: ",str(e))
		else:
			capure_reg = r'^.+\n'
			data_d = gzip.decompress(data)
			data_d_str = str(data_d, 'utf-8')
			data_d_raw = data_d_str.encode
			data_list = re.findall(r'(^((?:Package)|(?:Version)|(?:Description))+: .*)', data_d_str, re.MULTILINE)
			DATA = open(file_name[i], 'w')
			DATA.write('[')
			for each in data_list:
				if each[1] == 'Package':
					DATA.write('{\n\t'+each[0].replace('Package: ', '"packageName": "')+'",\n')
				if each[1] == 'Description':
					ref_data = purify(each[0])
					DATA.write('\t'+ref_data.replace('Description: ', '"description": "')+'"\n},\n')
				if each[1] == 'Version':
					DATA.write('\t'+each[0].replace('Version: ', '"version": "')+'",\n')
			DATA.write('{}]')
			DATA.close()
			print(f"Saved!\nfilename: {q[i]}")

def opensuse():
	global DATA, DATA_FILE_LOCATION
	results = []
	results_str = ''
	q = ['OpenSUSE_Tumbleweed.json', 'OpenSUSE_Leap_15_3.json']
	file_name = [f'{DATA_FILE_LOCATION}/{x}' for x in q]
	source_leap = [f"https://download.opensuse.org/distribution/leap/15.3/repo/oss/{x}" for x in ['s390x', 'noarch']]
	source_tumbleweed = [f"https://download.opensuse.org/ports/zsystems/tumbleweed/repo/oss/{x}" for x in ['s390x', 'noarch']]
	for each in source_tumbleweed:
		try:
			req = requests.get(each)
			data = req.text
			if req.status_code == 404:
				raise Exception("404 File not found")
		except Exception as e:
			print("Couldn't pull. Error: ",str(e))
		else:
			ref_data = re.findall(r"<a href=\"(.*\.rpm)\"><img.*<\/a>", data)
			results.extend(ref_data)
	DATA = open(file_name[0], 'w')
	DATA.write('[')
	for result in results:
		result = re.sub(r'\.(noarch|s390x)\.rpm', '', result)
		pkg = re.search(r'^([\w+\.-]+)-([+~\w\-\.]+)', result)
		each_pkg = f'"packageName": "{pkg.group(1)}","version": "{pkg.group(2)}"'
		each_pkg = '{'+each_pkg+'},'
		DATA.write(each_pkg+'\n')
	DATA.write('{}]')
	DATA.close()
	print(f"Saved!\nfilename: {q[0]}")
	results = []
	for each in source_leap:
		try:
			req = requests.get(each)
			data = req.text
			if req.status_code == 404:
				raise Exception("404 File not found")
		except Exception as e:
			print("Couldn't pull. Error: ",str(e))
		else:
			ref_data = re.findall(r"<a href=\"(.*\.rpm)\"><img.*<\/a>", data)
			results.extend(ref_data)
	DATA = open(file_name[1], 'w')
	DATA.write('[')
	for result in results:
		result = re.sub(r'\.(noarch|s390x)\.rpm', '', result)
		pkg = re.search(r'^([\w+\.-]+)-([+~\w\-\.]+)', result)
		each_pkg = f'"packageName": "{pkg.group(1)}","version": "{pkg.group(2)}"'
		each_pkg = '{'+each_pkg+'},'
		DATA.write(each_pkg+'\n')
	DATA.write('{}]')
	DATA.close()
	print(f"Saved!\nfilename: {q[1]}")

def clefos():
	global DATA, DATA_FILE_LOCATION
	results = []
	q = 'ClefOS_7_List.json'
	file_name = f'{DATA_FILE_LOCATION}/{q}'
	source = [f"https://download.sinenomine.net/clefos/7/base/{x}/" for x in ['s390x','noarch']]
	for each in source:
		try:
			req = requests.get(each)
			data = req.text
			if req.status_code == 404:
				raise Exception("404 File not found")
		except Exception as e:
			print("Couldn't pull. Error: ",str(e))
		else:
			ref_data = re.findall(r"<a href=\"(.*\.rpm)\">.*<\/a>", data)
			results.extend(ref_data)
	DATA = open(file_name, 'w')
	DATA.write('[')
	for result in results:
		result = re.sub(r'\.el.*','', result)
		pkg = re.search(r'([\w+\-]+)-([\w\-\.]+)', result)
		each_pkg = f'"packageName": "{pkg.group(1)}","version": "{pkg.group(2)}"'
		each_pkg = '{'+each_pkg+'},'
		DATA.write(each_pkg+'\n')
	DATA.write('{}]')
	DATA.close()
	print(f"Saved!\nfilename: {q}")

def fedora():
	global DATA,DATA_FILE_LOCATION
	sources = [34, 35]
	pkg_reg = r'<a href="(.*)\.rpm"'
	dirs = '023456789abcdefghijklmnopqrstuvwxyz'
	for i in range(2):
		results = []
		q = f'Fedora_{sources[i]}_List.json'
		file_name = f'{DATA_FILE_LOCATION}/{q}'
		for each in range(len(dirs)):
			link = f"https://dl.fedoraproject.org/pub/fedora-secondary/releases/{sources[i]}/Everything/s390x/os/Packages/{dirs[each]}/"
			try:
				req = requests.get(link)
				data = req.text
				if req.status_code == 404:
					raise Exception(f"404 Directory {dirs[each]} not found")
			except Exception as e:
				print("Couldn't pull. Error: ",str(e))
			else:
				ref_data = re.findall(pkg_reg, data)
				results.extend(ref_data)
		DATA = open(file_name, 'w')
		DATA.write('[\n')
		for each in results:
			each = each.replace('.s390x', '').replace('.noarch', '')
			each = re.sub(r'\.fc\d\d', '', each)
			pkg = re.search(r'([\w+\-]+)-([\w\-\.]+)', each)
			DATA.write('{"packageName": "'+pkg.group(1)+'","version": "'+pkg.group(2)+'"},\n')
		DATA.write('{}\n]')
		DATA.close()
		print(f"Saved!\nfilename: {q}")

def pds(q):
	global DATA,DATA_FILE_LOCATION
	file_name = f'{DATA_FILE_LOCATION}/{q}'
	try:
		req = requests.get(f"https://raw.githubusercontent.com/linux-on-ibm-z/PDS/master/distro_data/{q}")
		data = req.text
		if req.status_code == 404:
			raise Exception("404 File not found")
	except Exception as e:
		print("Couldn't pull. Error: ",str(e))
	else:
		DATA = open(file_name, 'w')
		DATA.write(data)
		DATA.close()
		print(f"Saved!\nfilename: {q}")

if __name__ == "__main__":
	
	try:
		file = sys.argv[1]
	except:
		file = ''
	if re.match(r'.*\.json', file):
		print(f"Extracting {file} from PDS data ... ")
		pds(file)
	elif file == 'Debian' or file == 'debian':
		print(f"Extracting {file} data ... ")
		debian()
	elif file == 'Clef' or file == 'clef':
		print(f"Extracting {file} data ... ")
		clefos()
	elif file == 'OpenSuse' or file == 'opensuse':
		print(f"Extracting data for {file} ... ")
		opensuse()
	elif file == 'Fedora' or file == 'fedora':
		print(f"Extracting data for {file} ... ")
		fedora()
	else:
		print(
			"Usage:\n./package_build <exact_file_name.json>\n\t\t\t[if data is from PDS]"
			"\n./package_build.py debian\n\t\t\t[if data is from Debian]"
			"\n./package_build.py clef\n\t\t\t[if data is from ClefOS]"
			"\n./package_build.py opensuse\n\t\t\t[if data is from OpenSUSE]"
			"\n./package_build.py fedora\n\t\t\t[if data is from Fedora]"
			"\n./package_build.py\n\t\t\t[for displaying this help]\n"
			"Example:\n./package_build.py RHEL_8_Package_List.json\n./package_build.py debian")
	
	print("Thanks for using SDT!")
