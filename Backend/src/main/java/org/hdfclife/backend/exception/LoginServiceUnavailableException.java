package org.hdfclife.backend.exception;

public class LoginServiceUnavailableException extends RuntimeException {

    public LoginServiceUnavailableException(String message) {
        super(message);
    }
}