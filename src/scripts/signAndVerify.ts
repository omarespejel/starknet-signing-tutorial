import { ec, hash, encode } from "starknet";

async function main() {
  // 1) Generate or have a private key
  const privateKey = "0x1234567890987654321";

  // 2) Compute the Starknet public key in hex format (0x04 + X + Y)
  const fullPublicKey = encode.addHexPrefix(
    encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false)),
  );
  console.log("Full public key =", fullPublicKey);

  // 3) Define a message as BigNumberish[] and compute its hash as a hex string
  const message = [1, 128, 18, 14];
  const msgHash = hash.computeHashOnElements(message);
  console.log("Message hash =", msgHash); // Should be something like "0x0123abcd..."

  // 4) Sign the hash using ec.starkCurve.sign (returns { r: "0x..", s: "0x.." })
  const signature = ec.starkCurve.sign(msgHash, privateKey);
  console.log("Signature =", signature);

  // 5) Verify the signature
  // ec.starkCurve.verify( { r, s }, msgHash, publicKey )
  const isValid = ec.starkCurve.verify(signature, msgHash, fullPublicKey);
  console.log("Signature is valid?", isValid);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
