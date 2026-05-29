const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_SQS_ENDPOINT || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  forcePathStyle: true,
});

function getQueueUrl(queueName) {
  const endpoint = process.env.AWS_SQS_ENDPOINT || 'http://localhost:4566';
  return `${endpoint}/queue/${queueName}`;
}

async function sendMessage(queueName, body) {
  const cmd = new SendMessageCommand({
    QueueUrl: getQueueUrl(queueName),
    MessageBody: JSON.stringify(body),
  });
  return sqs.send(cmd);
}

module.exports = { sqs, sendMessage, getQueueUrl };
