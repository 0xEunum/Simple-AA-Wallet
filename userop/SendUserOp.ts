import { Address, createPublicClient, Hex, http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { PackedUserOperation, RpcUserOperation } from "viem";
import { unPackUserOperation } from "../utils/UnPackUserOperation";
import { defineChain } from "viem";

export const anvil8546 = /*#__PURE__*/ defineChain({
  id: 8546,
  name: "Anvil",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"],
    },
  },
});

export async function sendUserOp(
  userOp: PackedUserOperation,
  entryPoint: Address,
): Promise<Hex> {
  const rpcUserOperation: RpcUserOperation = unPackUserOperation(userOp);

  const publicClient = createPublicClient({
    chain: anvil8546,
    transport: http("http://127.0.0.1:8545"),
  });

  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http("http://localhost:3000/rpc"), // bundler RPC
  });

  const userOpHash = await bundlerClient.request({
    method: "eth_sendUserOperation",
    params: [rpcUserOperation, entryPoint],
  });

  return userOpHash;
}
