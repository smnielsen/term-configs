const assert = require('assert');
const {
  connectProducer,
} = require('@lightelligence/olt-microservice-package').kafka;
const uuidv4 = require('uuid/v4');

const KAFKA_BROKER = process.env.KAFKA_BROKER;

assert(KAFKA_BROKER, 'Missing process.env.KAFKA_BROKER');

console.log(`Kafka: ${KAFKA_BROKER}`);

async function send(topic, data) {
  // Create producer
  console.log('# Connecting to producer...');
  const producer = await connectProducer({ kafkaHost: KAFKA_BROKER }, [topic]);
  console.log('# Connection successful!');
  // Send message
  await new Promise((resolve, reject) => {
    console.log(`# Sending message from producer on ${topic}`);
    console.log(data);
    producer.send(
      [
        {
          key: 'hello-key',
          topic,
          messages: JSON.stringify({
            meta: {
              timestamp: new Date(),
              producer: 'simon-kafka-sender',
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

const argv = process.argv;
console.log('Argv', argv);
const topic = argv[2];
const data = argv[3]
  ? JSON.parse(argv[3])
  : {
      applicationId: uuidv4(),
      applicationName: 'Test From CLI script',
      tenantId: uuidv4(),
    };

send(topic, data)
  .catch(err => console.error(err))
  .then(() => process.exit(0));
