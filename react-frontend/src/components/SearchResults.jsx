import React, { useState, useMemo } from 'react';
import ReactPaginate from 'react-paginate';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import '../App.css';

function SearchResults({ 
  results = [], 
  showDesc, 
  itemsPerPage, 
  searchPerformed, 
  totalResultsCount, 
  selectedParentDistributions, 
  osList,
  currentPage,
  totalPages,
  onPageChange
}) {
  const [refinePackageName, setRefinePackageName] = useState('');

  const filteredResults = useMemo(() => {
    if (!Array.isArray(results)) return [];
    if (!refinePackageName.trim()) return results;
    
    return results.filter((result) => {
      const nameMatch = result.packageName.toLowerCase().includes(refinePackageName.toLowerCase());
      const versionMatch = result.version.toLowerCase().includes(refinePackageName.toLowerCase());
      return nameMatch || versionMatch;
    });
  }, [results, refinePackageName]);

  const handlePageChange = (selectedPage) => {
    onPageChange(selectedPage.selected);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const shouldShowPagination = totalPages > 1;

  return (
    <div className="search-results-container">
      {searchPerformed && results.length > 0 && (
        <div className="refine-filters-container">
          <div className="refine-filters">
            <label>
              Refine results on this page:
              <input
                type="text"
                value={refinePackageName}
                onChange={(e) => setRefinePackageName(e.target.value)}
                placeholder="Search within page..."
                className="ml-2 p-1 border rounded"
              />
            </label>
          </div>
        </div>
      )}

      <div className="search-list-container">
        {filteredResults.map((result, index) => (
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
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageChange}
              forcePage={currentPage}
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
