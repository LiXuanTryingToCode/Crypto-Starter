import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Web3 from "web3";
import CrowdfundingABI from "./CrowdfundingABI.json";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Demo from "./components/Demo/Demo";
import Demoback from "./components/Demo/Demoback";
import CreateCampaign from "./pages/CreateCampaign";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import FRRegister from "./pages/FRRegister";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Campaign from "./pages/Campaign";
import Browse from "./pages/Browse";
import Bcampaign from "./pages/Bcampaign"
import Tracker from "./pages/Tracker";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          const contractInstance = new web3Instance.eth.Contract(
            CrowdfundingABI,
            contractAddress
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Error connecting to metamask", error);
        }
      }
    };
    initWeb3();
  }, []);

  const CampaignWrapper = (props) => (
    <Campaign {...props} web3={web3} account={account} contract={contract} />
  );


  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Body */}
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/Demo" element={<Demo />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Demoback" element={<Demoback />} />
          <Route path="/CreateCampaign" element={<CreateCampaign />} />
          <Route path="/FundraiserRegister" element={<FRRegister />} />
          <Route path="/Admin" element={<AdminDashboard />} />
          <Route path="/Campaign/:campaign_id" element={<CampaignWrapper />} />
          <Route path="/Bcampaign" element={<Bcampaign />} />
          <Route path="/Browse" element={<Browse />} />
          <Route path="/Tracker" element={<Tracker />} />
        </Routes>
      
      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
