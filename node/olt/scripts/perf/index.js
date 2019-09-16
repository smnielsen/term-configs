require('colors');
const inquirer = require('inquirer');
const clientPerfTest = require('./client-perf-test');

const run = async () => {
  console.log('>> Running KEYCLOAK Performance module'.bold);
  console.log(' == Please type in your configuration =='.blue.bold);
  const { host, adminPassword } = await inquirer.prompt([
    {
      name: 'host',
      type: 'input',
      message: 'Keycloak host',
      default: 'http://localhost:8080',
    },
    {
      name: 'adminPassword',
      type: 'password',
      message: 'Keycloak admin password',
      default: 'secureadmin',
    },
  ]);
  console.log(' == Type in Performance Metrics =='.blue.bold);
  const { amount, rounds, level } = await inquirer.prompt([
    {
      name: 'amount',
      type: 'number',
      message: 'Amount of clients to create',
      default: 10,
    },
    {
      name: 'rounds',
      type: 'number',
      message: 'Amount of rounds to run',
      default: 2,
    },
    {
      name: 'level',
      type: 'list',
      message: 'Logging level',
      choices: ['debug', 'prod'],
      default: 'debug',
    },
  ]);
  return clientPerfTest({ host, adminPassword }, { amount, rounds, level });
};

run().catch(err => {
  console.log(`>> Script error ${err.message}`.red);
});
