const { TwitterApi } = require("twitter-api-v2");
var emojiFlags = require("emoji-flags");
const countryCodes = require("./countryEnums.json");
require("dotenv").config();

const client = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

const CreateFootballTwitterMessage = ({
  leagueName,
  // leagueLogo,
  homeTeamName,
  // homeTeamLogo,
  awayTeamName,
  // awayTeamLogo,
  homeTeamGoals,
  awayTeamGols,
  teamGoal,
  goalPlayerName,
  countryName,
  goalTime,
  // countryLogo
}) => {
  const countryFlag =
    countryName && countryCodes[countryName]
      ? emojiFlags.countryCode(countryCodes[countryName])
        ? emojiFlags.countryCode(countryCodes[countryName]).emoji
        : ""
      : "";

  const gameFooter = `
  \n${homeTeamName} ${homeTeamGoals} X ${awayTeamGols} ${awayTeamName}
  \n${countryFlag}League: ${leagueName}
  `;
  let message = "";

  if (
    parseInt(homeTeamGoals) === 0 &&
    parseInt(awayTeamGols) === 0 &&
    parseInt(homeTeamGoals) === parseInt(awayTeamGols)
  ) {
    message = `
    🏟️ GAME STARTED!!
    ${gameFooter}
    `;
  } else {
    message = `
    ⚽ GOOOOOAL${teamGoal ? ` from ${teamGoal}` : ""}${
      teamGoal ? ` of ${goalPlayerName}` : ""
    } at ${goalTime} !! 
    ${gameFooter}
    `;
  }

  CreateTweet(message);
};

async function CreateTweet(text) {
  try {
    await client.v1.tweet(text);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  CreateFootballTwitterMessage,
};
