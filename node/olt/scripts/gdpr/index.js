require('colors');
const inquirer = require('inquirer');

const gdprRequest = require('./gdpr-request');

const run = async () => {
  console.log('>> Running GDPR module'.bold);
  const { name, email, address, adminPassword } = await inquirer.prompt([
    {
      name: 'name',
      type: 'input',
      message: 'The name:',
      default: 'Simon Nielsen',
    },
    {
      name: 'email',
      type: 'input',
      message: 'The email:',
      default: 'simon.nielsen@netlight.com',
    },
    {
      name: 'address',
      type: 'input',
      message: 'The address (street + number):',
      default: 'Stralauer Allee 23C',
    },
    {
      name: 'adminPassword',
      type: 'password',
      message: 'Admin password for current Kubernetes env',
      default: process.env.KC_ADMIN_PASS,
    },
  ]);

  return gdprRequest(
    {
      name,
      email,
      address,
    },
    adminPassword,
  );
};

run().catch(err => {
  console.log(`>> Script error ${err.message}`.red);
});
