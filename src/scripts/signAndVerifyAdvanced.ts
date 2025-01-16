import {
  ec,
  hash,
  encode,
  shortString,
  Account,
  RpcProvider,
  TypedData,
  WeierstrassSignatureType,
} from "starknet";

async function main() {
  // ---------------------------
  // 1) Check Connection to Devnet
  // ---------------------------
  const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
  try {
    // Confirm devnet is responding
    const latestBlock = await provider.getBlock("latest");
    console.log("✅ Successfully connected to devnet!");
    console.log(
      `Latest block #${latestBlock.block_number} | Hash: ${latestBlock.block_hash}`,
    );
  } catch (err) {
    console.error("❌ Could not connect to devnet. Is it running? Error:", err);
    process.exit(1);
  }

  // ---------------------------
  // 2) Devnet Account Setup
  // ---------------------------
  // Use your new devnet account #0 details
  const privateKey =
    "0x00000000000000000000000000000000c10662b7b247c7cecf7e8a30726cff12";
  const accountAddress =
    "0x0260a8311b4f1092db620b923e8d7d20e76dedcc615fb4b6fdf28315b81de201";

  // Create an Account instance pointing to that address & private key
  const account = new Account(provider, accountAddress, privateKey);

  // ---------------------------
  // 3) Generate Uncompressed Public Key
  // ---------------------------
  // The devnet info only provides an X coordinate for the public key. If you have the private key,
  // you can re-derive the full uncompressed version (0x04 + X + Y) with starkCurve:
  const fullPublicKey = encode.addHexPrefix(
    encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false)),
  );
  console.log("Full uncompressed public key =", fullPublicKey);

  // ---------------------------
  // 4) EIP-712 TYPED DATA (Advanced Example)
  // ---------------------------
  // Define some structured data for a "PurchaseOrder" scenario
  const typedData: TypedData = {
    types: {
      // Domain used for structured data
      StarkNetDomain: [
        { name: "name", type: "string" },
        { name: "version", type: "felt" },
        { name: "chainId", type: "felt" },
      ],
      // Example type to sign
      PurchaseOrder: [
        { name: "orderId", type: "felt" },
        { name: "buyer", type: "felt" },
        { name: "items", type: "felt*" },
        { name: "memo", type: "string" },
      ],
    },
    primaryType: "PurchaseOrder",
    domain: {
      name: "MyNftGame",
      version: "1",
      chainId: shortString.encodeShortString("SN_LOCAL"), // typical devnet chain name
    },
    message: {
      orderId: "0x123abc",
      buyer: accountAddress,
      items: ["0x01", "0x02", "0x03"],
      memo: "Thank you for your order!",
    },
  };

  console.log("\nSigning EIP-712 typed data with private key...");

  // ---------------------------
  // 5) Hash & Sign Off-chain
  // ---------------------------
  // *Naive approach* using starknetKeccak over the entire typedData JSON.
  // Real EIP-712 in Starknet is more complex, but this demonstrates the concept.
  const typedDataHashBigInt = hash.starknetKeccak(JSON.stringify(typedData));
  const typedDataHashHex = "0x" + typedDataHashBigInt.toString(16); // Convert BigInt -> 0x hex
  console.log("Typed data hash (hex) =", typedDataHashHex);

  // Use the standard Stark curve sign method
  const signatureEIP712: WeierstrassSignatureType = ec.starkCurve.sign(
    typedDataHashHex,
    privateKey,
  );
  console.log("Signature (r, s) =", signatureEIP712);

  // ---------------------------
  // 6) Off-chain Verification
  // ---------------------------
  // Verify with uncompressed public key (fast, no on-chain fees)
  const resultOffChain = ec.starkCurve.verify(
    signatureEIP712,
    typedDataHashHex,
    fullPublicKey,
  );
  console.log("\nOff-chain verification result =", resultOffChain);

  // ---------------------------
  // 7) On-chain Verification
  // ---------------------------
  // We'll attempt to call isValidSignature on the account contract itself.
  // This requires:
  //  1) The account implements isValidSignature
  //  2) The typedDataHash matches the contract's expected hashing for EIP-712
  // The BigInts for r and s
  // The BigInts for r and s
  const { r, s } = signatureEIP712;

  // Convert them to 0x hex
  const rHex = "0x" + r.toString(16);
  const sHex = "0x" + s.toString(16);

  try {
    await account.execute({
      contractAddress: accountAddress,
      entrypoint: "isValidSignature",
      calldata: [
        typedDataHashHex, // The hash
        "2", // The signature length
        rHex, // signature[0]
        sHex, // signature[1]
      ],
    });
    console.log("On-chain verification result = true");
  } catch (err) {
    console.log("On-chain verification failed:", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
