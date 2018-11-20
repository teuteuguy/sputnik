import mxnet as mx  # pylint: disable=import-error
import cv2  # pylint: disable=import-error
import numpy as np # pylint: disable=import-error
from collections import namedtuple
import glob

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

        print("path: {}".format(self.path))
        print("model_name: {}".format(self.model_name))
        print("width: {}, height: {}".format(self.width, self.height))

        epoch = int(glob.glob(self.path + "/" + self.model_name + '*.params')
                    [0].split(self.model_name + "-")[1].split('.params')[0])

        print("Infer.init: epoch: {}".format(epoch))

        if self.camera == 'awscam':
            import mo  # pylint: disable=import-error
            self.mo = mo
            error, model_path = self.mo.optimize(model_name=self.model_name, input_width=self.width, input_height=self.height, platform="mx", aux_inputs={
                "--epoch": epoch,
                "--models-dir": self.path,
                "--output-dir": self.path
            })
            print("Model optimization: {} {}".format(error, model_path))
            if error == 0:
                print("Model optimization worked")
                import awscam # pylint: disable=import-error
                self.awscam = awscam
                self.model = awscam.Model(model_path, {'GPU': 1})
                print("Model loaded")
                # Since this is a binary classifier only retrieve 2 classes.
                self.num_top_k = 2
            else:
                print("Model optimization failed")
        else:
            sym, args, auxs = mx.model.load_checkpoint(path, epoch)
            self.mod = mx.mod.Module(sym, label_names=None, context=mx.cpu())
            self.mod.bind(
                for_training=False,
                data_shapes=[('data', (1, 3, self.width, self.height))],
                label_shapes=self.mod._label_shapes)
            self.mod.set_params(args, auxs, allow_missing=True)

    def do(self, original):

        if self.camera == 'awscam':
            model_type = "classification"
            frame_resize = cv2.resize(original, (self.height, self.width))
            parsed_inference_results = self.model.parseResult(model_type, self.model.doInference(frame_resize))
            top_k = parsed_inference_results[model_type][0:self.num_top_k]
            output_map = {}
            for i in range(len(self.categories)):
                output_map[i] = self.categories[i]
            cloud_output = {}
            for obj in top_k:
                cloud_output[output_map[obj['label']]] = obj['prob']
            return cloud_output
        else:
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
                cloud_output[self.categories[i]] = prob[i]
            return cloud_output

            # # print the top-5
            # prob = np.squeeze(prob)
            # x = np.argmax(prob)
            # print("Infer.do(): x: {} {}".format(x, prob))
            # return self.categories[x], prob[x]
