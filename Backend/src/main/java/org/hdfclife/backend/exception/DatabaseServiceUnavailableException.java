package org.hdfclife.backend.exception;

public class DatabaseServiceUnavailableException extends RuntimeException {

    public DatabaseServiceUnavailableException(String message) {
        super(message);
    }
}