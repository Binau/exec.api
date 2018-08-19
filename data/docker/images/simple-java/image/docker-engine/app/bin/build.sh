#!/bin/sh

cd $(dirname $0)/../src

#BUILD
javac -sourcepath . Main.java
