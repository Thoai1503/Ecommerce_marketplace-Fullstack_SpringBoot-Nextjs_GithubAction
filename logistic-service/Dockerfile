# Multi-stage Dockerfile for the api-gateway (Maven + Java 21)

# --- Builder: compile with Maven ---
FROM maven:3.9.4-eclipse-temurin-21 AS builder
WORKDIR /workspace

COPY pom.xml .
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd
COPY .mvn .mvn
RUN mvn -B -DskipTests dependency:go-offline || true

COPY src ./src
RUN mvn -B -DskipTests package -DskipTests

# --- Runtime: lightweight JRE ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

ENV JAVA_OPTS=""

# Copy JAR from builder
COPY --from=builder /workspace/target/*.jar ./app.jar

<<<<<<< HEAD:OrderService/Dockerfile
EXPOSE 8002
=======
EXPOSE 8007
>>>>>>> 2303dbea4457761743ead14c44865db12e8d57c3:logistic-service/Dockerfile

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]