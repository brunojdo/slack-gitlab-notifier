# Gitlab-Slack Notifier

This project aims to integrate Gitlab with Slack teams through webhooks. To do so, we created a service in NodeJS that handle the hooks to Slack channels and also direct messages to slack users.

So far, we integrated *Push Hooks* and *Merge Request Hooks*.

**IMPORTANT:** If you want to notify the slack users through DM, they must have the same username in Gitlab and Slack.
##### Ex: Slack username: @brunojdo and Gitlab username: brunojdo

### Specs

* NodeJS 8.3
* Express 4.10.*

## Usage

### Docker

You can start the service using a docker container. Execute the command below: 

`docker run -d --restart=always -p 8008:8080 --name notifier-slgb brunodias20/slack-gitlab-notifier:{version}`

### NPM 

If you prefer, you may also clone this project and run `npm`. On the `./app` folder you can execute:

`npm run build && npm run serve`

## Setup

### Enable Webhooks

In your Gitlab project select **Settings -> Integrations** and put your service address. For example, on: `http://localhost:8008/webhook` select which hooks you want use. For more informations [click here.](https://docs.gitlab.com/ce/user/project/integrations/webhooks.html)

### Create a SlackBot

To create a slackbot [click here](https://my.slack.com/services/new/bot). If you are in doubt visit: https://api.slack.com/bot-users

### File `config.yml`

This file has several configurations options, such as: 

| Parameter	| Description | Required |
| :------- | :------ | :------ |
| system.name | *Name that appear when access the root address* | `true` |
| system.port | *Service port* (Default: `8080`) | `false` |
| lang_selector | *Language defined to notifications* | `true` |
| slack.bot.name | *Bot Name* | `true` |
| slack.bot.token | *Bot Token* | `true` |
| slack.bot.icon | *Image that will appears at the bot avatar* | `false` |
| slack.push_channel | *Slack Channel that service will notify the Push Events* | `true` |
| slack.mr_channel | *Slack Channel that service will notify the MR Events* | `true` |
| slack.clrPush | *Color to push messages* | `false` |
| slack.clrOpen | *Color to opened MR messages* | `false` |
| slack.clrUpdate | *Color to updated MR messages* | `false` |
| slack.clrMerge | *Color to merged MR messages* | `false` |
| slack.clrNotAssigned | *Color when MR has no selected Assignee* | `false` |
| gitlab.events | *List of all Hooks accepted to the service*  | `true` |


## Language options

This project has **two** languages defined to send slack notifications: 

* English (`lang/en_US.yml`)
* Brazilian Portuguese (`lang/pt_BR.yml`)

**How to choose language**

Just change the `lang_selector` parameter into `config.yml` file to the language that you prefer. 

You can also contribute with the project by translating it to your language and submitting a PR to us!

## Contributing

Feel free to open [issues](https://github.com/brunojdo/slack-gitlab-notifier/issues/new) and make [PR](https://github.com/brunojdo/slack-gitlab-notifier/pulls) to the project! :heart: 

## Acknowledgement

We would like to thank the projects [SlackBots.js](https://github.com/mishk0/slack-bot-api) and [Gitlab-Handler-Webhooks](https://github.com/Yuliang-Lee/gitlab-webhook-handler) for the awesome libraries to work with Slack API and Gitlab Webhooks Events. Thank you, guys!