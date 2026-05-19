FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

COPY event-contracts ./event-contracts
RUN cd event-contracts && mvn -q -DskipTests clean install && cd ..

COPY notification-service ./notification-service

RUN cd notification-service && mvn -q -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /build/notification-service/target/notification-service-*.jar app.jar

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8085/actuator/health || exit 1

ENV JAVA_TOOL_OPTIONS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:G1NewCollectionPercentThreshold=30 -Dcom.sun.akuma.Daemon=true"

USER appuser

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
