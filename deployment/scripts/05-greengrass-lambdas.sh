#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir"
    echo "For example: ./05-greengrass-lambdas.sh ../source ./dist"
    exit 1
fi

set -e

echo "Removing the solution lambda function code"
find $2/cf/solutions -type d -name lambdas -prune -exec rm -v -rf {} \;

echo "mkdir -p $1/greengrass"
mkdir -p $2/greengrass


echo "04-services-lambda.sh---------------------------------------------------------"
echo "[Build] Solution - aws-mini-connected-factory-v1.0"
echo "------------------------------------------------------------------------------"
cd $1/cf/solutions/aws-mini-connected-factory-v1.0/lambdas/aws-mini-connected-factory-camera-python
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
exit 0
