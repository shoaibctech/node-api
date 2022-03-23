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
  await pusher.trigger("affordability-channel", "processing-statement-complete", {
    status: "success",
    statusCode: result?.code || "good",
    message: result?.message || "Completed",
    token: job.data.token,
    userId: job.data.userId,
  });
});

queue.on("failed", async (job, error) => {
  // implement pusher
  await pusher.trigger("affordability-channel", "processing-statement-complete", {
    status: "failed",
    statusCode: error?.code || "server-error",
    message: error?.message || "Something went wrong!",
    token: job.data.token,
    userId: job.data.userId,
    fileIndex: error?.fileIndex || -1
  });
});

const createJob = async (
  statementFileNames,
  bankName,
  userId,
  token
) => {
  await queue.add({
    statementFileNames,
    bankName,
    userId,
    token,
  });
};

module.exports = { createJob };
