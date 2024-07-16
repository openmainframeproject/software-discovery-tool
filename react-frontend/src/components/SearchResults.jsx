import React from "react";

function SearchResults({ results }) {
  return (
    <div className="search-list-container">
      {results.map((result, index) => (
        <div key={index} className="search-list">
          <div className="name-desc">
            <div className="name">{result.packageName}</div>
            <div className="decription">{result.description}</div>
          </div>
          <div className="version-ostag">
            <div className="version-year-wrapper">
              <div className="text-wrapper">Version: {result.version}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchResults;
