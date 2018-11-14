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
echo "[Build] Solution - aws-mini-connected-factory-v1.0 - aws-mini-connected-factory-camera-python"
echo
cd $1/solutions/aws-mini-connected-factory-v1.0/lambdas/aws-mini-connected-factory-camera-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - aws-mini-connected-factory-v1.0 - aws-mini-connected-factory-belt-serial-python"
echo
cd $1/solutions/aws-mini-connected-factory-v1.0/lambdas/aws-mini-connected-factory-belt-serial-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - aws-mini-connected-factory-v1.0 - aws-mini-connected-factory-belt-serial-node"
echo
cd $1/solutions/aws-mini-connected-factory-v1.0/lambdas/aws-mini-connected-factory-belt-serial-node
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/greengrass/`jq -cr '.name' package.json`.zip

echo
echo "[Build] Solution - aws-mini-connected-factory-v1.0 - aws-mini-connected-factory-python"
echo
cd $1/solutions/aws-mini-connected-factory-v1.0/lambdas/aws-mini-connected-factory-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - aws-defaults - aws-deeplens-image-capture-python"
echo
cd $1/solutions/aws-defaults/lambdas/aws-deeplens-image-capture-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "--------------------------------------------------------------------------------------------------------"
echo
exit 0
