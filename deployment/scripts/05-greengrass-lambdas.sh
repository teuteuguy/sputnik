#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir"
    echo "For example: ./05-greengrass-lambdas.sh ../source ./dist"
    exit 1
fi

set -e

rm -rf $2/greengrass
echo "mkdir -p $1/greengrass"
mkdir -p $2/greengrass


echo "05-greengrass-lambdas.sh--------------------------------------------------------------------------------"
echo
echo "[Build] Solution - defaults - rpi-sense-hat-display-ip-python"
echo
cd $1/solutions/defaults/lambdas/rpi-sense-hat-display-ip-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - defaults - rpi-sense-hat-demo-python"
echo
cd $1/solutions/defaults/lambdas/rpi-sense-hat-demo-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - defaults - image-capture-python"
echo
cd $1/solutions/defaults/lambdas/image-capture-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - defaults - demo-squeezenet-python"
echo
cd $1/solutions/defaults/lambdas/demo-squeezenet-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - default - ml-inference-camera-python"
echo
cd $1/solutions/defaults/lambdas/ml-inference-camera-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - defaults - model-trainer-python"
echo
cd $1/solutions/defaults/lambdas/model-trainer-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - mini-connected-factory - mini-connected-factory-belt-serial-python"
echo
cd $1/solutions/mini-connected-factory/lambdas/mini-connected-factory-belt-serial-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - mini-connected-factory - mini-connected-factory-python"
echo
cd $1/solutions/mini-connected-factory/lambdas/mini-connected-factory-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "--------------------------------------------------------------------------------------------------------"
echo
exit 0
