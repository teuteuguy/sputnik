import mxnet as mx  # pylint: disable=import-error
import cv2  # pylint: disable=import-error
import numpy as np # pylint: disable=import-error
from collections import namedtuple
import glob
import math

# to run locally
# from inference import Infer  # from python prompt

class Infer:
    Batch = namedtuple('Batch', ['data'])

    def __init__(self, camera=None, path="/ml", model_name="image-classification", width=224, height=224, categories=['cat1', 'cat2']):

        self.width = width
        self.height = height
        self.categories = categories
        self.camera = camera
        self.path = path
        self.model_name = model_name

        print("Infer.init(): camera: {}".format(self.path))
        print("Infer.init(): path: {}".format(self.path))
        print("Infer.init(): model_name: {}".format(self.model_name))
        print("Infer.init(): width: {}, height: {}".format(self.width, self.height))
        print("Infer.init(): categories: {}".format(self.categories))

        epoch = int(glob.glob(self.path + "/" + self.model_name + '*.params')
                    [0].split(self.model_name + "-")[1].split('.params')[0])

        print("Infer.init(): epoch: {}".format(epoch))

        if self.camera == "awscam":
            import mo  # pylint: disable=import-error
            self.mo = mo

            error, model_path = self.mo.optimize(model_name=self.model_name, input_width=self.width, input_height=self.height, platform="mx", aux_inputs={
                "--epoch": epoch,
                "--models-dir": self.path,
                "--output-dir": self.path
            })

            print("Infer.init(): Model optimization result: {} {}".format(error, model_path))

            if error == 0:
                print("Infer.init(): Model optimization worked")
                import awscam # pylint: disable=import-error
                self.awscam = awscam
                self.model = self.awscam.Model(model_path, {'GPU': 1})
                print("Infer.init(): Model loaded")
                # # Since this is a binary classifier only retrieve 2 classes.
                # self.num_top_k = 2
            else:
                print("Infer.init(): Model optimization failed. Reverting to normal mode.")
                self.camera = None

        if self.camera != "awscam":
            sym, args, auxs = mx.model.load_checkpoint(path, epoch)
            self.mod = mx.mod.Module(sym, label_names=None, context=mx.cpu())
            self.mod.bind(for_training=False, data_shapes=[('data', (1, 3, self.width, self.height))], label_shapes=self.mod._label_shapes)
            self.mod.set_params(args, auxs, allow_missing=True)

    def do(self, original):

        if self.camera == "awscam":
            model_type = "classification"
            frame_resize = cv2.resize(original, (self.height, self.width))
            inference_results = self.model.doInference(frame_resize)
            parsed_inference_results = self.model.parseResult(model_type, inference_results)

            # print("parsed_inference_results: {}".format(parsed_inference_results))

            top_k = parsed_inference_results[model_type][0:len(self.categories)]

            # print("top_k: {}".format(top_k))

            output_map = {}
            for i in range(len(self.categories)):
                output_map[i] = self.categories[i]
            cloud_output = {}
            for obj in top_k:
                cloud_output[output_map[obj['label']]] = math.floor(obj['prob'] * 10000) / 100

            return cloud_output

        if self.camera != "awscam":
            # original = cv2.cvtColor(original, cv2.COLOR_BGR2RGB)
            # frame = cv2.resize(original, (224, 224)) # resize
            frame = original
            frame = mx.nd.array(frame)
            frame = frame.transpose((2, 0, 1))
            frame = frame.expand_dims(axis=0)

            self.mod.forward(self.Batch([original]))
            prob = self.mod.get_outputs()[0].asnumpy()
            print("Normal: {}".format(prob))
            prob = np.squeeze(prob)
            cloud_output = {}
            for i in range(len(self.categories)):
                cloud_output[self.categories[i]] = math.floor(prob[i] * 10000) / 100
            return cloud_output

            # # print the top-5
            # prob = np.squeeze(prob)
            # x = np.argmax(prob)
            # print("Infer.do(): x: {} {}".format(x, prob))
            # return self.categories[x], prob[x]
