
const jwt = require('jsonwebtoken');
const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQDMCAfATD5dulrQ7MZvl8leJDtykM2voyzaije5aTziasCmZRV0
Fjels5XwhCcXZCPyNDGUJc5zNcsG6Of5Iy9mKmA/ZYo9kbOHAEdeoJrnl7C58yYg
ZZzM+u9DqfOLzuORvOx8GoZ+DP34WKIAtw6nBZXJvILDhWkpFRATST+1GQIDAQAB
AoGAW1OQ3KOEGwIqWnBRlmvTx97h+TMVznN0xVGvBcA0b4inORPwGWlEeVg8Wk9d
DBxX9rckJhMSKQHAIhSomR0FvqGPMLyjCCXgxqh6Xx1RYA6/8UxLyzCElFZK6F50
WahcYOR1t4oI0GGG9jG8pvGSQWSqN/SOVR/9BKGbwdh/FQECQQDvm9Hvyf8yH8Qf
wld0a/woCx/nukWOIlGnqqhdiO7S151FDFmD6DQof5dbw/QaaUEEytkek+FUstP7
ltnFAlZ5AkEA2f0oY5exM3kEiPsoP/H1uVF+HemcuMeXwhrKdqyIyNrog5TgGeja
9qjqZLwdFgrkI//8DQx2HXWwEhiUlAkroQJAKcrs8D00ZOLDi6KTLHxVTAq8sud7
kFIOGgebPE1REreG9+8ygd5zkojGtrvUDPNE4vgarMmwaNyUOvLR4xoISQJAHdYC
ky8N9+eWcVE+/xGU+lpnEp0I8FmRMeYM1BVlW2hq7qePzLwMTDpuan880+mFtE+z
Je4QtJOJF9D5dRGUQQJALAen32samHUO7iiWR8Z7e3i2esD1T+MhRdRjatrcJo9y
ELx3OAj9CZysL+3Cfaj5J9I7BUXfaJLDa3J5BF25UA==
-----END RSA PRIVATE KEY-----
`;
const addToJwt = (token, data = {}) => {
  const decoded = token ? jwt.decode(token) : {};
  return jwt.sign({
    ...decoded,
    ...data,
  }, privateKey, {
    algorithm: 'RS256',
  });
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