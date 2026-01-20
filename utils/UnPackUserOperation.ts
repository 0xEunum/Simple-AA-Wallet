import {
  PackedUserOperation,
  RpcUserOperation,
} from "viem/account-abstraction";
import { decodeAbiParameters, toHex } from "viem";

export function unPackUserOperation(
  packed: PackedUserOperation,
): RpcUserOperation {
  // Decode bytes32 as uint256, then bit-shift/mask for uint128
  const accountGasLimits256 = decodeAbiParameters(
    [{ type: "uint256" }],
    packed.accountGasLimits as `0x${string}`,
  )[0] as bigint;

  const gasFees256 = decodeAbiParameters(
    [{ type: "uint256" }],
    packed.gasFees as `0x${string}`,
  )[0] as bigint;

  // Extract low/high uint128: low = & (2^128 - 1), high = >> 128
  const mask128 = (1n << 128n) - 1n;
  const verificationGasLimit = accountGasLimits256 & mask128;
  const callGasLimit = accountGasLimits256 >> 128n;

  const maxFeePerGas = gasFees256 & mask128;
  const maxPriorityFeePerGas = gasFees256 >> 128n;

  return {
    sender: packed.sender,
    nonce: toHex(packed.nonce),
    initCode: packed.initCode,
    callData: packed.callData,
    verificationGasLimit: toHex(verificationGasLimit, { size: 32 }),
    callGasLimit: toHex(callGasLimit, { size: 32 }),
    maxFeePerGas: toHex(maxFeePerGas, { size: 32 }),
    maxPriorityFeePerGas: toHex(maxPriorityFeePerGas, { size: 32 }),
    preVerificationGas: toHex(packed.preVerificationGas),
    paymasterAndData: packed.paymasterAndData,
    signature: packed.signature,
  };
}
