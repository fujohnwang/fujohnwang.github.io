#! /usr/bin/env bash
scripts=`dirname "${BASH_SOURCE-$0}"`
postsDir=`cd "$scripts/../posts">/dev/null; pwd`
cd $postsDir
ls *.html | awk -F_ '{print substr($1, 1, 4)}' | sort | uniq -c
