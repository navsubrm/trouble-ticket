const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs/promises");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

let client = null;
let db = null;

const args = { cwd: "./mongoDB/bin/" };

let instance = 0

async function runCheck() {
  //Check is mongo instances are running.
  //const { stdout } = await exec(process.env.CHECK_MONGO_ACTIVE, args);
  return instance //parseInt(stdout.slice(0));
}

function runMongod() {
  //Run commands to start mongo/mongosh
  exec(process.env.MONGOD, args, console.log("ran with", process.env.MONGOD));
  instance = 1
}

async function deleteOldLogs() {
  const files = await fs.readdir("./mongoDB/log");

  files.forEach(async (file) => {
    if (file != "mongo.log") await fs.unlink(`./mongoDB/log/${file}`);
  });
}

async function mongoInit() {
  if (!client) {
    if ((await runCheck()) > 0) {
      client = await mongoose.connect(process.env.CONNECTIONSTRING);
      db = client.connection;
      const app = require("./app");
      app.listen(process.env.APP_PORT, () => console.log(`Listening on port ${process.env.APP_PORT}.`));
    } else {
      deleteOldLogs();
      runMongod();
      mongoInit();
    }
  }
  module.exports = { db, client };
}