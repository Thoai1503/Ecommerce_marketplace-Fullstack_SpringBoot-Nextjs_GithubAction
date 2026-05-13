# Runtime-only Dockerfile for stock-service.
# Build JAR locally first, then build the image from the stock-service folder:
#   1) cd ../Marketplace-platform && mvnw -DskipTests install
#   2) cd ../stock-service       && mvnw -DskipTests package
#   3) docker build -t stock-service:local .

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

ENV TZ=Asia/Ho_Chi_Minh
ENV JAVA_TOOL_OPTIONS="-Duser.timezone=Asia/Ho_Chi_Minh"
ENV JAVA_OPTS=""

# Copy pre-built executable JAR from local target directory.
COPY target/*.jar ./app.jar

EXPOSE 8009

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
