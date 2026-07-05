import json
import os
import urllib.request, urllib.parse, urllib.error
import collections
import copy
import pymysql 
import math
from config import DATA_FILE_LOCATION, DISABLE_PAGINATION, MAX_RECORDS_TO_CONCAT, LOGGER, MAX_RECORDS_TO_SEND, CACHE_SIZE
from config.supported_distros import SUPPORTED_DISTROS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from the .env file

# User credentials
HOST = os.environ.get('DB_HOST')
USER = os.environ.get('DB_USER')
PASSWORD = os.environ.get('DB_PASSWORD')
DB_NAME = os.environ.get('DB_NAME')

class PackageSearch:
    package_data = {}
    DISTRO_BIT_MAP = {}
    INSTANCE = None   
    
    @classmethod
    def getDataFilePath(cls):
        '''This method will resolve the distributions data path based on configuration file to give actual 
        location of the file.
        '''
        LOGGER.debug('In getDataFilePath')
        return DATA_FILE_LOCATION
        
    @classmethod
    def loadSupportedDistros(cls):
        '''
        Returns list of supported OS distributions in software-discovery-tool
        '''
        LOGGER.debug('loadSupportedDistros: In loadSupportedDistros')
        
        if(len(list(cls.DISTRO_BIT_MAP.keys())) > 0):
            return cls.DISTRO_BIT_MAP
            
        bitFlag = 1        
        distroRecord = {}
        for supportedDistroName in list(SUPPORTED_DISTROS.keys()):
            for distroVersion in sorted(SUPPORTED_DISTROS[supportedDistroName].keys()):
                if(supportedDistroName not in cls.DISTRO_BIT_MAP):
                    cls.DISTRO_BIT_MAP[supportedDistroName] = {}
                cls.DISTRO_BIT_MAP[supportedDistroName][distroVersion] = bitFlag
                bitFlag += bitFlag
        return cls.DISTRO_BIT_MAP

    @classmethod
    def get_instance(cls):
        LOGGER.debug('get_instance: In get_instance')
        if not cls.INSTANCE:
            cls.INSTANCE = PackageSearch()
            cls.INSTANCE.DISTRO_BIT_MAP = cls.loadSupportedDistros()
            LOGGER.debug('get_instance: Creating singleton instance in get_instance')
        return cls.INSTANCE

    @classmethod
    def load(cls):
        LOGGER.debug('In load')
        return cls.get_instance()
        
    #getSupportedDistros - API returns details about supported distros in JSON format
    def getSupportedDistros(self):
        LOGGER.debug('In getSupportedDistros')
        return self.loadSupportedDistros()

    #searchPackages - API searches for given search term in packages array and returns matching results
    def searchPackages(self, search_term, exact_match, search_bit_flag, page_number = 0):
        LOGGER.debug('searchPackages: In function')
        search_term = urllib.parse.unquote(search_term)

        if(len(search_term) == 0 or search_term.replace('*','') == ''):
            final_data = {
            'total_packages': 0,
            'current_page': 0,
            'last_page': 0,
            'more_available': False,
            'packages': []
            }
            return json.dumps(final_data)
            
        LOGGER.debug('searchPackages: search_term : %s' % (search_term))
        LOGGER.debug('searchPackages: exact_match : %s' % (exact_match))
        LOGGER.debug('searchPackages: search_bit_flag : %s' % (search_bit_flag))
        
        search_packages_begin_with = str(search_term).endswith('*')
        search_packages_end_with = str(search_term).startswith('*')
        search_anywhere_in_packages = (search_packages_begin_with and search_packages_end_with) or ('*' not in str(search_term))
        
        LOGGER.debug('searchPackages: search_packages_begin_with : %s' % (search_packages_begin_with))
        LOGGER.debug('searchPackages: search_packages_end_with : %s' % (search_packages_end_with))
        LOGGER.debug('searchPackages: search_anywhere_in_packages : %s' % (search_anywhere_in_packages))
        
        search_term = search_term.replace('*', '')
        search_term_ucase = search_term.upper()
       
        totalLength = len(final_results)
        
        last_page = math.ceil(totalLength/float(MAX_RECORDS_TO_SEND))
        
        if (totalLength <= MAX_RECORDS_TO_SEND):
            LOGGER.debug('searchPackages: Sending all records')
            results = final_results
        else:
            if(page_number == 0):
                startIdx = page_number*MAX_RECORDS_TO_SEND
                endIdx = (page_number*MAX_RECORDS_TO_SEND)+MAX_RECORDS_TO_SEND
                LOGGER.debug('searchPackages: Sending records %s of %s and length of results is %s' % (startIdx,endIdx,totalLength))
                results = final_results[startIdx:endIdx]
                last_page = 1#math.ceil(totalLength/MAX_RECORDS_TO_SEND)
                LOGGER.debug('searchPackages: Applied pagination changes')
            else:
                startIdx = page_number*MAX_RECORDS_TO_SEND
                endIdx = totalLength #(page_number*MAX_RECORDS_TO_SEND)+MAX_RECORDS_TO_SEND
                LOGGER.debug('searchPackages: Sending records %s of %s and length of results is %s' % (startIdx,endIdx,totalLength))
                results = final_results[startIdx:endIdx]
                last_page = 1#math.ceil(totalLength/MAX_RECORDS_TO_SEND)
                LOGGER.debug('searchPackages: Applied pagination changes')
                
        final_data = {
            'total_packages': totalLength,
            'current_page': page_number,
            'last_page': last_page,
            'more_available': totalLength != len(results),
            'packages': results
        }

        LOGGER.debug('searchPackages: Returning from function')

        return json.dumps(final_data)

    def getTables(self,search_bit):
        ans = []
        for distroName in list(SUPPORTED_DISTROS.keys()):
            for distroVersion in sorted(SUPPORTED_DISTROS[distroName].keys()):
                B = self.INSTANCE.DISTRO_BIT_MAP[distroName][distroVersion]
                if B & search_bit>0:
                    ans.append(SUPPORTED_DISTROS[distroName][distroVersion]) 
        return ans

    def searchSQLPackages(self,term,exact_match,bit_flag,page_number):
        if(len(term)==0):
            final_data = {
            'total_packages': 0,
            'current_page': 0,
            'last_page': 0,
            'more_available': False,
            'packages': ()
            }
            return json.dumps(final_data)
        tables = self.getTables(search_bit=bit_flag)
        conn = pymysql.connect(host=HOST,user=USER,password=PASSWORD,database=DB_NAME,autocommit=True)
        curr = conn.cursor()
        rows = ()
        LOGGER.debug(f"We have {len(tables)} tables")
        for table in tables:
            if exact_match==True:
                LOGGER.debug("Exact Match")
                query = f"SELECT packageName,description,version,osName FROM {table} where packageName = %s"
            else:
                LOGGER.debug("NOT EXACT MATCH")
                query = f"SELECT packageName,description,version,osName FROM {table} where packageName REGEXP %s"
            curr.execute(query,(term))
            rows = rows + curr.fetchall()
        total_length = len(rows)
        LOGGER.debug(f"We have {total_length} files")
        last_page = math.ceil(total_length/float(MAX_RECORDS_TO_SEND))
        if total_length<= MAX_RECORDS_TO_SEND:
            results = rows
        else:
            if(page_number == 0):
                startIdx = page_number*MAX_RECORDS_TO_SEND
                endIdx = (page_number*MAX_RECORDS_TO_SEND)+MAX_RECORDS_TO_SEND
                #LOGGER.debug('searchPackages: Sending records %s of %s and length of results is %s' % (startIdx,endIdx,totalLength))
                results = rows[startIdx:endIdx]
                last_page = 1#math.ceil(totalLength/MAX_RECORDS_TO_SEND)
                #LOGGER.debug('searchPackages: Applied pagination changes')
            else:
                startIdx = page_number*MAX_RECORDS_TO_SEND
                endIdx = total_length #(page_number*MAX_RECORDS_TO_SEND)+MAX_RECORDS_TO_SEND
                #LOGGER.debug('searchPackages: Sending records %s of %s and length of results is %s' % (startIdx,endIdx,totalLength))
                results = rows[startIdx:endIdx]
                last_page = 1#math.ceil(totalLength/MAX_RECORDS_TO_SEND)
                #LOGGER.debug('searchPackages: Applied pagination changes')
        
        final_data = {
            'total_packages': total_length,
            'current_page': page_number,
            'last_page': last_page,
            'more_available': total_length != len(results),
            'packages': results
        }
        return json.dumps(final_data)
