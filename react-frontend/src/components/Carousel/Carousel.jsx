import React from 'react';
import Slider from "react-slick";
import ubuntu from '../../images/ubuntu.png'; 
import opensuse from '../../images/opensuse.png'; 
import debian from '../../images/debian.png';
import fedora from '../../images/fedora.png';
import rocky from '../../images/rocky.png';
import redhat from '../../images/redhat.png';
import clefos from '../../images/clefos.png';
import zos from '../../images/zos.png'; 
import almalinux from '../../images/almalinux.png';
import './Carousel.css';

function Carousel() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 2000, 
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: 'linear', 
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="support-section">
      <div className="supported-for">
        <div className="supported-text">SUPPORTED FOR</div>
      </div>
      <Slider {...settings} className="os-logos">
        <div>
          <img className="open-suse_-logo-1 w-20 h-20" src={ubuntu} alt="Ubuntu" />
        </div>
        <div>
          <img className="open-suse_-logo-1 w-24 h-20" src={opensuse} alt="OpenSUSE_Logo 1" />
        </div>
        <div>
          <img className="open-suse_-logo-1 w-20 h-20" src={debian} alt="Debian" />
        </div>
        <div>
          <img className="open-suse_-logo-1 w-20 h-20" src={fedora} alt="Fedora Linux" />
        </div>
        <div>
          <img className="open-suse_-logo-1 w-20 h-20" src={rocky} alt="Rocky Linux" />
        </div>
        <div>
          <img className="open-suse_-logo-1 w-20 h-20" src={redhat} alt="Red Hat" />
        </div>
        <div>
          <img className="open-suse_-logo-1 w-20 h-20" src={clefos} alt="ClefOS" />
        </div>
        <div>
          <img className="open-suse_-logo-1 w-20 h-20" src={zos} alt="IBM Z/OS" />
        </div>
        <div>
          <img className="open-suse_-logo-1 w-20 h-20" src={almalinux} alt="AlmaLinux" />
        </div>
      </Slider>
    </div>
  );
}

export default Carousel;