#!/bin/sh

# List of backend URLs
BACKENDS=${BACKEND_URLS}
# Generate CORS headers for each backend URL
CORS_HEADERS=""
for BACKEND in $BACKENDS; do
    CORS_HEADERS="$CORS_HEADERS add_header Access-Control-Allow-Origin '$BACKEND';"
done

# Insert the CORS headers into the Nginx configuration
sed -i "s|# CORS_HEADERS|$CORS_HEADERS|" /etc/nginx/conf.d/default.conf

# Generate proxy_pass configuration for each backend URL
PROXY_PASS_CONFIG=""
for BACKEND in $BACKENDS; do
    PROXY_PASS_CONFIG="$PROXY_PASS_CONFIG location /api/ { \
        proxy_pass $BACKEND; \
        proxy_set_header Host \$host; \
        proxy_set_header X-Real-IP \$remote_addr; \
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto \$scheme; \
        add_header Access-Control-Allow-Origin '*'; \
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS'; \
        add_header Access-Control-Allow-Headers 'Authorization, Content-Type'; \
    }"
done

# Insert the proxy_pass configuration into the Nginx configuration
sed -i "s|# PROXY_PASS_CONFIG|$PROXY_PASS_CONFIG|" /etc/nginx/conf.d/default.conf
