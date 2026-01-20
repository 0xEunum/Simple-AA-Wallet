import { ethers } from "ethers";
import { buildUserOp } from "../BuildUserOp";
import { Hex, PackedUserOperation } from "viem";

/**
 * @notice To run this script you must deploy ENTRY_POINT, ACCOUNT AND COUNTER contracts on anvil(local) chain to simulate and verify calldata in logs
 */
async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const ENTRY_POINT = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // deployed EntryPoint
  const ACCOUNT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // MinimalAccount address
  const COUNTER = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Counter address

  // Encode Counter.increment()
  const counterInterface = new ethers.Interface(["function increment()"]);

  const counterCallData = counterInterface.encodeFunctionData(
    "increment",
  ) as `0x${string}`;

  const userOp: PackedUserOperation = await buildUserOp({
    provider,
    entryPoint: ENTRY_POINT,
    sender: ACCOUNT,
    target: COUNTER,
    data: counterCallData,
  });

  console.log("UserOp build:", userOp);
}

main().catch(console.error);
