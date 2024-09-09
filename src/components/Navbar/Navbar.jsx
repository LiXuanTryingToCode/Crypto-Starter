import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import './Navbar.css';
import { Link } from 'react-router-dom';


const Navbar = () => {

  const [cookies, , removeCookie] = useCookies(['auth_token']);
  const [username, setUsername] = useState(''); //Account name
  const [role, setRole] = useState(''); //Role
  const [isLogin, setIsLogin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);


  //Requiring data from cookie
  useEffect(() => {
    if (cookies.auth_token) {
      if(cookies.auth_token!== 'undefined'){
        const decodedToken = jwtDecode(cookies.auth_token||"");
        console.log(decodedToken)
        setUsername(decodedToken.username);
        setIsLogin(true);
        setRole(decodedToken.role)
      }
      else{
        return;
      }
      // console.log("From navbar decode token: ", decodedToken)
    } else {
      setIsLogin(false);
    }
  });


  return (
    <nav className="bg-gray-800 sticky w-full top-0 z-10 ">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-between ">
            {/* Logo or Name */}
            <div className="flex-shrink-0 flex items-center">
              <img src="https://i.gifer.com/origin/e0/e02ce86bcfd6d1d6c2f775afb3ec8c01_w200.gif" alt=""
                className=' w-4 mr-2'
                style={{ marginTop: 3 }} />
              <Link to={"/"} className="text-white text-lg font-bold">Crypto Starter</Link>
            </div>

            {/* Menu */}
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <Link to="/" className="text-gray-300  hover:text-white px-3 py-2 text-md font-medium underline-hover ">
                  Home
                </Link>
                <Link to="/Browse" className="text-gray-300  hover:text-white px-3 py-2 text-md font-medium underline-hover ">
                  Browse
                </Link>
                <Link to="/Tracker" className="text-gray-300  hover:text-white px-3 py-2 text-md font-medium underline-hover ">
                  Tracker
                </Link>
                <Link to='/CreateCampaign' className="text-gray-300  hover:text-white px-3 py-2 text-md font-medium underline-hover ">
                  Create Campaign
                </Link>
                <Link to={isLogin ? ('/Profile') : ('/Login')}>
                  <button className='bg-white w-24 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow-md
                 transition duration-300 ease-in-out transform hover:bg-gray-100 hover:shadow-lg active:scale-95'
                  // onClick={handleLogout}
                  >
                    {isLogin ? (username) : ('Log in')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to={"/"} className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium underline-hover'>Home</Link>
            <Link to={"/Browse"} className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium underline-hover'>Browse</Link>
            <Link to={"/Tracker"} className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium underline-hover'>Tracker</Link>
            <Link to={"/CreateCampaign"} className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium underline-hover'>Create Campaign</Link>
            <Link to={"/Profile"}className='text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium underline-hover'>Profile</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar