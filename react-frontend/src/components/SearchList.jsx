import React from 'react';

export const SearchList = ({ data }) => {
  return (
    <div className="middle-section">
      <div className="upper-section">
        <div className="headline">
          <div className="medium-length-display outfit-bold-black-68px">
            Search Results
          </div>
        </div>
      </div>
      {data.map((item, index) => (
        <div key={index} className="search-result-item">
          <div className="result-name">{item.packageName}</div>
          <div className="result-description">{item.description}</div>
          <div className="result-version">Version: {item.version}</div>
          <div className="result-ostag">OSTag: {item.ostag}</div>
        </div>
      ))}
    </div>
  );
};
