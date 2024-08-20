import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import '../App.css';

function SearchResults({ results = [], showDesc, itemsPerPage, searchPerformed }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [refinePackageName, setRefinePackageName] = useState('');
  const [selectedDistribution, setSelectedDistribution] = useState('All');
  const [distributions, setDistributions] = useState([]);

  useEffect(() => {
    fetchDistributions();
  }, []);

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

  const filterResults = () => {
    if (!Array.isArray(results)) return [];

    const filteredByName = results.filter((result) => {
      const nameMatch = result.packageName.toLowerCase().includes(refinePackageName.toLowerCase());
      const versionMatch = result.version.toLowerCase().includes(refinePackageName.toLowerCase());
      return nameMatch || versionMatch;
    });

    console.log("Selected Distribution:", selectedDistribution);

    if (selectedDistribution === 'All') {
      return filteredByName;
    } else {
      const filteredByDistribution = filteredByName.filter(result => {
        const matchesDistribution = result.ostag === selectedDistribution;
        console.log(`Matching ${result.packageName} to ${selectedDistribution}: ${matchesDistribution}`);
        return matchesDistribution;
      });
      return filteredByDistribution;
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
    console.log('New Distribution Selected:', e.target.value);
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
              >
                {distributions.map((dist, index) => (
                  <option key={index} value={dist}>
                    {dist}
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
