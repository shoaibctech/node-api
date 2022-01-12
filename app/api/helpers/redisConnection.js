const Redis = require('ioredis');

const PORT = 6379;
const HOST = "127.0.0.1";
const client = new Redis(PORT, HOST);
const subscriber = new Redis(PORT, HOST);

const opts = {
  createClient(type) {
    switch (type) {
    case 'client':
      return client;
    case 'subscriber':
      return subscriber;
    default:
      return new Redis(PORT, HOST);
    }
  },
};

module.exports = {
    opts,
};