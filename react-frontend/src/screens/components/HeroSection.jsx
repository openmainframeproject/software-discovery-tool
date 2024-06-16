import heroPic from "../../images/hero-theme-pic.png";
import openMainFrameLogo from "../../images/openmainframeproject-color-1.png";

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
        <img className="hero-image" src={heroPic} alt="hero image" />
      </div>
      <div className="middle-section">
        <img
          className="openmainframeproject-color-1"
          src={openMainFrameLogo}
          alt="openmainframeproject-color 1"
        />
        <div className="sdt-tagline sdt">
          <p className="matches-developers-w valign-text-middle outfit-bold-black-68px">
            Matches Developers With <br />
            Best Open Source Software That
            <br />
            Meets Their Needs.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
