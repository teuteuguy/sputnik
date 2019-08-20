# sputnik - The IoT Pilot Kickstart Solution

The **IoT Pilot Kickstart solution** has been designed to simplify getting started on AWS IoT, by providing you with a boilerplate, sample application to onboard and manage IoT devices with minimalistic realtime data visualization capabilities.

Project named *Sputnik*, after (one of?) the first satellites.

Sputnik's goal is to help you get started and connecting your IoT devices to AWS and start generating business value from your use-case.


As part of this first release, Sputnik can, in theory, support all types of devices, however as part of this first release, for now, we have only included blueprints for the Raspberry Pi, Intel Up2, Deeplens and a dummy ESP32 device.
We will be including more device blueprints as we go along, and hope the community and the AWS partner eco-system will participate in the creation of these blueprints.

## What is the IoT Pilot Kickstart Solution


TODO: Add architecture diagram and description here.


## How it works

The main goal of Sputnik is to make it **easier** for you to start generating business value from your IoT devices. For this, Sputnik has concepts of blueprints that describe a device's business outcome. You can then add and deploy as many of these "business outcome driven devices" as you want.

For example: a Truck that you can track on a map, and check it's location and status, is a "business outcome driven device". Sputnik through blueprints will hide the devices that define the truck (ECU, sensors etc ...) and let your users manage Trucks.


#### First you create Device Types.####
A **DeviceType** is a physical electronic device (a Rapsberry Pi, a Deeplens). The DeviceType defines the unique specificicities of your electronic device. Information like specific hardware capabilities for example (GPU, Camera, GPIOs...)

[Details on creating a DeviceType.](./docs/device-types.md)

#### Second you create Device Blueprints.####
A **DeviceBlueprint** defines the business logic that your Device runs. Example: a Raspberry Pi with a Camera is just a Rapsberry Pi with a Camera. A Raspberry Pi with a Camera that runs code to detect whether people are wearing safety hats, becomes a "Safety hat detecting Camera". The business logic of detecting whether or not someone is wearing a safety hat or not is defined by a DeviceBlueprint. And, in some cases, this business logic, or DeviceBlueprint, could run on multiple DeviceTypes. 

Detecting whether or not someone is wearing their safety hat could run on a Deeplens, a Raspberry Pi with a camera, an Intel Up2 board with a webcam attached etc ...

[Details on creating a DeviceBlueprint.](./docs/device-blueprints.md)

#### Third you create System Blueprints.####
**SystemBlueprints** define how multiple Devices interact together to become a system. Example: a Truck is a system. Customers can deploy multiple trucks. A truck can consist of multiple devices (4 tire sensors, 1 central processing unit). 

[Details on creating a SystemBlueprint.](./docs/system-blueprints.md)


## Known Limitations
For now, deployment of blueprints is only supported on Greengrass based devices. Amazon FreeRTOS deployments via OTA to be implemented soon...


## Next steps wish list

* Add blueprints for the [3D Printed Connected FreeRTOS conveyor belt](https://github.com/aws-samples/amazon-freertos-iot-conveyor-belt)
* Add mapping widgets
* Support for Amazon FreeRTOS OTA deployments
* Create a Developer Cloud9 environment for Sputnik 

## Notes

Public access to the website has been disabled by default.
In order to enable it, you need to un-comment the S3 policy in the s3bucket-website Cloudformation script: sputnik-s3bucket-website.yml

# Deploy Sputnik in your AWS account

You can 1-click deploy this solution in your AWS Account by clicking the following button:

Region | Launch Template
------------ | -------------
**N. Virginia** (us-east-1) | [![Launch the Sputnik Stack into Virginia with CloudFormation](./Images/deploy-to-aws.png)](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=sputnik&templateURL=https://s3.amazonaws.com/tims-solutions-us-east-1/sputnik/v0.9.5/cf/sputnik.yml)

### Customize your own and build for yourself
Want to customize Sputnik, and want to fiddle around with the code? No problem.

[Follow this guide.](./docs/developers.md)

# Known issues
* There seems to be an issue on session timeout of the cognito authentication creating an endless loop of angular re-routing. Help me fix it :)



# Disclaimer

This repo is the work of 1 person only, and comes as is, non tested. **Use at your own risk**. Feedback is more than welcome.

## This is completely UNTESTED code! Use at your own risk!!! I will not be held reliable if the spaceships you are tracking suddently disapear because of an alien invasion the app did not show.

Kudos to the [IoT Device Simulator](https://aws.amazon.com/solutions/iot-device-simulator/) from which this project was inspired from, and completely rewritten on.
