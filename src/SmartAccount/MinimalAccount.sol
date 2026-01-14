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

import {IAccount} from "lib/account-abstraction/contracts/interfaces/IAccount.sol";
import {IEntryPoint} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "lib/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {SIG_VALIDATION_FAILED, SIG_VALIDATION_SUCCESS} from "lib/account-abstraction/contracts/core/Helpers.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MinimalAccount is IAccount, Ownable {
    // ERRORS
    error MinimalAccount__NotEntryPoint();
    error MinimalAccount__TransferFailed();
    error MinimalAccount__CallFailed(bytes);

    // STATE VARIABLES
    IEntryPoint private immutable I_ENTRY_POINT;

    // EVENTS

    // MODIFIERS
    modifier onlyEntryPoint() {
        if (msg.sender != address(I_ENTRY_POINT)) {
            revert MinimalAccount__NotEntryPoint();
        }
        _;
    }

    // FUNCTIONS
    constructor(address _entryPoint) Ownable(msg.sender) {
        I_ENTRY_POINT = IEntryPoint(_entryPoint);
    }

    receive() external payable {}

    // EXTERNAL FUNCTIONS
    function validateUserOp(PackedUserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds)
        external
        onlyEntryPoint
        returns (uint256 validationData)
    {
        validationData = _validateSignature(userOp, userOpHash);
        _payPreFund(missingAccountFunds);
    }

    function execute(address _target, uint256 _value, bytes calldata _calldata) external onlyEntryPoint {
        (bool success, bytes memory data) = payable(_target).call{value: _value}(_calldata);
        require(success, MinimalAccount__CallFailed(data));
    }

    // PUBLIC FUNCTIONS

    // INTERNAL FUNCTIONS

    // PRIVATE FUNCTIONS
    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        private
        view
        returns (uint256 validationData)
    {
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
        address signer = ECDSA.recover(ethSignedMessageHash, userOp.signature);

        if (signer != owner()) {
            return SIG_VALIDATION_FAILED;
        }
        return SIG_VALIDATION_SUCCESS;
    }

    function _payPreFund(uint256 _missingAccountFunds) private {
        if (_missingAccountFunds != 0) {
            (bool success,) = payable(address(I_ENTRY_POINT)).call{value: _missingAccountFunds}("");
            require(success, MinimalAccount__TransferFailed());
        }
    }

    // VIEW AND PURE FUNCTION
    function getEntryPoint() external view returns (address) {
        return address(I_ENTRY_POINT);
    }
}
