// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {VRFCoordinatorV2Interface} from "../lib/chainlink-contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "../lib/chainlink-contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";


contract RNG is VRFConsumerBaseV2 {
    struct RollInfo {
        bytes32 snapshotHash;
        uint256 result;
    }
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 immutable s_subscriptionId;

    // Sepolia coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    address immutable vrfCoordinator;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 immutable s_keyHash;

    uint32 callbackGasLimit = 300000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 1 random value in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 1;
    address s_owner;

    // map rollers to requestIds
    mapping(uint256 => RollInfo) public rolls;
    mapping(bytes32 => uint256) public snapshotHashToResult;
    // map vrf results to rollers

    event DiceRolled(uint256 requestId, bytes32 snapshotHash);
    event DiceLanded(uint256 requestId, uint256 result);

    constructor(uint64 subsID, address coordinator, bytes32 keyHash) VRFConsumerBaseV2(coordinator) {
        vrfCoordinator = coordinator;
        s_keyHash = keyHash;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subsID;
    }
    function getRoll(uint256 requestId) external view returns (RollInfo memory rollInfo ){
        return rolls[requestId];
    }
    /**
     * @notice Requests randomness
     * @dev Warning: if the VRF response is delayed, avoid calling requestRandomness repeatedly
     * as that would give miners/VRF operators latitude about which VRF response arrives first.
     * @dev You must review your implementation details with extreme care.
     *
     */
    function rollDice(
        bytes32 snapshotHash
    ) public onlyOwner returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        rolls[requestId].snapshotHash = snapshotHash;
        emit DiceRolled(requestId, snapshotHash);
    }

    /**
     * @notice Callback function used by VRF Coordinator to return the random number to this contract.
     *
     * @dev Some action on the contract state should be taken here, like storing the result.
     * @dev WARNING: take care to avoid having multiple VRF requests in flight if their order of arrival would result
     * in contract states with different outcomes. Otherwise miners or the VRF operator would could take advantage
     * by controlling the order.
     * @dev The VRF Coordinator will only send this function verified responses, and the parent VRFConsumerBaseV2
     * contract ensures that this method only receives randomness from the designated VRFCoordinator.
     *
     * @param requestId uint256
     * @param randomWords  uint256[] The random result returned by the oracle.
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 result = randomWords[0];
        rolls[requestId].result = result;
        bytes32 snapshotHash = rolls[requestId].snapshotHash;
        snapshotHashToResult[snapshotHash] = result;

        emit DiceLanded(requestId, result);
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }
}

