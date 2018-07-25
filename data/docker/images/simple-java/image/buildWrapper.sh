#!/bin/sh

(./build.sh $1 | sed -u "s/^/#L#/") 2>&1
