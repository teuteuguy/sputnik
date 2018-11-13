## My Things Management
Blablabla

## TODO

* Add A:FreeRTOS devic types, blueprints and deployment management.
* When creating a device, deal with the certificates ?
* Create a location picker for the solutions

* Put back the admin to manage the users, and the profile ?
* Attach cert function from UI
* Initialize the shadow when provisioning
* Attach policies
* Attach IAM
* Add things to group
* Delete Group/SOlution
* short id for group name ?
* disable devices update ?
* utils: find rogue stuff
* For a given thing, check which solution they are part of.
* have the factory reset refer to the cf scripts.
* Simplify cloudformation script, databucket vs databucketarn
* see if we can add the pre-zipped versions of node_modules for the solutions for each architecutre ?

## Notes

Public access to the website has been disabled by default.
In order to enable it, you need to un-comment the policy in the s3bucket-website CF script: mythings-mgmt-s3bucket-website.yml

The node lambda functions for some of the solutions require building on the final target => deeplens.

## Build
* Configure the bucket name of your target Amazon S3 distribution bucket
```
export DIST_OUTPUT_BUCKET=my-bucket-name # bucket where customized code will reside
export VERSION=my-version # version number for the customized code
```
_Note:_ You would have to create an S3 bucket with the prefix 'my-bucket-name-<aws_region>'; aws_region is where you are testing the customized solution. Also, the assets in bucket should be publicly accessible.

* Now build the distributable:
```
chmod +x ./build-s3-dist.sh \n
./build-s3-dist.sh $DIST_OUTPUT_BUCKET $VERSION \n
```

* Deploy the distributable to an Amazon S3 bucket in your account. _Note:_ you must have the AWS Command Line Interface installed.
```
aws s3 cp ./dist/ s3://my-bucket-name-<aws_region>/iot-device-simulator/<my-version>/ --recursive --acl bucket-owner-full-control --profile aws-cred-profile-name \n
```

# Known issues

Menu is broken because of Angular UI. Needs improving.

# Disclaimer

This is based off of the AWS IoT Device Simulator.
This is completely UNTESTED code! Use at your own risk!!!

