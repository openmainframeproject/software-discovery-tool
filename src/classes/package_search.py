import json
import os
import urllib.request, urllib.parse, urllib.error
import collections
import copy
import pymysql 
import math
from config import DATA_FILE_LOCATION, DISABLE_PAGINATION, MAX_RECORDS_TO_CONCAT, LOGGER, MAX_RECORDS_TO_SEND, CACHE_SIZE
from config.supported_distros import SUPPORTED_DISTROS

# Default user credentials
HOST = "localhost"
USER = 'sdtAdmin'
PASSWORD = "admin1234"
DB_NAME = 'sdtDB'

class PackageSearch:
    package_data = {}
    local_cache ={}
    cache_keys = []
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
    def loadPackageData(cls):
        '''
        Returns list of Packages in software-discovery-tool
        '''

        LOGGER.debug('loadPackageData: In loadSupportedDistros')
        distro_data_file = '%s/cached_data.json' % cls.getDataFilePath()
        try:
            json_data = json.load(open(distro_data_file))           
        except:
            LOGGER.warn('loadPackageData: Loading cached distros data failed generating from scratch')
            LOGGER.debug('loadPackageData: start writing distros data')
            json_data = cls.preparePackageData()
            cached_file = open(distro_data_file, 'w')
            cached_file.write(json.dumps(json_data, indent=2, separators=(',', ': ')))
            cached_file.close()
            LOGGER.debug('loadPackageData: end writing distros data')

        LOGGER.debug('loadPackageData: Loading supported distros data')

        return json_data

    @classmethod
    def preparePackageData(cls):
        data_dir = cls.getDataFilePath()
        package_info = [];
        package_data = {};
        cachedPackage = {}
        
        for distroName in list(SUPPORTED_DISTROS.keys()):
            for distroVersion in sorted(SUPPORTED_DISTROS[distroName].keys()):
                distro_file = SUPPORTED_DISTROS[distroName][distroVersion]
            
                package_info = json.load(open('%s/%s' % (data_dir, distro_file)))
                distro_file_name = distro_file                  
                
                for pkg in package_info:
                    try:
                        pkg_key = pkg["packageName"] + '_' + pkg["version"]
                    except Exception as ex:
                        LOGGER.error('preparePackageData: key not found for package %s' % str(ex))
                    if pkg_key not in package_data:
                        cachedPackage = {}
                        cachedPackage["P"] = pkg["packageName"]
                        cachedPackage["S"] = cachedPackage["P"].lower().upper()
                        cachedPackage["V"] = pkg["version"]
                        if "description" in pkg:
                            cachedPackage["D"] = pkg["description"]
                        try:
                            cachedPackage["B"] = cls.DISTRO_BIT_MAP[distroName][distroVersion]
                        except Exception as e:
                            raise #This occurrs only if there is a problem with how SUPPORTED_DISTROS is configured in config py

                        cachedPackage[distroName] = [distroVersion]
                        package_data[pkg_key] = cachedPackage
                    else:
                        if distroName not in package_data[pkg_key]:
                            package_data[pkg_key][distroName] = [distroVersion]
                            package_data[pkg_key]['B'] += cls.DISTRO_BIT_MAP[distroName][distroVersion]
                        else:
                            if distroVersion not in package_data[pkg_key][distroName]:
                                package_data[pkg_key][distroName].append(distroVersion)
                                package_data[pkg_key]['B'] += cls.DISTRO_BIT_MAP[distroName][distroVersion]
                                
        json_data = list(package_data.values())

        return json_data

    @classmethod
    def get_instance(cls):
        LOGGER.debug('get_instance: In get_instance')
        if not cls.INSTANCE:
            cls.INSTANCE = PackageSearch()
            cls.INSTANCE.DISTRO_BIT_MAP = cls.loadSupportedDistros()
            cls.INSTANCE.package_data = cls.loadPackageData()
            cls.INSTANCE.local_cache = {}
            cls.INSTANCE.cache_keys = []
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
        
        cache_key = 'ck_%s_%s_%s' % (search_term, exact_match, search_bit_flag)
        LOGGER.debug('searchPackages: Cache Key is : %s' % (cache_key))
        
        search_term = search_term.replace('*', '')
        search_term_ucase = search_term.upper()
       
        preliminary_results = {}
        if( (cache_key in self.INSTANCE.local_cache) == False ):
            LOGGER.debug('searchPackages: Not available in cache, so make fresh search')
            LOGGER.debug(self.INSTANCE.package_data)
            if (exact_match == True):
                LOGGER.debug('searchPackages: Doing exact search')
                preliminary_results = [s for s in self.INSTANCE.package_data if s['P'] == search_term and (s['B'] & search_bit_flag) > 0]
            elif search_anywhere_in_packages:
                LOGGER.debug('searchPackages: Doing Anywhere Search')
                preliminary_results = [s for s in self.INSTANCE.package_data if search_term_ucase in s['S'] and (s['B'] & search_bit_flag) > 0]
            elif search_packages_begin_with:
                LOGGER.debug('searchPackages: Find names that begin with')
                preliminary_results = [s for s in self.INSTANCE.package_data if str(s['S']).startswith(search_term_ucase) and (s['B'] & search_bit_flag) > 0]
            elif search_packages_end_with:
                LOGGER.debug('searchPackages: Find names that end with')
                preliminary_results = [s for s in self.INSTANCE.package_data if str(s['S']).endswith(search_term_ucase) and (s['B'] & search_bit_flag) > 0]

            final_results = copy.deepcopy(preliminary_results); #Deep Copy is required since we just need to remove the "S" field from returnable result 
            for pkg in final_results:
                del pkg['S']
                
            LOGGER.debug('searchPackages: Search Results Length : %s' % (len(final_results)))
            
            if(len(final_results) > MAX_RECORDS_TO_SEND): #This is a large result set so add it to cache
                LOGGER.debug('searchPackages: Add results to cache')
                if(len(list(self.INSTANCE.local_cache.keys())) >= CACHE_SIZE): #CACHE_SIZE is breached so remove oldest cached object
                    #LOGGER.debug('searchPackages: Cache full. So remove the oldest item. Total of Cached Items: %s' % (len(self.INSTANCE.local_cache.keys()))
                    self.INSTANCE.local_cache.pop(self.INSTANCE.cache_keys[0],None) #self.INSTANCE.cache_keys[0] has the Oldest Cache Key
                    self.INSTANCE.cache_keys.remove(self.INSTANCE.cache_keys[0]) #Remoe the cache_key from cache_keys for it is removed from local_cache
                
                LOGGER.debug('searchPackages: Add new Key to cache_keys for indexing.')
                self.INSTANCE.cache_keys.append(cache_key)     #append the new key to the list of cache_keys
                self.INSTANCE.local_cache[cache_key] = final_results
        else:
            LOGGER.debug('searchPackages: Getting from cache')
            final_results = self.INSTANCE.local_cache[cache_key];
        
        LOGGER.debug('searchPackages: Cache Keys: %s' %(json.dumps(self.INSTANCE.cache_keys)))
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