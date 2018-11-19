#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir"
    echo "For example: ./05-greengrass-lambdas.sh ../source ./dist"
    exit 1
fi

set -e

echo "mkdir -p $1/greengrass"
mkdir -p $2/greengrass


echo "05-greengrass-lambdas.sh--------------------------------------------------------------------------------"
echo
echo "[Build] Solution - mini-connected-factory - mini-connected-factory-camera-python"
echo
cd $1/solutions/mini-connected-factory/lambdas/mini-connected-factory-camera-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - mini-connected-factory - mini-connected-factory-belt-serial-python"
echo
cd $1/solutions/mini-connected-factory/lambdas/mini-connected-factory-belt-serial-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - mini-connected-factory - mini-connected-factory-belt-serial-node"
echo
cd $1/solutions/mini-connected-factory/lambdas/mini-connected-factory-belt-serial-node
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/greengrass/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Solution - mini-connected-factory - mini-connected-factory-python"
echo
cd $1/solutions/mini-connected-factory/lambdas/mini-connected-factory-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - defaults - image-capture-python"
echo
cd $1/solutions/defaults/lambdas/image-capture-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - defaults - demo-squeezenet-python"
echo
cd $1/solutions/defaults/lambdas/demo-squeezenet-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "--------------------------------------------------------------------------------------------------------"
echo
exit 0
