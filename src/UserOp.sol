// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct UserOp {
    address sender; // smart account
    address target; // contract to call
    uint256 value; // ETH value
    bytes data; // calldata
    uint256 nonce; // replay protection
    bytes signature; // owner signature
}
