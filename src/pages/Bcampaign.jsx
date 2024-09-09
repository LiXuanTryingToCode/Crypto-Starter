import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

// Import your contract ABI and address
import contractABI from '../test.json';
const contractAddress = '0x100364EBb337eFbe324976Ce4b0a6C7c3396b0C1'; // Replace with your contract address

const CampaignDetails = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [campaignDetails, setCampaignDetails] = useState(null);
    const [error, setError] = useState(null);
  
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
            setError('Failed to connect to MetaMask.');
            console.error('Error initializing Web3:', error);
          }
        } else {
          setError('Please install MetaMask to use this dApp.');
        }
      };
  
      initWeb3();
    }, []);
  
    useEffect(() => {
      const fetchCampaignDetails = async () => {
        if (contract && web3) {
          try {
            const campaignId = 'C001';
            const details = await contract.methods.campaigns(campaignId).call();
            console.log('Raw campaign details:', details);
  
            // Helper function to safely convert BigInt to string
            const bigIntToString = (value) => {
              if (value === null || value === undefined) return '0';
              if (typeof value === 'bigint') return value.toString();
              if (typeof value === 'string' || typeof value === 'number') return value.toString();
              return '0';
            };
  
            // Process the details
            const processedDetails = {
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
            };
  
            setCampaignDetails(processedDetails);
          } catch (error) {
            setError('Failed to fetch campaign details.');
            console.error('Error fetching campaign details:', error);
          }
        }
      };
  
      fetchCampaignDetails();
    }, [contract, web3]);
  
    if (error) {
      return <div>Error: {error}</div>;
    }
  
    if (!campaignDetails) {
      return <div>Loading...</div>;
    }
  
    return (
      <div>
        <h1>Campaign Details for C001</h1>
        <div>
          <p><strong>Owner:</strong> {campaignDetails.owner}</p>
          <p><strong>Target:</strong> {campaignDetails.target} ETH</p>
          <p><strong>Deadline:</strong> {campaignDetails.deadline}</p>
          <p><strong>Amount Collected:</strong> {campaignDetails.amountCollected} ETH</p>
          <p><strong>Target Met:</strong> {campaignDetails.targetMet ? 'Yes' : 'No'}</p>
          <p><strong>Refunded:</strong> {campaignDetails.refunded ? 'Yes' : 'No'}</p>
          <p><strong>Last Update Date:</strong> {campaignDetails.lastUpdateDate}</p>
          <p><strong>Initial Funds Released:</strong> {campaignDetails.initialFundsReleased ? 'Yes' : 'No'}</p>
          <p><strong>Total Funds Released:</strong> {campaignDetails.totalFundsReleased} ETH</p>
          <p><strong>Votes in Favor:</strong> {campaignDetails.votesInFavor}</p>
          <p><strong>Total Investors:</strong> {campaignDetails.totalInvestors}</p>
        </div>
      </div>
    );
  };
  
  export default CampaignDetails;