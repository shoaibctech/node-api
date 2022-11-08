const Pusher = require("pusher");
const appSync = require("./appsync");

let pusher = new Pusher({
  appId: "1101809",
  key: "ac404fe517d1f318787a",
  secret: "f46ee64d56269e3cb8fb",
  cluster: "ap2",
  useTLS: true,
});

const notifyFileStatus = async (status, index, { data }) => {
  appSync.publish(
    "processing-statement",
    JSON.stringify({
      status: status,
      token: data.token,
      userId: data.userId,
      fileIndex: index,
    })
  );
  return await pusher.trigger("affordability-channel", "processing-statement", {
    status: status,
    token: data.token,
    userId: data.userId,
    fileIndex: index,
  });
};

const notifyStatus = async ({ status, message }, { data }) => {
  appSync.publish(
    "processing-statement",
    JSON.stringify({
      status: status,
      message: message,
      token: data.token,
      userId: data.userId,
    })
  );
  return await pusher.trigger("affordability-channel", "processing-statement", {
    status: status,
    message: message,
    token: data.token,
    userId: data.userId,
  });
};

const saveStatement = async (status, token) => {
  appSync.publish(
    "save-statement",
    JSON.stringify({
      status: status,
      token: token,
    })
  );
  return await pusher.trigger("affordability-channel", "save-statement", {
    status: status,
    token: token,
  });
};

module.exports = {
  pusher,
  notifyFileStatus,
  notifyStatus,
  saveStatement,
};
