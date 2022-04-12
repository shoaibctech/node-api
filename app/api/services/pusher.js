const Pusher = require("pusher");

let pusher = new Pusher({
  appId: "1101809",
  key: "ac404fe517d1f318787a",
  secret: "f46ee64d56269e3cb8fb",
  cluster: "ap2",
  useTLS: true,
});

const notifyFileStatus = async (status, index, {data}) => {
    return await pusher.trigger("affordability-channel", "processing-statement", {
        status: status,
        token: data.token,
        userId: data.userId,
        fileIndex: index,
    });
}

const notifyStatus = async ({status, message}, {data}) => {
    return await pusher.trigger("affordability-channel", "processing-statement", {
        status: status,
        message: message,
        token: data.token,
        userId: data.userId
    });
}


module.exports = {
    pusher,
    notifyFileStatus,
    notifyStatus
}