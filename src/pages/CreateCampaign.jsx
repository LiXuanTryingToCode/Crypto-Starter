import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Web3 from 'web3';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import CrowdfundingABI from '../test.json'

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const CreateCampaign = () => {
  const [cookies] = useCookies(['auth_token']);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [userRole, setUserRole] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [profileData, setProfileData] = useState({});
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fundraiserId:'',
    walletAddress:'',
    title: '',
    description: '',
    risk: '',
    target: '',
    deadline: '',
    numberOfInvestors: '',
    rewards: [{ amount: '', perk: '' }],
    updates: '',
    image: null,
    location: ''
  });

  //Initialize web3
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(web3Instance);
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
  
          const contractInstance = new web3Instance.eth.Contract(CrowdfundingABI, contractAddress);
          setContract(contractInstance);
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };
  
    initWeb3();
  
    if (!cookies.auth_token) {
      alert("Please log in to your fundraiser account");
      navigate("/login");
    } else {
      const decodedToken = jwtDecode(cookies.auth_token);
      setUserRole(decodedToken.role);
      setUserId(decodedToken.id);
    }
  }, [cookies.auth_token, navigate]);
  
  //Fundraiser authentication
  useEffect(() => {
    if (web3 && contract && account) {
      if (userRole !== "fundraiser") {
        alert("Please log in to your fundraiser account");
        navigate("/login");
      }
  
      try {
        fetchProfileData();
      } catch (error) {
        console.log("Error fetching profile data:", error);
      }
    }
  }, [web3, contract, account, userRole, navigate]);


  //Get fundraiser data
  const fetchProfileData = async () => {
    try {
      const response = await axios.get('http://localhost:8081/user', {
        headers: {
          Authorization: cookies.auth_token,
        },
      });
      const userData = response.data;
       
      setFormData(prevData => ({
        ...prevData,
        walletAddress: userData.ethereum_wallet_address,
      }));
      if(userData.approval !== "approved"){
        alert("Your account has not been approved!")
        navigate("/Login")
      }
      setProfileData({userData});
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };


  // deadline must be 5 days from currernt time 
  const minDeadline = new Date();
  minDeadline.setDate(minDeadline.getDate() + 5);
  const minDeadlineString = minDeadline.toISOString().slice(0, 16);

  //Form change handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ 
      ...formData, 
      image: file,
      imagePreview: URL.createObjectURL(file)
    });
  };

  const handleRewardChange = (index, e) => {
    const newRewards = [...formData.rewards];
    newRewards[index][e.target.name] = e.target.value;
    setFormData({ ...formData, rewards: newRewards });
  };

  const addReward = () => {
    setFormData({ ...formData, rewards: [...formData.rewards, { amount: '', perk: '' }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.risk.trim()) newErrors.risk = "Risk assessment is required";
    if (!formData.target || formData.target <= 0) newErrors.target = "Valid target amount is required";
    if (!formData.deadline) newErrors.deadline = "Deadline is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.image) newErrors.image = "Image is required";
    if (formData.rewards.some(reward => !reward.amount || !reward.perk.trim())) {
      newErrors.rewards = "All reward fields must be filled";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop the form submission if got errors
    }

    // Reset errors if validation passes
    setErrors({});

    //Smart contract and API call
    if (!web3 || !contract || !account) {
      console.error("Web3, contract, or account not initialized");
      alert("Please ensure your wallet is connected before submitting.");
      return;
    }

    const data = {
      fundraiserid: userId,
      walletAddress: formData.walletAddress,
      title: formData.title,
      description: formData.description,
      risk: formData.risk,
      target: formData.target,
      deadline: formData.deadline,
      numberOfInvestors: formData.numberOfInvestors,
      rewards: formData.rewards,
      updates: formData.updates,
      image: formData.image,
      location: formData.location
    };

    try {
      const response = await axios.post("http://localhost:8081/createCampaign", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.status === 201) {
        const campaignId = response.data.campaign_id;
        setCampaignId(campaignId);
        console.log("Campaign created in database. ID:", campaignId);

        try {
          const targetWei = (web3.utils.toWei(formData.target, 'ether')); 
          const deadlineTimestamp = (Math.floor(new Date(formData.deadline).getTime() / 1000));
          console.log("Creating campaign on blockchain with parameters:", {
            campaignId,
            walletAddress: formData.walletAddress,
            targetWei,
            deadlineTimestamp
          });

          const result = await contract.methods.createCampaign(campaignId,formData.walletAddress,targetWei,deadlineTimestamp)
          .send({from: account });

          console.log("Transaction result:", result);
          alert("Campaign created successfully on the blockchain!");
        } catch (err) {
          console.error("Error creating campaign on blockchain:", err);
          console.error("Error details:", err.message);
          if (err.stack) console.error("Stack trace:", err.stack);
          alert("Error creating campaign on blockchain. Please check the console for details.");
        }
      } else {
        console.log("Unexpected response from server:", response);
        alert("Unexpected response from server. Please try again.");
      }
    } catch (error) {
      console.error("Error creating campaign in database:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      alert("Error creating campaign in database. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md my-10 ">
      <h2 className="text-2xl font-bold mb-4">Create Campaign</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Campaign Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`mt-1 block w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`mt-1 block w-full p-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Risk</label>
          <textarea
            name="risk"
            value={formData.risk}
            onChange={handleInputChange}
            className={`mt-1 block w-full p-2 border ${errors.risk ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          ></textarea>
          {errors.risk && <p className="text-red-500 text-sm mt-1">{errors.risk}</p>}
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="text"
            name="walletAddress"
            disabled
            value={formData.walletAddress}
            onChange={handleInputChange}
            placeholder="MetaMask Wallet Address"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Target Amount (ETH)</label>
          <input
            type="number"
            name="target"
            value={formData.target}
            onChange={handleInputChange}
            className={`mt-1 block w-full p-2 border ${errors.target ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.target && <p className="text-red-500 text-sm mt-1">{errors.target}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Deadline</label>
          <input
            type="datetime-local"
            name="deadline"
            min={minDeadlineString}
            value={formData.deadline}
            onChange={handleInputChange}
            className={`mt-1 block w-full p-2 border ${errors.deadline ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Rewards</label>
          {formData.rewards.map((reward, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={reward.amount}
                onChange={(e) => handleRewardChange(index, e)}
                className={`mr-2 p-2 border ${errors.rewards ? 'border-red-500' : 'border-gray-300'} rounded-md w-1/2`}
              />
              <input
                type="text"
                name="perk"
                placeholder="Perk"
                value={reward.perk}
                onChange={(e) => handleRewardChange(index, e)}
                className={`p-2 border ${errors.rewards ? 'border-red-500' : 'border-gray-300'} rounded-md w-1/2`}
              />
            </div>
          ))}
          {errors.rewards && <p className="text-red-500 text-sm mt-1">{errors.rewards}</p>}
          <button
            type="button"
            onClick={addReward}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add Reward
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            accept='image/*'
            onChange={handleImageChange}
            className={`mt-1 block w-full p-2 border ${errors.image ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          {formData.imagePreview && (
            <img 
              src={formData.imagePreview} 
              alt="Preview" 
              className="mt-2 w-full h-auto rounded-md" 
            />)}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Campaign Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={`mt-1 block w-full p-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        <div className="mb-4">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Create Campaign
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;