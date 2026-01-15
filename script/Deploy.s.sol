// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
// import {MinimalAccount} from "src/SmartAccount/MinimalAccount.sol";
import {Counter} from "src/Target/Counter.sol";
import {EntryPoint} from "lib/account-abstraction/contracts/core/EntryPoint.sol";

/**
 * @title DeployMinimalAccount
 * @author Mohammed Muzammil
 * @notice DeployMinimalAccount Script is complicated to implement, It's not impossible. It's just take so much set-up to deploy account with entryPoint address using *foundry script*.
 * @notice Thats why i'll use *forge create* command to deploy MinimalAccount.
 * @notice Deployment command would be
 * forge create src/SmartAccount/MinimalAccount.sol:MinimalAccount --private-key <private-key> --rpc-url anvil --constructor-args <EntryPoint address> --broadcast
 *                  OR
 * forge create src/SmartAccountMinimalAccount.sol:MinimalAccount --account <account-name> --rpc-url anvil --constructor-args <EntryPoint address> --broadcast
 */
// contract DeployMinimalAccount is Script {

//     function run() external returns (MinimalAccount) {
//         vm.startBroadcast();
//         MinimalAccount account = new MinimalAccount();
//         vm.stopBroadcast();
//         return (account);
//     }
// }

contract DeployCounter is Script {
    function run() external returns (Counter) {
        vm.startBroadcast();
        Counter counter = new Counter();
        vm.stopBroadcast();
        return counter;
    }
}

contract DeployEntryPoint is Script {
    function run() external returns (EntryPoint) {
        vm.startBroadcast();
        EntryPoint entryPoint = new EntryPoint();
        vm.stopBroadcast();
        return entryPoint;
    }
}
