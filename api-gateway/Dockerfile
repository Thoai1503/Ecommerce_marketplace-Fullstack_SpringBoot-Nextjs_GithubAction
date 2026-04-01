<<<<<<< HEAD
# Build stage: compile with Maven (Java 21)
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace/app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
RUN chmod +x mvnw || true
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

# Run stage: Tomcat server to run WAR
FROM tomcat:10.1-jdk21

# Remove default ROOT app
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy built WAR
COPY --from=build /workspace/app/target/*.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080


CMD ["catalina.sh", "run"]
=======
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

EXPOSE 8000

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
>>>>>>> b1e61f071ca45b7aa5c116f8b8285a226bed233e
