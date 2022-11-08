const bull = require("bull");
const { statementProcess } = require("../services/statement");
// import {setQueues, BullAdapter} from 'bull-board';
const opts = require("./redisConnection");
const { pusher } = require("./../services/pusher");
const appSync = require("./../services/appsync");

const queue = new bull("ocrQueue", opts);

// setQueues([
//     new BullAdapter(ocrQueue)
// ]);

queue.process(statementProcess);

queue.on("completed", async (job, result) => {
  appSync.publish(
    "processing-statement-complete",
    JSON.stringify({
      status: "success",
      statusCode: result.code || "good",
      message: result.message || "Completed",
      token: job.data.token,
      userId: job.data.userId,
    })
  );
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
  console.log("::", error);
  // implement pusher
  try {
    appSync.publish(
      "processing-statement-complete",
      JSON.stringify({
        status: "failed",
        statusCode: error.code || "server-error",
        message: error.message || "Something went wrong!",
        token: job.data.token,
        userId: job.data.userId,
        fileIndex: error.fileIndex ?? -1,
      })
    );
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
  } catch (error) {
    console.log(":::", error);
  }
});

const createJob = async (statementFileNames, bank, token) =>
  await queue.add({
    statementFileNames,
    bank,
    token,
  });

module.exports = { createJob };
