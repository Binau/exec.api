#!/bin/sh

#| awk '{print "#L#"$1}'
#./run.sh $1 | awk '{print "#L#"$*}' 2>&1

#./run.sh $1 | while read out ; do
# echo "#L#$out"
#done

#| awk '{print "#L#"$1}'
#./run.sh $1 | awk '{print "#L#"$*}' 2>&1

#./run.sh $1 | echo "#L#$(cat -)"
(./run.sh $1 | sed -u "s/^/#L#/") 2>&1
