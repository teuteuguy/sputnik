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

echo "Copying addons folder accross (cp -R $1/addons $2)"
cp -R $1/addons $2

echo
echo "------------------------------------------------------------------------------"
echo
exit 0
