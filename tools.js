require('dotenv').config();
const SDB = process.env.SKILLSDATABASE
var request = require('request');
var rp = require('request-promise');
var async = require("async");

function addSkill(event, client) {
	var skill = event.text.replace(`<@${client.activeUserId}> add skill:`, '').trim();
	var options = {
		method: 'POST',
		uri: `${SDB}/skill`,
		body: {
			name: skill
		},
		json: true
	};
	rp(options).then(function (body) {
		client.sendMessage('skill added', event.channel);
	}).catch(function(err){
		client.sendMessage(err.error.error, event.channel);
	});
}

function getSkills(event,client) {
	rp(`${SDB}/allskillz`)
		.then(function (body) {
			const skills = JSON.parse(body);
			const skillsArray = [];

			if (skills.length == 0) {
				client.sendMessage(`No skills found`, event.channel);
				return;
			}

			for (var i = 0; i < skills.length; i++) {
				var obj = skills[i];
				skillsArray.push(obj.name);
			}

			client.sendMessage(`${skillsArray}`, event.channel);
		})
		.catch((err) => {
			console.log(err)
		});
}

function getSkillsOfUser(event, client, user) {
	rp(`${SDB}/skillsbyuzer/` + user).then(function (getUserSkillBody) {
		const skills = JSON.parse(getUserSkillBody);
		const skillsArray = [];
		if (skills.length == 0) {
			client.sendMessage(`No skills found`, event.channel);
			return;
		}

		for (var i = 0; i < skills.length; i++) {
			var obj = skills[i].skill;

			skillsArray.push(obj);
		}
		client.sendMessage(`${skillsArray}`,event.channel);
	}).catch((err) => {
		console.log(err);
	})
}

function addUser(event, client) {
	var options = {
		method: 'POST',
		uri: `${SDB}/uzer`,
		body: {
			slackId: event.user,
			name: event.user
		},
		json: true
	};
	rp(options).then(function (body) {
		client.sendMessage('user added', event.channel);
	})
}

function addUserSkill(event, client) {

	rp(`${SDB}/skillbyname/` + event.text.replace(`<@${client.activeUserId}> I have learned`, '').trim()).then(function (getSkillBody) {
		skillBody = JSON.parse(getSkillBody);
		if (skillBody.skill === null) {
			client.sendMessage('This skill does not exist please add it seperately', event.channel);
			return;
		}
		var options = {
			method: 'POST',
			uri: `${SDB}/uzerskill`,
			body: {
				slackId: event.user,
				skillId: skillBody.skill._id
			},
			json: true
		};
		rp(options).then(function (body) {
			client.sendMessage('You have learned a new skill', event.channel);
		}).catch(function(err){
			client.sendMessage(err.error.error, event.channel);
		})
	})
}

async function test(event, rtm, web) {
	try {
		const result = await web.chat.postMessage({
			blocks: [
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: ":hand::cop: Stop right there criminal scum!"
					}
				},
				{
					type: "actions",
					elements: [
						{
							type: "button",
							text: {
								type: "plain_text",
								text: ":running::dash:     :police_car:",
								emoji: true
							}
						},
						{
							type: "button",
							text: {
								type: "plain_text",
								text: ":hand::eye::lips::eye::hand:",
								emoji: true
							}
						}
					]
				}
			],
			channel: event.channel,
		});
	} catch (error) {
		console.log('An error occurred', error);
	}
}

async function help(event, rtm, web) {
    rtm.sendMessage('There is no help here, only sadness', event.channel);
}

async function listDeleteSkill(event, client, user, web){
	rp(`${SDB}/skillsbyuzer/` + user).then(function (getUserSkillBody) {
		const skills = JSON.parse(getUserSkillBody);
		const skillsArray = [];
		if (skills.length == 0) {
			client.sendMessage(`No skills found`, event.channel);
			return;
		}

		for (var i = 0; i < skills.length; i++) {
			var obj = skills[i];

			skillsArray.push(obj);
		}
		var blockSkillsForDelete=[];
		for(var x = 0; x < skillsArray.length; x++){
			console.log(x)
			blockSkillsForDelete.push(	{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": skillsArray[x].skill
				},
				"accessory": {
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Delete this skill",
						"emoji": true
					},
					"value": skillsArray[x].skillId
				}
			});
		}
		web.chat.postMessage({callback_id:"test", blocks:blockSkillsForDelete,channel: event.channel});
	}).catch((err) => {
		console.log(err);
	})
}

function deleteSkill(skillId, slackId){
	var options = {
		method: 'POST',
		uri: `${SDB}/removeuzerskill`,
		body: {
			slackId: slackId,
			skillId: skillId
		},
		json: true
	};
	rp(options).then(function (body) {

	})
}

function getUsersBySkill(event, client){
	rp(`${SDB}/skillbyname/html`).then(function(getSkillBody){
		var skillBody = JSON.parse(getSkillBody);
		console.log(skillBody);
		if (skillBody.skill === null) {
			client.sendMessage('This skill doesnt exist', event.channel);
			return;
		}
		rp(`${SDB}/getusersbyskill/` + skillBody.skill._id).then(function(usersBody){
			console.log(usersBody)
			var users = JSON.parse(usersBody);
			var userArray=[];
			for (let i = 0; i < users.length; i++) {
				userArray.push(`<@${users[i]}>`);
			}
			console.log(userArray);
			client.sendMessage(`${userArray}` ,event.channel);
		})
	})
		
}

module.exports= {
    addSkill:           addSkill,
    getSkills:          getSkills,
    getSkillsOfUser:    getSkillsOfUser,
    addUser:            addUser,
    addUserSkill:       addUserSkill,
    test:               test,
	help:               help,
	listDeleteSkill:	listDeleteSkill,
	deleteSkill:		deleteSkill,
	getUsersBySkill:	getUsersBySkill
};
