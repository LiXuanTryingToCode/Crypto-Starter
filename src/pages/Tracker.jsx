import React, { useState } from 'react';
import axios from 'axios';

const Tracker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('address'); // 'address' or 'hash'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const apiKey = process.env.REACT_APP_ETHERSCANAPI;
    const baseUrl = 'https://api-sepolia.etherscan.io/api';

    try {
      let response;
      if (searchType === 'address') {
        response = await axios.get(baseUrl, {
          params: {
            module: 'account',
            action: 'txlist',
            address: searchQuery,
            startblock: 0,
            endblock: 99999999,
            sort: 'desc',
            apikey: apiKey,
          },
        });
      } else {
        response = await axios.get(baseUrl, {
          params: {
            module: 'proxy',
            action: 'eth_getTransactionByHash',
            txhash: searchQuery,
            apikey: apiKey,
          },
        });
      }

      if (searchType === 'address') {
        if (response.data.status === '1') {
          setTransactions(response.data.result.slice(0, 4)); // Limit to 4 transactions for display
        } else {
          setTransactions([]);
          setError('No transactions found for the given address.');
        }
      } else {
        const tx = response.data.result;
        if (tx) {
          setTransactions([tx]); // Display the single transaction
        } else {
          setTransactions([]);
          setError('No transaction found for the given hash.');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setTransactions([]);
      setError('Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const truncateHash = (hash) => hash.slice(0, 12);
  const truncateAddress = (address) => `${address.slice(0, 10)}...${address.slice(-10)}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-7">
      <div className="container mx-auto p-6 max-w-6xl bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Ethereum Transaction Tracker</h1>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex justify-center mb-4">
            <label className="mr-4">
              <input
                type="radio"
                value="address"
                checked={searchType === 'address'}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-2"
              />
              Address
            </label>
            <label>
              <input
                type="radio"
                value="hash"
                checked={searchType === 'hash'}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-2"
              />
              Transaction Hash
            </label>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === 'address' ? "Enter Ethereum address..." : "Enter Transaction hash..."}
              className="w-full px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {transactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Transaction Hash</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Block</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Age</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">From</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">To</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Txn Fee</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-3 px-4 text-sm text-blue-500 truncate">{truncateHash(tx.hash)}...</td>
                    <td className="py-3 px-4 text-sm truncate">{tx.method || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm truncate">{tx.blockNumber}</td>
                    <td className="py-3 px-4 text-sm truncate">{tx.timeStamp}</td>
                    <td className="py-3 px-4 text-sm truncate">{truncateAddress(tx.from)}</td>
                    <td className="py-3 px-4 text-sm truncate">{truncateAddress(tx.to)}</td>
                    <td className="py-3 px-4 text-sm truncate">{(tx.value / 1e18).toFixed(2)} ETH</td>
                    <td className="py-3 px-4 text-sm truncate">{(tx.gasUsed * tx.gasPrice / 1e18).toFixed(6)} ETH</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracker;
