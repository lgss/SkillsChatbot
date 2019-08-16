require('dotenv').config();
const SLACKTOKEN = process.env.SLACKTOKEN;
const slackbot = require('slackbots');
const restify = require('restify');
var request = require('request');
var rp = require('request-promise');

const bot = new slackbot({
	//token:'xoxb-492283298757-560422684000-rHtbsYu12uBmzFPJJdh3V92C',
	token:SLACKTOKEN,
	name:process.env.SLACKNAME ? process.env.SLACKNAME : 'skillbot'
});


bot.on('start', () => {
	const params = {
		icon_emoji: ':flag-england:'
	}

	bot.postMessageToChannel('general', 'bot on', params);
});

bot.on('error', (err) => console.log(err));

bot.on('message', (data) => {
	if(data.type !== 'message'){
		return
	}
	if(data.bot_id) return;      //Ignore bots
	handleMessage(data);
});

function handleMessage(data){
	var message = data.text;
	if(message.includes('add skill:')){
		addskill(message);
	} else if(message.includes('list my skills')) {
		getUserSkills(data.user);
	} else if(message.includes('list all skills')){
		listSkills();
	} else if(message.includes('add me')){
		addUser(data);
	} else if(message.includes('I have learned ')){
		addUserSkill(data)
	} else if(message.includes('help')){
		bot.postMessageToChannel('general', 'soz no can do');
	} else if(message.includes('what skills does')){
		getUserSkills(message.replace('what skills does','').trim().substr(2,9));
	}
}

function addskill(data){
	var skill = data.replace('add skill:','').trim();
	var options = {
		method: 'POST',
		uri: 'https://igotskillz.herokuapp.com/skill',
		body: {
			name: skill
		},
		json: true
	};
	rp(options).then(function(body){
		bot.postMessageToChannel('general', 'skill added');
	});
}

function listSkills(){
	rp('https://igotskillz.herokuapp.com/allskillz')
	.then(function(body){
		const skills = JSON.parse(body);
		const skillsArray = [];

		for (var i = 0; i < skills.length; i++){
			var obj = skills[i];
			skillsArray.push(obj.name);
		}

		bot.postMessageToChannel('general', `${skillsArray}`);
	});
}

function addUser(data){
	var options = {
		method: 'POST',
		uri: 'https://igotskillz.herokuapp.com/uzer',
		body: {
			slackId: data.user,
			name: data.user
		},
		json: true
	};
	rp(options).then(function(body){
		bot.postMessageToChannel('general', 'user added');
	})
}

function addUserSkill(data){

	rp('https://igotskillz.herokuapp.com/skillbyname/' + data.text.replace('I have learned','').trim()).then(function(getSkillBody){
		skillBody = JSON.parse(getSkillBody);
		if(skillBody.skill === null){
			bot.postMessageToChannel('general', 'This skill does not exist please add it seperately');
			return;
		}
		var options = {
			method: 'POST',
			uri: 'https://igotskillz.herokuapp.com/uzerskill',
			body: {
				slackId: data.user,
				skillId: skillBody.skill._id
			},
			json: true
		};
		rp(options).then(function(body){
			bot.postMessageToChannel('general', 'You have learned a new skill');
		})
	})
}

function getUserSkills(user){
	rp('https://igotskillz.herokuapp.com/skillsbyuzer/' + user).then(function(getUserSkillBody){
		const skills = JSON.parse(getUserSkillBody);
		const skillsArray = [];

		for (var i = 0; i < skills.length; i++){
			var obj = skills[i];

			skillsArray.push(obj);
		}
		bot.postMessageToChannel('general', `${skillsArray}`);
	})
}