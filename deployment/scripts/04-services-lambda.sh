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
echo "------------------------------------------------------------------------------"
cd $1/services/factoryreset
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo "------------------------------------------------------------------------------"
echo "[Build] Services - Devices"
echo "------------------------------------------------------------------------------"
cd $1/services/devices
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo "------------------------------------------------------------------------------"
echo "[Build] Services - Thing Auto Registration"
echo "------------------------------------------------------------------------------"
cd $1/services/thing-auto-registration
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo "------------------------------------------------------------------------------"
echo "[Build] Services - Settings"
echo "------------------------------------------------------------------------------"
cd $1/services/settings
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo "------------------------------------------------------------------------------"
echo "[Build] Services - Stats"
echo "------------------------------------------------------------------------------"
cd $1/services/stats
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo "------------------------------------------------------------------------------"
echo "[Build] Services - Deployments"
echo "------------------------------------------------------------------------------"
cd $1/services/deployments
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip


# echo "[Rebuild] Services - Admin"
# echo "------------------------------------------------------------------------------"
# cd $1/services/admin
# yarn run build
# cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

# echo "------------------------------------------------------------------------------"
# echo "[Rebuild] Services - Device"
# echo "------------------------------------------------------------------------------"
# cd $1/services/device
# yarn run build
# cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

# echo "------------------------------------------------------------------------------"
# echo "[Rebuild] Service - GGBlueprint"
# echo "------------------------------------------------------------------------------"
# cd $1/services/ggblueprint
# yarn run build
# cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

# echo "------------------------------------------------------------------------------"
# echo "[Rebuild] Service - Provisioning"
# echo "------------------------------------------------------------------------------"
# cd $1/services/provisioning
# yarn run build
# cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
exit 0
