# From secp256k1 to STARK-Friendly Curves: Exploring ECDSA in Ethereum and Starknet

Elliptic Curve Digital Signature Algorithm (ECDSA) is a fundamental building block for secure transactions on blockchains. While Ethereum and Starknet both rely on ECDSA, they implement it using different elliptic curves, account models, and verification methods.

Think of it like two bank branches that share the same principles of checking signatures, yet each uses a slightly different machine to verify them. Both branches still rely on your personal signature to confirm you’re the account owner, but the behind-the-scenes verification differs.

In this post, we’ll explain ECDSA’s basics, how Ethereum does it, and then how Starknet adapts ECDSA to suit its zero-knowledge-friendly environment.

## ECDSA in a Nutshell

ECDSA (Elliptic Curve Digital Signature Algorithm) is a method for creating digital signatures using elliptic-curve cryptography.

Key points:

* Private Key: A randomly generated number that must remain secret.
* Public Key: Derived from your private key and shared publicly.
* Signature: Formed by two numbers, typically called r and s, which prove you hold the private key.

Imagine your private key as the only keycard that opens your personal vault. Your public key is the lock on the vault’s door—visible to everyone. When you place an item in the vault (sign a transaction), you leave a unique imprint (your signature). Anyone can verify it matches your lock, but no one can duplicate your keycard.


## ECDSA in Ethereum
Ethereum relies on ECDSA with the `secp256k1` curve. Here’s how it works in everyday Ethereum transactions:

* Sign the Transaction: You use your private key to generate ECDSA’s `r`, `s`, `v` values (where `v` helps Ethereum figure out which public key to use for verification).
* Broadcast: The signed transaction goes out to the Ethereum network.
* Verification: Each node checks your signature against your public key. If the signature is valid, the network processes the transaction.

This process is tied to Ethereum’s `Externally Owned Accounts` (EOAs)—wallets controlled by a private key. While it’s straightforward, it can be rigid when you want more advanced authentication methods (like multi-factor authentication).


## ECDSA in Starknet
Starknet also uses ECDSA for signing but does so with a “STARK-friendly” elliptic curve optimized for zero-knowledge proofs. Its hashing function (Pedersen hash) and account abstraction model distinguish it from Ethereum.

How Starknet Adapts ECDSA
* Curve and Hash: Instead of secp256k1, Starknet uses a curve designed to work efficiently with STARK proofs. All transaction data is hashed via the Pedersen hash function, native to Starknet.
* Account Abstraction: Every user account on Starknet is a smart contract. This allows you to customize verification logic or add extra security steps.
* Flexible Verification: Because each account is a contract, you can upgrade or change how signatures are verified. This is especially powerful for multi-factor or quantum-resistant schemes.

## The Math Behind the Stark Curve

When we say “Starknet uses a STARK-friendly elliptic curve,” we’re referring to a curve whose parameters (prime field, curve equation, and group order) are chosen to work efficiently in STARK-based zero-knowledge proofs. Ethereum’s `secp256k1`, by contrast, is optimized for CPU-based ECDSA verification and is widely adopted (e.g., Bitcoin, Ethereum).

### Ethereum’s secp256k1 Curve
- **Type**: A Koblitz curve defined by the equation:
  ```
  y^2 = x^3 + 7   (mod p)
  ```
- **Prime** (`p`): `2^256 - 2^32 - 977`
- **Group Order** (`n`): approximately `1.158 × 10^77`
- **Motivation**: Designed for efficient scalar multiplication on CPUs (key for signature verification). It was not specifically chosen for zero-knowledge proofs, but rather for broad adoption in mainstream crypto applications.

### Starknet’s STARK-Friendly Curve
Starknet uses an elliptic curve defined over a large prime field near `2^251`. You’ll often see references to it in the Pedersen hashing process. The high-level math is similar—still `y^2 = x^3 + A x + B`—but the choice of `p`, `A`, and `B` is specialized for STARK proofs.

- **Type**: A Weierstrass form curve, typically expressed as:
  ```
  y^2 = x^3 + A x + B   (mod p)
  ```
- **Prime** (`p`): approximately `2^251`, ensuring efficient operations in STARK circuits.
- **Group Order** (`n`): also on the order of `2^251`, large enough to protect against discrete log attacks.
- **Motivation**: The prime is chosen to be “friendly” for STARK-based zero-knowledge proofs, meaning it simplifies the arithmetic within the proof circuits. Fewer constraints lead to more efficient proof generation.

### Why “STARK-Friendly” Matters
In a STARK-based system, you often need to prove knowledge of signatures or hashed data within a zero-knowledge circuit. Curves like `secp256k1` can be used in zero-knowledge proofs, but they introduce more overhead:

1. **Prime Field Mismatch**: STARK systems use a specific “native field.” If `secp256k1`’s prime doesn’t match that field, you need to add extra logic or conversions.
2. **Complex Curve Equations**: Every arithmetic step in your proof adds constraints. A curve that fits neatly into the STARK-native field reduces those constraints and speeds up proofs.

By using a curve that aligns with the native STARK field, Starknet can validate signatures and Pedersen hashes with far less complexity in the proof circuits. This means faster, cheaper proof generation and verification—critical for a zero-knowledge-oriented blockchain.

### Comparing the Two Curves
1. **Field Size**  
   - **secp256k1**: `p ≈ 2^256`  
   - **Stark Curve**: `p ≈ 2^251`  
   Though both are large, the Stark curve’s prime is deliberately chosen to match STARK circuits.

2. **Curve Equation**  
   - Both use a Weierstrass form, but each has distinct constants for `A` and `B`.

3. **Group Order & Security**  
   - Both define large prime-order subgroups to prevent discrete log attacks.

4. **Performance Goals**  
   - **secp256k1**: Ideal for CPU-based ECDSA, widely supported in existing libraries.  
   - **Stark Curve**: Ideal for zero-knowledge proof systems—faster, cheaper proving in STARK environments.

Conceptually, the ECDSA steps (hashing data, generating `(r, s)`, verifying signatures) remain the same on both Ethereum and Starknet. The critical difference is the choice of curve parameters under the hood, which makes Starknet’s curve more amenable to zero-knowledge computations.



## Differences Between Starknet and Ethereum

| **Aspect**           | **Starknet**                                                                                         | **Ethereum**                                                                  |
|----------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Curve**            | Uses a STARK-friendly elliptic curve, specialized for zero-knowledge (ZK) computations.             | Employs the secp256k1 curve.                                                 |
| **Account Model**    | All accounts are smart contracts (account abstraction).                                             | Uses Externally Owned Accounts (EOAs) plus contract accounts.                |
| **Verification**     | Signature checks occur within account contracts, allowing upgrades or customized logic.             | Verification is built into the protocol for EOAs; contracts need custom logic for their own checks. |
| **Flexibility**      | Supports multiple signing methods (e.g., multi-factor, quantum-safe), thanks to account abstraction. | Generally tied to ECDSA for EOAs, limiting native flexibility.               |
| **Gas Efficiency**   | Potential for lower costs with more efficient or alternative signature schemes.                     | ECDSA-based verification can be more expensive.                               |
| **Quantum Resistance** | Account abstraction streamlines the adoption of quantum-safe algorithms.                           | Relying on secp256k1 for EOAs, making a transition to quantum resistance more involved. |


## Step-by-Step: Signing a Transaction in Starknet
Below is the typical flow of signing a transaction in Starknet:

1. Message Hashing
   1. Starknet uses the Pedersen hash (native to Starknet) for hashing the transaction data.
2. Signature Generation
   1. You sign the hashed data using the ECDSA algorithm with the Stark-friendly elliptic curve.
   2. The result is a signature composed of two numbers, r and s.
3. Verification
   1. In Starknet, your account contract checks whether `r`, `s` match the hashed transaction data and your public key.
   2. If valid, the network processes your transaction.

Important Considerations:
* Nonce: Include a nonce in every transaction to prevent replay attacks.
* EIP-712: Starknet’s recommended approach for structured data, providing clarity and consistency.
* Ethereum Compatibility: Some libraries let you sign with Ethereum keys for cross-chain workflows.

## Practical Examples in Starknet.js

The Starknet.js library lets you sign messages in several ways: using simple arrays of numbers, structured data (EIP-712), or even an Ethereum-style signer. These examples show how to sign and verify both off-chain and on-chain.

### End-to-End Script: Generate Key, Sign, and Verify
Below is a complete script that you can run in this repository to verify that your local environment is set up correctly. This script does the following:

1. Generates or uses an existing private key.
2. Derives the corresponding public key.
3. Creates a simple message and computes its hash using Starknet’s Pedersen hash.
4. Signs the hash with Starknet ECDSA, producing { r, s }.
5. Verifies the signature with the uncompressed public key.

```ts
import { ec, hash, encode } from 'starknet';

async function main() {
  // 1) Generate or have a private key
  const privateKey = '0x1234567890987654321'; // Example only, use secure storage in production!

  // 2) Compute the Starknet public key in hex format (0x04 + X + Y)
  const fullPublicKey = encode.addHexPrefix(
    encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))
  );
  console.log('Full public key =', fullPublicKey);

  // 3) Define a message as BigNumberish[] and compute its hash as a hex string
  const message = [1, 128, 18, 14];
  const msgHash = hash.computeHashOnElements(message);
  console.log('Message hash =', msgHash); // "0x..." in hex

  // 4) Sign the hash using ec.starkCurve.sign (returns { r: "0x..", s: "0x.." })
  const signature = ec.starkCurve.sign(msgHash, privateKey);
  console.log('Signature =', signature);

  // 5) Verify the signature
  // ec.starkCurve.verify({ r, s }, msgHash, fullPublicKey)
  const isValid = ec.starkCurve.verify(signature, msgHash, fullPublicKey);
  console.log('Signature is valid?', isValid);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

If you’ve used Ethereum’s secp256k1 curve, you’ll notice that signing and verifying are conceptually similar—only the curve and hashing function differ.

### Advanced: EIP-712 Typed Data and On-Chain Verification

Sometimes you need to sign structured data—for instance, a game might want to verify that a user purchased certain items, or a DApp might require multiple typed fields. Starknet provides an EIP-712-like system for typed data, which you can sign off-chain and optionally verify on-chain.

Here’s a script that:

1. Connects to the local devnet.
2. Uses a real devnet account (with an address and private key).
3. Creates an EIP-712 style typedData object.
4. Naively hashes that data with starknetKeccak(JSON.stringify(typedData)) and signs it (just for demonstration).
5. Verifies the signature off-chain using the uncompressed public key.
6. Calls the account’s isValidSignature method on-chain—this typically requires the signature array to include its length (a common source of errors).

> Warning: In a production dApp, you should rely on official typed-data hashing (e.g., `account.signMessage(typedData)`), which ensures the on-chain contract recognizes the signature.

```ts
// signAndVerifyAdvanced.ts

import {
  ec,
  hash,
  encode,
  shortString,
  Account,
  RpcProvider,
  TypedData,
  WeierstrassSignatureType,
} from 'starknet';

async function main() {
  // ---------------------------
  // 1) Connect to Devnet
  // ---------------------------
  const provider = new RpcProvider({ nodeUrl: 'http://127.0.0.1:5050/rpc' });
  try {
    // Check if devnet is responding
    const latestBlock = await provider.getBlock('latest');
    console.log('✅ Successfully connected to devnet!');
    console.log(`Latest block #${latestBlock.block_number} | Hash: ${latestBlock.block_hash}`);
  } catch (err) {
    console.error('❌ Could not connect to devnet. Is it running? Error:', err);
    process.exit(1);
  }

  // ---------------------------
  // 2) Use Your Devnet Account
  // ---------------------------
  // Replace with your actual devnet account address & private key
  // (Provided example from devnet account #0)
  const privateKey =
    '0x00000000000000000000000000000000c10662b7b247c7cecf7e8a30726cff12';
  const accountAddress =
    '0x0260a8311b4f1092db620b923e8d7d20e76dedcc615fb4b6fdf28315b81de201';

  // Create an Account instance that can sign & send transactions
  const account = new Account(provider, accountAddress, privateKey);

  // ---------------------------
  // 3) Generate Uncompressed Public Key
  // ---------------------------
  // Devnet only shows you the X coordinate (shortPublicKey).
  // Since you have the private key, you can compute the full "0x04 + X + Y":
  const fullPublicKey = encode.addHexPrefix(
    encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))
  );
  console.log('Full uncompressed public key =', fullPublicKey);

  // ---------------------------
  // 4) Define a Complex EIP-712 TypedData
  // ---------------------------
  // We'll sign a "PurchaseOrder" that has an ID, buyer, array of items, etc.
  const typedData: TypedData = {
    types: {
      StarkNetDomain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'felt' },
        { name: 'chainId', type: 'felt' },
      ],
      PurchaseOrder: [
        { name: 'orderId', type: 'felt' },
        { name: 'buyer', type: 'felt' },
        { name: 'items', type: 'felt*' },
        { name: 'memo', type: 'string' },
      ],
    },
    primaryType: 'PurchaseOrder',
    domain: {
      name: 'MyNftGame',
      version: '1',
      chainId: shortString.encodeShortString('SN_LOCAL'), // typical devnet chain name
    },
    message: {
      orderId: '0x123abc',
      buyer: accountAddress,
      items: ['0x01', '0x02', '0x03'],
      memo: 'Thank you for your order!',
    },
  };

  console.log('\nSigning EIP-712 typed data with private key...');

  // ---------------------------
  // 5) Hash & Sign (Naive Approach)
  // ---------------------------
  // Real EIP-712 in Starknet is more involved. For demonstration:
  const typedDataHashBigInt = hash.starknetKeccak(JSON.stringify(typedData));
  const typedDataHashHex = '0x' + typedDataHashBigInt.toString(16);
  console.log('Typed data hash (hex) =', typedDataHashHex);

  // Produce an off-chain signature using starkCurve
  const signatureEIP712: WeierstrassSignatureType = ec.starkCurve.sign(
    typedDataHashHex,
    privateKey
  );
  console.log('Signature (r, s) =', signatureEIP712);

  // ---------------------------
  // 6) Off-chain Verification
  // ---------------------------
  const resultOffChain = ec.starkCurve.verify(signatureEIP712, typedDataHashHex, fullPublicKey);
  console.log('\nOff-chain verification result =', resultOffChain);

  // ---------------------------
  // 7) On-chain Verification
  // ---------------------------
  // We'll call isValidSignature on the devnet account contract.
  // NOTE: The contract expects "hash, signature_len, signature[0], signature[1], ..."
  // So we must provide the signature array length before r & s.
  const { r, s } = signatureEIP712;
  const rHex = '0x' + r.toString(16);
  const sHex = '0x' + s.toString(16);

  try {
    await account.execute({
      contractAddress: accountAddress,
      entrypoint: 'isValidSignature',
      calldata: [
        typedDataHashHex, // hash
        '2',              // length of signature array (two felts)
        rHex,             // signature[0]
        sHex,             // signature[1]
      ],
    });
    console.log('On-chain verification result = true');
  } catch (err) {
    console.log('On-chain verification failed:', err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

#### Tips & Warnings
1. **Param #2 Must Be the Signature Array Length**
In Cairo, a function parameter typed as `felt*` must begin with the length of the array. If you pass just `[hash, rHex, sHex]`, you’ll see `“Failed to deserialize param #2”`. Instead, do `[hash, '2', rHex, sHex]`.

2. **Hash Mismatch**
Most OpenZeppelin-based accounts expect a standard EIP-712 hashing approach (structured domain + typed data → pedersen hash). If you see an on-chain revert despite correct parameters, it may be because you used `starknetKeccak(JSON.stringify(...))`
Recommendation: Use `account.signMessage(typedData)` for automatic hashing that the contract recognizes.

3. **Keep Private Keys Secure**
This example is for local devnet usage. In production, store private keys in environment variables or secure vaults.

4. **Update devnet**
If you see “Method not found” or “Failed to estimate fee,” ensure you have a recent version of `starknet-devnet`.

### Putting It All Together

You now have two examples:

* Simple array signing: A quick introduction to hashing & signing.
* Advanced EIP-712: Demonstrates structured data, naive hashing, off-chain & on-chain checks.

In real-world projects, you’ll rely on the official EIP-712 hashing logic or `account.signMessage(typedData)` so that your on-chain account recognizes the signature. Nonetheless, this advanced sample gives you insight into the raw `ec.starkCurve.sign` call and how you might manually pass parameters for `isValidSignature`.

> Final Note: The differences between `secp256k1` (Ethereum) and Stark-friendly curves (Starknet) are behind the scenes. The higher-level signing steps and verification calls remain conceptually similar—only the library, hash function, and underlying prime field change. This is how Starknet combines the familiarity of ECDSA with the power of zero-knowledge-friendly cryptography.

## Conclusion
While Ethereum and Starknet both use ECDSA to verify transactions, Starknet’s approach opens the door to more flexible and future-proof cryptography. Account abstraction, in particular, means you can upgrade your security model over time. Whether you’re signing with Starknet.js or starknet.py, the goal remains the same: ensure that only the rightful vault owner (private key holder) can sign a transaction.

Remember our analogy: no one else can sneak into your vault or copy your keycard, and your unique signature (r, s) proves you’re the legitimate owner. As blockchain technology continues to evolve, Starknet’s specialized curve and account abstraction lay the groundwork for advanced authentication and quantum-safe cryptography—ensuring your digital vault remains secure for years to come.

## Further Reading

Starknet.js Documentation
starknet.py Documentation
EIP-712 Specification
SRC-6 Standard for Starknet

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.