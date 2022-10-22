const { TwitterApi } = require('twitter-api-v2');


// KC1ZM0Z3MJa0ZIFffpbeEUzeY - api key
//qdjscfqKdWAX7PG5FMkqOGUkNva4qfPaeQ5akDbu49CTH7T8xd - api key secret 

const userClient = new TwitterApi({
    appKey: "KC1ZM0Z3MJa0ZIFffpbeEUzeY",
    appSecret: "qdjscfqKdWAX7PG5FMkqOGUkNva4qfPaeQ5akDbu49CTH7T8xd"

})


async function test(){

    await userClient.v1.tweet("hello, this is a test");
}

test()
