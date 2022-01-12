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
  console.log("////////////", job.data, result);
});

queue.on("failed", (job, error) => {
  console.log("||||||||||||||||", job.data, error);
});

const createJob = async (
  statementFile,
  statementFileName,
  csvFileName,
  bankName,
  path
) => {
  await queue.add({
    statementFile,
    statementFileName,
    csvFileName,
    bankName,
    path,
  });
};

module.exports = { createJob };
