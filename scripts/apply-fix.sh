#!/bin/bash
# Apply S-normalization fix to @lazorkit/wallet
echo "Applying S-normalization fix to @lazorkit/wallet..."
cp scripts/sdk-fix/index.mjs node_modules/@lazorkit/wallet/dist/index.mjs
cp scripts/sdk-fix/index.js node_modules/@lazorkit/wallet/dist/index.js
echo "SDK fix applied!"
