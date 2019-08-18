const tools = require('./tools.js')

function handleMessage(event, rtm, web) {
	var message = event.text;
	switch (true) {
		default: break;
		case message.includes('add skill'):
			tools.addSkill(event, rtm);
			break;
		case message.includes('list my skills'):
			tools.getSkillsOfUser(event, rtm, event.user);
			break;
		case message.includes('list all skills'):
			tools.getSkills(event, rtm);
			break;
		case message.includes('add me'):
			tools.addUser(event, rtm);
			break;
		case message.includes('I have learned '):
			tools.addUserSkill(event, rtm)
			break;
		case message.includes('help'):
			tools.help(event, rtm, web)
			break;
		case message.includes('what skills does'):
			tools.getSkillsOfUser(event, rtm, message.replace('what skills does', '').trim().substr(2, 9));
			break;
		case message.includes('test'):
			tools.testHandler(event, rtm, web);
			break;
	}
}

function handleReactionAdded(event, rtm, web) {
	console.log(`${event.user} reacted to something`);
}

function handleError(err, rtm, web) {
	console.log('An error has occurred', err);
}

module.exports = {
	message: 		handleMessage,
	reaction_added:	handleReactionAdded,
	error: 			handleError
};