#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir"
    echo "For example: ./04-services-lambda.sh ../source ./dist"
    exit 1
fi

set -e

echo "04-services-lambda.sh---------------------------------------------------------"
echo "[Build] Services - Factory Reset"
echo "mkdir -p $2/lambda"
mkdir -p $2/lambda
echo
cd $1/services/factoryreset
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Services - Admin"
echo
cd $1/services/admin
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Services - Devices"
echo
cd $1/services/devices
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Services - Thing Auto Registration"
echo
cd $1/services/thing-auto-registration
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Services - Settings"
echo
cd $1/services/settings
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Services - Deployments"
echo
cd $1/services/deployments
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Services - Solutions"
echo
cd $1/services/solutions
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Services - Cert Deletor"
echo
cd $1/services/cert-deletor
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip


echo
echo "------------------------------------------------------------------------------"
echo
exit 0
