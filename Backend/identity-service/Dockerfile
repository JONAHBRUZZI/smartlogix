FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

COPY identity-service ./identity-service

RUN cd identity-service && mvn -q -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /build/identity-service/target/identity-service-*.jar app.jar

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8083/actuator/health || exit 1

ENV JAVA_TOOL_OPTIONS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:G1NewCollectionPercentThreshold=30 -Dcom.sun.akuma.Daemon=true"

USER appuser

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]
