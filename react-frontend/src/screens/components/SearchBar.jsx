import React, { useState } from "react";

import omfLogo from "../../images/openmainframe-logo.png";

function SearchBar({ setResults }) {
  const [input, setInput] = useState("");

  const fetchData = (value) => {
    fetch(
      "https://raw.githubusercontent.com/openmainframeproject/software-discovery-tool-data/d37ec20db63776674dae7beccfd95e152b0d1e55/data_files/IBMZ_container_registry.json"
    )
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((software) => {
          return (
            value &&
            software &&
            software.packageName &&
            software.packageName.toLowerCase().includes(value)
          );
        });
        setResults(results);
      });
  };

  const handleChange = (value) => {
    setInput(value);
    fetchData(value);
  };

  return (
    <div className="search-bar-wrapper">
      <div className="omf-logo">
        <img className="image-11" src={omfLogo} alt="image 11" />
      </div>
      <div className="searchbox">
        <input
          className="searchbox-input"
          name="rfijidskf"
          placeholder="Search Packages"
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <div className="search-button-container">
        {/* <a>
          <button className="search-button-container-item" alt="search button">
            <p className="text-inside-button">Search</p>
          </button>
        </a> */}
        <button className="search-button-container-item" alt="os dropdown">
          <p className="text-inside-button">All distros</p>
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
