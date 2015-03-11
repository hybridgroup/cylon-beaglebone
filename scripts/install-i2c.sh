#!/bin/bash

NODE_VERSION=$(node -v);

echo "this is the node version ==> $NODE_VERSION"

if [[ $NODE_VERSION == *"v0.10."* ]]; then
  echo "SAME!!!"
  npm install i2c@0.1.8
else
  echo "DIFFERENT!!!"
  npm install i2c

fi

