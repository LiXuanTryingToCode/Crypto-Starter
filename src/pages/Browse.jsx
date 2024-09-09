import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Browse = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [sort, setSort] = useState('');
  const [showActive, setShowActive] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8081/getCampaigns')
      .then(response => response.json())
      .then(data => {
        setCampaigns(data);
        setFilteredCampaigns(data);
      })
      .catch(error => console.error('Error fetching campaigns:', error));
  }, []);

  useEffect(() => {
    let result = [...campaigns];

    if (filterText) {
      result = result.filter(campaign =>
        campaign.title.toLowerCase().includes(filterText.toLowerCase()) ||
        campaign.description.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    if (showActive) {
      result = result.filter(campaign => new Date(campaign.deadline) > new Date());
    }

    if (sort === 'deadline') {
      result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort === 'target') {
      result.sort((a, b) => a.target - b.target);
    }

    setFilteredCampaigns(result);
  }, [filterText, sort, showActive, campaigns]);

  // Truncate function
  const truncateDescription = (description, maxLength = 100) => {
    if (description.length <= maxLength) return description;
    return description.substr(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Filter and Sort section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="whitespace-nowrap">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="p-2 rounded border border-gray-300"
              >
                <option value="">Category</option>
                <option value="deadline">Deadline</option>
                <option value="target">Target Amount</option>
              </select>
            </div>
            <div className="flex-grow md:mx-4">
              <input
                type="text"
                placeholder="Search..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="p-2 rounded border border-gray-300 w-full"
              />
            </div>
            <label className="flex items-center whitespace-nowrap">
              <input
                type="checkbox"
                checked={showActive}
                onChange={(e) => setShowActive(e.target.checked)}
                className="mr-2"
              />
              Show Active Only
            </label>
          </div>
        </div>

        {/* Card section with "No campaigns found" message */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <Link
                key={campaign.campaign_id}
                to={`/Campaign/${campaign.campaign_id}`}
                className="block"
              >
                <div
                  className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full flex flex-col"
                >
                  {campaign.image ? (
                    <img
                      src={campaign.image}
                      alt={`Campaign ${campaign.campaign_id}`}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">No Image</div>
                  )}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
                      <p className="text-gray-600 mb-4 text-justify">
                        {truncateDescription(campaign.description)}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                          <div 
                            style={{ width: `${(campaign.collected / campaign.target) * 100}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                        <p className="text-gray-700 text-sm">
                          ETH {campaign.collected} of {campaign.target} raised
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No campaigns found</h2>
            <p className="text-gray-600">
              We couldn't find any campaigns matching your search criteria. 
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Browse;