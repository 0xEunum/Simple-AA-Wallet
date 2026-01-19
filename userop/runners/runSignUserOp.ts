import { buildUserOp } from "../BuildUserOp";
import { signUserOp } from "../SignUserOp";
import { PackedUserOperation } from "viem";
import { ethers } from "ethers";
import "dotenv/config";

/**
 * @notice To run this script you must deploy ENTRY_POINT, ACCOUNT AND COUNTER contracts on anvil(local) chain to simulate and verify calldata in logs
 */
async function main() {
  const ENTRY_POINT = "0x...."; // deployed EntryPoint
  const ACCOUNT = "0x...."; // MinimalAccount address
  const COUNTER = "0x...."; // Counter address

  // Encode Counter.increment()
  const counterInterface = new ethers.Interface(["function increment()"]);

  const counterCallData = counterInterface.encodeFunctionData(
    "increment",
  ) as `0x${string}`;

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const packedUserOp: PackedUserOperation = await buildUserOp({
    provider,
    entryPoint: ENTRY_POINT,
    sender: ACCOUNT,
    target: COUNTER,
    data: counterCallData,
  });
  console.log("entryPoint", ENTRY_POINT);
  console.log("PackedUserOp received");

  const signedUserOp: PackedUserOperation = await signUserOp(
    packedUserOp,
    ENTRY_POINT,
    provider,
  );

  console.log("UserOp signed:");
  console.log("PackedUserOp", signedUserOp);
  console.log("signature:", signedUserOp.signature);
}

main().catch(console.error);
