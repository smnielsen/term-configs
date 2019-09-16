require('colors');
const inquirer = require('inquirer');

const run = async () => {
  console.log('>> Running kafka module'.bold);
  const { TYPE, KAFKA_BROKER } = await inquirer.prompt([
    {
      name: 'KAFKA_BROKER',
      type: 'input',
      message: 'Type your Kafka host',
      default: 'localhost:9092',
    },
    {
      name: 'TYPE',
      type: 'list',
      message: 'What do you want to do?',
      choices: ['consume', 'send'],
    },
  ]);

  const kafkaModule = require(`./kafka-${TYPE}.js`);
  return kafkaModule(KAFKA_BROKER);
};

run().catch(err => {
  console.log(`>> Script error ${err.message}`.red);
});
