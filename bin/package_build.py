#!/bin/python
import requests
import re
import sys

DATA = ""
SDT_BASE = '/opt/software-discovery-tool'
DATA_FILE_LOCATION = '%s/distro_data/distro_data' % SDT_BASE

def purify(dirty):
	dirty_encode = dirty.encode("ascii", "ignore")
	clean = dirty_encode.decode()
	return clean

def debian():
	global DATA, DATA_FILE_LOCATION
	q = 'Debian_Buster_List.json'
	file_name = f'{DATA_FILE_LOCATION}/{q}'
	try:
		req = requests.get(f"https://packages.debian.org/stable/allpackages")
		data = req.text
		if req.status_code == 404:
			raise Exception("404 File not found")
	except Exception as e:
		print("Couldn't pull. Error: ",str(e))
	else:
		ref_data = data.split('<dl>')[1].split('</dl>')[0]
#		cut unwanted unicode by placing regexes here. This is important
		sp_reg = r' \[<.*\]'
		if re.search(sp_reg, ref_data):
			ref_data = re.sub(sp_reg, '', ref_data)
		ref_data = re.sub(r"(<dt><a[^>]*'>)", '{\n\t"packageName": "', ref_data)
		ref_data = re.sub(r"(<\/a>(( \()|(</dt>))+)", '",\n\t"version": "', ref_data)
		ref_data = re.sub(r"\n*(<dd[^>]*>)", "%%<dd>", ref_data)
		ref_data = re.sub(r"((\)<\/dt>)*\n*%%)", '",\n', ref_data)
		ref_data = re.sub(r"(<dd[^>]*>)", '\t"description": "', ref_data)
		ref_data = re.sub(r"(<\/dd>)",'"\n},',ref_data)
#		To remove undecodable ascii chars
		ref_data = purify(ref_data)
		DATA = open(file_name, 'w')
		DATA.write('['+ref_data+'{}\n]')
		DATA.close()
		print(f"Saved!\nfilename: {q}")

def pds(q):
	global DATA, DATA_FILE_LOCATION
	file_name = f'{DATA_FILE_LOCATION}/{q}'
	try:
		req = requests.get(f"https://raw.githubusercontent.com/linux-on-ibm-z/PDS/master/distro_data/{q}")
		data = req.text
		if req.status_code == 404:
			raise Exception("404 File not found")
	except Exception as e:
		print("Couldn't pull. Error: ",str(e))
	else:
		data = purify(data)
		DATA = open(file_name, 'w')
		DATA.write(data)
		DATA.close()
		print(f"Saved!\nfilename: {q}")

if __name__ == "__main__":
	try:	
		file = sys.argv[1]
		if re.match(r'.*\.json', file):
			print(f"Extracting {file} from PDS data ... ")
			pds(file)
		elif file == 'Debian' or file == 'debian':
			print(f"Extracting {file} data ... ")
			debian()
		else:
			raise
	except:
		print(
			"Usage:\n./package_build <exact_file_name.json>\n\t\t\t[if data is from PDS]"
			"\n./package_build debian\n\t\t\t[if data is from Debian]"
			"\n./package_build\n\t\t\t[for displaying this help]\n"
			"Example:\n./package_build RHEL_8_Package_List.json\n./package_build debian")
	else:
		print("Thanks for using SDT!")
