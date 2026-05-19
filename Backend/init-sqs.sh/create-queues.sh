#!/bin/sh
set -e

ORDERS_QUEUE="orders-queue"
SHIPPING_QUEUE="shipping-queue"
NOTIFICATION_EVENTS_QUEUE="notification-events-queue"
NOTIFICATION_TOPIC_NAME="notification-events-topic"

queue_url() {
    echo "http://localhost:4566/000000000000/$1"
}

create_queue() {
    awslocal sqs create-queue --queue-name "$1" >/dev/null
}

queue_arn() {
    awslocal sqs get-queue-attributes \
        --queue-url "$(queue_url "$1")" \
        --attribute-names QueueArn \
        --query 'Attributes.QueueArn' \
        --output text
}

set_sqs_policy_for_sns_topic() {
    QUEUE_NAME=$1
    TOPIC_ARN=$2
    QUEUE_ARN=$(queue_arn "$QUEUE_NAME")
    ATTR_FILE="/tmp/${QUEUE_NAME}-sns-policy.json"

    cat > "$ATTR_FILE" <<EOF
{"Policy":"{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"Allow-SNS-SendMessage\",\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"sns.amazonaws.com\"},\"Action\":\"sqs:SendMessage\",\"Resource\":\"$QUEUE_ARN\",\"Condition\":{\"ArnEquals\":{\"aws:SourceArn\":\"$TOPIC_ARN\"}}}]}"}
EOF

    awslocal sqs set-queue-attributes \
        --queue-url "$(queue_url "$QUEUE_NAME")" \
        --attributes "file://$ATTR_FILE" >/dev/null
}

ensure_subscription_with_filter() {
    TOPIC_ARN=$1
    QUEUE_NAME=$2
    FILTER_POLICY=$3
    QUEUE_ARN=$(queue_arn "$QUEUE_NAME")

    SUB_ARN=$(awslocal sns list-subscriptions-by-topic \
        --topic-arn "$TOPIC_ARN" \
        --query "Subscriptions[?Endpoint=='$QUEUE_ARN'].SubscriptionArn" \
        --output text)

    if [ -z "$SUB_ARN" ] || [ "$SUB_ARN" = "None" ]; then
        SUB_ARN=$(awslocal sns subscribe \
            --topic-arn "$TOPIC_ARN" \
            --protocol sqs \
            --notification-endpoint "$QUEUE_ARN" \
            --query 'SubscriptionArn' \
            --output text)
    fi

    awslocal sns set-subscription-attributes \
        --subscription-arn "$SUB_ARN" \
        --attribute-name FilterPolicy \
        --attribute-value "$FILTER_POLICY" >/dev/null

    awslocal sns set-subscription-attributes \
        --subscription-arn "$SUB_ARN" \
        --attribute-name RawMessageDelivery \
        --attribute-value "true" >/dev/null
}

echo "[init-sqs] Creating queues..."
create_queue "$ORDERS_QUEUE"
create_queue "$SHIPPING_QUEUE"
create_queue "$NOTIFICATION_EVENTS_QUEUE"

echo "[init-sqs] Creating topic..."
TOPIC_ARN=$(awslocal sns create-topic --name "$NOTIFICATION_TOPIC_NAME" --query 'TopicArn' --output text)

echo "[init-sqs] Wiring SNS -> SQS subscriptions..."
set_sqs_policy_for_sns_topic "$NOTIFICATION_EVENTS_QUEUE" "$TOPIC_ARN"
ensure_subscription_with_filter "$TOPIC_ARN" "$NOTIFICATION_EVENTS_QUEUE" '{"audience":["CLIENT","OPERATOR","BOTH"]}'

echo "[init-sqs] Ready."
