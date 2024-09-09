import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FRRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    phone_number: '',
    ethereum_wallet_address: '',
    files: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('confirm_password', formData.confirm_password);
    data.append('full_name', formData.full_name);
    data.append('phone_number', formData.phone_number);
    data.append('ethereum_wallet_address', formData.ethereum_wallet_address);
    formData.files.forEach((file) => {
      data.append('files', file);
    });

    try {
      const res = await axios.post('http://localhost:8081/fsignup', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('res is: ', res);
    } catch (error) {
      console.log('fundraiser page error: ', error);
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData((prevData) => ({
          ...prevData,
          ethereum_wallet_address: accounts[0]
        }));
      } catch (error) {
        console.error(error);
        alert("An error occurred while connecting to MetaMask. Please try again.");
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
  };

  return (
    <section className='flex justify-center items-center h-screen bg-gray-100'>
      <div className='container h-auto py-8 px-6 max-w-md bg-white rounded-md mx-4 shadow-lg text-center'>
        <h2 className='text-xl font-semibold mb-4'>Register as Fundraiser</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <input
              type="text"
              placeholder="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <input
              type="file"
              id="files"
              name="files"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={connectMetaMask}
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
            >
              Connect MetaMask
            </button>
            <input
              type="text"
              placeholder="Ethereum Wallet Address"
              name="ethereum_wallet_address"
              value={formData.ethereum_wallet_address}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 text-sm"
              readOnly
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
          >
            Register
          </button>
        </form>
        
        <div className='flex justify-center mt-4 text-sm'>
          <p>Already have an account? &nbsp;</p>
          <Link className='underline text-blue-500' to='/Login'>Login</Link>
        </div>

        <div className="text-center mt-2 text-sm">
          <p className="text-gray-600">
            Sign up as&nbsp;
            <Link to="/Register" className="text-blue-500 hover:underline">
              Investor
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FRRegister;
