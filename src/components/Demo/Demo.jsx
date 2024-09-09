import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CrowdfundingABI from '../../test.json';
import RewardNFTABI from '../../NFTReward.json'

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const rewardNFTAddress = process.env.REACT_APP_NFT_ADDRESS; 

const Demo = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [rewardNFTContract, setRewardNFTContract] = useState(null);
  const [account, setAccount] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({ owner: '', target: '', deadline: '' });
  const [investment, setInvestment] = useState({ id: '', amount: '' });
  const [update, setUpdate] = useState({ id: '' });
  const [rewardDescription, setRewardDescription] = useState('');
  const [nftTokenId, setNftTokenId] = useState('');
  const [nftDetails, setNftDetails] = useState(null);

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

          const rewardNFTInstance = new web3Instance.eth.Contract(RewardNFTABI, rewardNFTAddress);
          setRewardNFTContract(rewardNFTInstance);

          loadCampaigns(contractInstance);
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };

    initWeb3();
  }, []);

  const loadCampaigns = async (contractInstance) => {
    // const campaignCount = await contractInstance.methods.campaignCount().call();
    // const campaignsData = [];
    // for (let i = 1; i <= campaignCount; i++) {
    //   const campaign = await contractInstance.methods.campaigns(i).call();
    //   campaignsData.push({ id: i, ...campaign });
    // }
    // setCampaigns(campaignsData);
    console.log("Nothing here")
  };

  const handleCreateCampaign = async (e) => {
    // e.preventDefault();
    // await contract.methods.createCampaign(newCampaign.owner, web3.utils.toWei(newCampaign.target, 'ether'), 
    // new Date(newCampaign.deadline).getTime() / 1000).send({ from: account });
    // loadCampaigns(contract);
    // setNewCampaign({ owner: '', target: '', deadline: '' });
    await contract.methods.createCampaign(
      'c001', // campaignId
      "0x1234567890123456789012345678901234567890", // owner address
      web3.utils.toWei("1", 'ether'), // target
      Math.floor(Date.now() / 1000) + 86400 // deadline (24 hours from now)
  ).send({ from: account });
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    await contract.methods.investInCampaign(investment.id)
      .send({ from: account, value: web3.utils.toWei(investment.amount, 'ether') });
    loadCampaigns(contract);
    setInvestment({ id: '', amount: '' });
  };

  const handleRefund = async (campaignId) => {
    await contract.methods.refund(campaignId).send({ from: account });
    loadCampaigns(contract);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await contract.methods.addUpdateDate(update.id).send({ from: account });
    loadCampaigns(contract);
    setUpdate({ id: '' });
  };

  const handleVote = async (campaignId, inFavor) => {
    await contract.methods.vote(campaignId, inFavor).send({ from: account });
    loadCampaigns(contract);
  };

  const handleClaimReward = async (campaignId) => {
    await contract.methods.claimReward(campaignId).send({ from: account });
    loadCampaigns(contract);
    loadRewardDescription();
  };

  const loadRewardDescription = async () => {
    const description = await contract.methods.getRewardDescription(account).call();
    setRewardDescription(description);
  };

  const handleRedeemNFT = async (e) => {
    e.preventDefault();
    await rewardNFTContract.methods.redeemReward(nftTokenId).send({ from: account });
    setNftTokenId('');
  };

  const handleGetNFTDetails = async (e) => {
    e.preventDefault();
    const details = await contract.methods.getNFTDetails(nftTokenId).call();
    setNftDetails(details);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Crowdfund and Refund Platform</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Create Campaign</h2>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <input
              type="text"
              placeholder="Owner Address"
              className="w-full p-2 border rounded"
              value={newCampaign.owner}
              onChange={(e) => setNewCampaign({ ...newCampaign, owner: e.target.value })}
            />
            <input
              type="number"
              placeholder="Target Amount (ETH)"
              className="w-full p-2 border rounded"
              value={newCampaign.target}
              onChange={(e) => setNewCampaign({ ...newCampaign, target: e.target.value })}
            />
            <input
              type="datetime-local"
              className="w-full p-2 border rounded"
              value={newCampaign.deadline}
              onChange={(e) => setNewCampaign({ ...newCampaign, deadline: e.target.value })}
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Create Campaign</button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Invest in Campaign</h2>
          <form onSubmit={handleInvest} className="space-y-4">
            <input
              type="number"
              placeholder="Campaign ID"
              className="w-full p-2 border rounded"
              value={investment.id}
              onChange={(e) => setInvestment({ ...investment, id: e.target.value })}
            />
            <input
              type="number"
              placeholder="Amount (ETH)"
              className="w-full p-2 border rounded"
              value={investment.amount}
              onChange={(e) => setInvestment({ ...investment, amount: e.target.value })}
            />
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Invest</button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Add Campaign Update</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="number"
            placeholder="Campaign ID"
            className="w-full p-2 border rounded"
            value={update.id}
            onChange={(e) => setUpdate({ ...update, id: e.target.value })}
          />
          <button type="submit" className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600">Add Update</button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Redeem NFT Reward</h2>
        <form onSubmit={handleRedeemNFT} className="space-y-4">
          <input
            type="number"
            placeholder="NFT Token ID"
            className="w-full p-2 border rounded"
            value={nftTokenId}
            onChange={(e) => setNftTokenId(e.target.value)}
          />
          <button type="submit" className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600">Redeem NFT</button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Get NFT Details</h2>
        <form onSubmit={handleGetNFTDetails} className="space-y-4">
          <input
            type="number"
            placeholder="NFT Token ID"
            className="w-full p-2 border rounded"
            value={nftTokenId}
            onChange={(e) => setNftTokenId(e.target.value)}
          />
          <button type="submit" className="w-full bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600">Get NFT Details</button>
        </form>
        {nftDetails && (
          <div className="mt-4 p-4 border rounded">
            <h3 className="font-semibold">NFT Details:</h3>
            <p>Campaign ID: {nftDetails.campaignId}</p>
            <p>Description: {nftDetails.rewardDescription}</p>
            <p>Redeemed: {nftDetails.redeemed ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Active Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded p-4 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Campaign #{campaign.id}</h3>
              <p>Owner: {campaign.owner}</p>
              <p>Target: {web3 ? web3.utils.fromWei(campaign.target.toString(), 'ether') : ''} ETH</p>
              <p>Collected: {web3 ? web3.utils.fromWei(campaign.amountCollected.toString(), 'ether') : ''} ETH</p>
              <p>Deadline: {new Date(Number(campaign.deadline) * 1000).toLocaleDateString()}</p>
              <p>Target Met: {campaign.targetMet ? 'Yes' : 'No'}</p>
              <p>Initial Funds Released: {campaign.initialFundsReleased ? 'Yes' : 'No'}</p>
              <p>Last Update: {campaign.lastUpdateDate ? new Date(Number(campaign.lastUpdateDate) * 1000).toLocaleString({ timeZone: 'UTC', hour12: true }) : 'No updates'}</p>
              <p>Votes in Favor: {campaign.votesInFavor} / {campaign.totalInvestors}</p>
              <p>Total Funds Released: {web3 ? web3.utils.fromWei(campaign.totalFundsReleased.toString(), 'ether') : ''} ETH</p>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => handleVote(campaign.id, true)}
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Vote in Favor
                </button>
                <button
                  onClick={() => handleRefund(campaign.id)}
                  className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Refund Investment
                </button>
                <button
                  onClick={() => handleClaimReward(campaign.id)}
                  className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Claim Reward
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {rewardDescription && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Reward Description</h2>
          <p>{rewardDescription}</p>
        </div>
      )}
    </div>  );
};

export default Demo;