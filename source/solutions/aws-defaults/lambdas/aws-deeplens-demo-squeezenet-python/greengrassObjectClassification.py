#
# Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#

# greengrassObjectClassification.py
# Demonstrates inference at edge using MXNET, squeezenet v1.1 model
# and Greengrass core sdk. This function will continuously retrieve the
# predictions from the ML framework and send them to the topic 'hello/world'.
# The function will sleep for three seconds, then repeat.  Since the function is
# long-lived it will run forever when deployed to a Greengrass core.  The handler
# will NOT be invoked in our example since the we are executing an infinite loop.
#
# Prerequisites:
#
# MXNET: Please refer AWS Greengrass documentation for a proper installation
# of MXNET on Raspberry-Pi and how to bundle the output with your lambda.
# Installation script will take of all the other dependencies needed to run
# this inference code on your GGC.
#
# MODEL: "Squeezenet v1.1"
# This lambda expects to have
#       "squeezenet_v1.1-0000.params",
#       "squeezenet_v1.1-symbol.json"
#       and "synset.txt" files
# on the root folder of your project.
# Below code sample includes a commented line where we initiate ImagenetModel
# with params, symbol and synset URLs. You may use those links to get the
# necessary files.
#
# DEVICE ACCESS: Please use AWS Greengrass console, CLI or API to add the below
# local device resources to your Greengrass group and then attach them to this
# lambda using the below settings also:
#
#      "Path": "/dev/vcsm", "Access": "r", "AutoAddGroupOwner": true },
#      "Path": "/dev/vchiq", "Access": "r", "AutoAddGroupOwner": true }

import sys
import time
import greengrasssdk
import platform
import os
import json
from threading import Timer
import load_model

client = greengrasssdk.client('iot-data')

model_path = '/greengrass-machine-learning/mxnet/squeezenet/'
global_model = load_model.ImagenetModel(model_path + 'synset.txt', model_path + 'squeezenet_v1.1')
'''
global_model = load_model.ImagenetModel('synset.txt',
                                          'squeezenet_v1.1',
                                          label_names=['prob_label'],
                                          params_url='http://data.mxnet.io/models/imagenet/squeezenet/squeezenet_v1.1-0000.params',
                                          symbol_url='http://data.mxnet.io/models/imagenet/squeezenet/squeezenet_v1.1-symbol.json',
                                          synset_url='http://data.mxnet.io/models/imagenet/synset.txt')
'''


# When deployed to a Greengrass core, this code will be executed immediately
# as a long-lived lambda function.  The code will enter the infinite while loop
# below.
def greengrass_object_classification_run():
    if global_model is not None:
        payload = dict()
        payload["Predictions"] = []

        try:
            predictions = global_model.predict_from_cam()
            print(predictions)

            for item in predictions:
                p, n = item
                prediction = {"probability": "{}".format(p), "name": n}
                payload["Predictions"].append(prediction)

        except:
            e = sys.exc_info()[0]
            print("Exception occured during prediction: %s" % e)

        try:
            # print("PAYLOAD", payload)
            # print("Ready to upload")
            #New Prediction: [(0.73277485, 'n03961711 plate rack'), (0.066790029, 'n03125729 cradle'), (0.01780333, 'n04266014 space shuttle'), (0.010995774, 'n03271574 electric fan, blower'), (0.010706531, 'n03868863 oxygen mask')]
            # client.publish(topic='innovate2018/inference', payload='New Prediction: {}'.format(str(predictions)))
            # print("DEBUG:", payload)
            #publish predictions

            payload = json.dumps(payload)
            client.publish(topic='innovate2018/inference', payload=payload)
            client.publish(topic='singapore2018/inference', payload=payload)

        except:
            e = sys.exc_info()[0]
            print("Exception: %s" % e)
            print(sys.exc_info())

    # Asynchronously schedule this function to be run again in 3 seconds
    # Timer(3, greengrass_object_classification_run).start()
    # Timer(0, greengrass_object_classification_run).start()


# Execute the function above
while True:
    greengrass_object_classification_run()


# This is a dummy handler and will not be invoked
# Instead the code above will be executed in an infinite loop for our example
def function_handler(event, context):
    return
