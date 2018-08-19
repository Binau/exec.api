#!/bin/sh

su dockeruser -c '(/docker-engine/app/bin/build.sh $1 | sed -u "s/^/#L#/") 2>&1'
