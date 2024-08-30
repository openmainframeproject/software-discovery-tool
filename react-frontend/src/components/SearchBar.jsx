import React, { useState, useEffect } from "react";
import omfLogo from "../images/openmainframe-logo.png";
import SearchResults from './SearchResults';
import '../App.css';

function SearchBar({ onSearchPerformed }) {
  const [input, setInput] = useState("");
  const [searchDescription, setSearchDescription] = useState(true);
  const [results, setResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [osList, setOsList] = useState({});
  const [selectedOS, setSelectedOS] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [selectedParentDistributions, setSelectedParentDistributions] = useState([]);
  const [noDistributionMessage, setNoDistributionMessage] = useState(false);

  useEffect(() => {
    fetchOSList();
  }, []);

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
      setNoDistributionMessage(isNoDistributionSelected());
    }
  }, [selectedOS, searchPerformed]);

  const fetchOSList = () => {
    fetch("https://sdt.openmainframeproject.org/sdt/getSupportedDistros")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setOsList(data);
      });
  };

  const generateSearchBitFlag = () => {
    let searchBitFlag = 0;
    Object.entries(selectedOS).forEach(([os, selected]) => {
      if (selected) {
        const osVersions = osList[os];
        Object.values(osVersions).forEach(bitValue => {
          searchBitFlag |= bitValue;
        });
      }
    });
    return searchBitFlag;
  };

  const fetchData = (value, exact) => {
    const selectedOSList = Object.keys(selectedOS).filter(key => selectedOS[key]);
    const osFilters = selectedOSList.length ? `&os_filters=${selectedOSList.join(',')}` : '';

    const searchBitFlag = generateSearchBitFlag();

    const apiUrl = `https://sdt.openmainframeproject.org/sdt/searchPackages?search_term=${value}&exact_match=${exact}&search_bit_flag=${searchBitFlag}${osFilters}`;
    
    console.log("Fetch URL:", apiUrl);
    setLoading(true);

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const transformedResults = data.packages.map(pkg => ({
          packageName: pkg[0],
          description: pkg[1] || 'No description available',
          version: pkg[2] || 'No version information',
          ostag: pkg[3] || 'No OSTag information'
        }));
        setResults(transformedResults);
        setTotalResultsCount(data.total_packages || transformedResults.length);
        setResultsCount(transformedResults.length);
        setSearchPerformed(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setSearchPerformed(true);
        setLoading(false);
      });
  };

  const handleChange = (value) => {
    setInput(value);
  };

  const handleSearch = () => {
    if (input.trim()) {
      fetchData(input, false);
    } else {
      setResults([]);
      setResultsCount(0);
      setSearchPerformed(false);
    }
  };

  const handleSearchExact = () => {
    if (input.trim()) {
      fetchData(input, true);
    } else {
      setResults([]);
      setResultsCount(0);
      setSearchPerformed(false);
    }
  };

  const handleCheckboxChange = () => {
    setSearchDescription(!searchDescription);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
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

  const isNoDistributionSelected = () => {
    return !Object.values(selectedOS).some(selected => selected);
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

      {resultsCount >= 5 && (
        <div className="records-per-page mt-2 flex justify-center sm:justify-start items-center">
          <label className="text-sm">
            Records per page:
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="ml-2 p-1 border rounded text-sm"
            >
              {[5, 10, 20, 30, 40, 50]
                .filter((count) => count <= resultsCount)
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
        />
      )}
    </div>
  );
}

export default SearchBar;
