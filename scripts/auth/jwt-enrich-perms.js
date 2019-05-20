
const jwt = require('jsonwebtoken');

const addToJwt = (token, data = {}) => {
  const decoded = token ? jwt.decode(token) : {};
  return jwt.sign({
    ...decoded,
    ...data,
  }, 'myKey');
};

const token = process.argv[2];
const data = {
  permissions: [
    'tenant:read'
  ]
};
const returnToken = addToJwt(token, data);

console.log('Permissions: ', data.permissions);
console.log('----- Populated token:');
console.log(returnToken);
console.log('------------')