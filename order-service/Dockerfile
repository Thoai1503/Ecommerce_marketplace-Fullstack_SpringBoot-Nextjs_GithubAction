# Runtime-only Dockerfile for order-service.
# Build jar locally first, then build image from order-service folder:
#   1) mvnw -f ../Marketplace-platform/pom.xml -DskipTests install
#   2) mvnw -DskipTests package
#   3) docker build -t order-service:local .

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

ENV TZ=Asia/Ho_Chi_Minh
ENV JAVA_TOOL_OPTIONS="-Duser.timezone=Asia/Ho_Chi_Minh"
ENV JAVA_OPTS=""

# Copy prebuilt jar from local target directory.
COPY target/*.jar ./app.jar

EXPOSE 8002

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]