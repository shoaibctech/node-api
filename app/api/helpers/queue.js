const bull = require("bull");
const { statementProcess } = require("../services/statement");
// import {setQueues, BullAdapter} from 'bull-board';
const opts = require("./redisConnection");
const Pusher = require("pusher");

let pusher = new Pusher({
  appId: "1101809",
  key: "ac404fe517d1f318787a",
  secret: "f46ee64d56269e3cb8fb",
  cluster: "ap2",
  useTLS: true,
});

// https://optimalbits.github.io/bull

const queue = new bull("ocrQueue", opts);

// setQueues([
//     new BullAdapter(ocrQueue)
// ]);

queue.process(statementProcess);

queue.on("completed", async (job, result) => {
  // implement pusher
  await pusher.trigger("affordability-channel", "qr-scan-event-complete", {
    status: result.status,
    statusCode: result.statusCode,
    resultMessage: result.resultMessage,
    token: result.token,
    userId: result.userId,
  });
});

queue.on("failed", async (job, error) => {
  // implement pusher
  await pusher.trigger("affordability-channel", "qr-scan-event-complete", {
    status: error.status,
    statusCode: error.statusCode,
    resultMessage: error.resultMessage,
    token: error.token,
    userId: error.userId,
  });
});

const createJob = async (
  statementFileNames,
  csvFileName,
  bankName,
  userId,
  token
) => {
  await queue.add({
    statementFileNames,
    csvFileName,
    bankName,
    userId,
    token,
  });
};

module.exports = { createJob };
