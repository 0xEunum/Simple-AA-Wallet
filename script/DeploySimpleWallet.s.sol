// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {EntryPointMock} from "src/EntryPointMock.sol";
import {SimpleAccount} from "src/SimpleAccount.sol";

contract DeploySimpleWallet is Script {
    function run() public returns (address, address) {
        vm.startBroadcast();
        EntryPointMock entryPointMock = new EntryPointMock();
        SimpleAccount account = new SimpleAccount(tx.origin, address(entryPointMock));
        // SimpleAccount account = new SimpleAccount(msg.sender, address(entryPointMock));
        vm.stopBroadcast();

        console2.log("tx origin", tx.origin);
        console2.log("msg sender", msg.sender);

        return (address(entryPointMock), address(account));
    }
}
