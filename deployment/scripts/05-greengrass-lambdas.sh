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
echo "[Build] Solution - defaults - gg-ml-demo-squeezenet-python"
echo
cd $1/solutions/defaults/lambdas/gg-ml-demo-squeezenet-python
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
echo "[Build] Solution - reinvent-2018-mcf - reinvent-2018-mcf-belt-serial-python"
echo
cd $1/solutions/reinvent-2018-mcf/lambdas/reinvent-2018-mcf-belt-serial-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - reinvent-2018-mcf - reinvent-2018-mcf-python"
echo
cd $1/solutions/reinvent-2018-mcf/lambdas/reinvent-2018-mcf-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Solution - ebc-mcf-2018 - ebc-mcf-2018-python"
echo
cd $1/solutions/reinvent-2018-mcf/lambdas/ebc-mcf-2018-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/greengrass/`echo ${PWD##*/}`.zip .

echo
echo "--------------------------------------------------------------------------------------------------------"
echo
exit 0
