import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: 'What is crowdfunding?',
      answer: 'Crowdfunding is a way of raising money from a large number of people to fund a project or venture.',
    },
    {
      question: 'How do I start a campaign?',
      answer: 'To start a campaign, click on the "Start a Campaign" button and follow the instructions to set up your fundraising page.',
    },
    {
      question: 'How can I share my campaign?',
      answer: 'You can share your campaign via social media, email, or word of mouth to spread the word to your network.',
    },
    {
      question:'What are the documents to be submitted during fundraiser registration?',
      answer: <>
        <p>For Sdn Bhd: Borang 9</p>
        <p>Sample of Borang 9:</p>
        <div className='flex justify-center'>
          <img src="https://www.cetakssm.com/wp-content/uploads/2024/04/form-9-724x1024.jpg" 
            className=' max-w-lg'
            alt="Sample of Borang 9" />
        </div>
        <p>For sole proprietorship/partnership: Borang D</p>
        <p>Sample of Borang D:</p>
        <div className='flex justify-center'>
          <img src="https://imgv2-1-f.scribdassets.com/img/document/520805989/original/2e115bb232/1717014928?v=1" 
            className=' max-w-lg'
            alt="Sample of Borang D" />
        </div>
      </>
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Empower Change Through Crowdfunding</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">Join our community and make a difference today</p>
          <button className="bg-blue-600 text-white py-2 px-6 rounded-full text-lg hover:bg-blue-700 transition duration-300">
            <Link to={"CreateCampaign"}>Start a Campaign</Link>
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Create Your Campaign</h3>
              <p className="text-gray-600">Set up your fundraising page in minutes</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Share Your Story</h3>
              <p className="text-gray-600">Spread the word to your network</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Collect Funds on Milestone</h3>
              <p className="text-gray-600">Receive funds and make an impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="bg-white py-16">
        {/* Accordion area */}
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full text-left py-3 px-4 bg-blue-100 rounded-lg flex justify-between items-center focus:outline-none"
                >
                  <span className="font-semibold text-blue-600">{faq.question}</span>
                  <svg
                    className={`w-6 h-6 transform transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {activeIndex === index && (
                  <div className="mt-2 p-4 bg-gray-50 border border-blue-100 rounded-lg">
                    <div className="text-gray-600">{faq.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use Blockchain Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-8">Why Use Blockchain-Based Crowdfunding?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-gray-600">Blockchain ensures that all transactions are transparent and can be audited by anyone.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Security</h3>
              <p className="text-gray-600">With blockchain, funds are securely stored and protected from fraud or unauthorized access.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Decentralization</h3>
              <p className="text-gray-600">Blockchain removes the need for intermediaries, giving control directly to fundraisers and backers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
