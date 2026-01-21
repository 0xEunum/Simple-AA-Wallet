# 🚀 Simple-AA-Wallet - Fully Local ERC-4337 (No Testnets!)

This repository demonstrates a **fully local, end-to-end ERC-4337 Account Abstraction flow**.

Everything runs on your machine:

- Build a `UserOperation`
- Sign it off-chain
- Send it to a local bundler
- Validate and execute it on-chain(anvil)
- Observe real state changes

No testnets. No third-party relayers. Pure local infra.

---

## 🧠 High-level Overview

This project implements a minimal smart account with the following properties:

- A **Smart Account (SA)** deployed with an `EntryPoint`
- The **deployer becomes the owner** of the smart account
- Only the **owner’s EOA** can sign `UserOperation`s
- Signatures are verified in `validateUserOp`
- Valid operations are executed via `execute(...)`
- Ownership can be transferred to another EOA

This mirrors how real production AA wallets work, without abstractions or SDKs.

---

## 🏗️ Architecture

```
EOA (owner)
   │
   │ signUserOp (off-chain)
   ▼
PackedUserOperation
   │
   │ eth_sendUserOperation
   ▼
Bundler (local)
   │
   │ calls EntryPoint.handleOps
   ▼
EntryPoint
   │
   ├─ validateUserOp (Smart Account)
   └─ execute (Smart Account)
         │
         ▼
     Target Contract (Counter)
```

---

## 📦 Contracts

### 1. EntryPoint

- Standard ERC-4337 EntryPoint
- Deployed locally
- Used by both Smart Account and Bundler

### 2. Smart Account

- Stores `owner`
- Validates signatures in `validateUserOp`
- Executes calls via `execute(address target, uint256 value, bytes calldata data)`
- Supports ownership transfer

### 3. Counter (Target Contract)

- Simple contract with `increment()`
- Used to prove execution and state change

---

## 🛠️ Local Setup

This project runs **fully locally** using Anvil, Foundry, and a local ERC-4337 bundler. Follow the steps in order.

---

### 1️⃣ Clone the repository

```bash
git clone https://github.com/0xEunum/Simple-AA-Wallet
cd Simple-AA-Wallet
```

---

### 2️⃣ Install dependencies

Install root dependencies:

```bash
npm install
```

Install bundler dependencies:

```bash
cd infra/bundler
yarn && yarn preprocess
```

---

### 3️⃣ Start Anvil

Run Anvil from root.

```bash
anvil \
  --disable-code-size-limit \
  --chain-id 8546
```

---

### 4️⃣ Deploy contracts (Foundry)

Use Anvil Account-1 for all deployments.

Deployment order **matters**:

1. EntryPoint
2. Smart Account (MinimalAccount)
3. Counter

---

#### 4.1 Deploy EntryPoint

```bash
forge script script/Deploy.s.sol:DeployEntryPoint \
  --private-key <PRIVATE_KEY> \
  --rpc-url anvil \
  --broadcast
```

---

#### 4.2 Deploy Smart Account

Pass the deployed EntryPoint address to the constructor.

```bash
forge create src/SmartAccount/MinimalAccount.sol:MinimalAccount \
  --private-key <PRIVATE_KEY> \
  --rpc-url anvil \
  --constructor-args <ENTRY_POINT_ADDRESS> \
  --broadcast
```

The deployer becomes the **owner** of the smart account.

---

#### 4.3 Deploy Counter contract

```bash
forge script script/Deploy.s.sol:DeployCounter \
  --private-key <PRIVATE_KEY> \
  --rpc-url anvil \
  --broadcast
```

---

### 5️⃣ Verify deployed addresses

Cross-check deployed contract addresses and update them in your `src/index.ts` and `userop/runners`.

```ts
const ENTRY_POINT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ACCOUNT = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const COUNTER = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
```

---

### 6️⃣ Fund the Smart Account

The smart account **must hold ETH** to pre-fund the EntryPoint.

```bash
cast send <SMART_ACCOUNT_ADDRESS> \
  --value 1ether \
  --private-key <PRIVATE_KEY> \
  --rpc-url anvil
```

Using keystore accounts:

```bash
cast send <SMART_ACCOUNT_ADDRESS> \
  --value 1ether \
  --account <ACCOUNT_NAME> \
  --rpc-url anvil
```

---

### 7️⃣ Environment variables

Create a `.env` file in the project root:

```env
OWNER_PRIVATE_KEY=<ANVIL_ACCOUNT_1_PRIVATE_KEY>
```

This key is used **off-chain** to sign `PackedUserOperation`s.

---

### 8️⃣ Start the local bundler

The bundler is included as a submodule under:

```
infra/bundler
```

Start the bundler:

```bash
cd infra/bundler
yarn run bundler \
  --unsafe \
  --auto \
  --entryPoint <ENTRY_POINT_ADDRESS>
```

Refer to `infra/bundler/README.md` for advanced configuration and flags.

---

### 9️⃣ Run the UserOperation flow

#### ▶ Full end-to-end flow

From the project root:

```bash
npm run start
```

This runs `src/index.ts` and performs the complete Account Abstraction flow:

1. Builds a `PackedUserOperation`
2. Computes `userOpHash` via `EntryPoint.getUserOpHash`
3. Signs the hash using the **smart account owner’s private key** (`OWNER_PRIVATE_KEY` from `.env`)
4. Converts `PackedUserOperation → RpcUserOperation`
5. Sends it to the **local bundler** via `eth_sendUserOperation`
6. Bundler calls `EntryPoint.handleOps`
7. Smart Account validates the signature
8. Smart Account executes the call
9. `Counter.increment()` is executed and state is updated

`npm run start` and `npm start` are equivalent.

---

#### 🧪 Run steps individually (debug-friendly)

Each step can be executed in isolation for debugging and learning.

##### 1️⃣ Build UserOperation only

```bash
npm run build:userop
```

Runs:

```
userop/runners/runBuildUserOp.ts
```

What it does:

- Fetches nonce from EntryPoint
- Encodes `execute(target, value, calldata)`
- Builds a `PackedUserOperation`
- Logs the built UserOp (no signature)

---

##### 2️⃣ Build + Sign UserOperation

```bash
npm run sign:userop
```

Runs:

```
userop/runners/runSignUserOp.ts
```

What it does:

- Builds the `PackedUserOperation`
- Computes `userOpHash`
- Signs it using `OWNER_PRIVATE_KEY`
- Attaches the signature
- Logs the **signed UserOperation**

---

##### 3️⃣ Build + Sign + Send UserOperation

```bash
npm run send:userop
```

What it does:

- Builds the UserOperation
- Signs it
- Converts it to `RpcUserOperation`
- Sends it to the local bundler

This command performs the same flow as `npm run start`, but exists as a dedicated script for clarity.

---

📝 Notes:

- All scripts assume the Smart Account is **already deployed**
- `initCode` is intentionally empty
- Gas values are static and tuned for local execution
- No paymaster is used

This setup mirrors how real AA clients and SDKs orchestrate UserOperations, without hiding any steps.

---

## ✅ Verifying Execution

After a successful run:

- The transaction is included by the bundler
- `handleOps` executes without revert
- `Counter.count()` increases by `+1`

This confirms:

- Signature validation worked
- Execution path is correct
- State was modified on-chain

---

## 📁 Project Structure

```
infra/
  bundler/                     # eth-infinitism/bundler (local ERC-4337 bundler)

script/
  Deploy.s.sol                 # Deploy EntryPoint, Counter

src/
  index.ts                     # Orchestrates full AA flow (build → sign → send)

  SmartAccount/
    MinimalAccount.sol         # ERC-4337 compatible smart account (owner-based)

  Target/
    Counter.sol                # Target contract to verify execution

userop/
  BuildUserOp.ts               # Constructs PackedUserOperation (nonce, calldata, gas)
  SignUserOp.ts                # Computes userOpHash and signs it with owner key
  SendUserOp.ts                # Sends UserOp to bundler via eth_sendUserOperation

  runners/
    runBuildUserOp.ts          # Runner: build only
    runSignUserOp.ts           # Runner: build + sign
    runSendUserOp.ts           # Runner: build + sign + send

utils/
  ABI/
    EntryPointABI.ts           # ABI for EntryPoint interactions (hashing, nonce)

  UnPackUserOperation.ts       # Converts PackedUserOp → RPC UserOp format

.gitignore
.gitmodules                    # Bundler repo as submodule
.foundry.toml                  # Foundry configuration
package.json                   # Node scripts + deps
... other config files
```

---

## 🛠️ Technologies Used

| Category            | Tools                                                             |
| ------------------- | ----------------------------------------------------------------- |
| **AA Spec**         | ERC-4337 (v0.7), PackedUserOperation, EntryPoint                  |
| **Smart Contracts** | Solidity ^0.8.24, Foundry, OpenZeppelin (ECDSA, Ownable)          |
| **Bundler**         | eth-infinitism/bundler (local, `--unsafe` Anvil mode)             |
| **Off-chain**       | TypeScript, viem@2.44.4 (RPC + signing), ethers v6 (ABI encoding) |
| **Dev Tools**       | Anvil (chainId 8546), Forge, Cast                                 |
| **Core Libs**       | `@account-abstraction/contracts`, `@openzeppelin/contracts`       |

**Design goal:** no SDKs, no wallet frameworks, only raw ERC-4337 primitives.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingNewFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingNewFeature`)
5. Open a Pull Request

**No contribution is too small!** Bug fixes, docs, tests - all welcome.

## 📄 License

MIT © [0xEunum](https://github.com/0xEunum)
