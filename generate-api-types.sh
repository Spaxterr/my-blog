#!/bin/bash

OPENAPI_SPEC_PATH='./packages/contracts/tsp-output/@typespec/openapi3/openapi.yaml'

rm -r ./apps/web/src/generated/
pnpm openapi-generator-cli generate -i $OPENAPI_SPEC_PATH -g typescript-fetch -o ./apps/web/src/generated/ --additional-properties=typescriptThreePlus=true
rm -r ./packages/contracts/rust/
pnpm openapi-generator-cli generate -i $OPENAPI_SPEC_PATH -g rust -o ./packages/contracts/rust/ --global-property modelDocs=false,apiDocs=false --additional-properties=packageName=blog-contracts
