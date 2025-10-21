package com.gr4.carboncredit.exception;

public class InsufficientBalanceException extends RuntimeException   {
    public InsufficientBalanceException(String message) {
        super(message);
    }
}
