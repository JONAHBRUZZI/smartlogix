#!/bin/sh
set -e

FRONTEND_BUCKET="smartlogix-frontend-local"
FRONTEND_DIST_DIR="/workspace/frontend-dist"
HOSTED_ZONE_NAME="smartlogix.cl."
USER_POOL_NAME="smartlogix-local-users"
USER_POOL_CLIENT_NAME="_custom_id_:smartlogixwebclient"
USER_POOL_CLIENT_ID="smartlogixwebclient"
DEFAULT_PASSWORD="Smartlogix123!"
PLATFORM_SECRET_NAME="smartlogix/local/platform-config"
COGNITO_ENABLED=false
ROUTE53_ENABLED=false
S3_ENABLED=false
ENABLE_COGNITO=${ENABLE_LOCALSTACK_COGNITO:-false}
ENABLE_ROUTE53=${ENABLE_LOCALSTACK_ROUTE53:-false}

service_available() {
    SERVICE_NAME=$1
    awslocal "$SERVICE_NAME" help >/dev/null 2>&1
}

ensure_bucket() {
    if ! awslocal s3api head-bucket --bucket "$FRONTEND_BUCKET" >/dev/null 2>&1; then
        awslocal s3 mb "s3://$FRONTEND_BUCKET" >/dev/null
    fi
}

sync_frontend_bucket() {
    if [ -d "$FRONTEND_DIST_DIR" ] && [ "$(ls -A "$FRONTEND_DIST_DIR" 2>/dev/null)" ]; then
        awslocal s3 sync "$FRONTEND_DIST_DIR" "s3://$FRONTEND_BUCKET" --delete >/dev/null
    fi
}

ensure_hosted_zone() {
    HOSTED_ZONE_ID=$(awslocal route53 list-hosted-zones-by-name \
        --dns-name "$HOSTED_ZONE_NAME" \
        --query "HostedZones[?Name=='$HOSTED_ZONE_NAME'] | [0].Id" \
        --output text)

    if [ -z "$HOSTED_ZONE_ID" ] || [ "$HOSTED_ZONE_ID" = "None" ]; then
        HOSTED_ZONE_ID=$(awslocal route53 create-hosted-zone \
            --name "$HOSTED_ZONE_NAME" \
            --caller-reference "smartlogix-$(date +%s)" \
            --hosted-zone-config Comment="SmartLogix local zone",PrivateZone=false \
            --query "HostedZone.Id" \
            --output text)
    fi

    HOSTED_ZONE_ID=$(echo "$HOSTED_ZONE_ID" | sed 's#.*/##')

    cat > /tmp/smartlogix-route53-records.json <<EOF
{
  "Comment": "SmartLogix local DNS records",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "smartlogix.cl.",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [{ "Value": "127.0.0.1" }]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.smartlogix.cl.",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [{ "Value": "127.0.0.1" }]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.smartlogix.cl.",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [{ "Value": "127.0.0.1" }]
      }
    }
  ]
}
EOF

    awslocal route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch file:///tmp/smartlogix-route53-records.json >/dev/null
}

ensure_user_pool() {
    USER_POOL_ID=$(awslocal cognito-idp list-user-pools \
        --max-results 60 \
        --query "UserPools[?Name=='$USER_POOL_NAME'] | [0].Id" \
        --output text)

    if [ -z "$USER_POOL_ID" ] || [ "$USER_POOL_ID" = "None" ]; then
        USER_POOL_ID=$(awslocal cognito-idp create-user-pool \
            --pool-name "$USER_POOL_NAME" \
            --auto-verified-attributes email \
            --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":true}}' \
            --query "UserPool.Id" \
            --output text)
    fi
}

ensure_user_pool_client() {
    USER_POOL_CLIENT_ID=$(awslocal cognito-idp list-user-pool-clients \
        --user-pool-id "$USER_POOL_ID" \
        --max-results 60 \
        --query "UserPoolClients[?ClientId=='$USER_POOL_CLIENT_ID'] | [0].ClientId" \
        --output text)

    if [ -z "$USER_POOL_CLIENT_ID" ] || [ "$USER_POOL_CLIENT_ID" = "None" ]; then
        USER_POOL_CLIENT_ID=$(awslocal cognito-idp create-user-pool-client \
            --user-pool-id "$USER_POOL_ID" \
            --client-name "$USER_POOL_CLIENT_NAME" \
            --no-generate-secret \
            --explicit-auth-flows ALLOW_ADMIN_USER_PASSWORD_AUTH ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
            --query "UserPoolClient.ClientId" \
            --output text)
    fi
}

ensure_group() {
    GROUP_NAME=$1

    if ! awslocal cognito-idp get-group \
        --user-pool-id "$USER_POOL_ID" \
        --group-name "$GROUP_NAME" >/dev/null 2>&1; then
        awslocal cognito-idp create-group \
            --user-pool-id "$USER_POOL_ID" \
            --group-name "$GROUP_NAME" \
            --description "SmartLogix local role $GROUP_NAME" >/dev/null
    fi
}

ensure_user() {
    USERNAME=$1
    FULL_NAME=$2
    GROUP_NAME=$3

    if ! awslocal cognito-idp admin-get-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$USERNAME" >/dev/null 2>&1; then
        awslocal cognito-idp admin-create-user \
            --user-pool-id "$USER_POOL_ID" \
            --username "$USERNAME" \
            --user-attributes Name=email,Value="$USERNAME" Name=email_verified,Value=true Name=name,Value="$FULL_NAME" \
            --temporary-password "$DEFAULT_PASSWORD" \
            --message-action SUPPRESS >/dev/null

        awslocal cognito-idp admin-set-user-password \
            --user-pool-id "$USER_POOL_ID" \
            --username "$USERNAME" \
            --password "$DEFAULT_PASSWORD" \
            --permanent >/dev/null
    fi

    awslocal cognito-idp admin-add-user-to-group \
        --user-pool-id "$USER_POOL_ID" \
        --username "$USERNAME" \
        --group-name "$GROUP_NAME" >/dev/null 2>&1 || true
}

upsert_platform_secret() {
    SECRET_PAYLOAD=$(printf '{"region":"us-east-1","serviceBaseUrls":{"orders":"http://localhost:8081","inventory":"http://localhost:8082","shipping":"http://localhost:8084","notification":"http://localhost:8085"},"cognitoEndpoint":"http://localhost:4566","frontendBucket":"%s","hostedZone":"smartlogix.cl","cognitoEnabled":%s,"userPoolId":"%s","clientId":"%s"}' \
        "$FRONTEND_BUCKET" "$COGNITO_ENABLED" "${USER_POOL_ID:-}" "${USER_POOL_CLIENT_ID:-}")

    if awslocal secretsmanager describe-secret --secret-id "$PLATFORM_SECRET_NAME" >/dev/null 2>&1; then
        awslocal secretsmanager put-secret-value \
            --secret-id "$PLATFORM_SECRET_NAME" \
            --secret-string "$SECRET_PAYLOAD" >/dev/null
    else
        awslocal secretsmanager create-secret \
            --name "$PLATFORM_SECRET_NAME" \
            --secret-string "$SECRET_PAYLOAD" >/dev/null
    fi
}

echo "[platform] Creating LocalStack platform resources..."

if service_available s3api; then
    S3_ENABLED=true
    ensure_bucket
    sync_frontend_bucket
else
    echo "[platform] S3 no disponible. Se omite bucket de frontend."
fi

if [ "$ENABLE_ROUTE53" = "true" ] && service_available route53; then
    ROUTE53_ENABLED=true
    ensure_hosted_zone
else
    echo "[platform] Route53 no disponible. Se omite zona local."
fi

if [ "$ENABLE_COGNITO" = "true" ] && awslocal cognito-idp list-user-pools --max-results 1 >/dev/null 2>&1; then
    COGNITO_ENABLED=true
    ensure_user_pool
    ensure_user_pool_client

    ensure_group "owner"
    ensure_group "ops"
    ensure_group "warehouse"
    ensure_group "support"
    ensure_group "shipper"

    ensure_user "admin@smartlogix.cl" "Administrador SmartLogix" "owner"
    ensure_user "operaciones@smartlogix.cl" "Operaciones SmartLogix" "ops"
    ensure_user "bodega@smartlogix.cl" "Bodega SmartLogix" "warehouse"
    ensure_user "soporte@smartlogix.cl" "Soporte SmartLogix" "support"
    ensure_user "transportista@smartlogix.cl" "Transportista SmartLogix" "shipper"
else
    echo "[platform] Cognito no esta disponible en la licencia actual de LocalStack. Se omite esta parte."
fi

upsert_platform_secret
echo "[platform] Frontend bucket, Route53 y secret listos."
