var amqp = require("amqplib/callback_api");

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'hello-test';

    channel.assertQueue(queue, {
      durable: false
    });

    console.log("[*] waiting for messages in %s", queue);
    channel.consume(queue, (msg)=>{
        console.log("receive %s", msg.content.toString())
    }, {
        noAck: true
    })
  });
});