import React, { useState } from 'react';
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
      {!searchPerformed && <Carousel />}
    </div>
  );
}

export default LandingPage;
