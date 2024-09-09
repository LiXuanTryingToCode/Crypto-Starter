import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { initWeb3 } from '../web3';
import axios from 'axios';
import EditProfile from './EditProfile';
import FundedCampagin from './FundedCampagin';


const Profile = () => {
  const [cookies, removeCookie] = useCookies(['auth_token']);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [userRole, setUserRole] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('editProfile');
  const [userId, setUserId] = useState('');
  const [fundedCampaigns, setFundedCampaigns] = useState([]);
  const [ownedCampaigns, setOwnedCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    //Connect to smart contract
    const initializeWeb3AndFetchData = async () => {
      if (!cookies.auth_token) {
        navigate('/login');
      } else {
        setIsLoading(true);
        const decodedToken = jwtDecode(cookies.auth_token);
        setUserRole(decodedToken.role);
        setUserId(decodedToken.id);
        try {
          await initWeb3();
          fetchProfileData();
        } catch (error) {
          console.error("Error initializing Web3 or fetching profile data", error);
          setIsLoading(false);
        }
      }
    };
    
    initializeWeb3AndFetchData();
  }, [cookies, navigate]);

  //Logout function & clear cookie
  const handleLogout = () => {
    removeCookie('auth_token');
    console.log('Log out successfully!')
  };

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('http://localhost:8081/user', {
        headers: {
          Authorization: cookies.auth_token,
        },
      });
      const userData = response.data;
      console.log('Profile Data is :', userData);
      setProfileData(userData);
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'editProfile':
        return <EditProfile 
          profileData={profileData} 
        />;
      case 'campaign':
        return <FundedCampagin 
          userRole={userRole} 
          ownedCampaigns={ownedCampaigns} 
          fundedCampaigns={fundedCampaigns} 
          profileData = {profileData}
          
        />;
      default:
        return <div>Page not found</div>;
    }
  };


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    //Sidebar
    <div className="flex min-h-screen">
      <aside
        className={`bg-gray-800 text-white p-4 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none mb-4"
        >
          {isSidebarOpen ? '<' : '>'}
        </button>
        {isSidebarOpen && (
          <>
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            <ul className="mt-4 space-y-2">
              <li onClick={() => setCurrentPage('editProfile')}
                className="py-2 px-4 bg-gray-700 rounded-md my-2 cursor-pointer hover:bg-gray-600">
                Edit Profile
              </li>

              <li onClick={() => setCurrentPage('campaign')}
                  className="py-2 px-4 bg-gray-700 rounded-md my-2 cursor-pointer hover:bg-gray-600">
                  {userRole === 'fundraiser' ? 'Your Campaigns' : 'Funded Campaigns'}
                </li>

              <li
              onClick={handleLogout} 
              className="py-2 px-4 bg-gray-700 rounded-md my-2 cursor-pointer hover:bg-gray-600">
                Log out
              </li>
              
            </ul>
          </>
        )}
      </aside>
      <main className="flex-1 p-8 bg-gray-100">
        {renderPage()}
      </main>
    </div>
  )
}

export default Profile