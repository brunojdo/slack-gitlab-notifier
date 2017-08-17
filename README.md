# Gitlab-Slack Notifier

This project aims to integrate Gitlab with Slack teams through webhooks. To do so, we created a service in NodeJS that handle the hooks to Slack channels and also direct messages to slack users.

So far, we integrated *Push Hooks* and *Merge Request Hooks*.

**IMPORTANT:** If you want to notify the slack users through DM, they must have the same username in Gitlab and Slack.
##### Ex: Slack username: @brunojdo and Gitlab username: brunojdo


### Dependencies

* NodeJS 8.3
* Express 4.10.*

See others dependencies [here](https://github.com/brunojdo/slack-gitlab-notifier/blob/master/app/package.json).

## Usage

There is two ways to start the service that we describe on follow sections.

### Docker Image

[![](https://images.microbadger.com/badges/image/brunodias20/slack-gitlab-notifier.svg)](https://microbadger.com/images/brunodias20/slack-gitlab-notifier "Get your own image badge on microbadger.com") [![](https://images.microbadger.com/badges/version/brunodias20/slack-gitlab-notifier.svg)](https://microbadger.com/images/brunodias20/slack-gitlab-notifier "Get your own version badge on microbadger.com")

You can start the service using a docker container. Execute the command below: 

`docker run -d --restart=always -p 8080:8080 -e SLACK_TOKEN=your-bot-token --name notifier-slgb brunodias20/slack-gitlab-notifier:latest`

**Environment Setup** 

You **must** pass the token of slack bot trough environment variable `SLACK_TOKEN`. 

You also can pass an env `SERVICE_PORT` that will set a port of the service inside the container *(optional)*. 

In addition, you can simply configure your own `config.yml` and bind as a volume with your container. For example: 

`docker run -d --restart=always -p 8080:8080 --name notifier-slgb -v ~/config.yml:/opt/app/config.yml brunodias20/slack-gitlab-notifier:latest`

**ATTENTION:** You must bind your `config.yml` correctly. The path of `config.yml` inside the container is `/opt/app/config.yml`. [See](https://github.com/brunojdo/slack-gitlab-notifier#file-configyml) more information about `config.yml`

### Docker Store

This project is also available on Docker Store, check out [here](https://store.docker.com/community/images/brunodias20/slack-gitlab-notifier)! 

### NPM 

If you prefer, you may also clone this project and run `npm`. On the `./app` folder you can execute:

`npm run build && npm run serve`

## Setup

### Enable Webhooks

In your Gitlab project select **Settings -> Integrations** and put your service address. For example, on: `http://localhost:8080/webhook` select which hooks you want use. For more information [click here.](https://docs.gitlab.com/ce/user/project/integrations/webhooks.html)

### Create a SlackBot

To create a slackbot [click here](https://my.slack.com/services/new/bot). If you are in doubt visit: https://api.slack.com/bot-users

### File `config.yml`

This [file](https://github.com/brunojdo/slack-gitlab-notifier/blob/master/app/config.yml) has several configuration options, such as: 

| Parameter	| Description | Required |
| :------- | :------ | :------ |
| system.name | *Name to display when accessing the root address* | `true` |
| system.port | *Service port* (Default: `8080`) | `false` |
| lang_selector | *Language to use for notifications* | `true` |
| slack.bot.name | *Bot Name* | `true` |
| slack.bot.token | *Bot Token* | `true` |
| slack.bot.icon | *Image for the bot avatar* | `false` |
| slack.push_channel | *Slack channel where Push Event notifications will be posted* | `true` |
| slack.mr_channel | *Slack channel where MR Event notifications will be posted* | `true` |
| slack.clrPush | *Color of push messages* | `false` |
| slack.clrOpen | *Color of opened MR messages* | `false` |
| slack.clrUpdate | *Color of updated MR messages* | `false` |
| slack.clrMerge | *Color of merged MR messages* | `false` |
| slack.clrNotAssigned | *Color when MR has no selected Assignee* | `false` |
| gitlab.events | *List of all Hooks accepted by service*  | `true` |


## Language options

This project has **two** languages defined to send slack notifications: 

* English (`lang/en_US.yml`)
* Brazilian Portuguese (`lang/pt_BR.yml`)

**Select a language**

Just change the `lang_selector` parameter inside `config.yml` file to your preferred language. 

You can also contribute with the project by translating it to your language and submitting a PR to us!


## Troubleshooting 

You can check if others are experiencing similar issues [here](https://github.com/brunojdo/slack-gitlab-notifier/issues/new). Also feel free to open [issues](https://github.com/brunojdo/slack-gitlab-notifier/issues/new).

## Contributing

You can contribute to our project!! To do this, see our **list of issues** and make a [PR](https://github.com/brunojdo/slack-gitlab-notifier/pulls)! :heart:

## Acknowledgement

We would like to thank the projects [SlackBots.js](https://github.com/mishk0/slack-bot-api) and [Gitlab-Handler-Webhooks](https://github.com/Yuliang-Lee/gitlab-webhook-handler) for the awesome libraries to work with Slack API and Gitlab Webhooks Events. Thank you, guys!
