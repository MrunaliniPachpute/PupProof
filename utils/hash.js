const sharp = require("sharp");
const crypto = require("crypto");

//img -> hash
async function hashBuffer(imgBuf){
  const small = await sharp(imgBuf)
    .resize(16,16)
    .grayscale()
    .raw()
    .toBuffer()
  let myHash = crypto.createHash('sha256').update(small).digest('hex');
  return myHash;
}

function hamming(a, b) {
  let x = BigInt('0x' + a) ^ BigInt('0x' + b);
  let count = 0;
  while (x) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

module.exports = { hashBuffer, hamming };