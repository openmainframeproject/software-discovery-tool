from flask import Flask, request, render_template, json, Response, make_response
import logging

from config import server_host, server_port
from config import LOGGER, DEBUG_LEVEL
from classes import PackageSearch


app = Flask(__name__)
# Ensure that the required JSON data file are pre-loaded in memory at the time of server start.
package_search = PackageSearch.load()

@app.route('/')
@app.route('/sdt/faq')
@app.route('/sdt/')
def index():
    resp = make_response(render_template('index.html'))
    resp.headers.set('Cache-Control','no-cache, no-store, must-revalidate')
    resp.headers.set('Pragma','no-cache')
    resp.headers.set('Expires','0')
    return resp

@app.route('/getSupportedDistros')
@app.route('/sdt/getSupportedDistros')
def getSupportedDistros():
    package_search = PackageSearch.load()
    json_data = json.dumps(package_search.getSupportedDistros())
    resp = Response(json_data,mimetype="application/json")
    resp.headers.set('Cache-Control','no-cache, no-store, must-revalidate')
    resp.headers.set('Pragma','no-cache')
    resp.headers.set('Expires','0')
    return resp

@app.route('/searchPackages')
@app.route('/sdt/searchPackages')
def searchPackages():
    package_search = PackageSearch.load()
    search_term = ''
    exact_match = False
    search_bit_flag = 0
    page_number = 0
    try:
        search_term = str(request.args.get('search_term', ''))
        search_term = search_term.lstrip().rstrip()
        exact_match = request.args.get('exact_match', False)
        search_bit_flag = int(request.args.get('search_bit_flag', '0'))
        page_number = int(request.args.get('page_number', '0'))
        
        json_data = package_search.searchSQLPackages(search_term,exact_match,search_bit_flag,page_number)
        resp = Response(json_data,mimetype="application/json")
        resp.headers.set('Cache-Control','no-cache, no-store, must-revalidate')
        resp.headers.set('Pragma','no-cache')
        resp.headers.set('Expires','0')
        return resp
    except Exception as ex:
        LOGGER.error('Error in searchPackages with search parameters: %s', str(ex))


# Logic to start flask server if executed via command line.
if __name__ == '__main__':

    if DEBUG_LEVEL == logging.DEBUG:
        app.debug = True

    app.run(host=server_host, port=server_port)

