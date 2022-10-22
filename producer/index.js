const Cache = require("cache");
const axios = require("axios");
const amqp = require('amqplib/callback_api');
const WebSocketClient = require('websocket').client;

require('dotenv').config();

var FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
var QUEUE_KEY = process.env.QUEUE_KEY;
var GAME_TTL = 2 * 3600 * 1000; // Time to keep the watching games (2 hours)
var LOGOS_TTL = 12 * 24 * 3600 * 1000; // Time to keep the watching games (12 days)

var rabbitMQConnection;
var watchingGames = new Cache(GAME_TTL);
var teamLogos = new Cache(LOGOS_TTL);
var footballWebSocketClient = new WebSocketClient();

var firstBulkAlreadyLoaded = false; //To idenfity new games

function sendToQueue(message) {
    rabbitMQConnection.createChannel((error, channel) => {
        if(error){
            throw error;
        }

        channel.assertQueue(QUEUE_KEY, {
            durable: false
        });

        channel.sendToQueue(QUEUE_KEY, Buffer.from(message));

        console.log("[x] sent %s", message);
    });
}

async function getTeamLogo(teamId) {
    if (!teamLogos.get(teamId)) {
        try {
            const response = await axios.get(`https://apiv2.allsportsapi.com/football?met=Teams&APIkey=${FOOTBALL_API_KEY}&teamId=${teamId}`);
            teamLogos.put(teamId, response.data.result[0].team_logo);
        } catch (error) {
            teamLogos.put(teamId, null);
        }
    }
    return teamLogos.get(teamId);
}

async function filterGamesByNewGols(events) {
    try {
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            let cachedEvent = watchingGames.get(String(event.event_key));
            if (!firstBulkAlreadyLoaded) {
                watchingGames.put(String(event.event_key), event);
            } else if(!cachedEvent || cachedEvent.goalscorers.length != event.goalscorers.length) {
                watchingGames.put(String(event.event_key), event);
                let goalScorer;
                if (event.goalscorers.length > 0) {
                    goalScorer = event.goalscorers[event.goalscorers.length - 1];
                } else {
                    goalScorer = {
                        "time": "0",
                        "home_scorer": "",
                        "score":"0 - 0",
                        "away_scorer":"",
                        "score_info": "",
                        "info_time": ""
                    }
                }
                let score = goalScorer.score.split(" - ");
                let homeScore = parseInt(score[0]);
                let awayScore = parseInt(score[1]);
                
                let homeTeamLogo = await getTeamLogo(event.home_team_key);
                let awayTeamLogo = await getTeamLogo(event.away_team_key);

                if (!homeTeamLogo || !awayTeamLogo) {
                    console.error(`Could not get the team logos: ${event.home_team_key} and ${event.away_team_key}`);
                }

                let goalPlayerName = goalScorer.home_scorer || goalScorer.away_scorer;
                let teamGoal = goalPlayerName ? (goalScorer.home_scorer ? event.event_home_team : event.event_away_team) : "";
                let goalEvent = {
                    "leagueName": event.league_name,
                    "leagueLogo": event.league_logo,
                    "countryName": event.country_name,
                    "countryLogo": event.country_logo,
                    "homeTeamName": event.event_home_team,
                    "homeTeamLogo": homeTeamLogo,
                    "awayTeamName": event.event_away_team,
                    "awayTeamLogo": awayTeamLogo,
                    "homeTeamGoals": homeScore,
                    "awayTeamGols": awayScore,
                    "teamGoal": teamGoal,
                    "goalPlayerName": goalPlayerName
                }
                console.log("Sending current result to the queue");
                console.log(goalEvent);

                sendToQueue(JSON.stringify(goalEvent));
            }
        }
        firstBulkAlreadyLoaded = true;
    } catch (error) {
        console.error(error);
    }
}

console.log("Connecting to RabbitMQ instance...");

amqp.connect(process.env.RABBIT_MQ_URL, (err, connection)=> {
    if(err){
        throw err;
    }

    rabbitMQConnection = connection;

    console.log("Connected to the RabbitMQ instance!");

    console.log("Connecting Football WebSocket API...");

    footballWebSocketClient.connect(`wss://wss.allsportsapi.com/live_events?APIkey=${FOOTBALL_API_KEY}`);

    footballWebSocketClient.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    footballWebSocketClient.on('connect', function(webSocketConnection) {
        console.log('Connected to the Football API!');

        webSocketConnection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });

        webSocketConnection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log(new Date(), "Received new bulk of events");
        
                let events = JSON.parse(message.utf8Data);

                filterGamesByNewGols(events);
            }
        });
    });
});
