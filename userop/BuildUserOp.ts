import { ethers } from "ethers";
import { EntryPointABI } from "../utils/ABI/EntryPointABI";

export type PackedUserOperation = {
  sender: string;
  nonce: bigint;
  initCode: string;
  callData: string;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: string;
  signature: string;
};

export async function buildUserOp({
  provider,
  entryPoint,
  sender,
  target,
  value = 0n,
  data,
}: {
  provider: ethers.JsonRpcProvider;
  entryPoint: string;
  sender: string;
  target: string;
  value?: bigint;
  data: string;
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
  ]);

  // 3. gas (static for now, ok for local)
  const maxFeePerGas = 1n * 10n ** 9n; // 1 gwei
  const maxPriorityFeePerGas = 1n * 10n ** 9n;

  return {
    sender,
    nonce,
    initCode: "0x", // already deployed
    callData,
    callGasLimit: 300_000n,
    verificationGasLimit: 300_000n,
    preVerificationGas: 50_000n,
    maxFeePerGas,
    maxPriorityFeePerGas,
    paymasterAndData: "0x", // no paymaster yet
    signature: "0x", // filled later
  };
}
