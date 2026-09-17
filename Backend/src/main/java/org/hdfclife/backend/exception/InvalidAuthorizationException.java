package org.hdfclife.backend.exception;

public class InvalidAuthorizationException extends RuntimeException {

    public InvalidAuthorizationException(String message) {
        super(message);
    }
}
