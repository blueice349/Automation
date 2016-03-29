#! /bin/bash

find titanium_src/Resources -iname *.js | grep -v vendor | grep -v test | xargs -I{} jshint {} | grep -v "Bad line breaking"
