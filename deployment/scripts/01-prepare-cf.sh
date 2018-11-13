#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ]; then
    echo "Please provide the source dir, dist dir, bucket name, version"
    echo "For example: ./00-prepare-cf.sh ../source ./dist mythings-mgmt.yml BUCKET v0.1"
    exit 1
fi

set -e

echo "01-prepare-cf.sh--------------------------------------------------------------"
echo "[Packing] Cloud formation template"
echo
echo "Removing old $2/cf dir (rm -rf $2/cf)"
rm -rf $2/cf

echo "Copying CF folder accross (cp -R $1/cf $2)"
cp -R $1/cf $2

echo "Copying Solutions folder accross (rsync -a --exclude=lambdas $1/solutions $2/cf)"
rsync -a --exclude=lambdas $1/solutions $2/cf

# echo "Removing the solution lambda function code"
# find $2/cf/solutions -type d -name lambdas -prune -exec rm -v -rf {} \;

UUID=`uuidgen`
echo "Generating Deployment UUID: $UUID"
echo "Renaming the graphql supporting CF scripts in case of updates"
mv $2/cf/graphql $2/cf/graphql-$UUID

echo "Updating code source bucket in templates with $3 and code source version in template with $4"
replace="s/%%BUCKET_NAME%%/$3/g"
echo "sed -i '' -e $replace $2/cf/*.yml"
sed -i '' -e $replace $2/cf/*.yml
echo "sed -i '' -e $replace $2/cf/dynamodb/*.yml"
sed -i '' -e $replace $2/cf/dynamodb/*.yml
echo "sed -i '' -e $replace $2/cf/lambda/*.yml"
sed -i '' -e $replace $2/cf/lambda/*.yml
echo "sed -i '' -e $replace $2/cf/solutions/*.yml"
sed -i '' -e $replace $2/cf/solutions/*.yml

replace="s/%%VERSION%%/$4/g"
echo "sed -i '' -e $replace $2/cf/*.yml"
sed -i '' -e $replace $2/cf/*.yml
echo "sed -i '' -e $replace $2/cf/dynamodb/*.yml"
sed -i '' -e $replace $2/cf/dynamodb/*.yml
echo "sed -i '' -e $replace $2/cf/lambda/*.yml"
sed -i '' -e $replace $2/cf/lambda/*.yml
echo "sed -i '' -e $replace $2/cf/solutions/*.yml"
sed -i '' -e $replace $2/cf/solutions/*.yml

replace="s/%%DEPLOYMENT_UUID%%/$UUID/g"
echo "sed -i '' -e $replace $2/cf/*.yml"
sed -i '' -e $replace $2/cf/*.yml
echo "sed -i '' -e $replace $2/cf/dynamodb/*.yml"
sed -i '' -e $replace $2/cf/dynamodb/*.yml
echo "sed -i '' -e $replace $2/cf/lambda/*.yml"
sed -i '' -e $replace $2/cf/lambda/*.yml
echo "sed -i '' -e $replace $2/cf/solutions/*.yml"
sed -i '' -e $replace $2/cf/solutions/*.yml

echo
echo "------------------------------------------------------------------------------"
echo
exit 0
