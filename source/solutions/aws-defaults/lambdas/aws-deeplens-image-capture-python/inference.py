import mxnet as mx
import cv2
import numpy as np
from collections import namedtuple

# to run locally
# from inference import Infer  # from python prompt

class Infer:
    Batch = namedtuple('Batch', ['data'])
    size = 224
    categories = ['hat', 'nohat']

    def __init__(self, path="/ml/helmets/image-classification"): ## TODO: Update the path
        sym, args, auxs = mx.model.load_checkpoint(path, 20)
        self.mod = mx.mod.Module(sym, label_names=None, context=mx.cpu())
        self.mod.bind(
            for_training=False,
            data_shapes=[('data', (1, 3, self.size, self.size))],
            label_shapes=self.mod._label_shapes)
        self.mod.set_params(args, auxs, allow_missing=True)

    def do(self, original):
        # original = cv2.cvtColor(original, cv2.COLOR_BGR2RGB)
        # frame = cv2.resize(original, (224, 224)) # resize
        frame = original
        frame = mx.nd.array(frame)
        frame = frame.transpose((2, 0, 1))
        frame = frame.expand_dims(axis=0)
        
        self.mod.forward(self.Batch([frame]))
        prob = self.mod.get_outputs()[0].asnumpy()

        # print the top-5
        prob = np.squeeze(prob)
        x = np.argmax(prob)
        return self.categories[x], prob[x]