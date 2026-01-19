import { privateKeyToAccount } from "viem/accounts";
import { EntryPointABI } from "../utils/ABI/EntryPointABI";
import { PackedUserOperation } from "viem";
import { Address } from "viem";
import { ethers } from "ethers";

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
  console.log("Got EP contract");
  console.log("PackedUserOp in SignUserOp", userOp);

  const userOpHash = await entryPoint.getUserOpHash(userOp);
  console.log("Got UserOpHash");

  const signature = await ownerAccount.signMessage({
    message: { raw: userOpHash as `0x${string}` },
  });
  console.log("Signed hash");

  return {
    ...userOp,
    signature,
  };
}
