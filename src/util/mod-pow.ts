const zero = BigInt(0);
const one = BigInt(1);
const two = BigInt(2);

export const modPow = (a: bigint, e: bigint, m: bigint) => {
  if (m === zero) {
    throw new Error('bad modulus (0)');
  }

  if (e <= 0) {
    throw new Error('negative exponents not implemented');
  }

  let r = one;
  let base = a % m;
  let exp = e;

  while (exp > zero) {
    if (base === zero) {
      r = zero;
      break;
    }

    if (exp % two === one) {
      r = (r * base) % m;
    }

    base = (base * base) % m;
    exp = exp / two;
  }

  return r <= zero ? r + m : r;
};
