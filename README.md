# From secp256k1 to STARK-Friendly Curves: Exploring ECDSA in Ethereum and Starknet

Elliptic Curve Digital Signature Algorithm (ECDSA) is a fundamental building block for secure transactions on blockchains. Ethereum and Starknet both rely on ECDSA but use different elliptic curves, hashing functions, and account models under the hood. Think of it like two bank branches that both check your signature—each branch might use a slightly different verification machine, but they both confirm that only you can sign transactions for your account.

In this post, we’ll:

1. Recap ECDSA essentials.
2. Discuss how Ethereum implements ECDSA on the `secp256k1` curve.
3. Explore how Starknet adapts ECDSA to be “STARK-friendly.”
4. Compare the two approaches and look at practical code examples.
5. Show how to run all the examples using Bun.

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

The Starknet.js library lets you sign messages in several ways: using simple arrays of numbers, structured data (EIP-712), or even an Ethereum-style signer.

Below, we’ll highlight two main scripts you can run. Both scripts assume you have a [Starknet devnet running](https://0xspaceshard.github.io/starknet-devnet-rs/docs/running/install), along with Bun installed for dependency management and script execution.

Start by cloning the tutorial repository to your local machine:

```bash
git clone https://github.com/omarespejel/starknet-signing-tutorial.git
cd starknet-signing-tutorial
```

Install Bun (if not already) ([docs here](https://bun.sh/)):

```bash
curl -fsSL https://bun.sh/install | bash
```

Install Dependencies:
```bash
bun install
```

Run the Scripts (from the repo root):

* Basic Sign & Verify:

```bash
bun run sign-verify
```
This runs `src/scripts/signAndVerify.ts`.


Advanced EIP-712:
```bash
bun run sign-verify-advanced
```
This runs `src/scripts/signAndVerifyAdvanced.ts`.

The scripts in the package.json look like this:

```jsonc
{
  "scripts": {
    "start": "bun run src/index.ts",
    "sign-verify": "bun run src/scripts/signAndVerify.ts",
    "sign-verify-advanced": "bun run src/scripts/signAndVerifyAdvanced.ts",
    "sign-ethereum": "bun run src/scripts/signWithEthereum.ts"
  }
}
```

### `signAndVerify.ts`

A simple demonstration of:

* Generating a private key (or using an existing one).
* Deriving the public key.
* Hashing a basic message with Pedersen.
* Signing and verifying the signature off-chain.

```ts
// signAndVerify.ts
import { ec, hash, encode } from 'starknet';

async function main() {
  // 1) Use or generate a private key
  const privateKey = '0x1234567890987654321';

  // 2) Get the uncompressed public key
  const fullPublicKey = encode.addHexPrefix(
    encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))
  );
  console.log('Full public key =', fullPublicKey);

  // 3) Hash the message
  const message = [1, 128, 18, 14];
  const msgHash = hash.computeHashOnElements(message);
  console.log('Message hash =', msgHash);

  // 4) Sign the hash
  const signature = ec.starkCurve.sign(msgHash, privateKey);
  console.log('Signature =', signature);

  // 5) Verify the signature
  const isValid = ec.starkCurve.verify(signature, msgHash, fullPublicKey);
  console.log('Signature is valid?', isValid);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

If you’ve used Ethereum’s secp256k1 curve, you’ll notice that signing and verifying are conceptually similar—only the curve and hashing function differ.

### `signAndVerifyAdvanced.ts`

Sometimes you need to sign structured data—for instance, a game might want to verify that a user purchased certain items, or a DApp might require multiple typed fields. Starknet provides an EIP-712-like system for typed data, which you can sign off-chain and optionally verify on-chain.

Demonstrates:

* Connecting to a local devnet.
* Using a real devnet account.
* Crafting EIP-712-style typed data.
* Signing it, verifying off-chain, and verifying on-chain via the account’s isValidSignature method.

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
  // 1) Connect to devnet
  const provider = new RpcProvider({ nodeUrl: 'http://127.0.0.1:5050/rpc' });
  const latestBlock = await provider.getBlock('latest');
  console.log('✅ Connected to devnet!');
  console.log(`Latest block #${latestBlock.block_number} | Hash: ${latestBlock.block_hash}`);

  // 2) Use your devnet account
  const privateKey =
    '0x00000000000000000000000000000000c10662b7b247c7cecf7e8a30726cff12';
  const accountAddress =
    '0x0260a8311b4f1092db620b923e8d7d20e76dedcc615fb4b6fdf28315b81de201';
  const account = new Account(provider, accountAddress, privateKey);

  // 3) Generate uncompressed public key
  const fullPublicKey = encode.addHexPrefix(
    encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))
  );
  console.log('Full uncompressed public key =', fullPublicKey);

  // 4) Define EIP-712 typed data
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
      chainId: shortString.encodeShortString('SN_LOCAL'),
    },
    message: {
      orderId: '0x123abc',
      buyer: accountAddress,
      items: ['0x01', '0x02', '0x03'],
      memo: 'Thank you for your order!',
    },
  };

  console.log('\nSigning EIP-712 typed data...');

  // 5) Naive hash & sign
  const typedDataHashBigInt = hash.starknetKeccak(JSON.stringify(typedData));
  const typedDataHashHex = '0x' + typedDataHashBigInt.toString(16);
  console.log('Typed data hash (hex) =', typedDataHashHex);

  const signatureEIP712: WeierstrassSignatureType = ec.starkCurve.sign(
    typedDataHashHex,
    privateKey
  );
  console.log('Signature (r, s) =', signatureEIP712);

  // 6) Off-chain verification
  const resultOffChain = ec.starkCurve.verify(signatureEIP712, typedDataHashHex, fullPublicKey);
  console.log('Off-chain verification result =', resultOffChain);

  // 7) On-chain verification
  const { r, s } = signatureEIP712;
  try {
    await account.execute({
      contractAddress: accountAddress,
      entrypoint: 'isValidSignature',
      calldata: [
        typedDataHashHex,
        '2', // length of signature array
        '0x' + r.toString(16),
        '0x' + s.toString(16),
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
Both Ethereum and Starknet leverage ECDSA, but Starknet’s STARK-friendly curve and account abstraction make zero-knowledge proofs cheaper and more flexible. From a developer’s perspective, signing transactions might feel familiar—the differences lie in the choice of curve and hashing function.

Feel free to explore the scripts in this repo to deepen your understanding:

* Basic `signAndVerify.ts` for off-chain signature checks.
* Advanced `signAndVerifyAdvanced.ts` for EIP-712-like typed data, plus on-chain validation.

As blockchain evolves, Starknet’s architecture—particularly its specialized curve and account abstraction—lays the groundwork for advanced authentication methods and quantum-safe cryptography.

Keep your private key safe, and happy coding!

## Further Reading
* [Starknet.js Documentation](https://www.starknetjs.com/docs/guides/intro/)
* [starknet.py Documentation](https://starknetpy.readthedocs.com/en/latest/)
* [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712)
* [SRC-6 (Starknet) Standard](https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-6.md)
* Bun: https://bun.sh/
