#!/bin/sh

if [ ! -f "$2" ]; then
    su -c 'mkdir -p $0' dockeruser -- "$2"
    rm -r "$2"
fi

echo -e "$1" > "$2"
chmod 777 "$2"
chown dockeruser:dockeruser "$2"
 