import { buildUserOp } from "../userop/BuildUserOp";
import { signUserOp } from "../userop/SignUserOp";
import { sendUserOp } from "../userop/SendUserOp";
import { ethers } from "ethers";
import { Hex, PackedUserOperation } from "viem";

async function main() {
  const ENTRY_POINT = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // deployed EntryPoint
  const ACCOUNT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // MinimalAccount address
  const COUNTER = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Counter address

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const packedUserOp: PackedUserOperation = await buildUserOp({
    provider,
    entryPoint: ENTRY_POINT,
    sender: ACCOUNT,
    target: COUNTER,
    data: "0xd09de08a", // increment(),
  });
  console.log("PackedUserOp build:", packedUserOp);

  const signedUserOp: PackedUserOperation = await signUserOp(
    packedUserOp,
    ENTRY_POINT,
    provider,
  );

  console.log("UserOp signed:", signedUserOp);

  const userOpHash: Hex = await sendUserOp(signedUserOp, ENTRY_POINT);
  console.log("UserOp Hash:", userOpHash);
}

main().catch(console.error);
