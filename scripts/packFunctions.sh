#!/bin/bash

rm -rf functions && mkdir functions
cp -rfv build/* functions
cp package.json functions