// signWithEthSignerArray.ts

// WIP - NOT COMPILING

import { EcSigner as EthSigner, ec, hash } from 'starknet'; 
// ^ If your version doesn't have EcSigner, it may be `EthSigner` or from a different import path
//   Check your Starknet.js docs.

//
// HELPER FUNCTION: If signMessage returns a splitted signature, we merge them.
//
function parseSplittedSignature(sigParts: string[]) {
  if (sigParts.length < 4) {
    throw new Error(`Unexpected signature format: ${JSON.stringify(sigParts)}`);
  }
  // Usually [rLow, rHigh, sLow, sHigh, recoveryBit?]
  const [rLow, rHigh, sLow, sHigh, recoveryBit] = sigParts;

  // Combine rLow + rHigh into a single 256-bit hex
  const rMerged = '0x' + rLow.slice(2) + rHigh.slice(2);
  const sMerged = '0x' + sLow.slice(2) + sHigh.slice(2);

  return { r: rMerged, s: sMerged, recovery: recoveryBit ?? '0x0' };
}

async function main() {
  // 1) Ethereum private key (32 bytes in 0x-hex format)
  //    In production, never commit real keys to source control—use .env or a secret manager.
  const myEthPrivateKey = '0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead';

  // 2) A Starknet address to tie the signature to
  //    This prevents replay of the signature for a different address.
  const myEthAccountAddressInStarknet =
    '0x65a822fbee1ae79e898688b5a4282dc79e0042cbed12f6169937fddb4c26641';

  // 3) Create an Ethereum-based signer for Starknet
  //    Some versions export this as EthSigner, some as EcSigner. Adjust if needed.
  const myEthSigner = new EthSigner(myEthPrivateKey);

  // 4) Define a numeric array to sign
  //    Same style as standard Starknet "message" (BigNumberish[]).
  const message = [1, 128, 18, 14];
  console.log('Message array:', message);

  // 5) Compute the Starknet Pedersen hash for verification
  const msgHash = hash.computeHashOnElements(message);
  console.log('Starknet hash of message:', msgHash);

  // 6) Sign with the Ethereum key using signMessage
  //    The second arg is your Starknet address (prevents replay).
  const splittedSignature = await myEthSigner.signMessage(message, myEthAccountAddressInStarknet);
  console.log('Raw signature (possibly splitted) =', splittedSignature);

  // 7) Merge splitted signature if needed
  //    If your starknet.js returns a single {r, s} object, you can skip this step.
  let rHex: string, sHex: string;
  if (Array.isArray(splittedSignature)) {
    // e.g. [rLow, rHigh, sLow, sHigh, recovery?]
    const { r, s, recovery } = parseSplittedSignature(splittedSignature);
    rHex = r;
    sHex = s;
    console.log('Merged signature:', { rHex, sHex, recovery });
  } else {
    // If it returns an object { r: '0x...', s: '0x...' }
    // Just rename them
    rHex = splittedSignature.r;
    sHex = splittedSignature.s;
    console.log('Non-splitted signature:', { rHex, sHex });
  }

  // 8) Obtain your uncompressed public key (0x04 + X + Y)
  const ethPubKey = await myEthSigner.getPubKey();
  console.log('Ethereum-based uncompressed pubkey:', ethPubKey);

  // 9) Off-chain verification with Starknet's ec.starkCurve
  const isValid = ec.starkCurve.verify({ r: rHex, s: sHex }, msgHash, ethPubKey);
  console.log('Off-chain verification result:', isValid);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
