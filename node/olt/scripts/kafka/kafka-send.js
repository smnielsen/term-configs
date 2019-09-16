require('colors');
const assert = require('assert');
const _ = require('lodash');
const inquirer = require('inquirer');
const {
  connectProducer,
} = require('@lightelligence/olt-microservice-package').kafka;
const uuidv4 = require('uuid/v4');

async function send(kafkaHost, topic, data) {
  // Create producer
  console.log('# Connecting to producer...'.italic);
  const producer = await connectProducer({ kafkaHost }, [topic]);
  console.log(`# Connected to ${kafkaHost}`.green);
  // Send message
  return new Promise((resolve, reject) => {
    console.log(`# Sending message from producer on ${topic}`);
    console.log(data);
    producer.send(
      [
        {
          key: 'olt-kafka-key',
          topic,
          messages: JSON.stringify({
            meta: {
              timestamp: new Date(),
              producer: 'olt-kafka-tester',
              producerVersion: '-',
            },
            data,
          }),
        },
      ],
      (err, result) => {
        if (err) {
          console.info(`=> ERROR: Could not send message ${err.message}`, err);
          reject();
          return;
        }
        console.log('=> Success, message sent with result', result);
        resolve();
      },
    );
  });
}

const MOCK_TOPICS = {
  'application:created': {
    applicationId: uuidv4(),
    applicationName: 'Test From CLI script',
    tenantId: uuidv4(),
  },
};

module.exports = async kafkaHost => {
  console.log('== Kafka Sender Module =='.bold);
  let { topic } = await inquirer.prompt([
    {
      name: 'topic',
      type: 'list',
      message: 'Choose topic to send over Kafka (first for random)',
      choices: ['', ...Object.keys(MOCK_TOPICS)],
    },
  ]);

  if (!topic) {
    topic = Object.keys(MOCK_TOPICS)[_.random(0, Object.keys(MOCK_TOPICS))];
    console.log(`>> Using random topic...`);
  }
  const data = MOCK_TOPICS[topic];
  assert(data, `Invalid topic ${topic}, no Mock data found`);

  console.log(`# Sending topic ${topic.italic} with data`);
  console.log(data);

  return send(kafkaHost, topic, data).catch(err => {
    console.error(`Kafka sender could not send ${err.message}`.red);
  });
};
