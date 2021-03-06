import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';

const SlackBot = require('slackbots');

const conf = yaml.load(fs.readFileSync('config.yml'));
const lang = yaml.load(fs.readFileSync(conf.lang_selector));

module.exports = {
    /**
     * Build a push message to send on slack channel
     * @param {Event obj of Gitlab webhook} event 
     */
    pushMessage: function (event) {
        let titleMessage = "*" + event.user_name + lang.m_push +
            event.repository.name + lang.m_branch +
            event.ref + "`";
        let commitText = '';
        // Catch all commits
        event.commits.forEach(function(commit){
            commitText += commit.message.replace(/\n/g, ' ') + " - " + commit.author.name + "\n";
        });
        /** More information about additional params: https://api.slack.com/methods/chat.postMessage */ 
        let slackParams = { 
            icon_emoji: conf.slack.bot.icon,
            attachments: [{
                color: conf.slack.clrPush,
                title: event.total_commits_count + lang.m_commit,
                text: commitText
            }]
        };
        // When a branch is created or removed will not be send message
        if (event.total_commits_count) {
            sendChannelMessage(conf.slack.push_channel, titleMessage, slackParams);
        }
    },
    /**
     * Build a merge request message to send on slack channel and DM to assignee
     * @param {Event obj of Gitlab webhook} event
     * @return {when assignee is not defined will send a message to submitter}
     */
    mergeRequestMessage: function(event) {
        // Assignee must be defined
        if (!event.assignee) {
            let message = lang.no_assignee;
            let slackParams = {
                icon_emoji: conf.slack.bot.icon,                
                attachments: [{
                    color: conf.slack.clrNotAssigned,
                    title: event.object_attributes.title,
                    title_link: event.object_attributes.url
                }]
            };
            sendDMMessage(event.user.username, message, slackParams);
            return;
        }
        let partMessage = buildMessageByAction(event.object_attributes.action, event.user.name);
        let titleMessage = lang.m_merge + event.repository.name + '`' + partMessage.mType;
        let slackParams = { 
            icon_emoji: conf.slack.bot.icon,            
            attachments: [{
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
            }]
        };
        sendChannelMessage(conf.slack.mr_channel, titleMessage, slackParams);
        sendDMMessage(event.assignee.username, titleMessage, slackParams);
    },

    /**
     * Send a Merge Request update warning to a specific user informing their list of MR's
     * with either merge conflict problems or broken pipelines.
     * @param MRList List of MR's links with problems.
     * @param user User receiving the update warning.
     */
    mergeRequestUpdateMessage: function(MRList, user) {
        let titleMessage = lang.title_merge_warning;
        let slackParams = {
            icon_emoji: conf.slack.bot.icon,
            attachments: [{
                color: conf.slack.clrWarning,
                title: lang.msg_merge_warning,
                fields: _.map(MRList, MR => ({value : MR}))
            }]
        };
        sendDMMessage(user, titleMessage, slackParams);
    }
};

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
    }
}

/**
 * Create a Singleton bot that open a RTM connection with Slack Service
 * @return {object - Slack session object} 
 */
const Bot = (function () {
    let object;
    return {
        getInstance: function () {
            if (!object) {
                object = new SlackBot({
                    name: conf.slack.bot.name,
                    token: conf.slack.bot.token
                });
            }
            return object;
        }
    };
})();

/**
 * Notify a slack channel.
 * 
 * @param {Message to be send to slack} message 
 * @param {Another parameters to send on the message} params 
 */
function sendChannelMessage(ch, message, params) {
    const bot = Bot.getInstance();
    console.log("Send message to: " + ch);
    bot.postMessageToChannel(ch, message, params).fail(function(data){
        console.err(data);
    });
}

/**
 * Notify a slack user.
 * 
 * @param {who receive the DM} user 
 * @param {Message to be send to slack} message 
 * @param {Another parameters to send on the message} params 
 */
function sendDMMessage(user, message, params) {
    const bot = Bot.getInstance();
    console.log("Send message to: " + user);
    bot.postMessageToUser(user, message, params).fail(function(data){
        console.err(data);
    });
}