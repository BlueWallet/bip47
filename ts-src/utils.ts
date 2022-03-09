import { NetworkCoin } from './interfaces';
import BIP32Factory, { BIP32API, BIP32Interface } from 'bip32';
import bs58safe from 'bs58check-ts';
import * as ecc from 'tiny-secp256k1';
import { mainnetData } from './networks';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';

const bip32: BIP32API = BIP32Factory(ecc);

export const getPublicPaymentCodeNodeFromBase58 = (
  paymentCode: string,
  network: NetworkCoin,
): BIP32Interface => {
  const rawPaymentCode = bs58safe.decode(paymentCode);
  return bip32.fromPublicKey(
    rawPaymentCode.slice(3, 36),
    rawPaymentCode.slice(36, 68),
    network.network,
  );
};

export const getRootPaymentCodeNodeFromSeedHex = (
  seedHex: string | Buffer,
  network: NetworkCoin = mainnetData,
) => {
  if (typeof seedHex === 'string') seedHex = Buffer.from(seedHex, 'hex');

  const node: BIP32Interface = bip32.fromSeed(seedHex, network.network);
  return node.derivePath(`m/47'/${network.coin}'/0'`);
};

export const getRootPaymentCodeNodeFromBIP39Seed = (
  bip39Seed: string,
  network: NetworkCoin = mainnetData,
  password?: string,
) => {
  const seed: Buffer = bip39.mnemonicToSeedSync(bip39Seed, password);
  return getRootPaymentCodeNodeFromSeedHex(seed);
};

export const uintArrayToBuffer = (array: Uint8Array): Buffer => {
  const b: Buffer = Buffer.alloc(array.length);
  for (let i = 0; i < array.length; i++) b[i] = array[i];
  return b;
};

export const getSharedSecret = (B: Buffer, a: Buffer) => {
  const SUint: Uint8Array = ecc.xOnlyPointFromPoint(
    ecc.pointMultiply(B, a, true) as Uint8Array,
  ) as Uint8Array;
  const S: Buffer = Buffer.alloc(32);
  for (let i = 0; i < S.length; i++) S[i] = SUint[i]; // uint8Array to Buffer
  return bitcoin.crypto.sha256(S);
};