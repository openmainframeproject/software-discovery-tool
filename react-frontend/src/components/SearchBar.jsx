import React, { useState } from "react";
import omfLogo from "../images/openmainframe-logo.png";
import SearchResults from './SearchResults'

function SearchBar() {
  const [input, setInput] = useState("");
  const [searchDescription, setSearchDescription] = useState(false);
  const [results, setResults] = useState([]);

  const fetchData = (value, exact) => {
    fetch(
      `https://sdt.openmainframeproject.org/sdt/searchPackages?search_term=${value}&exact_match=${exact}&search_bit_flag=4398046511103`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // setResults(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handleChange = (value) => {
    setInput(value);
  };

  const handleSearch = () => {
    fetchData(input, false);
  };

  const handleSearchExact = () => {
    fetchData(input, true);
  };

  const handleCheckboxChange = () => {
    setSearchDescription(!searchDescription);
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
      <SearchResults results={results} />
    </div>
  );
}

export default SearchBar;