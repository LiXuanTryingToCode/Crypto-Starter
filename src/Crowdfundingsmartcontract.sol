// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./RewardNFT.sol";

contract CFnRFnVnRW10 {
    RewardNFT public rewardNFT;
    mapping(address => string) public rewardDescriptions;

    struct Campaign {
        address payable owner;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        bool targetMet;
        bool refunded;
        uint256 lastUpdateDate;
        bool initialFundsReleased;
        uint256 totalFundsReleased;
        uint256 votesInFavor;
        uint256 totalInvestors;
        mapping(address => uint256) contributions;
        mapping(address => bool) hasVoted;
        mapping(address => bool) hasClaimedReward;
        address[] investors;
    }

    uint256 public campaignCount;
    mapping(string => Campaign) public campaigns;
    mapping(address => string[]) public userOwnedCampaigns;
    mapping(address => string[]) public userFundedCampaigns;

    event CampaignCreated(string campaignId, address owner, uint256 target, uint256 deadline);
    event InvestmentReceived(string campaignId, address investor, uint256 amount);
    event RefundIssued(string campaignId, address investor, uint256 amount);
    event InitialFundsReleased(string campaignId, uint256 amount);
    event VoteCast(string campaignId, address voter, bool inFavor);
    event CampaignUpdated(string campaignId, uint256 updateDate);
    event FundsReleased(string campaignId, uint256 amount);
    event RewardDistributed(string campaignId, address investor, uint256 tokenId);

    constructor(string memory nftName, string memory nftSymbol) {
        rewardNFT = new RewardNFT(nftName, nftSymbol, address(this));
    }

    function createCampaign(string memory campaignId, address payable owner, uint256 target, uint256 deadline) public {
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(campaigns[campaignId].owner == address(0), "Campaign already exists");
        Campaign storage campaign = campaigns[campaignId];
        campaign.owner = owner;
        campaign.target = target;
        campaign.deadline = deadline;
        campaign.lastUpdateDate = block.timestamp;
        campaignCount++;
        userOwnedCampaigns[owner].push(campaignId);
        emit CampaignCreated(campaignId, owner, target, deadline);
    }

    function investInCampaign(string memory campaignId) public payable {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.owner != address(0), "Campaign does not exist");
        require(block.timestamp < campaign.deadline, "The campaign has ended");
        if (campaign.contributions[msg.sender] == 0) {
            campaign.totalInvestors++;
            campaign.investors.push(msg.sender);
            userFundedCampaigns[msg.sender].push(campaignId);
        }
        campaign.contributions[msg.sender] += msg.value;
        campaign.amountCollected += msg.value;

        if (campaign.amountCollected >= campaign.target && !campaign.initialFundsReleased) {
            campaign.targetMet = true;
            uint256 initialReleaseAmount = campaign.target / 10;
            campaign.owner.transfer(initialReleaseAmount);
            campaign.initialFundsReleased = true;
            campaign.totalFundsReleased += initialReleaseAmount;
            emit InitialFundsReleased(campaignId, initialReleaseAmount);
        }

        emit InvestmentReceived(campaignId, msg.sender, msg.value);
    }

    function refund(string memory campaignId) public {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.owner != address(0), "Campaign does not exist");
        require(block.timestamp > campaign.deadline, "The campaign is still active");
        require(!campaign.targetMet || (block.timestamp > campaign.lastUpdateDate + 180 days), "Refund conditions not met");
        require(campaign.contributions[msg.sender] > 0, "No contributions to refund");

        uint256 amount = campaign.contributions[msg.sender];
        campaign.contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit RefundIssued(campaignId, msg.sender, amount);
    }

    function vote(string memory campaignId, bool inFavor) public {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.owner != address(0), "Campaign does not exist");
        require(campaign.contributions[msg.sender] > 0, "Only investors can vote");
        require(!campaign.hasVoted[msg.sender], "Already voted");
        require(campaign.targetMet, "Campaign target not met");
        require(!campaign.refunded, "Campaign has been refunded");

        campaign.hasVoted[msg.sender] = true;
        if (inFavor) {
            campaign.votesInFavor++;
        }

        emit VoteCast(campaignId, msg.sender, inFavor);

        if (campaign.votesInFavor > campaign.totalInvestors / 2) {
            releaseFunds(campaignId);
            for (uint256 i = 0; i < campaign.investors.length; i++) {
                campaign.hasVoted[campaign.investors[i]] = false;
            }
            campaign.votesInFavor = 0;
        }
    }

    function addUpdateDate(string memory campaignId) public {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.owner != address(0), "Campaign does not exist");
        require(msg.sender == campaign.owner, "Only the campaign owner can add updates");
        campaign.lastUpdateDate = block.timestamp;
        emit CampaignUpdated(campaignId, block.timestamp);
    }

    function releaseFunds(string memory campaignId) internal {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.targetMet, "Target not met");
        require(campaign.initialFundsReleased, "Initial funds not released yet");
        require(campaign.votesInFavor > campaign.totalInvestors / 2, "Not enough votes in favor");

        uint256 releaseAmount = campaign.target * 20 / 100; // 20% of the target amount
        uint256 maxRelease = campaign.amountCollected - campaign.totalFundsReleased;
        
        // Ensure we don't release more than what's available
        if (releaseAmount > maxRelease) {
            releaseAmount = maxRelease;
        }

        require(releaseAmount > 0, "No funds to release");

        campaign.owner.transfer(releaseAmount);
        campaign.totalFundsReleased += releaseAmount;

        emit FundsReleased(campaignId, releaseAmount);

        // Reset voting if all funds have been released
        if (campaign.totalFundsReleased == campaign.amountCollected) {
            for (uint256 i = 0; i < campaign.investors.length; i++) {
                campaign.hasVoted[campaign.investors[i]] = false;
            }
            campaign.votesInFavor = 0;
        }
    }

    function claimReward(string memory campaignId) public {
    Campaign storage campaign = campaigns[campaignId];
    require(campaign.owner != address(0), "Campaign does not exist");
    require(campaign.targetMet, "Target not met");
    require(campaign.totalFundsReleased == campaign.amountCollected, "Funds not fully released");
    require(campaign.contributions[msg.sender] > 0, "No contribution found");
    require(!campaign.hasClaimedReward[msg.sender], "Reward already claimed");

    campaign.hasClaimedReward[msg.sender] = true;

    uint256 contributionPercentage = (campaign.contributions[msg.sender] * 1e18) / campaign.amountCollected;

    string memory description = string(abi.encodePacked(
        "Reward for contribution to campaign ",
        campaignId,
        ". Contribution percentage: ",
        toString(contributionPercentage / 1e16),
        "%"
    ));

    string memory tokenURI = ""; 

    uint256 tokenId = rewardNFT.mintReward(msg.sender, stringToUint(campaignId), description, tokenURI);

    rewardDescriptions[msg.sender] = description;

    emit RewardDistributed(campaignId, msg.sender, tokenId);
}


    function redeemNFTReward(uint256 tokenId) public {
        rewardNFT.redeemReward(tokenId);
    }

    function getNFTDetails(uint256 tokenId) public view returns (RewardNFT.RewardDetails memory) {
        return rewardNFT.getRewardDetails(tokenId);
    }

    function getRewardDescription(address investor) public view returns (string memory) {
        return rewardDescriptions[investor];
    }

    function getContribution(string memory campaignId, address investor) public view returns (uint256) {
        return campaigns[campaignId].contributions[investor];
    }

    function hasClaimedReward(string memory campaignId, address investor) public view returns (bool) {
        return campaigns[campaignId].hasClaimedReward[investor];
    }

    function getInvestors(string memory campaignId) public view returns (address[] memory) {
        return campaigns[campaignId].investors;
    }

    function getFundedCampaigns(address investor) public view returns (string[] memory) {
        return userFundedCampaigns[investor];
    }

    function getOwnedCampaigns(address owner) public view returns (string[] memory) {
        return userOwnedCampaigns[owner];
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {
                result = result * 10 + (uint8(b[i]) - 48);
            }
        }
        return result;
    }
}