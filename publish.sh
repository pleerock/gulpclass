#!/bin/sh
CURR=$(pwd)
cd ./build/package
yarn publish --access public
cd $CURR