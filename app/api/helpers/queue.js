const bull = require("bull");
const { statementProcess } = require("../services/statement");
// import {setQueues, BullAdapter} from 'bull-board';
const opts = require("./redisConnection");
const { pusher } = require("./../services/pusher");

const queue = new bull("ocrQueue", opts);

// setQueues([
//     new BullAdapter(ocrQueue)
// ]);

queue.process(statementProcess);

queue.on("completed", async (job, result) => {
  // implement pusher
  await pusher.trigger(
    "affordability-channel",
    "processing-statement-complete",
    {
      status: "success",
      statusCode: result.code || "good",
      message: result.message || "Completed",
      token: job.data.token,
      userId: job.data.userId,
    }
  );
});

queue.on("failed", async (job, error) => {
  // implement pusher
  await pusher.trigger(
    "affordability-channel",
    "processing-statement-complete",
    {
      status: "failed",
      statusCode: error.code || "server-error",
      message: error.message || "Something went wrong!",
      token: job.data.token,
      userId: job.data.userId,
      fileIndex: error.fileIndex ?? -1,
    }
  );
});

const createJob = async (statementFileNames, bank, token) =>
  await queue.add({
    statementFileNames,
    bank,
    token,
  });

module.exports = { createJob };
