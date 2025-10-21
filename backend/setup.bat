@echo off
echo ============================================
echo Carbon Credit Marketplace - Setup Script
echo ============================================
echo.

echo [1/4] Checking Java version...
java -version
if %ERRORLEVEL% neq 0 (
    echo ERROR: Java 17 or higher is required!
    echo Please install Java 17 and try again.
    pause
    exit /b 1
)
echo ✓ Java is installed

echo.
echo [2/4] Checking if .env file exists...
if exist ".env" (
    echo ✓ .env file already exists
) else (
    echo Creating .env file from template...
    copy ".env.template" ".env"
    echo.
    echo ⚠️  IMPORTANT: Please edit the .env file with your actual database credentials:
    echo    - DB_USERNAME: Your SQL Server username
    echo    - DB_PASSWORD: Your SQL Server password
    echo    - JWT_SECRET: A secure secret key (minimum 32 characters)
    echo.
    echo Opening .env file for editing...
    notepad .env
)

echo.
echo [3/4] Testing Maven build...
call mvnw.cmd clean compile
if %ERRORLEVEL% neq 0 (
    echo ERROR: Maven build failed!
    echo Please check your environment configuration.
    pause
    exit /b 1
)
echo ✓ Maven build successful

echo.
echo [4/4] Running tests...
call mvnw.cmd test
if %ERRORLEVEL% neq 0 (
    echo WARNING: Some tests failed. Check your database connection.
) else (
    echo ✓ All tests passed
)

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo To start the application:
echo   ./mvnw spring-boot:run
echo.
echo The application will be available at:
echo   http://localhost:8080
echo.
pause
