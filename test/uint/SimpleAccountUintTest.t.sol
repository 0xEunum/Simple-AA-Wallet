// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DeploySimpleWallet, SimpleAccount, EntryPointMock} from "script/DeploySimpleWallet.s.sol";

contract SimpleAccountUintTest is Test {
    SimpleAccount account;
    EntryPointMock entryPoint;

    address owner = address(this);

    function setUp() public {
        DeploySimpleWallet deployer = new DeploySimpleWallet();
        (account, entryPoint) = deployer.run();
    }

    function testOwnerIsDeployer() public view {
        address deployerAddress = account.getOwner();

        assertEq(deployerAddress, owner);
    }

    function testEntryPointAddIsSet() public view {
        address deployedEntryPointAddress = account.getEntryPoint();

        assertEq(deployedEntryPointAddress, address(entryPoint));
    }

    function testNonceIsSetToZero() public view {
        uint256 defaultNonce = account.getNonce();

        assertEq(defaultNonce, 0);
    }
}
