
const jwt = require('jsonwebtoken');

const addToJwt = (token, data = {}) => {
  const decoded = jwt.decode(token);
  return jwt.sign(
    {
      ...decoded,
      ...data,
    },
    'myKey',
  );
};

const type = process.argv[2];
const token = process.argv[4];
let value;
try {
  value = JSON.parse(process.argv[3]);
} catch (err) {
  value = process.argv[3];
}
const data = {
  [type]: value
};
const returnToken = addToJwt(token, data);

console.log('Data: ', data);
console.log('----- Populated token:');
console.log(returnToken);
console.log('------------')