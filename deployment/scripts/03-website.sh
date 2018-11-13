#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir, the website dir name and the manifest generator path"
    echo "For example: ./00-cleanup.sh ../source ./dist console ./manifest-generator"
    exit 1
fi

set -e

echo "03-website.sh-----------------------------------------------------------------"
echo "mkdir -p $2/console"
mkdir -p $2/console
echo
echo "[Rebuild] console"
# build and copy console distribution files
cd $1/console
rm -rf ./dist
yarn install
yarn run build
cp -r ./dist/** $2/console
echo "[Custom building] Deleting appVariables.js"
rm $2/console/assets/appVariables.js

echo
echo "------------------------------------------------------------------------------"
echo
exit 0
