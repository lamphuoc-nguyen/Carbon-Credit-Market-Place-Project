package com.carboncredit.exception;

import com.carboncredit.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for all application exceptions
 * Handles exceptions from any entity or service in the system
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleEntityNotFound(
            EntityNotFoundException ex, WebRequest request) {
        log.warn("Entity not found: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.NOT_FOUND, "ENTITY_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(InvalidStatusException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidStatus(
            InvalidStatusException ex, WebRequest request) {
        log.warn("Invalid status operation: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.CONFLICT, "INVALID_STATUS", ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedOperationException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedOperation(
            UnauthorizedOperationException ex, WebRequest request) {
        log.warn("Unauthorized operation: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.FORBIDDEN, "ACCESS_DENIED", ex.getMessage());
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(
            ValidationException ex, WebRequest request) {
        log.warn("Validation failed: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage());
    }

    @ExceptionHandler(BusinessOperationException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessOperation(
            BusinessOperationException ex, WebRequest request) {
        log.error("Business operation failed: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.UNPROCESSABLE_ENTITY, "OPERATION_FAILED", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        log.warn("Invalid argument: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalState(
            IllegalStateException ex, WebRequest request) {
        log.warn("Illegal state: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.CONFLICT, "ILLEGAL_STATE", ex.getMessage());
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiResponse<Object>> handleSecurity(
            SecurityException ex, WebRequest request) {
        log.warn("Security violation: {}", ex.getMessage());
        return createErrorResponse(HttpStatus.FORBIDDEN, "SECURITY_VIOLATION", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage()));
        return createErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed", fieldErrors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred. Please try again later.");
    }

    private ResponseEntity<ApiResponse<Object>> createErrorResponse(
            HttpStatus status, String errorCode, String message) {
        return createErrorResponse(status, errorCode, message, null);
    }

    private ResponseEntity<ApiResponse<Object>> createErrorResponse(
            HttpStatus status, String errorCode, String message, Object details) {
        Map<String, Object> errors = new HashMap<>();
        errors.put("status", status.value());
        errors.put("error", status.getReasonPhrase());
        errors.put("errorCode", errorCode);
        if (details != null) {
            errors.put("details", details);
        }

        return new ResponseEntity<>(ApiResponse.error(message, errors, null), status);
    }
}
