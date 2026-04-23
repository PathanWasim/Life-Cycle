// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BloodChain
 * @dev Smart contract for recording blood supply chain milestones on Polygon Amoy testnet
 * @notice This contract records three critical events: Donation, Transfer, and Usage
 */
contract BloodChain {
    
    // Enum for milestone types
    enum MilestoneType { Donation, Transfer, Usage }
    
    // Struct to store milestone information
    struct Milestone {
        string bloodUnitID;           // Unique identifier for the blood unit
        MilestoneType milestoneType;  // Type of milestone (Donation, Transfer, Usage)
        address actor;                // Address of the account recording the milestone
        string metadata;              // JSON string with additional data
        uint256 timestamp;            // Block timestamp when milestone was recorded
    }
    
    // Mapping: bloodUnitID => array of milestones
    mapping(string => Milestone[]) private bloodUnitMilestones;
    
    // Events for each milestone type
    event DonationRecorded(
        string indexed bloodUnitID,
        address indexed donor,
        uint256 timestamp,
        string metadata
    );
    
    event TransferRecorded(
        string indexed bloodUnitID,
        address indexed fromHospital,
        address indexed toHospital,
        uint256 timestamp,
        string metadata
    );
    
    event UsageRecorded(
        string indexed bloodUnitID,
        address indexed hospital,
        uint256 timestamp,
        string metadata
    );
    
    /**
     * @dev Record a blood donation milestone
     * @param bloodUnitID Unique identifier for the blood unit
     * @param metadata JSON string containing donor info, hospital info, blood group, etc.
     */
    function recordDonation(
        string memory bloodUnitID,
        string memory metadata
    ) public {
        // Create milestone
        Milestone memory newMilestone = Milestone({
            bloodUnitID: bloodUnitID,
            milestoneType: MilestoneType.Donation,
            actor: msg.sender,
            metadata: metadata,
            timestamp: block.timestamp
        });
        
        // Store milestone
        bloodUnitMilestones[bloodUnitID].push(newMilestone);
        
        // Emit event
        emit DonationRecorded(bloodUnitID, msg.sender, block.timestamp, metadata);
    }
    
    /**
     * @dev Record a blood transfer milestone
     * @param bloodUnitID Unique identifier for the blood unit
     * @param metadata JSON string containing from/to hospital info, transfer date, etc.
     */
    function recordTransfer(
        string memory bloodUnitID,
        string memory metadata
    ) public {
        // Create milestone
        Milestone memory newMilestone = Milestone({
            bloodUnitID: bloodUnitID,
            milestoneType: MilestoneType.Transfer,
            actor: msg.sender,
            metadata: metadata,
            timestamp: block.timestamp
        });
        
        // Store milestone
        bloodUnitMilestones[bloodUnitID].push(newMilestone);
        
        // Emit event
        emit TransferRecorded(bloodUnitID, msg.sender, address(0), block.timestamp, metadata);
    }
    
    /**
     * @dev Record a blood usage milestone
     * @param bloodUnitID Unique identifier for the blood unit
     * @param metadata JSON string containing hospital info, patient info, usage date, etc.
     */
    function recordUsage(
        string memory bloodUnitID,
        string memory metadata
    ) public {
        // Create milestone
        Milestone memory newMilestone = Milestone({
            bloodUnitID: bloodUnitID,
            milestoneType: MilestoneType.Usage,
            actor: msg.sender,
            metadata: metadata,
            timestamp: block.timestamp
        });
        
        // Store milestone
        bloodUnitMilestones[bloodUnitID].push(newMilestone);
        
        // Emit event
        emit UsageRecorded(bloodUnitID, msg.sender, block.timestamp, metadata);
    }
    
    /**
     * @dev Get all milestones for a specific blood unit
     * @param bloodUnitID Unique identifier for the blood unit
     * @return Array of milestones for the blood unit
     */
    function getMilestones(string memory bloodUnitID) 
        public 
        view 
        returns (Milestone[] memory) 
    {
        return bloodUnitMilestones[bloodUnitID];
    }
    
    /**
     * @dev Get the count of milestones for a specific blood unit
     * @param bloodUnitID Unique identifier for the blood unit
     * @return Number of milestones recorded
     */
    function getMilestoneCount(string memory bloodUnitID) 
        public 
        view 
        returns (uint256) 
    {
        return bloodUnitMilestones[bloodUnitID].length;
    }
}