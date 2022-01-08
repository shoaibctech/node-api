const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
let fs = require('fs');
let FormData = require('form-data');
const {uploadFile} = require("../helpers/statement");
const axios = require("axios");
const fsPromises = require("fs/promises");


let parentDir = path.resolve(process.cwd(), '..');

module.exports = {
    upload: async (req, res, next) => {
        try {

            await uploadFile(req.files.file);

            const command1 = 'sr_api_call.exe --ip 127.0.0.1 --port 503 --version';
            const command = `sr_api_call.exe --ip 127.0.0.1 --port 503 --ocrflag 0 --upath Statement_2021_12.pdf --rtemplate UK::Lloyds --opath test.csv`;

            const result = await runCommand(command1);
            console.log("_result", result);

            let filePath = path.join(`/Users/macbook/lucie/Application 00001 transactions.csv`)

            const coolPath = path.join(__dirname, '../../../Application 00001 transactions.csv');
            let form = new FormData();
            let newFile = fs.createReadStream(coolPath);

            form.append('file', newFile, 'file.csv');
            const data = await axios.post('http://localhost:4000/api/file/upload', form, {
                headers: form.getHeaders(),
            });

            await deleteFile(coolPath);

            res.status(200).send({message: true});
        } catch (e) {
            next(e);
        }
    },

}

runCommand = async (command) => {
    console.log("[[]]][][][][][[]", parentDir);
    const {stdout, stderr, error} = await exec(command);
    if (stderr) {
        console.error('stderr:', stderr);
    }
    if (error) {
        console.error('error:', error);
    }
    return stdout;
};

deleteFile = async (filePath) => {
    try {
        await fsPromises.unlink(filePath);
        console.log('Successfully removed file!');
    } catch (err) {
        throw err;
    }
};