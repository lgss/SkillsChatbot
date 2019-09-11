require('dotenv').config();
const SLACKTOKEN = process.env.SLACKTOKEN;
const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');
const handle = require('./handle.js');
var restify = require('restify');
const tools = require('./tools.js');

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
	if (!event.text.startsWith(`<@${this.activeUserId}>`)) return;
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

var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.post('/receivemessage',function(req, res, next){
	var body = JSON.parse(req.body.payload)
	console.log(body.user.id);
	console.log(body.actions[0].value);
	tools.deleteSkill(body.actions[0].value, body.user.id);
	res.send(200,"ok");
});

server.listen(4390, function() {
	console.log('%s listening at %s', server.name, server.url);
});