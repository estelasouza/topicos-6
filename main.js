const { TwitterApi } = require('twitter-api-v2');

const Twitter = require('twitter-v2');


// KC1ZM0Z3MJa0ZIFffpbeEUzeY - api key
//qdjscfqKdWAX7PG5FMkqOGUkNva4qfPaeQ5akDbu49CTH7T8xd - api key secret 

const client = new Twitter({
    bearer_token: 'AAAAAAAAAAAAAAAAAAAAAKHWiQEAAAAAm6CcT680F4dfQTi9URNdZ04ZyCg%3DV6PmWkXvzg784Os78Sdf3CCK7BYRKBhgd7k0Z7e5Zl8oUkwRWZ',
  });


async function test(){
    
    const { data } = await client.get('tweets', { ids: '1228393702244134912' });
    console.log(data);
}

test()
