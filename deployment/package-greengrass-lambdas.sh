#!/bin/bash
set -e

# Get reference for all important folders
template_dir="$PWD"
dist_dir="$template_dir/dist"
source_dir="$template_dir/../source/greengrass"

cd $source_dir

for directory in * ; do
    if [[ -d $directory ]]; then
        echo "$directory"
        cd $directory
        rm -f $directory.zip
        zip -rq $directory.zip *
        mv $directory.zip $dist_dir/$directory.zip
        cd $source_dir
    fi
done


# LAMBDA_FUNCTION_NAME=${PWD##*/}

# package() {
#     rm -f package.zip
#     echo "Zipping..."
#     zip -rq package.zip *
#     echo "package.zip created"
# }

# deployLambda() {
#     echo "Deploying package.zip to AWS.Lambda"
#     echo "Uploading $LAMBDA_FUNCTION_NAME to AWS.Lambda"
#     LAMBDA_SHA=`$AWS_COMMAND lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --zip-file fileb://\`pwd\`/package.zip --query CodeSha256 --output text`
#     LAMBDA_PUBLISH_VERSION=`$AWS_COMMAND lambda publish-version --function-name $LAMBDA_FUNCTION_NAME --code-sha-256 $LAMBDA_SHA --query Version --output text`
#     echo "Publishing new Lambda version: $LAMBDA_PUBLISH_VERSION"
#     echo "Pointing alias $LAMBDA_ALIAS_NAME to new version"
#     $AWS_COMMAND  lambda update-alias --name $LAMBDA_ALIAS_NAME --function-name $LAMBDA_FUNCTION_NAME --function-version $LAMBDA_PUBLISH_VERSION
# }

# if [ -z "$1" ]
#     then
#         echo "No argument supplied for alias"
#         exit -1
#     else
#         LAMBDA_ALIAS_NAME=$1
# fi

# if [ -z "$2" ]
#     then
#         echo "No argument supplied for config, using defaults"
#         AWS_COMMAND="aws"
#     else
#         PROFILE=`jq -r '.profile' $2`
#         REGION=`jq -r '.region' $2`
#         AWS_COMMAND="aws --profile $PROFILE --region $REGION"
# fi

# echo "Using aws = $AWS_COMMAND"

# package
# deployLambda
