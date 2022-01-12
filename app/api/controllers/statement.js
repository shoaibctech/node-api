const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
let fs = require("fs");
let FormData = require("form-data");
const { uploadFile } = require("../helpers/statement");
const { createJob } = require("../helpers/queue");
const opts = require("../helpers/redisConnection");
const axios = require("axios");
const fsPromises = require("fs/promises");
const bull = require("bull");

module.exports = {
  upload: async (req, res, next) => {
    try {
      let bankName = req.body.bankName;
      let statementFileName = req.files.file.name;
      let statementFile = req.files.file;
      let csvFileName = req.body.csvFileName;
      let path = `C:/Users/Administrator/Downloads/`;

      await createJob(
        statementFile,
        statementFileName,
        csvFileName,
        bankName,
        path
      );

      // } else {
      //     res.status(400).send({success: false, message: "Result is not accurate enough"})
      // }
      res.status(200).send({ message: true, trans: "data.data" });
    } catch (e) {
      next(e);
    }
  },
  test: async (req, res) => {
    let statementFileName = req.files.file.name;
    let statementFile = req.files.file;
    res.status(200).send({ message: statementFileName });
  },
};

createJobs = async (
  statementFile,
  statementFileName,
  csvFileName,
  bankName,
  path,
  res
) => {
  console.log("1111111111", csvFileName);
  const queue = new bull("ocrQueue", opts);
  console.log("xxxxxxx");
  await queue.add({
    statementFile,
    statementFileName,
    csvFileName,
    bankName,
    path,
  });

  console.log("222222222");

  await queue.process(async (job, done) => {
    console.log("3333333333");
    /*  /*
            Sometimes, you might need to report the jobs progress, you can easily use the     job.progress() function to track the progress
             */
    let progress = 0;

    // for(let i = 0; i < 80; i++){
    // await doSomething(job.data);
    console.log("[][[][][]", job.data);
    const { statementFile, statementFileName, csvFileName, bankName, path } =
      job.data;
    const das = await processPdf(
      statementFile,
      statementFileName,
      csvFileName,
      bankName,
      path,
      res
    );

    progress += 10;
    //     job.progress(progress);
    // }
    // call done when finished
    done();
    console.log("returnnnnnnnnnnnnnnn!...!!!!!!");
  });
  console.log("&&&&&&&&&&&&&&&&&&&&!...!!!!!!");
};
