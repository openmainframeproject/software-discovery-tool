import sdtLogo from "../../images/sdt-logo.png";

function NavTopSection() {
  return (
    <div className="navbar-wrapper">
      <div className="sdt-logo sdt">
        <img className="image-12" src={sdtLogo} alt="image 12" />
      </div>
      <div className="navbar">
        <div className="navbar-link poppins-bold-black-20px">about</div>
        <div className="navbar-link poppins-bold-black-20px">blog</div>
        <div className="navbar-link poppins-bold-black-20px">contact</div>
        <div className="navbar-link poppins-bold-black-20px">documentation</div>
      </div>
    </div>
  );
}

export default NavTopSection;