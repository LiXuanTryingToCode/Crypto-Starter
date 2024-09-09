import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [fundraisers, setFundraisers] = useState([]);
  const [cookies, removeCookie] = useCookies(['auth_token']);
  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = jwtDecode(cookies.auth_token);
    if (decodedToken.role !== 'admin') {
      console.log("You're not supposed to be here");
      alert('Unauthenticated user detected!');
      navigate('/');
    } else {
      fetchFundraisers();
    }
  }, [cookies.auth_token, navigate]);

  const fetchFundraisers = async () => {
    try {
      const res = await axios.get('http://localhost:8081/fundraisers', {
        headers: { Authorization: cookies.auth_token }
      });
      setFundraisers(res.data);
    } catch (error) {
      console.error('Error fetching fundraisers:', error);
    }
  };

  const handleApproval = async (id, approved) => {
    try {
      await axios.put(`http://localhost:8081/fundraisers/${id}/approve`, { approved }, {
        headers: { Authorization: cookies.auth_token }
      });
      fetchFundraisers();
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };

  const openPdfInNewTab = (url) => {
    window.open(`http://localhost:8081${url}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4 top-0">
      <h1 className="text-3xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Fundraiser ID</th>
              <th className="py-2 px-4 border-b">Full Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Files</th>
              <th className="py-2 px-4 border-b">Metamask Wallet Address</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fundraisers.map((fundraiser) => (
              <tr key={fundraiser.id} className="bg-white hover:bg-gray-100 transition-colors">
                <td className="py-2 px-4 border-b">{fundraiser.fundraiser_id}</td>
                <td className="py-2 px-4 border-b">{fundraiser.full_name}</td>
                <td className="py-2 px-4 border-b">{fundraiser.email}</td>
                <td className="py-2 px-4 border-b">
                  {fundraiser.ver_document && fundraiser.ver_document.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => openPdfInNewTab(doc.url)}
                      className="text-blue-500 hover:text-blue-700 underline mr-2"
                    >
                      {doc.name}
                    </button>
                  ))}
                </td>
                <td className="py-2 px-4 border-b">{fundraiser.ethereum_wallet_address}</td>
                <td className="py-2 px-4 border-b">{fundraiser.approval}</td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  <button
                    onClick={() => handleApproval(fundraiser.id, 'Approved')}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded-md"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(fundraiser.id, 'Disapproved')}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-md"
                  >
                    Disapprove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
