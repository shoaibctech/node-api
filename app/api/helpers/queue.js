const bull = require("bull");
const { statementProcess } = require("../services/statement");
// import {setQueues, BullAdapter} from 'bull-board';
const opts = require("./redisConnection");

// https://optimalbits.github.io/bull

const queue = new bull("ocrQueue", opts);

// setQueues([
//     new BullAdapter(ocrQueue)
// ]);

queue.process(statementProcess);

queue.on("completed", (job, result) => {
  // implement pusher
});

queue.on("failed", (job, error) => {
  // implement pusher
});

const createJob = async (
    statementFile,
    csvFileName,
    bankName,
) => {
  await queue.add({
    statementFile,
    csvFileName,
    bankName,
  });
};

module.exports = { createJob };
