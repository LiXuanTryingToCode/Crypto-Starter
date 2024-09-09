import React from 'react';
import "./Footer.css"
import { Link } from 'react-router-dom'


const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 text-center text-sm font-medium ">

          <div className="mx-4">
            <ul className='sm:columns-1 md:columns-5 justify-around gap-3'>
              <li className="">
                <Link to="/" className="underline-mid-hover">Home</Link>
              </li>
              <li className="my-2">
                <Link to="/Browse" className="underline-mid-hover">Browse</Link>
              </li>
              <li className="my-2">
                <Link to="/Tracker" className="underline-mid-hover">Tracker</Link>
              </li>
              <li className="my-2">
                <Link to="/Profile" className="underline-mid-hover">Profile</Link>
              </li>
              <li className="my-2">
                <Link to="/CreateCampaign" className="underline-mid-hover">Create campaign</Link>
              </li>

            </ul>
          </div>

          <div className="py-3">
            <p>Copyright© 2024. All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
