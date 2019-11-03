/**
 * 
# Scripts README

Scripts to help with investigating, debugging, managing Keycloak.

## clients-performance-test.js

Tests how long it takes to do different actions on clients, separated by type (public | confidential).
It currently runs tests for the actions below:

- Fetch a token
- Update the client
- Delete the client

### Runner

The script will start by creating a number of clients (NUMBER_OF_CLIENTS), then run the different test-actions and print the results in the console.

The script will run these sessions in regards to how many runs (NUMBER_OF_RUNS) are configured (default: 1).

The level (LEVEL) states the logging level. Set to "prod" if only summaries should be printed.
 */
require('colors');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const pLimit = require('p-limit');
const getAdminToken = require('../../util/admin-token');

/**************************
 * VARIABLES
 **************************/
let host;
let adminPassword;

let amount;
let rounds;
let level;
/**************************
 * END OF VARIABLES
 **************************/

let logString = '';
const log = (...msg) => {
  // eslint-disable-next-line
  console.log(...msg);
  try {
    const str = msg
      .map(l => {
        if (typeof l === 'object') {
          return JSON.stringify(l);
        }
        if (typeof l === 'string') {
          return l
            .replace('[32m', '')
            .replace('[39m', '')
            .replace('[22m', '')
            .replace('[1m', '');
        }
        return l;
      })
      .join(' ');
    logString += `${str}\n`;
  } catch (error) {
    console.error('Error with', msg, error);
    throw error;
  }
};

const debug = (...msg) => {
  if (level !== 'prod') {
    // eslint-disable-next-line
    console.log(...msg);
  }
};

const validations = {
  UPDATE: {
    approvedMs: 1000,
  },
  DELETE: {
    approvedMs: 100,
  },
  ALL: {
    approvedMs: 1000,
  },
  TOKEN: {
    approvedMs: 400,
  },
};

const prettyPrintDiff = diff => {
  const seconds = Math.floor(diff / 1000);
  const ms = diff - seconds * 1000;
  return `${seconds > 0 ? `${seconds}s` : ''} ${ms}ms`;
};

const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (+max - +min)) + +min;
};
const formUrlEncoded = x =>
  Object.keys(x).reduce((p, c) => `${p}&${c}=${encodeURIComponent(x[c])}`, '');

const getClient = async id => {
  const token = await getAdminToken(adminPassword);
  const internalUrl = `${host}/v1/id/auth/admin/realms/olt/clients/${id}`;
  const res = await axios({
    method: 'get',
    url: internalUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status > 299) {
    throw new Error(`Could not get client: ${res.statusText}`);
  }

  return res.data;
};

const getAllClients = async () => {
  const token = await getAdminToken(adminPassword);
  const internalUrl = `${host}/v1/id/auth/admin/realms/olt/clients`;
  const res = await axios({
    method: 'get',
    url: internalUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status > 299) {
    throw new Error(`Could not get client: ${res.statusText}`);
  }

  return res.data;
};

let count = 0;
// eslint-disable-next-line
const namePrefix = '-test-load-client';
const incrementalId = () => `${namePrefix}-${randomNumber(0, 10000000)}`;
const createClient = async (token, override = {}) => {
  // eslint-disable-next-line
  let internalCount = ++count;
  const startTime = Date.now();
  const id = incrementalId();
  const internalUrl = `${host}/v1/id/auth/admin/realms/olt/clients`;
  const data = {
    id,
    clientId: id,
    name: id,
    clientAuthenticatorType: 'client-secret',
    implicitFlowEnabled: false,
    standardFlowEnabled: true,
    serviceAccountsEnabled: false,
    directAccessGrantsEnabled: true,
    publicClient: true,
    defaultClientScopes: ['olt-applications'],
    optionalClientScopes: ['profile', 'email'],
    redirectUris: ['http://localhost:*', 'http://127.0.0.1:*'],
    webOrigins: ['*'],
    ...override,
  };
  try {
    await axios({
      method: 'post',
      url: internalUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data,
    });
    const diff = Date.now() - startTime;
    debug(
      `=> ${internalCount}: Created "${
        data.serviceAccountsEnabled ? 'confidential' : 'public'
      }" - "${id}" - ${prettyPrintDiff(diff)}`.green,
    );
    const client = await getClient(id);
    debug(`=> Returning new client ${client.name || client.id}`);
    return client;
  } catch (err) {
    const res = err.response;
    debug(
      `=> ${internalCount}: Could not create client ${id}: ${res.status}-${res.statusText}`
        .red,
    );
    return { status: res.status, statusText: res.statusText, data: res.data };
  }
};
const getClientSecret = async client => {
  const token = await getAdminToken(adminPassword);
  const internalUrl = `${host}/v1/id/auth/admin/realms/olt/clients/${client.id}/client-secret`;
  const res = await axios({
    method: 'get',
    url: internalUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status > 299) {
    throw new Error(`Could not get client-secret: ${res.statusText}`);
  }

  return res.data.value;
};
const testTokenClient = async client => {
  const startTime = Date.now();
  const internalUrl = `${host}/v1/id/auth/realms/olt/protocol/openid-connect/token`;
  let clientSecret = '';
  if (!client.publicClient) {
    clientSecret = await getClientSecret(client);
  }
  try {
    const res = await axios({
      method: 'post',
      url: internalUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: formUrlEncoded({
        client_id: client.id,
        client_secret: clientSecret,
        grant_type: 'password',
        username: '-test-performance-user',
        password: 'P@ssw0rd',
      }),
    });
    const diff = Date.now() - startTime;
    debug(`${client.id}:`, `Token - ${prettyPrintDiff(diff)}`.bold);

    return {
      status: res.status,
      statusText: res.statusText,
      time: diff,
    };
  } catch (err) {
    const res = err.response;
    debug(
      `Could not get token for client ${client.id}: ${res.status}-${res.statusText}`
        .red,
    );
    return {
      status: res.status,
      statusText: res.statusText,
      data: res.data,
      time: Date.now() - startTime,
    };
  }
};

const testUpdateClient = async client => {
  const token = await getAdminToken(adminPassword);

  const startTime = Date.now();
  const internalUrl = `${host}/v1/id/auth/admin/realms/olt/clients/${client.id}`;
  const data = {
    clientId: client.id,
    redirectUris: ['http://localhost:8080/auth', 'http://127.0.0.1:8080/auth'],
  };
  try {
    await axios({
      method: 'put',
      url: internalUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data,
    });
    const diff = Date.now() - startTime;
    debug(`${client.id}:`, `Updated - ${prettyPrintDiff(diff)}`.bold);
    return {
      status: 200,
      time: diff,
    };
  } catch (err) {
    const res = err.response;
    debug(
      `Could not update client ${client.id}: ${res.status}-${res.statusText}`
        .red,
    );
    return {
      status: res.status,
      statusText: res.statusText,
      data: res.data,
      time: Date.now() - startTime,
    };
  }
};
const testDeleteClient = async client => {
  const token = await getAdminToken(adminPassword);

  const startTime = Date.now();
  const internalUrl = `${host}/v1/id/auth/admin/realms/olt/clients/${client.id}`;
  try {
    await axios({
      method: 'delete',
      url: internalUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const diff = Date.now() - startTime;
    debug(`${client.id}:`, `Deleted - ${prettyPrintDiff(diff)}`.bold);
    return {
      status: 200,
      time: diff,
    };
  } catch (err) {
    const res = err.response;
    debug(
      `Could not delete client ${client.id}: ${res.status}-${res.statusText}`
        .red,
    );
    return {
      status: res.status,
      statusText: res.statusText,
      data: res.data,
      time: Date.now() - startTime,
    };
  }
};

const createConfidentialClient = token => {
  debug('Creating [CONFIDENTIAL] client...');
  return createClient(token, {
    serviceAccountsEnabled: true,
    publicClient: false,
  });
};

const createPublicClient = token => {
  debug('Creating [PUBLIC] client...');
  return createClient(token);
};

const runCreation = async () => {
  // Get token
  debug('Creating one client...');
  const token = await getAdminToken(adminPassword);
  debug('Got Admin Token');
  // Create Clients
  if (count % 2 === 0) {
    return createPublicClient(token);
  }
  return createConfidentialClient(token);
};

const result = {
  ok: [],
  failed: [],
};
const addToResult = (client, type, time, status) => {
  const valid = validations[type].approvedMs > time;
  const res = {
    client,
    type: 'UPDATE',
    time,
  };
  if (valid) {
    debug(`=> ${status}:${type} - `, 'OK'.green);
    result.ok.push(res);
  } else {
    debug(`=> ${status}:${type} - `, 'NOT OK'.red);
    result.failed.push(res);
  }
};
/**
 * PEROFRMANCE TEST PER CLIENT RUNNER
 */
const loadTestClient = async client => {
  const startTime = Date.now();
  debug('Running performance test'.blue, `for ${client.id}`);

  // Get token
  const { status: tStatus, time: tTime } = await testTokenClient(client);
  addToResult(client, 'TOKEN', tTime, tStatus);

  // Update with new redirectUrls
  const { status: uStatus, time: uTime } = await testUpdateClient(client);
  addToResult(client, 'UPDATE', uTime, uStatus);

  // Delete client
  const { status: dStatus, time: dTime } = await testDeleteClient(client);
  addToResult(client, 'DELETE', dTime, dStatus);

  debug('----------');
  debug('TEST'.bold, `took: ${prettyPrintDiff(Date.now() - startTime)}`);
  return { uTime, dTime, tTime, tStatus, uStatus, dStatus };
};

/**
 * THE ACTUAL RUNNER
 */
const outputResult = [];
const LIMIT_COUNT = 50;
const limit = pLimit(LIMIT_COUNT);
async function main(round) {
  const roundStart = Date.now();
  // Start logging
  log(`=== Starting round ${round} performance test ===`.bold);
  log(`-> Creating  ${amount} clients per round`);
  log(`-> Running   ${rounds} rounds`);
  log('Running...');
  // Create amount
  const amountArray = Array.from({ length: amount + 2 });
  const clients = await Promise.all(
    amountArray.map(() => limit(() => runCreation())),
  );

  // Filter successful from failures
  const successes = clients.filter(client => !client.status);

  debug(`==> Successfully created ${successes.length} clients`);
  debug('');
  debug('----- performance test START-------');

  // performance test getting all clients
  debug('==== ALL CLIENTS =====');
  const startTimeGet = Date.now();
  const allClients = await getAllClients();
  const allTime = Date.now() - startTimeGet;
  debug('GET'.bold, `time: ${prettyPrintDiff(allTime)}`);

  debug('==== PUBLIC CLIENT(S) =====');
  const publics = allClients.filter(
    client => client.publicClient && client.id.includes(namePrefix),
  );
  // performance test one public client
  if (publics.length === 0) {
    debug(`-> No public clients to run loadtest on, STOPPING!`.yellow);
    return;
  }
  const { uTime: uPTime, dTime: dPTime, tTime: tPTime } = await loadTestClient(
    publics[randomNumber(0, publics.length)],
  );
  debug('');

  debug('==== CONFIDENTIAL CLIENT(S) =====');
  const confidentials = allClients.filter(
    client => !client.publicClient && client.id.includes(namePrefix),
  );

  // performance test update one service account client
  if (confidentials.length === 0) {
    debug(`-> No service account clients to run loadtest on, STOPPING!`.yellow);
    return;
  }
  const { uTime: uCTime, dTime: dCTime, tTime: tCTime } = await loadTestClient(
    confidentials[randomNumber(0, confidentials.length)],
  );
  log(`===== SUMMARY round ${round} ======`.bold);
  log('= Approved levels');
  Object.keys(validations).forEach(key =>
    log(`${key}:`, `${validations[key].approvedMs}`.yellow, 'ms'),
  );
  log('----');
  log(
    `# GET`,
    `${allClients.length} clients: ${prettyPrintDiff(allTime)}`.bold,
    'which is',
    validations.ALL.approvedMs > allTime ? 'OK'.green : 'NOT OK'.red,
  );
  log('');
  log(
    `# ${allClients.length} - PUBLIC`,
    `Token: ${prettyPrintDiff(tPTime)}`.bold,
    'which is',
    validations.TOKEN.approvedMs > tPTime ? 'OK'.green : 'NOT OK'.red,
  );
  log(
    `# ${allClients.length} - PUBLIC`,
    `Update: ${prettyPrintDiff(uPTime)}`.bold,
    'which is',
    validations.UPDATE.approvedMs > uPTime ? 'OK'.green : 'NOT OK'.red,
  );
  log(
    `# ${allClients.length} - PUBLIC`,
    `Delete: ${prettyPrintDiff(dPTime)}`.bold,
    'which is',
    validations.DELETE.approvedMs > dPTime ? 'OK'.green : 'NOT OK'.red,
  );
  log('');
  log(
    `# ${allClients.length - 1} - CONFIDENTIAL`,
    `Token: ${prettyPrintDiff(tCTime)}`.bold,
    'which is',
    validations.TOKEN.approvedMs > tCTime ? 'OK'.green : 'NOT OK'.red,
  );
  log(
    `# ${allClients.length - 1} - CONFIDENTIAL`,
    `Update: ${prettyPrintDiff(uCTime)}`.bold,
    'which is',
    validations.UPDATE.approvedMs > uCTime ? 'OK'.green : 'NOT OK'.red,
  );
  log(
    `# ${allClients.length - 1} - CONFIDENTIAL`,
    `Delete: ${prettyPrintDiff(dCTime)}`.bold,
    'which is',
    validations.DELETE.approvedMs > dCTime ? 'OK'.green : 'NOT OK'.red,
  );
  const roundTime = Date.now() - roundStart;
  log('');
  log(
    `# ${allClients.length - 2} COMPLETED:`,
    `${prettyPrintDiff(roundTime)}`.bold,
  );
  log('.........');

  outputResult.push({
    clientsCount: allClients.length - 2,
    roundTime,
    allTime,
    tPTime,
    uPTime,
    dPTime,
    tCTime,
    uCTime,
    dCTime,
  });
}

let round = 0;
async function run() {
  round += 1;
  if (round > rounds) {
    return Promise.resolve();
  }
  await main(round);
  return run();
}

const testConnection = async () => {
  log('Testing connection to Keycloak...');
  try {
    await getAdminToken(adminPassword);
  } catch (err) {
    log(`ERROR: Keycloak connection test failed...`);
    throw err;
  }
};

module.exports = async (config, options) => {
  host = config.host;
  adminPassword = config.adminPassword;

  amount = options.amount;
  rounds = options.rounds;
  level = options.level;

  await testConnection();

  const start = Date.now();
  return run()
    .then(async () => {
      const allClients = await getAllClients();
      const outputDir = path.resolve(
        __dirname,
        '../../../',
        'output/performance',
      );
      await fs.writeFile(
        `${outputDir}/latest-perf-result.json`,
        JSON.stringify(outputResult),
      );
      await fs.writeFile(`${outputDir}/latest-perf-result.log`, logString);
      const outputDirHistory = path.resolve(
        __dirname,
        '../../../',
        'output/performance/history',
      );
      await fs.writeFile(
        `${outputDirHistory}/${allClients.length}-latest-perf-result.json`,
        JSON.stringify(outputResult),
      );
      await fs.writeFile(
        `${outputDirHistory}/${allClients.length}-latest-perf-result.log`,
        logString,
      );
      return outputResult;
    })
    .catch(err => {
      log(
        `performance test failed after: ${prettyPrintDiff(Date.now() - start)}`,
      );
      log(`${err.message}`.red, err.response ? err.response.data : err);
    });
};
