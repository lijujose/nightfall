/**
Implements a mimcHash function, mirroring that written by HarryR in Solidity.
*/

// TODO - move this into zkpUtils?
<<<<<<< HEAD
import config from 'config';
import utils from './zkpUtils';

function addMod(addMe, m) {
  return addMe.reduce((e, acc) => (e + acc) % m, BigInt(0));
}

function powerMod(base, exponent, m) {
  if (m === BigInt(1)) return BigInt(0);
  let result = BigInt(1);
  let b = base % m;
  let e = exponent;
  while (e > BigInt(0)) {
    if (e % BigInt(2) === BigInt(1)) result = (result * b) % m;
    e >>= BigInt(1);
=======
import config from './config';
import utils from './zkpUtils';

function addMod(addMe, m = config.ZOKRATES_PRIME) {
  const sum = addMe.reduce((e, acc) => e + acc);
  return ((sum % m) + m) % m;
}

function powerMod(base, exponent, m = config.ZOKRATES_PRIME) {
  if (m === 1) return 0;
  let result = 1;
  let b = base % m;
  let e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % m;
    e >>= 1;
>>>>>>> feat(zkp): add mimc hash functions
    b = (b * b) % m;
  }
  return result;
}

/**
mimc encryption function
@param  {String} x - the input value
@param {String} k - the key value
@param {String} seed - input seed for first round (=0n for a hash)
@param
*/
function mimcpe7(x, k, seed, roundCount, m) {
  let xx = x;
  let t;
  let c = seed;
  for (let i = 0; i < roundCount; i++) {
<<<<<<< HEAD
    c = utils.keccak256Hash(c);
    t = addMod([xx, BigInt(c), k], m); // t = x + c_i + k
    xx = powerMod(t, BigInt(7), m); // t^7
  }
  // Result adds key again as blinding factor
  return addMod([xx, k], m);
}

function mimcpe7mp(x, k, seed, roundCount, m = BigInt(config.ZOKRATES_PRIME)) {
  let r = k;
  let i;
  for (i = 0; i < x.length; i++) {
    r = (r + (x[i] % m) + mimcpe7(x[i], r, seed, roundCount, m)) % m;
=======
    c = utils.hash(c); // TODO
    t = addMod([xx, c, k], m); // t = x + c_i + k
    xx = powerMod(t, 7, m); // t^7
  }
  // Result adds key again as blinding factor
  return addMod(xx, k);
}

function mimcpe7mp(x, k, seed, roundCount, m = config.ZOKRATES_PRIME) {
  let r = k;
  for (let i = 0; i < x.length; i++) {
    r = (r + x[i] + mimcpe7(x[i], r, seed, roundCount)) % m;
>>>>>>> feat(zkp): add mimc hash functions
  }
  return r;
}

<<<<<<< HEAD
function mimcHash(...msgs) {
  // elipses means input stored in array called msgs
  const mimc = '0x6d696d63'; // this is 'mimc' in hex as a nothing-up-my-sleeve seed
  return `0x${mimcpe7mp(
    // '${' notation '0x${x}' -> '0x34' w/ x=34
    msgs.map(e => {
      const f = BigInt(e);
      if (f > config.ZOKRATES_PRIME) throw new Error('MiMC input exceeded prime field size');
      return f;
    }),
    BigInt(0), // k
    utils.keccak256Hash(mimc), // seed
    91, // rounds of hashing
  )
    .toString(16) // hex string - can remove 0s
    .padStart(64, '0')}`; // so pad
=======
function mimcHash(msgs) {
  return mimcpe7mp(msgs, 0, utils.sha256Hash('mimc'), 91);
>>>>>>> feat(zkp): add mimc hash functions
}

export default { mimcHash };