import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import '../App.css';

function SearchResults({ results = [], showDesc, itemsPerPage, searchPerformed, totalResultsCount }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [refinePackageName, setRefinePackageName] = useState('');
  const [selectedDistribution, setSelectedDistribution] = useState('All');
  const [distributions, setDistributions] = useState([]);
  const [distributionCounts, setDistributionCounts] = useState({});
  const [matchingCounts, setMatchingCounts] = useState({});

  useEffect(() => {
    fetchDistributions();
  }, []);

  useEffect(() => {
    calculatePackageCounts();
    calculateMatchingCounts();
    if (searchPerformed) {
      setSelectedDistribution('All'); 
    }
  }, [results, refinePackageName, searchPerformed]);

  const fetchDistributions = async () => {
    try {
      const response = await fetch('https://sdt.openmainframeproject.org/sdt/getSupportedDistros');
      const data = await response.json();

      const childDistributions = Object.keys(data).flatMap(parent => 
        Object.keys(data[parent])
      );

      setDistributions(['All', ...childDistributions]);
    } catch (error) {
      console.error('Error fetching distributions:', error);
    }
  };

  const calculatePackageCounts = () => {
    const counts = results.reduce((acc, result) => {
      const ostag = result.ostag || 'Unknown';
      if (!acc[ostag]) acc[ostag] = 0;
      acc[ostag]++;
      return acc;
    }, {});

    counts['All'] = results.length;

    setDistributionCounts(counts);
  };

  const calculateMatchingCounts = () => {
    const filteredByName = results.filter((result) => {
      const nameMatch = result.packageName.toLowerCase().includes(refinePackageName.toLowerCase());
      const versionMatch = result.version.toLowerCase().includes(refinePackageName.toLowerCase());
      return nameMatch || versionMatch;
    });

    const counts = filteredByName.reduce((acc, result) => {
      const ostag = result.ostag || 'Unknown';
      if (!acc[ostag]) acc[ostag] = 0;
      acc[ostag]++;
      return acc;
    }, {});

    counts['All'] = filteredByName.length;

    setMatchingCounts(counts);
  };

  const filterResults = () => {
    if (!Array.isArray(results)) return [];

    const filteredByName = results.filter((result) => {
      const nameMatch = result.packageName.toLowerCase().includes(refinePackageName.toLowerCase());
      const versionMatch = result.version.toLowerCase().includes(refinePackageName.toLowerCase());
      return nameMatch || versionMatch;
    });

    if (selectedDistribution === 'All') {
      return filteredByName;
    } else {
      return filteredByName.filter(result => result.ostag === selectedDistribution);
    }
  };

  useEffect(() => {
    const filteredResults = filterResults();
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedResults(filteredResults.slice(start, end));
  }, [currentPage, itemsPerPage, refinePackageName, results, selectedDistribution]);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDistributionChange = (e) => {
    setSelectedDistribution(e.target.value);
  };

  const shouldShowPagination = filterResults().length > itemsPerPage;

  return (
    <div className="search-results-container">
      {searchPerformed && (
        <div className="refine-filters-container">
          <div className="refine-filters">
            <label>
              Refine package name/version:
              <input
                type="text"
                value={refinePackageName}
                onChange={(e) => setRefinePackageName(e.target.value)}
                placeholder="Enter package name or version"
              />
            </label>
          </div>
          <div className="refine-filters">
            <label>
              Distribution:
              <select
              value={selectedDistribution}
              onChange={handleDistributionChange}
              style={{ marginLeft: '10px', borderRadius: '15px' }}
              >
              {distributions.map((dist, index) => (
              <option key={index} value={dist}>
                {dist === 'All' 
                  ? `${dist} (${totalResultsCount}/${distributionCounts[dist] || 0})`
                  : `${dist} (${matchingCounts[dist] || 0}/${distributionCounts[dist] || 0})`}
              </option>
            ))}
          </select>
            </label>
          </div>
        </div>
      )}

      <div className="search-list-container">
        {paginatedResults.map((result, index) => (
          <div key={index} className="search-list">
            <div className="version-tags">
              {result.version.split(', ').map((ver, i) => (
                <div key={i} className="version-tag">
                  {ver}
                </div>
              ))}
            </div>
            <div className="content">
              <div className="name">{result.packageName}</div>
              {showDesc && (
                <div className="description">{result.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-and-scroll-wrapper">
        {shouldShowPagination && (
          <div className="pagination-wrapper">
            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              pageCount={Math.ceil(filterResults().length / itemsPerPage)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageChange}
              containerClassName={'pagination'}
              pageClassName={'page-item'}
              pageLinkClassName={'page-link'}
              previousClassName={'page-item'}
              previousLinkClassName={'page-link'}
              nextClassName={'page-item'}
              nextLinkClassName={'page-link'}
              breakClassName={'page-item'}
              breakLinkClassName={'page-link'}
              activeClassName={'active'}
            />
          </div>
        )}
        
        {searchPerformed && (
          <button
            onClick={handleScrollToTop}
            className="scroll-to-top"
          >
            <ArrowUpwardIcon className="mr-1" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
