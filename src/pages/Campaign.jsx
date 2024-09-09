import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Web3 from 'web3';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import contractABI from '../test.json';
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const Campaign = () => {
  const { campaign_id } = useParams();
  const [cookies] = useCookies(['auth_token']);
  const [profileData, setProfileData] = useState({});
  const [campaign, setCampaign] = useState('');
  const [amount, setAmount] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const [blockchainCampaign, setBlockchainCampaign] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('http://localhost:8081/user', {
        headers: {
          Authorization: cookies.auth_token,
        },
      });
      const userData = response.data;
      setProfileData(userData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to fetch profile data');
    }
  };

  const parseUpdates = (updatesString) => {
    try {
      return JSON.parse(updatesString);
    } catch (error) {
      console.error('Error parsing updates:', error);
      return [];
    }
  };

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);
        } catch (error) {
          setError('Failed to connect to MetaMask: ' + error.message);
          console.error('Error initializing Web3:', error);
        }
      } else {
        setError('Please install MetaMask to use this dApp.');
      }
      setIsLoading(false);
    };

    initWeb3();
  }, []);

  
  useEffect(() => {
    if (!cookies.auth_token) {
      alert("Please log in to your fundraiser account");
      navigate("/login");
    } else {
      const decodedToken = jwtDecode(cookies.auth_token);
      setUserRole(decodedToken.role);
    }

    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/campaigns/${campaign_id}`);
        setCampaign(response.data);
        console.log(response);
      } catch (error) {
        console.error('Error fetching campaign details:', error);
        setError('Failed to fetch campaign details from database');
      }
    };

    fetchProfileData();
    fetchCampaign();
  }, [cookies.auth_token, campaign_id, navigate]);


  useEffect(() => {
    const fetchBlockchainCampaign = async () => {
      if (contract && web3) {
        try {
          const campaignExists = await contract.methods.campaigns(campaign_id).call();
          if (!campaignExists || campaignExists.owner === '0x0000000000000000000000000000000000000000') {
            setError(`Campaign ${campaign_id} does not exist on the blockchain`);
            return;
          }
          const details = await contract.methods.campaigns(campaign_id).call();
          const bigIntToString = (value) => {
            if (value === null || value === undefined) return '0';
            if (typeof value === 'bigint') return value.toString();
            if (typeof value === 'string' || typeof value === 'number') return value.toString();
            return '0';
          };

          setBlockchainCampaign({
            owner: details.owner,
            target: web3.utils.fromWei(bigIntToString(details.target), 'ether'),
            deadline: new Date(Number(bigIntToString(details.deadline)) * 1000).toLocaleString(),
            amountCollected: web3.utils.fromWei(bigIntToString(details.amountCollected), 'ether'),
            targetMet: details.targetMet,
            refunded: details.refunded,
            lastUpdateDate: new Date(Number(bigIntToString(details.lastUpdateDate)) * 1000).toLocaleString(),
            initialFundsReleased: details.initialFundsReleased,
            totalFundsReleased: web3.utils.fromWei(bigIntToString(details.totalFundsReleased), 'ether'),
            votesInFavor: bigIntToString(details.votesInFavor),
            totalInvestors: bigIntToString(details.totalInvestors)
          });
        } catch (error) {
          console.error('Error fetching blockchain campaign details:', error);
          setError(`Failed to fetch campaign details from blockchain: ${error.message}`);
        }
      } else {
        console.error('Web3 or contract not initialized');
      }
    };
    fetchBlockchainCampaign();
  }, [contract, web3, campaign_id]);

  useEffect(() => {
    const checkExpiration = () => {
      if (campaign && campaign.deadline) {
        const currentDate = new Date();
        const deadlineDate = new Date(campaign.deadline);
        setIsExpired(currentDate > deadlineDate);
      }
    };

    checkExpiration();
  }, [campaign]);

  if (isLoading) {
    return <div>Loading Web3...</div>;
  }

  if (!campaign) {
    return <div>Loading campaign data...</div>;
  }

  const handleContribute = async () => {
    if (userRole !== "investor") {
      alert("Please log in to your fundraiser account");
      navigate("/login");
      return;
    }
    if (!amount || isNaN(amount)) {
      alert('Please enter a valid amount.');
      return;
    }
    try {
      const amountInWei = web3.utils.toWei(amount, 'ether');
      // console.log(amountInWei)

      //smart contract fund method
      await contract.methods.investInCampaign(campaign_id)
      .send({ from: profileData.ethereum_wallet_address, value: amountInWei });
      alert('Contribution successful!');
      

      //Update database
      const response = await fetch('http://localhost:8081/fundCampaign', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},body: JSON.stringify({campaign_id: campaign_id,amount: amount}),})

        if (!response.ok) {
          throw new Error('Failed to update campaign investment');
        }
        const result = await response.json();
        console.log(result.message);

    } catch (error) {
      console.error('Error contributing to the campaign:', error);
      alert('Error contributing to the campaign: ' + error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-10">
      <div className="container mx-auto px-4 lg:px-8 bg-white rounded-lg shadow-lg overflow-hidden ">
        {error && <div className="text-red-500 mt-4 p-4 bg-red-100 rounded">{error}</div>}
        <div className="flex flex-col lg:flex-row">

          {/* Img area */}
          <div className="w-full lg:w-2/3 p-6">
            {campaign.image && (
              <img src={campaign.image} alt="Campaign" 
              className="w-full aspec-[4/3] object-cover rounded-md mb-4" />
            )}
            <h1 className="text-2xl font-bold mb-4">{campaign.title}</h1>
            
            {/* Name and wallet address */}
            <div className="flex items-center text-gray-700 mb-4">
              <p className="mr-2 text-lg"><strong>Campaign owner:</strong></p>
              <p className=' text-lg mr-6'>{campaign.full_name}</p>

              <img src={campaign.profile_picture || 'https://static.vecteezy.com/system/resources/thumbnails/005/129/844/small_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg'} alt=""
               className=' w-16 rounded-full'/>
            </div>

            {/* Campaign description */}
            <p className=' text-lg'><strong>Description:</strong></p>
            <p className="text-lg text-gray-700 mb-6 text-justify">{campaign.campaign_description}</p>

            {/* Risks */}
            <p className=' text-lg'><strong>Risk:</strong></p>
            <p className="text-lg text-gray-700 mb-6 text-justify">{campaign.risk}</p>

            {/* Updates section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Campaign Updates</h2>
              {campaign.updates && parseUpdates(campaign.updates).length > 0 ? (
                parseUpdates(campaign.updates).map((update, index) => (
                  
                  <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
                    <h2 className=' underline'>Update {index + 1}</h2>
                    <p className="font-semibold text-sm text-gray-600">Date: {new Date(update.date).toLocaleDateString()}</p>
                    <p className="mt-2">Description: {update.description}</p>
                  </div>
                ))
              ) : (
                <p>No updates available for this campaign.</p>
              )}
            </div>
          </div>

            {/* Amount progress bar */}
          <div className="w-full lg:w-1/3 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
            <div className="mb-6">
              <span className="text-gray-900 font-semibold">ETH {campaign.collected} of {campaign.target} raised</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(campaign.collected / campaign.target) * 100}%` }}></div>
              </div>
            </div>

            {/* Days left */}
            <div className="mb-4">
              <span className="text-gray-900 font-semibold">
                {isExpired ? (
                  "Campaign expired"
                ) : (
                  <>
                    Days left:{" "}
                    {Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))}
                  </>
                )}
              </span>
            </div>

            {/* Total investors */}
            <div className="mb-4">
              <span className="text-gray-900 font-semibold">Total investors: </span>
              {campaign.numberOfInvestors || '0'}
              {/* {blockchainCampaign.totalInvestors} */}
            </div>

            {/* Amount to be fund */}
            <div className="mb-6">
              <label htmlFor="amount" className="text-gray-900 font-semibold">Amount (ETH):</label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.1"
                className="w-full p-2 border rounded mt-2"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isExpired}
              />
              <button 
                onClick={handleContribute} 
                className={`bg-green-500 text-white mt-4 p-3 rounded w-full ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isExpired}
              >
                Fund Project
              </button>
            </div>
            <div className="mb-6">
              <h2 className="font-bold mb-2">Rewards</h2>
              <ul className="list-disc list-inside text-gray-700">
                {campaign.rewards && campaign.rewards.length > 0 ? (
                  campaign.rewards.map((reward, index) => (
                    <li key={index}>
                      <span className="font-semibold">Amount:</span> {reward.amount}, <span className="font-semibold">Perk:</span> {reward.perk}
                    </li>
                  ))
                ) : (
                  <li>No rewards available</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Blockchain Campaign Details</h2>
          <div className="space-y-4">
            {blockchainCampaign ? (
              <>
                <div className="flex justify-between">
                  <p className="font-semibold">Owner:</p>
                  <p>{blockchainCampaign.owner}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Target:</p>
                  <p>{blockchainCampaign.target} ETH</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Deadline:</p>
                  <p>{blockchainCampaign.deadline}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Amount Collected:</p>
                  <p>{blockchainCampaign.amountCollected} ETH</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Target Met:</p>
                  <p>{blockchainCampaign.targetMet ? 'Yes' : 'No'}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Refunded:</p>
                  <p>{blockchainCampaign.refunded ? 'Yes' : 'No'}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Last Update:</p>
                  <p>{blockchainCampaign.lastUpdateDate}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Initial Funds Released:</p>
                  <p>{blockchainCampaign.initialFundsReleased ? 'Yes' : 'No'}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Total Funds Released:</p>
                  <p>{blockchainCampaign.totalFundsReleased} ETH</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Votes in Favor:</p>
                  <p>{blockchainCampaign.votesInFavor}</p>
                </div>
                <div className="flex justify-between pb-5">
                  <p className="font-semibold">Total Investors:</p>
                  <p>{blockchainCampaign.totalInvestors}</p>
                </div>
              </>
            ) : (
              <p>Loading blockchain campaign details...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Campaign