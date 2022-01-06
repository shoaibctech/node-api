const util = require('util');
const exec = util.promisify(require('child_process').exec);
var path = require('path');

var parentDir = path.resolve(process.cwd(), '..');

module.exports = {
    runApiCaller: async (req, res, next) => {
        try {
            const user = [
                {
                    id: 1,
                    Name: "Emma smith"
                }
            ]
                
    const command = 'sr_api_call.exe --ip 127.0.0.1 --port 503 --version';
    const command1 = 'sr_api_call.exe --ip 127.0.0.1 --port 503 --ocrflag 0 --upath Statement_2021_12.pdf --rtemplate UK::Lloyds --opath test.csv';

    const result = await runCommand(command1);
    console.log("_result", result);

            res.status(200).send({success: true, user: user})
        } catch (e){
            next(e);
        }
    },
    uploadFile: async (req, res, next) => {
        try {

            let file = req.files.file;
            let fileName = file.name;

            let uploadPath = path.join(`/Users/macbook/lucie/${fileName}`);
            file.mv(uploadPath, function(err) {
                if (err)
                    return res.status(500).send(err);

                res.send('File uploaded to ' + uploadPath);
            });

        } catch (e){
            next(e);
        }
    },

}

async function runCommand(command) {
    console.log("[[]]][][][][][[]", parentDir);
  const { stdout, stderr, error } = await exec(command, {
    cwd: parentDir
  },);
  if(stderr){console.error('stderr:', stderr);}
  if(error){console.error('error:', error);}
  return stdout;
}