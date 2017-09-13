require('colors');
const jwt = require('jsonwebtoken');

function keyToPEM(cert) {
  let pem = cert.match(/.{1,64}/g).join('\n');
  pem = `-----BEGIN PUBLIC KEY-----\n${pem}\n-----END PUBLIC KEY-----\n`;
  return pem;
}

const token = process.argv[2];
const publicKey = keyToPEM(process.argv[3]);
console.log('----TOKEN-----');
console.log(token);
console.log(publicKey)
console.log('------------')
console.log('Verifying signature...');
console.log('......')
try {
  jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
  }, (err) => {
    if (err) {
      console.error('## Could not verify token'.red.bold, err);
    } else {
      console.log('## SUCCESS: Token is valid!'.green.bold);
    }
  });
} catch (err) {
  console.error('## Something is wrong with the token'.red.bold, err); 
}

