#!/bin/sh
echo '=> Configuring'
emconfigure ./configure
echo '=> Making'
emmake make
echo '=> Javascripting'
ASM_JS=1 emcc -O2 src/main.o -o main.js -s TOTAL_MEMORY=536870912
