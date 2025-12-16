# Build stage
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .

# Build the application
RUN cd backend && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]