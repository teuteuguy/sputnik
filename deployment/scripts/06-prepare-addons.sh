#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir, bucket name, version"
    echo "For example: ./00-prepare-cf.sh ../source ./dist"
    exit 1
fi

set -e

echo "06-prepare-addons.sh--------------------------------------------------------------"
echo "[Packing] Cloud formation template"
echo
echo "Removing old $2/addons dir (rm -rf $2/addons)"
rm -rf $2/addons
echo "Creating addons folder: mkdir -p $2/addons"
mkdir -p $2/addons

echo
echo "[Rebuild] addons"

# build and copy console distribution files
cd $1/addons
rm -rf ./dist
mkdir -p dist
mkdir -p dist/libs

echo "build libs - aws-iot"
cd $1/addons/libs/aws-iot
yarn install
yarn build

cp -R $1/addons/libs/aws-iot/dist/aws-iot $1/addons/dist/libs/aws-iot

echo "Copying the blueprints over"
rsync -a --exclude=views --exclude=libs --exclude=dist $1/addons/* $1/addons/dist

echo "build addons - murata"
cd $1/addons/murata/views/murata-vibration-sensor-network
yarn install
yarn build
cp $1/addons/murata/views/murata-vibration-sensor-network/dist/*.js $1/addons/dist/murata/

# echo "build addons - samples"
# cd $1/addons/samples/views/sample
# yarn install
# yarn build

# rsync -a --exclude=views --exclude=libs --exclude=dist $1/addons/* $1/addons/dist

cp -r $1/addons/dist/* $2/addons

echo
echo "------------------------------------------------------------------------------"
echo
exit 0
