import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import axios from 'axios';
import { initWeb3, getFundedCampaigns, getOwnedCampaigns, getCampaignDetails, getCurrentAccount } from '../web3';

const CampaignCard = ({ campaign, userRole, onSelect, onVote, onRefund, onClaimReward }) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const isDeadlinePassed = currentTimestamp > Number(campaign.deadline);
  const lastUpdateTimestamp = Number(campaign.lastUpdateDate);
  const timeSinceLastUpdate = currentTimestamp - lastUpdateTimestamp;
  const sixMonthsInSeconds = 180 * 24 * 60 * 60;
  
  const canRefund = isDeadlinePassed && 
    (!campaign.targetMet || timeSinceLastUpdate > sixMonthsInSeconds);

  const canSelect = !(isDeadlinePassed && !campaign.targetMet);

  const canClaimReward = campaign.targetMet && 
    Number(campaign.totalFundsReleased) === Number(campaign.amountCollected);

    const canVote = !isDeadlinePassed && campaign.targetMet && 
    Number(campaign.totalFundsReleased) < Number(campaign.amountCollected);

  const getStatusMessage = () => {
    if (userRole === 'fundraiser' && isDeadlinePassed && !campaign.targetMet) {
      return "Target not hit before deadline";
    } else if (campaign.targetMet) {
      return "Target Met";
    } else if (!isDeadlinePassed) {
      return "In Progress";
    } else {
      return "Deadline Passed";
    }
  };

  const getLastUpdateMessage = () => {
    if (Number(campaign.lastUpdateDate) < Number(campaign.deadline)) {
      return "Fundraiser has not updated yet";
    } else {
      return new Date(Number(campaign.lastUpdateDate) * 1000).toLocaleString();
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:scale-105">
      <Link to={`/Campaign/${campaign.id}`} className="block p-6">
        <h3 className="text-xl font-semibold mb-2">Campaign ID: {campaign.id ? campaign.id.toString() : 'N/A'}</h3>
        {userRole !== 'fundraiser' && (
          <p className="text-sm text-gray-600 mb-4">Owner: {campaign.owner || 'N/A'}</p>
        )}
        <div className="space-y-2">
          <p><span className="font-medium">Target:</span> {campaign.target ? `${Web3.utils.fromWei(campaign.target.toString(), 'ether')} ETH` : 'N/A'}</p>
          <p><span className="font-medium">Current:</span> {campaign.amountCollected ? `${Web3.utils.fromWei(campaign.amountCollected.toString(), 'ether')} ETH` : 'N/A'}</p>
          <p><span className="font-medium">Deadline:</span> {campaign.deadline ? new Date(Number(campaign.deadline) * 1000).toLocaleString() : 'N/A'}</p>
          <p><span className="font-medium">Last Update:</span> {getLastUpdateMessage()}</p>
        </div>
        <div className="mt-4">
          <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
            campaign.targetMet ? 'bg-green-100 text-green-800' : 
            (isDeadlinePassed && !campaign.targetMet) ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {getStatusMessage()}
          </span>
        </div>
      </Link>
      
      {userRole === 'fundraiser' && (
        <div className="px-6 pb-4">
          <button
            onClick={() => onSelect(campaign)}
            disabled={!canSelect}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 ${
              canSelect
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Select for Update
          </button>
        </div>
      )}
      
      {userRole === 'investor' && (
        <div className="px-6 pb-4 space-y-2">
          <div className="flex justify-between space-x-2">
            <button
              onClick={() => onVote(campaign.id, true)}
              disabled={!canVote}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 ${
                canVote
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Vote Agree 
            </button>
            <button
              onClick={() => onVote(campaign.id, false)}
              disabled={!canVote}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 ${
                canVote
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Vote Against
            </button>
          </div>
          <button
            onClick={() => onClaimReward(campaign.id)}
            disabled={!canClaimReward}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 ${
              canClaimReward
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Claim Reward
          </button>
          <button
            onClick={() => onRefund(campaign.id)}
            disabled={!canRefund}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 ${
              canRefund
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Request Refund
          </button>
        </div>
      )}
    </div>
  );
};

const FundedCampaign = ({ userRole, profileData }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    updateDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [web3Instance, setWeb3Instance] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const setup = async () => {
      try {
        const { web3, crowdfundingContract } = await initWeb3();
        setWeb3Instance(web3);
        setContractInstance(crowdfundingContract);
        await fetchCampaigns();
      } catch (error) {
        console.error("Failed to initialize Web3", error);
      }
    };

    setup();
  }, [userRole, profileData.ethereum_wallet_address]);


  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      let campaignIds;
      if (userRole === 'fundraiser') {
        console.log(profileData.ethereum_wallet_address)
        campaignIds = await getOwnedCampaigns(profileData.ethereum_wallet_address);
      } else if (userRole === 'investor') {
        campaignIds = await getFundedCampaigns(profileData.ethereum_wallet_address);
        console.log("funded campaigns are: ",campaignIds)
      }

      const campaignDetails = await Promise.all(campaignIds.map(async (id) => {
        const details = await getCampaignDetails(id);
        console.log("Details I can get",details)
        console.log("id is:", id)
        
        //Here got error leh
        return { ...details, id, };
      }));

      console.log(`User ${userRole === 'fundraiser' ? 'owns' : 'funded'} these campaigns:`, campaignDetails);
      setCampaigns(campaignDetails);
      console.log(campaignDetails)
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaign || !updateForm.updateDate || !updateForm.description) {
      setFormError('Please select a campaign and fill all fields');
      return;
    }
  
    try {
      setFormError('');

      const campaignToSend = {
        ...selectedCampaign,
        id: selectedCampaign.id.toString(),
        target: selectedCampaign.target.toString(),
        amountCollected: selectedCampaign.amountCollected.toString(),
        deadline: selectedCampaign.deadline.toString(),
        lastUpdateDate: selectedCampaign.lastUpdateDate.toString(),
      };
  
      await axios.post('http://localhost:8081/updateCampaign', {
        campaignId: campaignToSend.id,
        updateDate: updateForm.updateDate,
        description: updateForm.description
      });
  
      alert('Update submitted successfully');
      setUpdateForm({ updateDate: '', description: '' });
      setSelectedCampaign(null);
  
      await fetchCampaigns();
    } catch (error) {
      console.error('Error submitting update:', error);
      alert('Error submitting update');
    }
  };

  //Get votes
  const handleVote = async (campaignId, inFavor) => {
    if (!web3Instance || !contractInstance) {
      alert('Web3 is not initialized');
      return;
    }

    try {
      const account = await getCurrentAccount();
      await contractInstance.methods.vote(campaignId, inFavor).send({ from: account });
      alert(`Vote submitted successfully for campaign ${campaignId}`);
      await fetchCampaigns();
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Error submitting vote. Make sure you are an investor in this campaign.');
    }
  };

  //Get refund
  const handleRefund = async (campaignId) => {
    if (!web3Instance || !contractInstance) {
      alert('Web3 is not initialized');
      return;
    }

    try {
      const account = await getCurrentAccount();
      await contractInstance.methods.refund(campaignId).send({ from: account });
      alert(`Refund requested successfully for campaign ${campaignId}`);
      await fetchCampaigns();
    } catch (error) {
      console.error('Error requesting refund:', error);
      alert('Error requesting refund. Make sure you are eligible for a refund.');
    }
  };

  //Get reward
  const handleClaimReward = async (campaignId) => {
    if (!web3Instance || !contractInstance) {
      alert('Web3 is not initialized');
      return;
    }

    try {
      const account = await getCurrentAccount();
      await contractInstance.methods.claimReward(campaignId).send({ from: account });
      alert(`Reward claimed successfully for campaign ${campaignId}`);
      await fetchCampaigns();
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Error claiming reward. Make sure you are eligible and haven\'t already claimed.');
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading campaigns...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        {userRole === 'fundraiser' ? 'Your Campaigns' : 'Funded Campaigns'}
      </h2>
      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <CampaignCard 
              key={index} 
              campaign={campaign} 
              userRole={userRole} 
              onSelect={handleCampaignSelect}
              onVote={handleVote}
              onRefund={handleRefund}
              onClaimReward={handleClaimReward}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No campaigns found.</p>
      )}
    
      {userRole === 'fundraiser' && (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add Campaign Update</h3>
          <form onSubmit={handleUpdateSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Selected Campaign</label>
              <input 
                type="text" 
                value={selectedCampaign ? `Campaign ${selectedCampaign.id}` : 'No campaign selected'} 
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Update Date</label>
              <p className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md">
              {new Date().toISOString().split('T')[0]}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={updateForm.description}
                onChange={handleUpdateFormChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              ></textarea>
              {formError && (
                <p className="text-red-500 text-sm mt-2">{formError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FundedCampaign;