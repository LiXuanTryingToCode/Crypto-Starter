import Web3 from 'web3';
import CrowdfundingABI from './test.json';

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;


let web3;
let crowdfundingContract;

let currentAccount;

export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      currentAccount = accounts[0];

      crowdfundingContract = new web3.eth.Contract(CrowdfundingABI, contractAddress);


      return { web3, crowdfundingContract, currentAccount };
    } catch (error) {
      console.error("User denied account access");
      throw error;
    }
  } else {
    console.log('Please install MetaMask!');
    throw new Error('No Ethereum provider detected');
  }
};

export const checkContractState = async () => {
  if (!crowdfundingContract) {
    console.error('Contract not initialized');
    return;
  }
  try {
    const owner = await crowdfundingContract.methods.owner().call();
    console.log('Contract owner:', owner);
    const campaignCount = await crowdfundingContract.methods.campaignCount().call();
    console.log('Total campaigns:', campaignCount);
  } catch (error) {
    console.error('Error checking contract state:', error);
  }
};

export const createCampaign = async (campaignId, owner, target, deadline) => {
  if (!web3 || !crowdfundingContract || !currentAccount) {
    throw new Error('Web3 or contract not initialized. Call initWeb3 first.');
  }

  try {
    console.log('Input values:', { campaignId, owner, target, deadline });

    // Validate campaignId
    // const validCampaignId = web3.utils.toBN(campaignId);
    // console.log('Validated campaignId:', validCampaignId.toString());

    // Validate owner address
    if (!web3.utils.isAddress(owner)) {
      throw new Error('Invalid owner address');
    }

    // Validate and convert target to Wei
    let targetWei;
    try {
      targetWei = web3.utils.toWei(target.toString(), 'ether');
    } catch (error) {
      throw new Error('Invalid target amount: ' + error.message);
    }
    console.log('Target in Wei:', targetWei);

    // Validate and convert deadline to Unix timestamp
    const deadlineUnix = Math.floor(new Date(deadline).getTime() / 1000);
    if (isNaN(deadlineUnix)) {
      throw new Error('Invalid deadline date');
    }
    console.log('Deadline Unix timestamp:', deadlineUnix);

    const result = await crowdfundingContract.methods.createCampaign(
      campaignId,
      owner,
      targetWei,
      deadlineUnix
    ).send({ from: currentAccount });

    console.log('Campaign created successfully', result);
    return result;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const getFundedCampaigns = async (userAddress) => {
  if (!crowdfundingContract) {
    throw new Error('Contract not initialized');
  }
  return await crowdfundingContract.methods.getFundedCampaigns(userAddress).call();
};

export const getOwnedCampaigns = async (address) => {
    if (!crowdfundingContract) {
      throw new Error("Contract not initialized. Call initWeb3 first.");
    }
    return await crowdfundingContract.methods.getOwnedCampaigns(address).call();
  };

export const getCampaignDetails = async (campaignId) => {
  if (!crowdfundingContract) {
    throw new Error('Contract not initialized');
  }
  return await crowdfundingContract.methods.campaigns(campaignId).call();
};

// Add more contract interaction functions as needed

export const getCurrentAccount = () => currentAccount;

export const onAccountChange = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      currentAccount = accounts[0];
      callback(currentAccount);
    });
  }
};