require('dotenv').config();
const SDB = process.env.SKILLSDATABASE
var request = require('request');
var rp = require('request-promise');
//var async = require("async");

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
				skillsArray.push(" " + obj.name);
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

			skillsArray.push(" " + obj);
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
			slackId: event.user
		},
		json: true
	};
	rp(options).then(function (body) {
		client.sendMessage('user added', event.channel);
	}).catch((err)=> {
		client.sendMessage(err.error.error, event.channel);
	})
}

function addUserSkill(event, client, web) {

	rp(`${SDB}/skillbyname/` + event.text.replace(`<@${client.activeUserId}> I have learned`, '').trim())
	.then(function (getSkillBody) {
		skillBody = JSON.parse(getSkillBody);
		if (skillBody.skill === null) {
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
	}).catch(err => {
		if (err.statusCode == 404) {
			//client.sendMessage('This skill does not exist please add it seperately', event.channel);
			rp(`${SDB}/searchskill/` + event.text.replace(`<@${client.activeUserId}> I have learned`, '').trim())
			.then(function(searchSkillBody){
				const skills = JSON.parse(searchSkillBody);
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

				blockSkillsForDelete.push({
						"type": "section",
						"text": {
							"type": "mrkdwn",
							"text": "*We couldn't find a skill with that name so maybe try and add one of these?*"
						}
					});

				for(var x = 0; x < skillsArray.length; x++){
					blockSkillsForDelete.push(	{
						"type": "divider"
					},
					{
						"type": "section",
						"text": {
							"type": "mrkdwn",
							"text": skillsArray[x].name
						},
						"accessory": {
							"type": "button",
							"text": {
								"type": "plain_text",
								"text": "Add this skill",
								"emoji": true
							},
							"action_id":"add",
							"value": skillsArray[x]._id
						}
					});
				}
				web.chat.postMessage({callback_id:"add_skill", blocks:blockSkillsForDelete,channel: event.channel});
			}).catch((err) => {
				console.log(err);
			});
			return;
		}
		throw(err);
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
    try {
		const result = await web.chat.postMessage({
			blocks: [
				{
					"type": "divider"
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": "To add a new skill enter - @Skillbot add skill: {skill}",
						"emoji": true
					}
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": "To add yourself enter - @Skillbot add me",
						"emoji": true
					}
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": "To add a new skill to yourself enter - @Skillbot I have learned {skill}. The skill needs to already be added before you can learn it",
						"emoji": true
					}
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": "To find out who knows a skill enter - @Skillbot who knows {skill}.",
						"emoji": true
					}
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": "To find out what somebody else knows enter - @Skillbot what does @person know.",
						"emoji": true
					}
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": "To find out what you know enter - @Skillbot list my skills",
						"emoji": true
					}
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": "To delete a skill enter - @Skillbot delete",
						"emoji": true
					}
				},
				{
					"type": "divider"
				},
				{
					"type": "section",
					"text": {
						"type": "plain_text",
						"text": "To add list all skills enter - @Skillbot list all skills",
						"emoji": true
					}
				},
				{
					"type": "divider"
				}
			],
			channel: event.channel,
		});
	} catch (error) {
		console.log('An error occurred', error);
	}
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
					"value": skillsArray[x].skillId,
					"action_id":"delete"
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

	}).catch(err => {
		console.log(err);
	});
}

function actionAddSkill(skillId,slackId){
	var options = {
		method: 'POST',
		uri: `${SDB}/uzerskill`,
		body: {
			slackId: slackId,
			skillId: skillId
		},
		json: true
	};
	rp(options).then(function(body){

	}).catch(err => {
		console.log(err);
	});
}

function getUsersBySkill(event, client){
	rp(`${SDB}/skillbyname/${event.text.replace(`<@${client.activeUserId}> who knows`, '').trim()}`).then(function(getSkillBody){
		var skillBody = JSON.parse(getSkillBody);
		if (skillBody.skill === null) {
			return client.sendMessage('This skill doesnt exist', event.channel);
			
		}
		rp(`${SDB}/getusersbyskill/` + skillBody.skill._id).then(function(usersBody){
			var users = JSON.parse(usersBody);
			var userArray=[];
			for (let i = 0; i < users.length; i++) {
				userArray.push(`<@${users[i]}>`);
			}
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
	getUsersBySkill:	getUsersBySkill,
	actionAddSkill:		actionAddSkill
};
