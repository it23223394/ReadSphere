# Use official Java 21 image
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Maven files first (better caching)
COPY pom.xml .
COPY src ./src

# Build the JAR
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port and run
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]