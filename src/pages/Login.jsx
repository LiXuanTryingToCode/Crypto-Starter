import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import React, { useState } from 'react';
import { Cookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
  const cookies = new Cookies();
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState(''); // State for form error
  const navigate = useNavigate();

  // Login 
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'email') {
      if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address.');
      } else {
        setEmailError('');
      }
    }

    
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };


  // Login request
  const handleLogin = async (event) => {
    event.preventDefault();
    if (!loginData.email || !loginData.password) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (!validateEmail(loginData.email)) {
      setFormError('Please fix the errors before submitting.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8081/login', loginData);
      if (res.status === 200 && res.data.token) {
        cookies.set('auth_token', res.data.token, { path: '/' });
        const decodedToken = jwtDecode(res.data.token);

        if (decodedToken.role === 'admin') {
          navigate('/admin');
        } else if (decodedToken.role === 'fundraiser') {
          navigate('/');
        } else {
          navigate('/');
        }
      } else {
        alert('Invalid login credentials');
      }
    } catch (error) {
      console.log(error);
      alert('An error occurred during login. Please try again.');
    }
  };

  return (
    <section className='flex justify-center items-center h-screen bg-gray-100'>
      <div className='container h-auto py-10 px-12 max-w-md bg-white rounded-md mx-5 shadow-lg text-center transform transition-transform duration-300 ease-in-out'>
        <div className='text-lg text-center mb-6'>
          <p className='font-semibold text-2xl'>Login</p>
        </div>
        <form onSubmit={handleLogin} className='space-y-6'>
          <div>
            <input
              type='email'
              placeholder='Email'
              name='email'
              value={loginData.email}
              onChange={handleChange}
              className='w-full py-2 px-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors duration-300'
            />
            {emailError && <p className='text-red-500 text-sm mt-2'>{emailError}</p>}
          </div>
          <div>
            <input
              type='password'
              placeholder='Password'
              name='password'
              value={loginData.password}
              onChange={handleChange}
              className='w-full py-2 px-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors duration-300'
            />
            {passwordError && <p className='text-red-500 text-sm mt-2'>{passwordError}</p>}
          </div>
          {formError && <p className='text-red-500 text-sm mt-2'>{formError}</p>}
          <div>
            <button
              type='submit'
              className='w-full py-2 bg-blue-400 text-white rounded-md transition-transform duration-300 ease-in-out transform hover:scale-105 active:scale-95'
            >
              Log in
            </button>
          </div>
        </form>
        <div className='flex justify-center mt-4'>
          <p>Do not have an account? &nbsp;</p>
          <Link className='underline text-blue-500' to='/Register'>
            Sign up
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Login;
