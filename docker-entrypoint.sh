#!/bin/bash
#
#####################################################
# Initialize the Notifier Server                    #
#                                                   #
# Author: Bruno Dias                                #
#####################################################

cd /opt/app

# Install dependencies
yarn && yarn cache clean

# Set a port 
sed -i 's/port: "/&'$SERVICE_PORT'/' config.yml
# If defined, Set a Slack token
if [ ! -z "$SLACK_TOKEN" ]; then
    sed -i 's/token: /&'$SLACK_TOKEN'/' config.yml
fi

# Build & Start service
npm run build && npm run serve