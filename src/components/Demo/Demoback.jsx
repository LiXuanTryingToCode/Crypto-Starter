import React, { useState, useEffect } from 'react'
import './Demo.css'
import axios from 'axios';
import Web3 from 'web3';
import Transfer from '../../Transfer.json';


const contractAddress = '0xf8e81D47203A594245E36C48e151709F0C19fBe8';

const Demoback = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');



  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

      const contractInstance = new web3Instance.eth.Contract(Transfer, contractAddress);
      setContract(contractInstance);
    } else {
      alert('Please install MetaMask!');
    }
  };


  const handleTransfer = async () => {
    if (contract && toAddress && amount) {
      await contract.methods.transfer(toAddress).send({ from: account, value: web3.utils.toWei(amount, 'ether') });
    }
  };


  // Fetch campaigns or other data as needed

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-xl font-bold mb-2">ETH Transfer</h1>

        <button onClick={initWeb3} className="bg-gray-500 text-white mt-2 p-2 rounded w-full">
          Connect to MetaMask
        </button>

        <p className='mt-4'>Connected account: {account}</p>
        <div className="mb-4 mt-4">
          <label htmlFor="toAddress" className="font-semibold">To Address:</label>
          <input
            type="text"
            id="toAddress"
            name="toAddress"
            className="w-full p-2 border rounded mt-2"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="font-semibold">Amount (ETH):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            className="w-full p-2 border rounded mt-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button onClick={handleTransfer} className="bg-gray-500 text-white mt-2 p-2 rounded w-full">
          Transfer
        </button>
      </div>
    </div>
  );
};

export default Demoback