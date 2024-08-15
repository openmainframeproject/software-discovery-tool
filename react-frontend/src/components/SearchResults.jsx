import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import '../App.css'; 

function SearchResults({ results = [], showDesc, itemsPerPage, searchPerformed }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [refinePackageName, setRefinePackageName] = useState('');

  const filterResults = () => {
    if (!Array.isArray(results)) return [];
    
    return results.filter((result) => {
      const nameMatch = result.packageName.toLowerCase().includes(refinePackageName.toLowerCase());
      const versionMatch = result.version.toLowerCase().includes(refinePackageName.toLowerCase());
      return nameMatch || versionMatch;
    });
  };

  useEffect(() => {
    const filteredResults = filterResults();
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedResults(filteredResults.slice(start, end));
  }, [currentPage, itemsPerPage, refinePackageName, results]);

  useEffect(() => {
    setCurrentPage(0);
  }, [itemsPerPage, results]);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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

      {shouldShowPagination && (
        <div className="pagination-and-scroll-wrapper flex justify-between items-center mt-4">
          <div className="pagination-wrapper">
            <ReactPaginate
              previousLabel={'previous'}
              nextLabel={'next'}
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
          <button
            onClick={handleScrollToTop}
            className="scroll-to-top flex items-center bg-customBlue text-white py-1 px-3 rounded ml-4 hover:bg-blue-700"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ArrowUpwardIcon className="mr-1" />
            <span>Scroll to Top</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
