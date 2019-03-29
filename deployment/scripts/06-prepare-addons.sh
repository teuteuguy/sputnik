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

rsync -a --exclude=views --exclude=libs --exclude=dist --exclude=lambdas $1/addons/* $2/addons

echo "[SAMPLES]"
mkdir $2/addons/samples/lambdas

echo
echo "[Build] Samples - rpi-sense-hat-display-ip-python"
echo
cd $1/addons/samples/lambdas/rpi-sense-hat-display-ip-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/addons/samples/lambdas/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Samples - rpi-sense-hat-demo-python"
echo
cd $1/addons/samples/lambdas/rpi-sense-hat-demo-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/addons/samples/lambdas/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Samples - image-capture-python"
echo
cd $1/addons/samples/lambdas/image-capture-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/addons/samples/lambdas/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Samples - gg-ml-demo-squeezenet-python"
echo
cd $1/addons/samples/lambdas/gg-ml-demo-squeezenet-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/addons/samples/lambdas/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Samples - ml-inference-camera-python"
echo
cd $1/addons/samples/lambdas/ml-inference-camera-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/addons/samples/lambdas/`echo ${PWD##*/}`.zip .

echo
echo "[Build] Samples - model-trainer-python"
echo
cd $1/addons/samples/lambdas/model-trainer-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/addons/samples/lambdas/`echo ${PWD##*/}`.zip .


echo "[MURATA]"
mkdir $2/addons/murata/lambdas

echo
echo "[Build] Murata addon lambda functions"
cd $1/addons/murata/lambdas/murata-vibration-sensor-gateway-main-lambda-python
pip install -r requirements.txt -t . --upgrade
zip -rq $2/addons/murata/lambdas/`echo ${PWD##*/}`.zip .

echo
echo "------------------------------------------------------------------------------"
echo
exit 0
