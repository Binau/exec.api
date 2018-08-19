#!/bin/sh

if [ ! -f "$2" ]; then
    mkdir -p "$2"
    rm -r "$2"
fi

echo -e "$1" > "$2"
chmod 777 "$2"
chown dockeruser:dockeruser "$2"
 