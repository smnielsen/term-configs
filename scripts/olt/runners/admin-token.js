require('colors');
const assert = require('assert');
const querystring = require('querystring');
const path = require('path');
const axios = require('axios');
const pLimit = require('p-limit');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;

const limit = pLimit(10);

const fullLog = [];
const log = (...msg) => {
  fullLog.push(msg);
  console.log('[admin-token]', ...msg);
};

const success = (...msg) => {
  const [str, ...rest] = msg;
  console.log('[admin-token]', str.green.bold, ...rest);
};

const error = (...msg) => {
  const [str, ...rest] = msg;
  console.log('[admin-token]', str.red.bold, ...rest);
};

const keycloak = axios.create({
  baseURL: 'http://localhost:7000/',
  timeout: 30000,
  headers: {},
});

let adminPassword = process.env.KC_ADMIN_PASS;
assert(adminPassword, 'Missing admin password on process.env.KC_ADMIN_PASS');

const getAdminToken = async () => {
  let res;
  try {
    res = await keycloak.post(
      '/v1/id/auth/realms/master/protocol/openid-connect/token',
      querystring.stringify({
        client_id: 'admin-cli',
        grant_type: 'password',
        username: 'admin',
        password: adminPassword,
      }),
    );
    const { data: token } = res;

    return token;
  } catch (err) {
    error(`Could not fetch all tenants "${err.message}"`, err);
    throw err;
  }
};

const main = async () => {
  log('Fetching admin token');
  const token = await getAdminToken();

  return token;
};

/**
 * RUNNER
 */
if (require.main === module) {
  const filename = path.basename(__filename);
  log(`Running CLI for ${filename}`);
  // Called from CLI (terminal)
  main()
    .then(async token => {
      success(`Admin Token:`);
      console.log(token);
      return token;
    })
    .catch(err => {
      error(`Got Error: ${err.message}`);
    });
}

module.exports = main;
