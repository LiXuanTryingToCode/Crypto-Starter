import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import {jwtDecode} from 'jwt-decode'; // You'll need to install this package

const EditProfile = ({ profileData }) => {
  const [cookies] = useCookies(['auth_token']);
  const [formData, setFormData] = useState(profileData);
  const [profilePicture, setProfilePicture] = useState('');
  const [userType, setUserType] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(profileData);
    setProfilePicture(profileData.profile_picture || '');

    // Decode the token to get the user type
    if (cookies.auth_token) {
      const decodedToken = jwtDecode(cookies.auth_token);
      setUserType(decodedToken.role);
    }
  }, [profileData, cookies.auth_token]);

  if (!profileData || Object.keys(profileData).length === 0) {
    return <div>Loading...</div>;
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be between 10 and 15 digits';
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await axios.put('http://localhost:8081/update',
        {
          ...formData,
          profile_picture: profilePicture,
          user_type: userType
        },
        {
          headers: {
            Authorization: cookies.auth_token,
          },
        }
      );
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.value);
  };

  const handlePhoneNumberInput = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData(prevData => ({ ...prevData, phone_number: value }));
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src={profilePicture || 'https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
            <input
              type="url"
              value={profilePicture}
              onChange={handleProfilePictureChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter profile picture URL"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username || ''}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone number</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number || ''}
            onInput={handlePhoneNumberInput}
            className={`mt-1 block w-full px-3 py-2 border ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </form>
    </>
  )
}

export default EditProfile;
