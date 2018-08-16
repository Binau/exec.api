#!/bin/sh

(./run.sh $1 | sed -u "s/^/#L#/") 2>&1
 