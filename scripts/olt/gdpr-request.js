require('colors');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');
const _ = require('lodash');
const getTenants = require('./runners/list-tenants-data');
const searchUsers = require('./runners/search-users');
const gdprConfig = require('./gdpr-config');

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

const searchTenant = (query, tenants) => {
  const matcher = createMatcher(query || '');
  const result = tenants.filter(tenant => {
    return (
      matcher(tenant.name) ||
      matcher(tenant.billingContact.firstname) ||
      matcher(tenant.billingContact.lastname) ||
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

async function main() {
  const { tenants: allTenants } = await getTenants();
  log.info(`Searching through ${allTenants.length} tenants..`.bold);

  // TODO: Add tenant search
  const tenants = gdprConfig
    .map(async userData => {
      Object.keys(userData)
        .map(async key => {
          log(
            `> {tenants} Searching "${userData[key]}" on "${key}" key`.italic,
          );
          return searchTenant(userData[key], allTenants);
        })
        .flat();
    })
    .flat();

  log.info(`Searching through users..`.bold);
  const users = (await Promise.all(
    gdprConfig.map(async userData => {
      return (await Promise.all(
        Object.keys(userData).map(async key => {
          log(`> {users} Searching "${userData[key]}" on "${key}" key`.italic);
          return searchUsers(userData[key]);
        }),
      )).flat();
    }),
  )).flat();

  return {
    tenants,
    users,
  };
}

const filename = path.basename(__filename);
log(`Running CLI for ${filename}`);
main()
  .then(async ({ users, tenants }) => {
    const output = path.resolve(
      __dirname,
      `-${filename.replace('.js', '-output.json')}`,
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
