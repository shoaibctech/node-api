const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
let fs = require("fs");
let FormData = require("form-data");
const { uploadFile } = require("../helpers/statement");
const axios = require("axios");
const fsPromises = require("fs/promises");

let parentDir = path.resolve(process.cwd(), "..");

statementProcess = async (job) => {
  const { statementFile, statementFileName, csvFileName, bankName, path } = job;
  try {
    // await uploadFile(statementFile, `${path}${statementFileName}`);

    // const command1 = 'sr_api_call.exe --ip 127.0.0.1 --port 503 --version';
    const command = `sr_api_call.exe --ip 127.0.0.1 --port 503 --ocrflag 0 --upath Statement_2021_12.pdf --rtemplate UK::${bankName} --opath ${csvFileName}`;

    const result = await runCommand(command);
    console.log("_result", result);

    let accuracy = parseInt(
      result.match(new RegExp("accuracy" + "\\s(\\w+)"))[1]
    );

    console.log("{}{}{}}{}{}", accuracy, typeof accuracy);

    if (accuracy >= 70) {
      let form = new FormData();
      let csvStatement = fs.createReadStream(`${path}${csvFileName}`);

      console.log("DDDDDDD");
      form.append("statement", csvStatement, "statement.csv");
      return await axios.post(
        "https://dev-api-clearstake.herokuapp.com/api/statement/read",
        form,
        {
          headers: form.getHeaders(),
        }
      );

      // await deleteFile(`${path}${statementFileName}`);
      // await deleteFile(`${path}statement.csv`);

      // res.status(200).send({message: true, trans: data.data});
    }
  } catch (err) {
    throw err;
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
