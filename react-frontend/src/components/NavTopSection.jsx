import sdtLogo from "../images/sdt-logo.png";

function NavTopSection() {
  return (
    <div className="navbar-wrapper">
      <div className="sdt-logo sdt">
        <img className="image-12" src={sdtLogo} alt="image12" />
      </div>
      <div className="navbar">
        <div className="navbar-link poppins-bold-black-20px">About</div>
        <div className="navbar-link poppins-bold-black-20px">Blog</div>
        <div className="navbar-link poppins-bold-black-20px">Contact</div>
        <div className="navbar-link poppins-bold-black-20px">Documentation</div>
      </div>
    </div>
  );
}

export default NavTopSection;