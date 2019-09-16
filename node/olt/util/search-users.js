require('colors');
const assert = require('assert');
const querystring = require('querystring');
const path = require('path');
const axios = require('axios');
const pLimit = require('p-limit');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const getAdminToken = require('./admin-token');

const shouldLog = require.main === module;
const fullLog = [];
const log = (...msg) => {
  if (shouldLog) {
    fullLog.push(msg);
    console.log('[search-users]', ...msg);
  }
};

const success = (...msg) => {
  const [str, ...rest] = msg;
  console.log('[search-users]', str.green.bold, ...rest);
};

const error = (...msg) => {
  const [str, ...rest] = msg;
  console.log('[search-users]', str.red.bold, ...rest);
};

const keycloak = axios.create({
  baseURL: 'http://localhost:7000/',
  timeout: 30000,
  headers: {},
});

const searchUsers = (query, adminPassword) => {
  return new Promise(async (resolve, reject) => {
    let res;
    try {
      const token = await getAdminToken(adminPassword);
      log(`Searching users...`);
      res = await keycloak({
        method: 'GET',
        url: '/v1/id/auth/admin/realms/olt/users',
        params: {
          search: query,
        },
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });
    } catch (err) {
      error(
        `Error during search ${err.message}`,
        err.toJSON ? err.toJSON() : err,
      );
      return reject(new Error(`Could not search users "${err.message}"`, err));
    }
    if (res.status > 299) {
      return reject(new Error(`Could not search users "${res.statusText}"`));
    }
    resolve(res.data);
  });
};

const main = async (query, adminPassword = process.env.KC_ADMIN_PASS) => {
  assert(typeof query === 'string', 'invalid query. Should be a string value');
  log(`# Searching for users...`);
  log(`  Query = "${query.bold}"`);
  const users = await searchUsers(query, adminPassword);

  log('------');
  success(`==> [${query}] Found ${users.length} users`);

  return users;
};

/**
 * RUNNER
 */
if (require.main === module) {
  const filename = path.basename(__filename);
  log(`Running CLI for ${filename}`);
  // Called from CLI (terminal)
  main(process.argv[2])
    .then(async users => {
      await fs.writeFile(
        path.resolve(
          __dirname,
          '../../../',
          'output',
          `-${filename}-output.json`,
        ),
        JSON.stringify({ users }),
      );
    })
    .catch(err => {
      error(`Got Error: ${err.message}`);
    });
}

module.exports = main;
