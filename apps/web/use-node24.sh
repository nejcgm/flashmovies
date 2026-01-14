#!/bin/bash
# Temporarily switch to Node 24 for this terminal session

export PATH="/usr/local/opt/node/bin:$PATH"
hash -r

echo "Switched to Node version: $(node -v)"
echo "Using npm version: $(npm -v)"

