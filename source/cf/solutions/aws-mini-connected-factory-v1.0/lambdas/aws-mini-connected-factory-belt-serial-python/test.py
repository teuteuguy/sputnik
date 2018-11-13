import lambda_function
import time

print('Hello')

lambda_function.lambda_handler(event={ 'state': { 'desired': { 'beltMode': 2, 'beltSpeed': 1}}}, context={})

while 42:
    time.sleep(100)
