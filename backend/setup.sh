#!/bin/bash

echo "============================================"
echo "Carbon Credit Marketplace - Setup Script"
echo "============================================"
echo

echo "[1/4] Checking Java version..."
java -version
if [ $? -ne 0 ]; then
    echo "ERROR: Java 17 or higher is required!"
    echo "Please install Java 17 and try again."
    exit 1
fi
echo "✓ Java is installed"

echo
echo "[2/4] Checking if .env file exists..."
if [ -f ".env" ]; then
    echo "✓ .env file already exists"
else
    echo "Creating .env file from template..."
    cp .env.template .env
    echo
    echo "⚠️  IMPORTANT: Please edit the .env file with your actual database credentials:"
    echo "   - DB_USERNAME: Your SQL Server username"
    echo "   - DB_PASSWORD: Your SQL Server password"
    echo "   - JWT_SECRET: A secure secret key (minimum 32 characters)"
    echo
    echo "Opening .env file for editing..."
    ${EDITOR:-nano} .env
fi

echo
echo "[3/4] Testing Maven build..."
./mvnw clean compile
if [ $? -ne 0 ]; then
    echo "ERROR: Maven build failed!"
    echo "Please check your environment configuration."
    exit 1
fi
echo "✓ Maven build successful"

echo
echo "[4/4] Running tests..."
./mvnw test
if [ $? -ne 0 ]; then
    echo "WARNING: Some tests failed. Check your database connection."
else
    echo "✓ All tests passed"
fi

echo
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo
echo "To start the application:"
echo "  ./mvnw spring-boot:run"
echo
echo "The application will be available at:"
echo "  http://localhost:8080"
echo
