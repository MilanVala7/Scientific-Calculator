export function degToRad(deg) {
  return deg * (Math.PI / 180);
}

export function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return null;

  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}