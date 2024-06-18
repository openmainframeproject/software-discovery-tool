import { useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Carousel from "../components/Carousel/Carousel";
// import SearchResults from "../components/SearchResults";
// import { useState } from "react";
// import Footer from "../components/Footer/Footer";

function LandingPage() {
  // const [results, setResults] = useState([]);
  return (
    <div className="landing-page screen">
      {/* <Navbar setResults={setResults} /> */}
      <Navbar />
      <HeroSection />
      {/* <SearchResults results={results} /> */}
      <Carousel/>
      {/* <Footer /> */}
    </div>
  );
}

export default LandingPage;
