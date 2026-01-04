// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Layout of Contract:
// version
// imports
// interfaces, libraries, contracts
// Type declarations
// errors
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

import {UserOp} from "./UserOp.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract SimpleAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    // ERRORS

    error SimpleAccount__NotEntryPoint();
    error SimpleAccount__InvalidSignature();
    error SimpleAccount__InvalidNonce();
    error SimpleAccount__CallFailed();

    // STATE VARIABLES
    address private immutable i_owner;
    address private immutable i_entryPoint;
    uint256 private s_nonce;

    // EVENTS

    // MODIFIERS
    modifier onlyEntryPoint() {
        if (msg.sender != i_entryPoint) revert SimpleAccount__NotEntryPoint();
        _;
    }

    // FUNCTIONS
    constructor(address _owner, address _entryPoint) {
        i_owner = _owner;
        i_entryPoint = _entryPoint;
    }

    receive() external payable {}

    // EXTERNAL FUNCTIONS
    function validateUserOp(UserOp calldata op) external onlyEntryPoint {
        if (op.nonce != s_nonce) revert SimpleAccount__InvalidNonce();

        bytes32 hash = keccak256(abi.encode(op.sender, op.target, op.value, op.data, op.nonce));

        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(op.signature);

        if (signer != i_owner) revert SimpleAccount__InvalidSignature();

        s_nonce++;
    }

    function execute(address target, uint256 value, bytes calldata data) external onlyEntryPoint {
        (bool success,) = target.call{value: value}(data);
        if (!success) revert SimpleAccount__CallFailed();
    }

    // PUBLIC FUNCTIONS

    // INTERNAL FUNCTIONS

    // PRIVATE FUNCTIONS

    // VIEW AND PURE FUNCTION
    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getEntryPoint() external view returns (address) {
        return i_entryPoint;
    }

    function getNonce() external view returns (uint256) {
        return s_nonce;
    }
}
