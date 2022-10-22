const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();


const client = new TwitterApi({
    appKey:process.env.APP_KEY,
    appSecret:process.env.APP_SECRET,
    accessToken:process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_SECRET
  });

  
  async function test(){
  

    const mediaIds = await Promise.all([
        // file path
        client.v1.uploadMedia('./fluxograma.drawio.png'),
      ]);
      
      // mediaIds is a string[], can be given to .tweet
      await client.v1.tweet('My tweet text with two images!', { media_ids: mediaIds });
    

}

test()
