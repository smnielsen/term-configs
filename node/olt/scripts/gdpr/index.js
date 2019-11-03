require('colors');
const inquirer = require('inquirer');
const program = require('commander');

const gdprConfig = require('./gdpr-config');
const gdprRequest = require('./gdpr-request');

// Setup commander interface
program
  .option('-n, --name <name>', 'Set the name of the person')
  .option('-e, --email <email>', 'Set the email of the person')
  .option('-a, --address <address>', 'Set the email of the person (within "")')
  .option('-p, --password <password>', 'Admin password for current k8s env');

const run = async () => {
  console.log('>> Running GDPR module'.bold);
  const data = program.parse(process.argv);

  const input = await inquirer.prompt([
    {
      name: 'name',
      type: 'input',
      message: 'The name:',
      default: data.name,
    },
    {
      name: 'email',
      type: 'input',
      message: 'The email:',
      default: data.email,
    },
    {
      name: 'address',
      type: 'input',
      message: 'The address (street + number):',
      default: data.address || 'empty',
    },
  ]);

  const { adminPassword } = await inquirer.prompt([
    {
      name: 'adminPassword',
      type: 'input',
      message: 'Admin password for current Kubernetes env',
      default: process.env.KC_ADMIN_PASS || data.password,
    },
  ]);

  return gdprRequest(input, adminPassword);
};

if (require.main === module) {
  run().catch(err => {
    console.log(`>> Script error ${err.message}`.red);
  });
}

module.exports = run;
