package com.carboncredit.exception;

/**
 * Exception thrown when a user doesn't have sufficient carbon credits for retirement operation
 */
public class InsufficientCreditsException extends RuntimeException {

    public InsufficientCreditsException(String message) {
        super(message);
    }

    public InsufficientCreditsException(String message, Throwable cause) {
        super(message, cause);
    }
}
