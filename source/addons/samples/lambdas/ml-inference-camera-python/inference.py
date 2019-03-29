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

    # def __init__(self, camera=None, path="/ml", model_name="image-classification", width=224, height=224, categories=['cat1', 'cat2']):
    def __init__(self,
            model_type=None,
            model_path="/ml/",
            model_name="image-classification",
            width=224,
            height=224,
            categories=['cat1', 'cat2'],
            stream=None
        ):

        self.width = width
        self.height = height
        self.categories = categories
        self.model_type = model_type
        self.model_path = model_path
        self.model_name = model_name
        self.optimized_model_path = self.model_path + self.model_name

        print("Infer.init(): model_type: {}".format(self.model_type))
        print("Infer.init(): model_path: {}".format(self.model_path))
        print("Infer.init(): model_name: {}".format(self.model_name))
        print("Infer.init(): width: {}, height: {}".format(self.width, self.height))
        print("Infer.init(): categories: {}".format(self.categories))

        epoch = int(glob.glob(self.model_path + self.model_name + '*.params')
                    [0].split(self.model_name + "-")[1].split('.params')[0])

        print("Infer.init(): epoch: {}".format(epoch))

        if self.model_type == "optimized":

            import mo  # pylint: disable=import-error
            self.mo = mo

            error, self.optimized_model_path = self.mo.optimize(model_name=self.model_name, input_width=self.width, input_height=self.height, platform="mx", aux_inputs={
                "--epoch": epoch,
                "--models-dir": self.model_path,
                "--output-dir": self.model_path
            })

            print("Infer.init(): Model optimization result: {} {}".format(error, self.optimized_model_path))

            if error == 0 and stream.Model:
                self.model = stream.Model(self.optimized_model_path, {'GPU': 1})
                print("Infer.init(): Optimized Model loaded to awscam")
            else:
                self.model_type = "non_optimized"

        if self.model_type == "non_optimized":
            sym, args, auxs = mx.model.load_checkpoint(self.model_path + self.model_name, epoch)
            self.mod = mx.mod.Module(sym, label_names=None, context=mx.cpu())
            self.mod.bind(for_training=False, data_shapes=[('data', (1, 3, self.width, self.height))], label_shapes=self.mod._label_shapes)
            self.mod.set_params(args, auxs, allow_missing=True)

    def do(self, original):

        frame_resize = cv2.resize(original, (self.height, self.width))

        if self.model_type == "optimized":
            inference_results = self.model.doInference(frame_resize)
            parsed_inference_results = self.model.parseResult("classification", inference_results)
            # print("parsed_inference_results: {}".format(parsed_inference_results))
            top_k = parsed_inference_results["classification"][0:len(self.categories)]
            # print("top_k: {}".format(top_k))
            output_map = {}
            for i in range(len(self.categories)):
                output_map[i] = self.categories[i]
            cloud_output = {}
            for obj in top_k:
                cloud_output[output_map[obj['label']]] = math.floor(obj['prob'] * 10000) / 100
            return cloud_output

        if self.model_type == "non_optimized":
            # frame_resize = cv2.cvtColor(frame_resize, cv2.COLOR_BGR2RGB)
            frame_resize = np.swapaxes(frame_resize, 0, 2)
            frame_resize = np.swapaxes(frame_resize, 1, 2)
            frame_resize = frame_resize[np.newaxis, :]
            # print(frame_resize)
            self.mod.forward(self.Batch([mx.nd.array(frame_resize)]))
            # self.mod.forward(self.Batch([original]))
            prob = self.mod.get_outputs()[0].asnumpy()
            prob = np.squeeze(prob)
            cloud_output = {}
            for i in range(len(self.categories)):
                cloud_output[self.categories[i]] = math.floor(prob[i] * 10000) / 100
            return cloud_output
