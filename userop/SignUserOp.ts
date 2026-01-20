import { privateKeyToAccount } from "viem/accounts";
import { EntryPointABI } from "../utils/ABI/EntryPointABI";
import { PackedUserOperation } from "viem";
import { Address } from "viem";
import { ethers } from "ethers";
import "dotenv/config";

export async function signUserOp(
  userOp: PackedUserOperation,
  entryPointAddress: Address,
  provider: ethers.JsonRpcProvider,
): Promise<PackedUserOperation> {
  const ownerAccount = privateKeyToAccount(
    process.env.OWNER_PRIVATE_KEY as `0x${string}`,
  );

  const entryPoint = new ethers.Contract(
    entryPointAddress,
    EntryPointABI,
    provider,
  );

  const userOpHash = await entryPoint.getUserOpHash(userOp);

  const signature = await ownerAccount.signMessage({
    message: { raw: userOpHash as `0x${string}` },
  });

  return {
    ...userOp,
    signature,
  };
}
