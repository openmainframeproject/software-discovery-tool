import SearchList from "./SearchList";

function SearchResults({ results }) {
  return (
    <div className="search-list-container">
      {results.map((result) => {
        return <SearchList result={result} />;
      })}
    </div>
  );
}

export default SearchResults;
