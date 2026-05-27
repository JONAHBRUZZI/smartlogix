package com.smartlogix.shipping_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.awspring.cloud.sqs.config.SqsMessageListenerContainerFactory;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import io.awspring.cloud.sqs.support.converter.SqsMessagingMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsAsyncClient;

import java.net.URI;

@Configuration
@Profile("!test")
public class SqsConfig {

    @Value("${AWS_SQS_ENDPOINT:http://localhost:4566}")
    private String sqsEndpoint;

    @Value("${AWS_REGION:us-east-1}")
    private String awsRegion;

    @Value("${AWS_ACCESS_KEY_ID:test}")
    private String awsAccessKey;

    @Value("${AWS_SECRET_ACCESS_KEY:test}")
    private String awsSecretKey;

    @Bean
    @Profile("!prod")
    public SqsAsyncClient localSqsAsyncClient() {
        return SqsAsyncClient.builder()
                .endpointOverride(URI.create(sqsEndpoint))
                .region(Region.of(awsRegion))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(awsAccessKey, awsSecretKey)))
                .build();
    }

    @Bean
    @Profile("prod")
    public SqsAsyncClient prodSqsAsyncClient() {
        return SqsAsyncClient.builder()
                .region(Region.US_EAST_1)
                .build();
    }

    @Bean
    public SqsTemplate sqsTemplate(SqsAsyncClient sqsAsyncClient) {
        return SqsTemplate.builder()
                .sqsAsyncClient(sqsAsyncClient)
                .build();
    }

    @Bean
    public SqsMessageListenerContainerFactory<Object> defaultSqsListenerContainerFactory(
            SqsAsyncClient sqsAsyncClient, ObjectMapper objectMapper) {

        SqsMessageListenerContainerFactory<Object> factory = new SqsMessageListenerContainerFactory<>();
        factory.setSqsAsyncClient(sqsAsyncClient);

        SqsMessagingMessageConverter converter = new SqsMessagingMessageConverter();
        converter.setObjectMapper(objectMapper);

        factory.configure(options -> options.messageConverter(converter));
        return factory;
    }
}
