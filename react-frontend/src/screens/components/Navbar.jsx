import NavTopSection from "./NavTopSection";
import SearchBar from "./SearchBar";

function Navbar({ setResults }) {
  return (
    <div className="nav-section">
      <NavTopSection />
      <SearchBar setResults={setResults} />
    </div>
  );
}

export default Navbar;
