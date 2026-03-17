// import React from 'react';
// import { Link } from 'react-router-dom'
// import sdtLogo from "../images/sdt-logo.png";

// function NavBar() {
//   return (
//     <div className="navbar-wrapper m-5">
//       <div className="sdt-logo sdt">
//         <img className="image-12" src={sdtLogo} alt="Software Discovery Tool Logo" />
//       </div>
//       <div className="navbar">
//         <Link to="/" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">Home</Link>
//         <Link to="/faq" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">FAQ</Link>
//         <Link to="/blog" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">Blog</Link>
//         <Link to="/contact" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">Contact</Link>
//         <a href="https://software-discovery-tool.readthedocs.io/en/latest/index.html" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]" target="_blank" rel="noopener noreferrer">Documentation</a>
//       </div>
//     </div>
//   );
// }

// export default NavBar;


import sdtLogo from "../images/sdt-logo.png";
function NavBar() {
    return (
        <nav>
            <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
                    <img className="image-12" src={sdtLogo} alt="Software Discovery Tool Logo" />
                </a>
                <button data-collapse-toggle="navbar-default" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
                <div class="hidden w-full md:block md:w-auto" id="navbar-default">
                    <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <li>
                            <a href="/" class="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Home</a>
                        </li>
                        <li>
                            <a href="/faq" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">FAQ</a>
                        </li>
                        <li>
                            <a href="/blog" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Blog</a>
                        </li>
                        <li>
                            <a href="/contact" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Contact</a>
                        </li>
                        <li>
                            <a href="https://software-discovery-tool.readthedocs.io/en/latest/index.html" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Documentation</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
