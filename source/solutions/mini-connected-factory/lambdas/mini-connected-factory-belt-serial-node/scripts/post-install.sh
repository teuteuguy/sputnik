#!/bin/bash
echo 'This is a hack. The idea is that we have a pre-built version of the @serialport/bindings for linux that we copy over'
cp bindings.node node_modules/@serialport/bindings/build/Release/
