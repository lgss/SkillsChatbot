require('dotenv').config();
const SLACKTOKEN = process.env.SLACKTOKEN;
const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');
const handle = require('./handle.js');

// Initilise RTM and Web clients
const rtm = new RTMClient(SLACKTOKEN);
const web = new WebClient(SLACKTOKEN);

// Connect to Slack
(async () => {
	const { self, team } = await rtm.start();
})();


rtm.on('message', function (event) {
	if (event.type !== 'message') return;
	if (event.bot_id) return;
	handle.message(event, this, web);
});

rtm.on('reaction_added', function(event){
	handle.reaction_added(event, this, web);
})

rtm.on('error', (err) => {
	handle.error(err, rtm, web)
})

rtm.on('block_payloads', function(event) {
	console.log('bloack payload detected');
})

