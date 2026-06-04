/* global BigInt */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import omfLogo from "../images/openmainframe-logo.png";
import SearchResults from './SearchResults.jsx';
import '../App.css';

const DEFAULT_API_BASE_URL = 'http://localhost:5000';

const normalizeApiBaseUrl = (rawUrl) => {
  const trimmedUrl = (rawUrl || '').trim();
  if (!trimmedUrl || trimmedUrl === 'undefined' || trimmedUrl === 'null') {
    return DEFAULT_API_BASE_URL;
  }
  return trimmedUrl.replace(/\/+$/, '');
};

function SearchBar({ onSearchPerformed }) {
  const [input, setInput] = useState("");
  const [searchDescription, setSearchDescription] = useState(true);
  const [results, setResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [osList, setOsList] = useState({});
  const [selectedOS, setSelectedOS] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedParentDistributions, setSelectedParentDistributions] = useState([]);
  const [noDistributionMessage, setNoDistributionMessage] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [lastSearchParams, setLastSearchParams] = useState(null);

  const BASE_URL = useMemo(
    () => normalizeApiBaseUrl(process.env.REACT_APP_API_URL),
    []
  );

  const fetchOSList = useCallback(() => {
    fetch(`${BASE_URL}/getSupportedDistros`)
      .then((response) => response.json())
      .then((data) => {
        setOsList(data);
      })
      .catch((error) => {
        console.error('Error fetching supported distros:', error);
      });
  }, [BASE_URL]);

  useEffect(() => {
    fetchOSList();
  }, [fetchOSList]);

  useEffect(() => {
    const updatedSelectedOS = Object.keys(osList).reduce((acc, os) => {
      acc[os] = selectAll;
      return acc;
    }, {});
    setSelectedOS(updatedSelectedOS);
  }, [selectAll, osList]);

  useEffect(() => {
    onSearchPerformed(searchPerformed);
  }, [searchPerformed, onSearchPerformed]);

  useEffect(() => {
    if (searchPerformed) {
      setNoDistributionMessage(!Object.values(selectedOS).some(Boolean));
    }
  }, [selectedOS, searchPerformed]);

  const generateSearchBitFlag = () => {
    let searchBitFlag = 0n;
    Object.entries(selectedOS).forEach(([os, selected]) => {
      if (selected) {
        const osVersions = osList[os];
        Object.values(osVersions).forEach(bitValue => {
          searchBitFlag |= BigInt(bitValue);
        });
      }
    });
    return searchBitFlag.toString();
  };

  const fetchData = (value, exact, page = 0, limit = itemsPerPage, params = null) => {
    const searchBitFlag = params ? params.searchBitFlag : generateSearchBitFlag();
    const isExact = params ? params.exact : exact;
    const isSearchDescription = params ? params.searchDescription : searchDescription;
    const searchTerm = params ? params.value : value;

    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const apiUrl = `${BASE_URL}/searchPackages?search_term=${encodedSearchTerm}&exact_match=${isExact}&search_bit_flag=${searchBitFlag}&page_number=${page}&search_description=${isSearchDescription}&limit=${limit}`;
    setLoading(true);
    setSearchError("");

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        const transformedResults = data.packages.map(pkg => ({
          packageName: pkg.packageName,
          description: pkg.description || 'No description available',
          version: pkg.version || 'No version information',
          ostag: pkg.osName || 'No OSTag information'
        }));
        setResults(transformedResults);
        setTotalResultsCount(data.total_packages || 0);
        setTotalPages(data.last_page || 0);
        setCurrentPage(page);
        setSearchPerformed(true);
        setLoading(false);
        setLastSearchParams({ value: searchTerm, exact: isExact, searchDescription: isSearchDescription, searchBitFlag });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setSearchError("Failed to fetch results. Please try again.");
        setSearchPerformed(true);
        setLoading(false);
      });
  };

  const handleChange = (value) => {
    setInput(value);
  };

  const validateInput = (value, exact) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (!exact && trimmed.length < 3 && !trimmed.includes('*')) {
      setSearchError("Please enter at least three characters for a pattern search.");
      return false;
    }
    return true;
  };

  const handleSearch = () => {
    if (validateInput(input, false)) {
      fetchData(input, false, 0);
    }
  };

  const handleSearchExact = () => {
    if (validateInput(input, true)) {
      fetchData(input, true, 0);
    }
  };

  const handlePageChange = (newPage) => {
    if (lastSearchParams) {
      fetchData(null, null, newPage, itemsPerPage, lastSearchParams);
    }
  };

  const handleCheckboxChange = () => {
    setSearchDescription(!searchDescription);
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    setItemsPerPage(newLimit);
    if (lastSearchParams) {
      fetchData(null, null, 0, newLimit, lastSearchParams);
    }
  };

  const handleOSCheckboxChange = (os) => {
    setSelectedOS(prev => {
      const updated = { ...prev, [os]: !prev[os] };
      const selectedParents = Object.keys(updated).filter(key => updated[key]);
      setSelectedParentDistributions(selectedParents);
      return updated;
    });
  };

  const handleSelectAllChange = () => {
    setSelectAll(prev => {
      const newSelectAll = !prev;
      setSelectedParentDistributions(newSelectAll ? Object.keys(osList) : []);
      return newSelectAll;
    });
  };

  return (
    <div>
      <div className="search-bar-wrapper">
        <div className="omf-logo">
          <img className="image-11" src={omfLogo} alt="OMF Logo" />
        </div>
        <div className="searchbox">
          <input
            className="searchbox-input"
            name="search"
            placeholder="Search Packages"
            type="text"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
        <div className="search-button-container">
          <button
            className="search-button-container-item bg-customBlue"
            onClick={handleSearch}
            alt="Search button"
          >
            <p className="text-inside-button">Search</p>
          </button>
          <button
            className="search-button-container-item bg-customBlue"
            onClick={handleSearchExact}
            alt="Search Exact button"
          >
            <p className="text-inside-button">Search Exact</p>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center os-checkbox-wrapper mt-4">
        <div className="os-checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAllChange}
              className="mr-2"
            />
            All
          </label>
        </div>
        {Object.keys(osList).map((os, index) => (
          <div key={index} className="os-checkbox-container">
            <label>
              <input
                type="checkbox"
                checked={selectedOS[os] || false}
                onChange={() => handleOSCheckboxChange(os)}
                className="mr-2"
              />
              {os}
            </label>
          </div>
        ))}
      </div>

      {searchPerformed && noDistributionMessage && (
        <div className="text-center text-red-500 mt-2">
          No distribution selected
        </div>
      )}

      <div className="flex justify-center mt-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={searchDescription}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Search Description
        </label>
      </div>

      <div className="text-center mt-2 font-bold">
        Enter the name of the package or at least three characters to enable pattern search. Wildcard ('*') can be used either before or after the search keywords.
      </div>

      {searchError && (
        <div className="text-center mt-2 text-red-600 font-semibold">
          {searchError}
        </div>
      )}

      <div className="results-count text-center sm:text-left">
        {searchPerformed ? (
          totalResultsCount > 0 ? (
            `${totalResultsCount} package${totalResultsCount !== 1 ? 's' : ''} found`
          ) : (
            '0 packages found'
          )
        ) : (
          ''
        )}
      </div>

      {totalResultsCount > 5 && (
        <div className="records-per-page mt-2 flex justify-center sm:justify-start items-center">
          <label className="text-sm">
            Records per page:
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="ml-2 p-1 border rounded text-sm"
            >
              {[5, 10, 20, 30, 40, 50]
                .filter((count) => count <= totalResultsCount || count === 5)
                .map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
            </select>
          </label>
        </div>
      )}

      {loading ? (
        <div className="text-center mt-4">Loading...</div>
      ) : (
        <SearchResults 
          results={results} 
          showDesc={searchDescription} 
          itemsPerPage={itemsPerPage} 
          searchPerformed={searchPerformed} 
          totalResultsCount={totalResultsCount}
          selectedParentDistributions={selectedParentDistributions}
          osList={osList}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default SearchBar;
