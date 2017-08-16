import * as fs from 'fs';
import * as yaml from 'js-yaml';
var SlackBot = require('slackbots');

var conf = yaml.load(fs.readFileSync('config.yml'));
var lang = yaml.load(fs.readFileSync(conf.lang_selector))

module.exports = {
    /**
     * Build a push message to send on slack channel
     * @param {Event obj of Gitlab webhook} event 
     */
    pushMessage: function (event) {
        let titleMessage = "*" + event.user_name + lang.m_push +
            event.repository.name + lang.m_branch +
            event.ref + "`";
        let commitText = ''
        // Catch all commits
        event.commits.forEach(function(commit){
            commitText += commit.message.replace(/\n/g, ' ') + " - " + commit.author.name + "\n";
        });
        slackParams.attachments = [
            {
                color: conf.slack.clrPush,
                title: event.total_commits_count + lang.m_commit,
                text: commitText
            }
        ];
        // When a branch is created or removed will not be send message
        if (event.total_commits_count) {
            sendChannelMessage(conf.slack.push_channel, titleMessage, slackParams);
        };
    },
    /**
     * Build a merge request message to send on slack channel and DM to assignee
     * @param {Event obj of Gitlab webhook} event
     * @return {when assignee is not defined will send a message to submitter}
     */
    mergeRequestMessage: function(event) {
        // Assignee must be defined
        if (!event.assignee) {
            let message = lang.no_assignee
            slackParams.attachments = [{
                color: conf.slack.clrNotAssigned,
                title: event.object_attributes.title,
                title_link: event.object_attributes.url
            }];
            sendDMMessage(event.user.username, message, slackParams);
            return;
        };
        let partMessage = buildMessageByAction(event.object_attributes.action, event.user.name);
        let titleMessage = lang.m_merge + event.repository.name + partMessage.mType + '`'
        slackParams.attachments = [{
            color: partMessage.mrColor,
            title: event.object_attributes.title,
            title_link: event.object_attributes.url,
            fields: [{
                title: lang.send_by,
                value: event.user.name,
                short: true
            },
            {
                title: lang.send_to,
                value: event.assignee.name,
                short: true
            },
            {
                title: "Target Branch",
                value: event.object_attributes.target_branch,
                short: true          
            },
            {
                title: "Source Branch",
                value: event.object_attributes.source_branch,
                short: true
            }]
        }];
        sendChannelMessage(conf.slack.mr_channel, titleMessage, slackParams);
        sendDMMessage(event.assignee.username, titleMessage, slackParams);
    }
}

/**
 * Build part of notification message based on action type of the event.
 * @param {Merge Request Hook action type} action 
 * @param {Who activated the hook} submitter
 * @return {Obj with a message part and color of attachment}
 */
function buildMessageByAction(action, submitter){ 
    if (action.includes("open")) {
        return {mType: lang.opened_by + submitter, mrColor: conf.slack.clrOpen};
    } else if (action.includes("update")) {
        return {mType: lang.updated_by + submitter, mrColor: conf.slack.clrUpdate};
    } else if (action.includes("merge")) {
        return {mType: lang.merged_by + submitter, mrColor: conf.slack.clrMerge};
    };
}

/**
 * Parameters to attach on slack message
 * more information about additional params: https://api.slack.com/methods/chat.postMessage
 */ 
var slackParams = {
    icon_emoji: conf.slack.bot.icon,
};

/**
 * Notify a slack channel.
 * 
 * @param {Message to be send to slack} message 
 * @param {Another parameters to send on the message} params 
 */
function sendChannelMessage(ch, message, params) {
    // Create a bot - To add a bot https://my.slack.com/services/new/bot
    var bot = new SlackBot({
        name: conf.slack.bot.name,
        token: conf.slack.bot.token
    });
    bot.on('start', function() {
        console.log("Send message to: " + ch)
        bot.postMessageToChannel(ch, message, params).fail(function(data){
            console.err(data);
        });
    });
};

/**
 * Notify a slack user.
 * 
 * @param {who receive the DM} user 
 * @param {Message to be send to slack} message 
 * @param {Another parameters to send on the message} params 
 */
function sendDMMessage(user, message, params) {
    // Create a bot - To add a bot https://my.slack.com/services/new/bot
    var bot = new SlackBot({ 
        name: conf.slack.bot.name,        
        token: conf.slack.bot.token
    });
    bot.on('start', function(){
        console.log("Send message to: " + user)    
        bot.postMessageToUser(user, message, params).fail(function(data){
            console.err(data);
        });
    });
};