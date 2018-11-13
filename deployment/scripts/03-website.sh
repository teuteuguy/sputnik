#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir, the website dir name and the manifest generator path"
    echo "For example: ./00-cleanup.sh ../source ./dist console ./manifest-generator"
    exit 1
fi

set -e

echo "03-website.sh-----------------------------------------------------------------"
echo "[Rebuild] console"
echo "------------------------------------------------------------------------------"
# build and copy console distribution files
cd $1/console
rm -rf ./dist
yarn install
yarn run build
# npm install --production
# npm run build
cp -r ./dist/** $2/console
echo "[Custom building] Deleting appVariables.js"
rm $2/console/assets/appVariables.js


# TODO see if something needs to be done here, or can be removed by reworking the helper service to not need the manifest ?
# echo "------------------------------------------------------------------------------"
# echo "[Manifest] Generating console manifest"
# echo "------------------------------------------------------------------------------"

# cd $4
# yarn install
# node app.js --target $2/$3 --output $2/site-manifest.json

echo
exit 0
