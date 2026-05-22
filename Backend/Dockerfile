ARG SERVICE

FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
ARG SERVICE
WORKDIR /workspace
COPY event-contracts ./event-contracts/
COPY $SERVICE ./$SERVICE/
RUN mvn -q -f event-contracts/pom.xml -DskipTests install
RUN mvn -q -f $SERVICE/pom.xml -DskipTests package -DskipTests

FROM eclipse-temurin:21-jre-alpine
ARG SERVICE
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /workspace/$SERVICE/target/*.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx96m", "-XX:+UseContainerSupport", "-jar", "app.jar"]
