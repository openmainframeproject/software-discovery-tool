import heroPic from "../images/hero-theme-pic.png";
import openMainFrameLogo from "../images/openmainframeproject-color-1.png";

function HeroSection() {
  return (
    <div>
      <div className="hero-section">
        <div className="headline">
          <h1 className="medium-length-display outfit-bold-black-68px">
            Packages From
            <br />
            any Source
            <br />
            any Repository <br />
            in One Place.
          </h1>
          <p className="discover-open-source">
            Discover Open Source Packages For <br />
            Z architecture/s390x On Any Z Operating<br />
            system In One Place.
          </p>
        </div>
        <img className="hero-image" src={heroPic} alt="hero_image" />
      </div>
     
    </div>
  );
}

export default HeroSection;
