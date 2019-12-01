require('colors');
const inquirer = require('inquirer');
const listFullTenantList = require('./listFullTenantList');

const run = async () => {
  console.log('>> Running TENANTS'.bold);
  console.log(' == Please type in your configuration =='.blue.bold);
  const TYPES = ['full'];
  const { type } = await inquirer.prompt([
    {
      name: 'type',
      type: 'list',
      message: 'Type of tenants',
      choices: TYPES,
      default: 'debug',
    },
  ]);

  try {
    switch (type) {
      case 'full': {
        return await listFullTenantList();
      }
      default: {
        console.log('Not running anything...'.yellow);
      }
    }
  } catch (err) {
    console.error(`[tenants] Could not execute ${type} cause ${err.message}`.red, err);
    throw err;
  }
};

if (require.main === module) {
  run().catch(err => {
    console.log(`>> Script error ${err.message}`.red, err);
  });
}

module.exports = run;
