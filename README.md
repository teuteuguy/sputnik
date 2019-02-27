# sputnik - The Simple IoT Management Solution

The sputnik solution has been designed to simplify getting started on AWS IoT, by removing notions of Things, Greengrass etc ... and only refering to Devices and Solutions.

As of Dec 2018, the built in supported devices are: Raspberry Pi, Intel Up2, Deeplens. And only the 1 solution available was built for re:Invent to support the mini connected factory use case.

## How it works

First you create Device Types. A device type is a physical electronic device (a Rapsberry Pi, a Deeplens). This describes what the unique specificities of your electronic device.

Second you create Device Blueprints. A device blueprint defines the business logic that your Device runs. Example: a Raspberry Pi with a Camera is just a Rapsberry Pi with a Camera. A Raspberry Pi with a Camera that runs code to detect objects, becomes an "Object detecting Camera".

Third you create Solution Blueprints. A solution blueprint defines how multiple Devices interact together to become a solution. Example: a Truck in the context of "sputnik" is a solution. Customers can deploy multiple trucks. A truck can consist of multiple devices (4 tire sensors, 1 central processing unit).

Fourth, you can then create specific angular modules and views for your blueprints. Those can be viewed in the ./source/src/app/secure/child-views folder.

Example:
The demo that is currently built into sputnik is a Connected Factory. The solution is a mini connected factory. You can deploy as many of these mini connected factories as you want. The mini connected factory consists of 2 devices. 1 Conveyor belt and 1 connected smart camera. The conveyor belt is based off of the [3D Printed Connected FreeRTOS conveyor belt](https://github.com/aws-samples/amazon-freertos-iot-conveyor-belt). The Smart Camera can run off of a Deeplens or the Intel Up2 (with a webcam).

## Next steps

First big next step is to add a fleet tracker and fleet tracking widgets.

## Notes

Public access to the website has been disabled by default.
In order to enable it, you need to un-comment the S3 policy in the s3bucket-website Cloudformation script: sputnik-s3bucket-website.yml

# Deploy as is

You can 1-click deploy this solution in your AWS Account in us-east-1 by clicking the following button:

Region | Launch Template
------------ | -------------
**N. Virginia** (us-east-1) | [![Launch the sputnik Stack into Virginia with CloudFormation](/Images/deploy-to-aws.png)](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=sputnik&templateURL=https://s3.amazonaws.com/tims-solutions-us-east-1/sputnik/v1.0/cf/sputnik.yml)

# Customize your own and build for yourself
First of all. You do not need to do this step. Only do this if you want to build and run a customized version of this solution for your needs.

* In the ./deployment folder you will find the build.sh script. Run that script

```
chmod +x build.sh
./build.sh [S3 BUCKET NAME] [VERSION]
```
_Note 1:_ You would have to create an S3 bucket with the prefix 'my-bucket-name-<aws_region>'; aws_region is where you are testing the customized solution. Also, the assets in bucket should be publicly accessible.

_Note 2:_ Specify a version for your build, example: "v1.0"

* Deploy the distributable to an Amazon S3 bucket in your account. _Note:_ you must have the AWS Command Line Interface installed.

```
aws s3 cp ./dist/ s3://[S3 BUCKET NAME]/sputnik/[VERSION]/ --recursive --acl bucket-owner-full-control --profile aws-cred-profile-name
```

_Note 3:_ Dependencies:
The deployment scripts require:
* jq
* yarn
* uuidgen

# Known issues

Help me find them. There's plenty !

# Development TODO / WIP

* certs are a massive mess, change it
* check on the on-boarding just in time service
* model trainer view has issues with the pictures
* A:FreeRTOS. Need to add full management (deployment) of FreeRTOS devices via OTA. Taken into account in Blueprints etc ...
* Device creation: need to think about how to provide Cert to end user.
* Maps: Create a location picker for solutions and devices
* Regions: currently only us-east-1
* Move the common lambda stuff to Lambda layers !
* Attach cert function from UI
* Attach policies
* Attach IAM
* Add things to groups => use Thing Groups to organize things
* short id for group name ?
* disable devices update ?
* utils: find rogue stuff
* For a given thing, check which solution they are part of.
* See if we can add the pre-zipped versions of node_modules for the solutions for each architecutre ? => lambda layers is the solution here


# Disclaimer

This repo is the work of 1 sole person, and comes as is, non tested. **Use at your own risk**. Feedback more than welcome.
Project is a massive rewrite from clone/fork of the AWS IoT Device Simulator.

## This is completely UNTESTED code! Use at your own risk!!! I will not be held reliable if the spaceships you are tracking suddently disapear because of an alien invasion the app did not show.

