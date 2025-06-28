# This script processes a configuration template for Kong and sets up the environment for the Kong entrypoint.
#!/bin/bash
set -e

echo "Kong custom entrypoint: Processing configuration template..."

ls /kong

if [ -f "/kong/config.template.yaml" ]; then
    echo "Found configuration template, processing..."

    envsubst < /kong/config.template.yaml > /kong/config.yaml

    export KONG_DECLARATIVE_CONFIG=/kong/config.yaml
else
    echo "No configuration template found, using default configuration."
fi

. /docker-entrypoint.sh
