// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {UserOp} from "./UserOp.sol";
import {SimpleAccount} from "./SimpleAccount.sol";

contract EntryPointMock {
    error InvalidSender();

    function handleUserOp(UserOp calldata op) external {
        if (op.sender == address(0)) revert InvalidSender();

        SimpleAccount account = SimpleAccount(payable(op.sender));

        // 1. validate
        account.validateUserOp(op);

        // 2. execute
        account.execute(op.target, op.value, op.data);
    }
}
