require('colors');
const request = require('request');
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

const fetchAllTenants = (tenants = [], page = 0, pageSize = 100) => {
  return new Promise(async (resolve, reject) => {
    let res;
    try {
      res = await idService({
        method: 'GET',
        url: '/v1/internal/tenants',
        params: {
          page,
          pageSize,
        },
      });
    } catch (err) {
      error(`Could not fetch all tenants "${err.message}"`, err);
      return reject(
        new Error(`Could not fetch all tenants "${err.message}"`, err),
      );
    }
    if (res.status > 299) {
      return reject(
        new Error(`Could not fetch all tenants "${res.statusText}"`),
      );
    }
    const {
      data: { data, meta },
    } = res;
    log(`=> Fetched page ${page} with ${data.length} results`);
    if (data.length >= meta.pageSize) {
      return resolve(fetchAllTenants([...tenants, ...data], ++page, pageSize));
    }
    resolve([...tenants, ...data]);
  });
};

const fetchTenant = async (tenantId, index) => {
  try {
    // log(`§ ${index}: Fetching tenant ${tenantId}...`);
    const res = await idService({
      method: 'GET',
      url: `/v1/tenants/${tenantId}`,
      headers: {
        Authorization: `Bearer ${buildJwt(tenantId)}`,
      },
    });

    const {
      data: { data: tenant },
    } = res;

    // success(`=> ${index}: Fetched ${tenant.name} (${tenant.id})`);
    return tenant;
  } catch (err) {
    if (err.response) {
      error(`Res: Could not fetch ${tenantId}`, err.response.data);
    } else {
      error(`Error: Could not fetch ${tenantId}`, err.message);
    }
    return null;
  }
};

const enrichTenants = async tenantIds => {
  return Promise.all(
    tenantIds.map((tenantId, index) =>
      limit(() => fetchTenant(tenantId, index)),
    ),
  ).then(tenants => tenants.filter(t => t !== null));
};

const main = async (prefixes = []) => {
  try {
    await idService({
      method: 'GET',
      url: '/sys/health',
    });
  } catch (err) {
    error(`Could not ping at least one required service`, err.message);
    throw err;
  }
  log(
    '=> Fetching tenants'.bold,
    ' -> ',
    `"${prefixes.length > 0 ? prefixes.join(', ') : 'ALL'}"`,
  );
  const tenantIds = await fetchAllTenants();

  log(`=> Enriching ${tenantIds.length} tenants...`);
  // We need the name to find test tenants
  const enriched = await enrichTenants(tenantIds);

  // Filter test tenants
  let tenants = enriched;
  if (prefixes.length > 0) {
    tenants = enriched.filter(
      tenant =>
        prefixes.filter(prefix => new RegExp('^' + prefix).test(tenant.name))
          .length > 0,
    );
  }

  // Fetch applications for all test-tenants
  const applications = []; // await fetchAllAppsForTenants(filtered);

  log(`Found ${tenants.length} tenants...`);
  log(
    `Found`,
    `${applications.length}`.bold,
    'apps for',
    `${tenants.length}`.bold,
    'tenants',
  );

  return {
    allTenantIds: tenantIds,
    tenants,
    applications,
  };
};

/**
 * RUNNER
 */
if (require.main === module) {
  const filename = path.basename(__filename);
  log(`Running CLI for ${filename}`);
  // Called from CLI (terminal)
  const args = process.argv.slice(2);

  // First prefixes
  let prefixes = (args[0] || '').split(',');
  main(prefixes)
    .then(async ({ tenants, filtered, applications }) => {
      await fs.writeFile(
        path.resolve(__dirname, 'output', `-${filename}-output.json`),
        JSON.stringify({ tenants, filtered, applications }),
      );
    })
    .catch(err => {
      error(`Got Error: ${err.message}`);
    });
}

module.exports = main;
