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
  console.log(...msg);
};

const success = (...msg) => {
  const [str, ...rest] = msg;
  console.log(str.green.bold, ...rest);
};

const error = (...msg) => {
  const [str, ...rest] = msg;
  console.log(str.red.bold, ...rest);
};

const buildJwt = tenant => {
  return jwt.sign(
    {
      permissions: [
        'tenant:read',
        'tenant_user_management:read',
        'applications_development:read',
      ],
      sub: uuidv4(),
      tenant,
    },
    'aaa',
  );
};

const keycloak = axios.create({
  baseURL: 'http://localhost:7000/',
  timeout: 30000,
  headers: {},
});
const idService = axios.create({
  baseURL: 'http://localhost:7001/',
  timeout: 10000,
  headers: {},
});
const appService = axios.create({
  baseURL: 'http://localhost:7002/',
  timeout: 10000,
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

const fetchAllUsers = (users = [], page = 0, pageSize = 100) => {
  return new Promise(async (resolve, reject) => {
    let res;
    try {
      log(`# Fetching page ${page}...`);
      const token = await getAdminToken();
      res = await keycloak({
        method: 'GET',
        url: '/v1/id/auth/admin/realms/olt/users',
        params: {
          first: page * pageSize,
          max: pageSize,
        },
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });
    } catch (err) {
      error(`Could not fetch all users "${err.message}"`, err);
      return reject(
        new Error(`Could not fetch all users "${err.message}"`, err),
      );
    }
    if (res.status > 299) {
      return reject(new Error(`Could not fetch all users "${res.statusText}"`));
    }
    const { data } = res;
    log(`=> Fetched page ${page} -> ${data.length + users.length} users`.green);
    if (data.length >= pageSize) {
      return resolve(fetchAllUsers([...users, ...data], ++page, pageSize));
    }
    resolve([...users, ...data]);
  });
};

const main = async () => {
  console.log('Fetching all Users...'.bold);
  const users = await fetchAllUsers();

  log('------');
  log(`==> Fetched ${users.length} users...`.bold.green);

  return {
    users,
  };
};

/**
 * RUNNER
 */
if (require.main === module) {
  const filename = path.basename(__filename);
  log(`Running CLI for ${filename}`);
  // Called from CLI (terminal)
  main()
    .then(async ({ users }) => {
      await fs.writeFile(
        path.resolve(__dirname, 'output', `-${filename}-output.json`),
        JSON.stringify({ users }),
      );
    })
    .catch(err => {
      error(`Got Error: ${err.message}`);
    });
}

module.exports = main;
