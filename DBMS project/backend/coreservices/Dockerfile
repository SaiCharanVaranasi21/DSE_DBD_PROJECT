# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run the application
FROM eclipse-temurin:21-alpine
WORKDIR /app
COPY --from=build /app/target/coreservices-0.0.1-SNAPSHOT.war app.war
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.war"]
