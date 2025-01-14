# starknet-signing

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.





## Introduction
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

When we say “Starknet uses a STARK-friendly elliptic curve,” we’re referring to a curve whose parameters (prime field, curve equation, and group order) are chosen to be efficient within STARK-based zero-knowledge proofs. Ethereum’s `secp256k1`, by contrast, is geared toward efficient ECDSA verification on CPU architectures and has been widely adopted by Bitcoin and other blockchains.

### Ethereum’s secp256k1 Curve
- **Type**: A Koblitz curve defined by the equation:  
  \[
    y^2 \equiv x^3 + 7 \pmod{p}
  \]  
- **Prime** (\( p \)): \( 2^{256} - 2^{32} - 977 \)  
- **Group Order** (\( n \)): \( \approx 1.158 \times 10^{77} \)  
- **Motivation**: Designed for efficient scalar multiplication on CPUs (key for signature verification). It wasn’t explicitly chosen for zero-knowledge proof systems, but rather for fast ECDSA and broad industry adoption.

### Starknet’s STARK-Friendly Curve
Starknet uses an elliptic curve defined over a large prime field close to \(2^{251}\). You’ll often see references to this curve in the Pedersen hashing process. The high-level math is similar (still \(y^2 = x^3 + Ax + B\)), but the choice of \(p\), \(A\), and \(B\) is specialized for STARK proofs.

- **Type**: A Weierstrass form curve, typically expressed as:  
  \[
    y^2 \equiv x^3 + Ax + B \pmod{p}
  \]
- **Prime** (\( p \)): Approximately \(2^{251}\), ensuring efficient operations in STARK circuits.
- **Group Order** (\( n \)): Also on the order of \(2^{251}\), large enough to protect against discrete log attacks.
- **Motivation**: This prime is “friendly” for STARKs because it simplifies the circuitry for proof generation. Arithmetic operations (like exponentiations and point multiplications) can be done with fewer constraints, making proofs faster and cheaper.

### Why “STARK-Friendly” Matters
In a STARK-based system, you frequently need to prove knowledge of signatures or hashed data inside a zero-knowledge circuit. Curves like `secp256k1` can be used in ZK proofs, but require more overhead:
1. **Prime Field Mismatch**: STARK systems operate in a specific “native field.” If `secp256k1`’s prime doesn’t match this field, you need extra logic in the proof circuit.
2. **Complex Curve Equations**: Every arithmetic step adds constraints. A curve fine-tuned to the STARK field reduces these constraints and boosts performance.

By using a curve that aligns with the native STARK field, Starknet can validate signatures and Pedersen hashes with reduced complexity. This leads to more efficient proof generation and verification—core features of a zero-knowledge-oriented blockchain.

### Comparing the Two Curves
1. **Field Size**  
   - **secp256k1**: \(p \approx 2^{256}\)  
   - **Stark Curve**: \(p \approx 2^{251}\)  
   Though similar in magnitude, the Stark curve’s prime is deliberately chosen for STARK circuits.

2. **Curve Equation**  
   - Both use a Weierstrass form, but each has distinct constants \(A\) and \(B\).

3. **Group Order & Security**  
   - Both define large prime-order subgroups, ensuring security against discrete log attacks.  
   
4. **Performance Goals**  
   - **secp256k1**: Popular for CPU-based ECDSA, widely supported.  
   - **Stark Curve**: Zero-knowledge circuit-friendly, enabling faster, cheaper STARK proofs.

Ultimately, the signing and verification steps remain conceptually the same—hash your data, generate \((r, s)\), and verify with your public key. The difference lies in the underlying parameters, which make Starknet’s curve more efficient in a STARK-proven environment. 


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

1) End-to-End Script: Generate Key, Sign, and Verify
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




1. Sign and Send a Basic Message (Array of Numbers)

```ts
import { ec, hash, num, encode, WeierstrassSignatureType } from 'starknet';

const privateKey = '0x1234567890987654321';
const starknetPublicKey = ec.starkCurve.getStarkKey(privateKey);
const fullPublicKey = encode.addHexPrefix(
  encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))
);

// Suppose your message is an array of BigNumberish
const message = [1, 128, 18, 14];

// Step 1: Compute the hash
const msgHash = hash.computeHashOnElements(message);

// Step 2: Sign the message
const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey);

// Now you can send (off-chain) to a recipient:
// - The message
// - The signature
// - The full public key (or the account address that uses this private key)
```






## Conclusion
While Ethereum and Starknet both use ECDSA to verify transactions, Starknet’s approach opens the door to more flexible and future-proof cryptography. Account abstraction, in particular, means you can upgrade your security model over time. Whether you’re signing with Starknet.js or starknet.py, the goal remains the same: ensure that only the rightful vault owner (private key holder) can sign a transaction.

Remember our analogy: no one else can sneak into your vault or copy your keycard, and your unique signature (r, s) proves you’re the legitimate owner. As blockchain technology continues to evolve, Starknet’s specialized curve and account abstraction lay the groundwork for advanced authentication and quantum-safe cryptography—ensuring your digital vault remains secure for years to come.

Further Reading

Starknet.js Documentation
starknet.py Documentation
EIP-712 Specification
SRC-6 Standard for Starknet