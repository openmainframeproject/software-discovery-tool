import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import SearchResults from "./components/SearchResults";
import { useState } from "react";
function LandingPage() {
  const [results, setResults] = useState([]);
  return (
    <div className="landing-page screen">
      <Navbar setResults={setResults} />
      {/* <HeroSection /> */}
      <SearchResults results={results} />
      {/* <Footer/> */}
    </div>
  );
}

export default LandingPage;
