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
