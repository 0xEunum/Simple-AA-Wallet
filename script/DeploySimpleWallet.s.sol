// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {EntryPointMock} from "src/EntryPointMock.sol";
import {SimpleAccount} from "src/SimpleAccount.sol";

contract DeploySimpleWallet is Script {
    function run() public returns (SimpleAccount, EntryPointMock) {
        vm.startBroadcast();

        EntryPointMock ep = new EntryPointMock();
        SimpleAccount account = new SimpleAccount(msg.sender, address(ep));

        vm.stopBroadcast();

        console2.log("msg.sender", msg.sender);
        console2.log("tx.origin", tx.origin);

        return (account, ep);
    }
}
