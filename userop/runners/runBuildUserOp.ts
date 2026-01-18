import { ethers } from "ethers";
import { buildUserOp } from "../BuildUserOp";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const ENTRY_POINT = "0x..."; // deployed EntryPoint
  const ACCOUNT = "0x..."; // MinimalAccount address
  const COUNTER = "0x..."; // Counter address

  // Encode Counter.increment()
  const counterInterface = new ethers.Interface(["function increment()"]);

  const counterCallData = counterInterface.encodeFunctionData("increment");

  const userOp = await buildUserOp({
    provider,
    entryPoint: ENTRY_POINT,
    sender: ACCOUNT,
    target: COUNTER,
    data: counterCallData,
  });

  console.log("UserOp built:");
  console.log("sender:", userOp.sender);
  console.log("nonce:", userOp.nonce.toString());
  console.log("callData:", userOp.callData);
}

main().catch(console.error);
