const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
let fs = require("fs");
let FormData = require("form-data");
const { uploadFile } = require("../helpers/statement");
const axios = require("axios");
const fsPromises = require("fs/promises");

let parentDir = path.resolve(process.cwd(), "..");
let form = new FormData();
let dirPath = `C:/Users/Administrator/Downloads/`;
// let dirPath = `/Users/macbook/lucie/`;
const Pusher = require("pusher");

let pusher = new Pusher({
  appId: "1101809",
  key: "ac404fe517d1f318787a",
  secret: "f46ee64d56269e3cb8fb",
  cluster: "ap2",
  useTLS: true,
});

statementProcess = async (job, done) => {
  const { statementFileNames, csvFileName, bankName, userId, token } = job.data;
  try {
    for (let index = 0; index < statementFileNames.length; index++) {
      await pusher.trigger("affordability-channel", "processing_statement", {
        token,
        userId,
        processingStatement: index + 1,
      });

      let statementFileName = statementFileNames[index];

      let fileNameWithOutExtension = path.parse(statementFileName).name;

      // await uploadFile(statementFile[index], `${dirPath}${statementFileName}`);

      // const command1 = 'sr_api_call.exe --ip 127.0.0.1 --port 503 --version';
      const command = `sr_api_call.exe --ip 127.0.0.1 --port 503 --ocrflag 0 --upath ${statementFileName} --rtemplate UK::${bankName} --opath ${fileNameWithOutExtension}.csv`;

      const result = await runCommand(command);
      console.log("_result", result);

      let accuracy = parseInt(
        result.match(new RegExp("accuracy" + "\\s(\\w+)"))[1]
      );

      if (accuracy < 90) {
        done({
          status: "Failed",
          statusCode: 400,
          resultMessage: "Result is not accurate enough",
          userId,
          token,
        });
      }

      let csvStatement = fs.createReadStream(
        `${dirPath}${fileNameWithOutExtension}.csv`
      );

      form.append("statement", csvStatement, `${fileNameWithOutExtension}.csv`);

      await deleteFile(`${dirPath}${statementFileName}`);
    }

    const result = await axios.post(
      "https://dev-api-clearstake.herokuapp.com/api/statement/read",
      form,
      {
        headers: form.getHeaders(),
      }
    );

    done(null, {
      status: "successful",
      statusCode: 200,
      resultMessage: "PDF successfully processed",
      userId,
      token,
    });

    // await deleteFile(`${dirPath}statement.csv`);

    // res.status(200).send({message: true, trans: data.data});
  } catch (error) {
    done(error);
  }
};

runCommand = async (command) => {
  const { stdout, stderr, error } = await exec(command, {
    cwd: parentDir,
  });
  if (stderr) {
    console.error("stderr:", stderr);
    throw stderr;
  }
  if (error) {
    console.error("error:", error);
    throw error;
  }
  return stdout;
};

deleteFile = async (filePath) => {
  try {
    await fsPromises.unlink(filePath);
    console.log("Successfully removed file!");
  } catch (err) {
    throw err;
  }
};

module.exports = {
  statementProcess,
};
