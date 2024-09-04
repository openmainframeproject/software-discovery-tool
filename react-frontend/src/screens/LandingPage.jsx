import React, { useState } from 'react';
import HeroSection from "../components/HeroSection";
import SearchBar from "../components/SearchBar";
import Carousel from "../components/Carousel/Carousel";

function LandingPage() {
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearchPerformed = (performed) => {
    setSearchPerformed(performed);
  };

  return (
    <div className="page">
      <SearchBar onSearchPerformed={handleSearchPerformed} />
      {!searchPerformed && <HeroSection />}
      {!searchPerformed && <Carousel />}
    </div>
  );
}

export default LandingPage;
