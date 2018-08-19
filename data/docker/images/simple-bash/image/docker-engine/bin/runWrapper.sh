#!/bin/sh

su dockeruser -c '(/docker-engine/app/bin/run.sh $1 | sed -u "s/^/#L#/") 2>&1'

