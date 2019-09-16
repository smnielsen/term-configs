require('colors');
const assert = require('assert');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const _ = require('lodash');
const getTenants = require('../../util/list-tenants-data');
const searchUsers = require('../../util/search-users');
// const gdprUser = require('./gdpr-config');

const log = (...msg) => {
  console.log(...msg);
};

log.info = (...msg) => {
  console.info(`>> ${msg[0]}`.blue, ...msg.slice(1));
};

log.error = (...msg) => {
  console.error(`${msg[0]}`.red.bold, ...msg.slice(1));
};

log.success = (...msg) => {
  console.log(`${msg[0]}`.green.bold, ...msg.slice(1));
};

const createMatcher = query => (value = '') =>
  query.toLowerCase() === value.toLowerCase();

const recursiveSearch = (matcher, obj, keyStr) => {
  if (typeof obj !== 'object') {
    return {
      key: keyStr,
      match: matcher(obj),
    };
  }
  return Object.keys(obj)
    .reduce((result, key) => {
      const value = obj[key];
    }, [])
    .filter(obj => obj.match !== null);
};

const searchTenant = (query, tenants) => {
  const matcher = createMatcher(query || '');
  const result = tenants.filter(tenant => {
    return (
      matcher(tenant.name) ||
      matcher(tenant.billingContact.firstname) ||
      matcher(tenant.billingContact.lastname) ||
      matcher(
        `${tenant.billingCompany.street} ${tenant.billingCompany.housenum}`,
      ) ||
      // Fullname
      matcher(
        `${tenant.billingContact.firstname} ${tenant.billingContact.lastname}`,
      ) ||
      matcher(tenant.billingCompany.name1) ||
      matcher(tenant.billingCompany.name2)
    );
  });
  log(
    '[search-tenants]',
    `==> [${query}] found ${result.length} tenants`.green.bold,
  );
  return result;
};

async function main(gdprUser, adminPassword) {
  log.info('Running GDPR Request for...');
  log(gdprUser);
  const { tenants: allTenants } = await getTenants();
  log.info(`Searching through ${allTenants.length} tenants..`.bold);

  const tenants = Object.keys(gdprUser)
    .map(async key => {
      log(`> {tenants} Searching "${gdprUser[key]}" on "${key}" key`.italic);
      return searchTenant(gdprUser[key], allTenants);
    })
    .flat();

  log.info(`Searching through users..`.bold);
  const users = (await Promise.all(
    Object.keys(gdprUser).map(async key => {
      log(`> {users} Searching "${gdprUser[key]}" on "${key}" key`.italic);
      return searchUsers(gdprUser[key], adminPassword);
    }),
  )).flat();

  return {
    tenants,
    users,
  };
}

module.exports = (gdprUser, adminPassword) => {
  assert(gdprUser, 'missing GDPR user');
  const filename = path.basename(__filename);
  return main(gdprUser, adminPassword)
    .then(async ({ users, tenants }) => {
      const output = path.resolve(
        __dirname,
        '../../../../output',
        `-${filename.replace('.js', `-${gdprUser.name}-output.json`)}`,
      );
      await fs.writeFile(output, JSON.stringify({ users, tenants }));
      log(``);
      log(`=> Success. Wrote result to:`.green);
      log(`   ${output}`);
    })
    .catch(err => {
      log.error(
        `Error during search ${err.message}`,
        err.toJSON ? err.toJSON() : err,
      );
    });
};
