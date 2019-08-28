const assert = require('assert');
const {
  connectConsumerGroupStream,
} = require('@lightelligence/olt-microservice-package').kafka;

const KAFKA_BROKER = process.env.KAFKA_BROKER;
assert(KAFKA_BROKER, 'Missing process.env.KAFKA_BROKER');
assert(process.argv[2], 'Set topics separated by "," at first param');

const topics = (process.argv[2] || '').split(',');
console.log(`Kafka: ${KAFKA_BROKER}`);

async function run(consumerGroup) {
  console.log(`Consuming: ${JSON.stringify(topics)}...`);
  consumerGroup.on('data', async msg => {
    console.log(`Received ${msg.topics} with payload`, msg);
    consumerGroup.commit(msg, true);
  });

  process.on('SIGTERM', () => consumerGroup.close());
  process.on('SIGINT', () => consumerGroup.close());

  setInterval(() => {
    console.log('...waiting for messages...');
  }, 1000);
}

connectConsumerGroupStream(
  {
    kafkaHost: KAFKA_BROKER,
    groupId: 'simontest',
  },
  topics,
)
  .then(run)
  .catch(err => console.error(`Failed to connect to ${KAFKA_BROKER}`, err));
