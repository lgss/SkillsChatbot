require('dotenv').config();
const SDB = process.env.SKILLSDATABASE
var request = require('request');
var rp = require('request-promise');

function addSkill(event, client) {
	var skill = event.text.replace('add skill:', '').trim();
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
			var obj = skills[i];

			skillsArray.push(obj);
		}
		client.sendMessage(`${skillsArray}`,event.channel);
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

	rp(`${SDB}/skillbyname/` + event.text.replace('I have learned', '').trim()).then(function (getSkillBody) {
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

module.exports= {
    addSkill:           addSkill,
    getSkills:          getSkills,
    getSkillsOfUser:    getSkillsOfUser,
    addUser:            addUser,
    addUserSkill:       addUserSkill,
    test:               test,
    help:               help
};
