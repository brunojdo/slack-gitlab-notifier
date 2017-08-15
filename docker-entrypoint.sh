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
# Build & Start service
npm run build && npm run serve 
