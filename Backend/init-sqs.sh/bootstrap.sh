#!/bin/sh
awslocal sqs create-queue --queue-name orders-queue
awslocal sqs create-queue --queue-name shipping-queue
awslocal sqs create-queue --queue-name notification-events-queue
