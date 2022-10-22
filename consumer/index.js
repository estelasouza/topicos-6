var amqp = require("amqplib/callback_api");
require("dotenv").config();
const { CreateFootballTwitterMessage } = require("./twitter.message");

amqp.connect(process.env.RABBIT_MQ_URL, function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = "football-events";

    channel.assertQueue(queue, {
      durable: false,
    });

    console.log("[*] waiting for messages in %s", queue);
    channel.consume(
      queue,
      (msg) => {
        console.log("receive %s", msg.content.toString());
        CreateFootballTwitterMessage(JSON.parse(msg.content.toString()));
      },
      {
        noAck: true,
      }
    );
  });
});
