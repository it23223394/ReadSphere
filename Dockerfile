# CHANGE FROM 21 to 17
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
RUN cd backend && ./mvnw clean package -DskipTests

# CHANGE FROM 21 to 17
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]