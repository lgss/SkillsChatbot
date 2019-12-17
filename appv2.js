var restify = require('restify');
const tools = require('./tools.js');

var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.post('/receivemessage',function(req, res, next){
	var body = JSON.parse(req.body.payload)
	tools.deleteSkill(body.actions[0].value, body.user.id);
	res.send(200,"ok");
});

server.listen(process.env.PORT || 4390, function() {
	console.log('%s listening at %s', server.name, server.url);
});