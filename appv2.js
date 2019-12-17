var restify = require('restify');
const tools = require('./tools.js');

var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.post('/receivemessage',function(req, res, next){
	var body = JSON.parse(req.body.payload);
	switch (true) {
		default: 
			res.send(400,"ok");
			break;
		case body.actions[0].action_id == "delete":
			tools.deleteSkill(body.actions[0].value, body.user.id);
			res.send(200,"ok");
			break;
		case body.actions[0].action_id == "add":
			tools.actionAddSkill(body.actions[0].value, body.user.id);
			res.send(200,"ok");
			break;
	}
});

server.listen(process.env.PORT || 4390, function() {
	console.log('%s listening at %s', server.name, server.url);
});