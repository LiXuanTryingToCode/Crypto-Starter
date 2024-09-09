import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    phone_number: '',
    ethereum_wallet_address: ''
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setSignupData((prevData) => ({
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate full name
    if (name === 'full_name' && /[^a-zA-Z\s]/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        full_name: 'Full Name must contain only alphabetic characters and spaces',
      }));
    } else if (name === 'full_name') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        full_name: '',
      }));
    }

    // Validate phone number
    if (name === 'phone_number' && /[^\d]/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone_number: 'Phone Number must contain only numeric characters',
      }));
    } else if (name === 'phone_number') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone_number: '',
      }));
    }

    // Clear other errors if field is valid
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!signupData.username) formErrors.username = 'Username is required';
    if (!signupData.email) formErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) formErrors.email = 'Email is invalid';
    if (!signupData.password) formErrors.password = 'Password is required';
    else if (!passwordRegex.test(signupData.password)) formErrors.password = 'Password must be at least 8 characters long and include a letter, number, and special character';
    if (signupData.password !== signupData.confirm_password) formErrors.confirm_password = 'Passwords do not match';
    if (!signupData.full_name) formErrors.full_name = 'Full Name is required';
    if (!signupData.phone_number) formErrors.phone_number = 'Phone Number is required';
    else if (!/^\d{10,15}$/.test(signupData.phone_number)) formErrors.phone_number = 'Phone Number must be between 10 and 15 digits';

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = {
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      ethereum_wallet_address: signupData.ethereum_wallet_address,
      full_name: signupData.full_name,
      phone_number: signupData.phone_number,
    };

    try {
      const response = await axios.post('http://localhost:8081/isignup', data);

      if (response.status === 200) {
        alert('Signup successful');
        navigate("/Login");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          const errorMessage = error.response.data.error;
          if (errorMessage === "Both username and email already exist") {
            setErrors(prevErrors => ({
              ...prevErrors,
              username: "Username already exists",
              email: "Email already exists"
            }));
          } else if (errorMessage === "Username already exists") {
            setErrors(prevErrors => ({
              ...prevErrors,
              username: "Username already exists"
            }));
          } else if (errorMessage === "Email already exists") {
            setErrors(prevErrors => ({
              ...prevErrors,
              email: "Email already exists"
            }));
          } else {
            alert(errorMessage);
          }
        } else if (error.response.status === 500) {
          alert("An error occurred on the server. Please try again later.");
        }
      } else if (error.request) {
        alert("No response received from the server. Please check your connection and try again.");
      } else {
        console.error('Error', error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <section className='flex justify-center items-center h-screen bg-gray-100'>
      <div className='container h-auto py-8 px-6 max-w-md bg-white rounded-md mx-4 shadow-lg text-center'>
        <h2 className='text-xl font-semibold mb-4'>Sign Up as Investor</h2>

        <form onSubmit={handleSignup} className='space-y-4'>
          <div>
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={signupData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.username && <p className='text-red-500 text-xs mt-1'>{errors.username}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={signupData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={signupData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              name="confirm_password"
              value={signupData.confirm_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.confirm_password && <p className='text-red-500 text-xs mt-1'>{errors.confirm_password}</p>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Full Name"
              name="full_name"
              value={signupData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.full_name && <p className='text-red-500 text-xs mt-1'>{errors.full_name}</p>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Phone Number"
              name="phone_number"
              value={signupData.phone_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {errors.phone_number && <p className='text-red-500 text-xs mt-1'>{errors.phone_number}</p>}
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
              value={signupData.ethereum_wallet_address}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 text-sm"
              readOnly
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
            >
              Sign Up
            </button>
          </div>

          <div className='flex justify-center mt-4 text-sm'>
            <p>Already have an account? &nbsp;</p>
            <Link className='underline text-blue-500' to='/Login'>Login</Link>
          </div>

          <div className="text-center mt-2 text-sm">
            <p className="text-gray-600">
              Sign up as&nbsp;
              <Link to="/FundRaiserRegister" className="text-blue-500 hover:underline">
                Fundraiser
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Register;
