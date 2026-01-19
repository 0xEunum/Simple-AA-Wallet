import { ethers } from "ethers";
import { EntryPointABI } from "../utils/ABI/EntryPointABI";
import { Hex, PackedUserOperation, numberToHex } from "viem";
import { Address } from "viem";

export async function buildUserOp({
  provider,
  entryPoint,
  sender,
  target,
  value = 0n,
  data,
}: {
  provider: ethers.JsonRpcProvider;
  entryPoint: Address;
  sender: Address;
  target: Address;
  value?: bigint;
  data: Hex;
}): Promise<PackedUserOperation> {
  const epContract = new ethers.Contract(entryPoint, EntryPointABI, provider);

  // 1. nonce comes from EntryPoint
  const nonce: bigint = await epContract.getNonce(sender, 0);

  // 2. encode execute(target, value, calldata)
  const accountInterface = new ethers.Interface([
    "function execute(address,uint256,bytes)",
  ]);

  const callData = accountInterface.encodeFunctionData("execute", [
    target,
    value,
    data,
  ]) as `0x${string}`;

  return {
    sender,
    nonce,
    initCode: "0x", // already deployed
    callData,
    accountGasLimits: numberToHex(300000n, { size: 32 }),
    preVerificationGas: 50_000n,
    gasFees: numberToHex(5000000n, { size: 32 }),
    paymasterAndData: "0x", // no paymaster yet
    signature: "0x", // filled later
  };
}
