import HeroSection from "../components/HeroSection";
import SearchBar from "../components/SearchBar";

import Carousel from "../components/Carousel/Carousel";
// import SearchResults from "../components/SearchResults";

function LandingPage() {
  // const [results, setResults] = useState([]);
  return (
    <div className="page">
      {/* <Navbar setResults={setResults} /> */}
      <SearchBar/>

      <HeroSection />
      {/* <SearchResults results={results} /> */}
      <Carousel/>
      {/* <Footer /> */}
    </div>
  );
}

export default LandingPage;
