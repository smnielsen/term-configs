
const jwt = require('jsonwebtoken');

const token = process.argv[2];
const decoded = jwt.decode(token);

console.log(`----- Decoded "${decoded.typ}" token`);
console.log(decoded);
console.log('------------')
