import * as http from 'http';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as slackbot from './slackNotify.js';

// Load config.yml with slack and gitlab configuration
var conf = yaml.load(fs.readFileSync('config.yml'));

/**
 * Create a server to handle Gitlab webhooks
 */
var createServer = require('gitlab-webhook-handler2')
var webhookHandler = createServer({ path: '/webhook', events: conf.gitlab.events})
http.createServer(function (req, res) {
  webhookHandler(req, res, function (err) {
   res.statusCode = 200
   res.end(conf.system.name)
  })
}).listen(conf.system.port || 8080);

webhookHandler.on('error', function (err) {
  console.error('Error:', err.message)
});

/**
 * Receive a Push Hook event and call the Slackbot
 */ 
webhookHandler.on('Push Hook', function (event) {
  slackbot.pushMessage(event.payload);
});

/**
 * Receive a Merge Request Hook event and call the Slackbot
 */ 
webhookHandler.on('Merge Request Hook', function (event) {
  slackbot.mergeRequestMessage(event.payload);
});
