require('colors');
const inquirer = require('inquirer');
const assert = require('assert');
const {
  connectConsumerGroupStream,
} = require('@lightelligence/olt-microservice-package').kafka;

function run(consumerGroup) {
  return new Promise((resolve, reject) => {
    console.log(`Consuming: ${JSON.stringify(topics)}...`);
    consumerGroup.on('data', msg => {
      console.log(`Received ${msg.topics} with payload`.green, msg);
      consumerGroup.commit(msg, true);
    });

    consumerGroup.on('error', msg => {
      console.log(`Errored`, msg);
    });

    process.on('SIGTERM', () => {
      consumerGroup.close();
      reject();
    });
    process.on('SIGINT', () => {
      consumerGroup.close();
      reject();
    });

    setInterval(() => {
      console.log('...waiting for messages...'.italic);
    }, 1000);
  });
}

const TOPICS = ['application:created'];

module.exports = async kafkaHost => {
  console.log('== Kafka Consumer Module =='.bold);
  const { topics } = await inquirer.prompt([
    {
      name: 'topics',
      type: 'checkbox',
      message: 'Choose topic(s) to consume (multiple options available)',
      choices: TOPICS,
    },
  ]);
  assert(topics, 'Missing topics');
  console.log(`# Kafka Topics:`, topics);
  console.log('Connecting to consumer...'.italic);

  return connectConsumerGroupStream(
    {
      kafkaHost,
      groupId: 'olt-kafka-tester',
    },
    topics,
  )
    .then(run)
    .catch(err => {
      console.error(`Failed to connect to ${kafkaHost}`, err);
    });
};
