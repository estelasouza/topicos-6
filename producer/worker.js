var amqp = require('amqplib/callback_api');

amqp.connect("amqp://localhost",(err,connect)=> {
    if(err){
        throw err
    }

    connect.createChannel((error,chanel)=>{
        if(error){
            throw error
        }

        var queue = 'hello-test';
        var msg = 'Hello world'

        chanel.assertQueue(queue, {
            durable: false
        });

        chanel.sendToQueue(queue, Buffer.from(msg));

        console.log("[x] sent %s", msg);
    });

    setTimeout(()=>{
        connect.close();
        process.exit(0)
    },500)
})