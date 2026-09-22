package org.hdfclife.backend.resilience;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.hdfclife.backend.exception.LoginRateLimitExceededException;
import org.junit.jupiter.api.Test;

class LoginRateLimiterServiceTest {

    @Test
    void shouldAllowLoginAttemptsWithinUserLimit() {

        LoginRateLimiterService service =
                new LoginRateLimiterService(3, 10, 60);

        assertDoesNotThrow(() ->
                service.checkLoginAttempt("testuser", "192.168.1.10")
        );

        assertDoesNotThrow(() ->
                service.checkLoginAttempt("testuser", "192.168.1.10")
        );

        assertDoesNotThrow(() ->
                service.checkLoginAttempt("testuser", "192.168.1.10")
        );
    }


    @Test
    void shouldRejectWhenUserLimitExceeded() {

        LoginRateLimiterService service =
                new LoginRateLimiterService(2, 10, 60);

        service.checkLoginAttempt(
                "testuser",
                "192.168.1.10"
        );

        service.checkLoginAttempt(
                "testuser",
                "192.168.1.10"
        );

        assertThrows(
                LoginRateLimitExceededException.class,
                () -> service.checkLoginAttempt(
                        "testuser",
                        "192.168.1.10"
                )
        );
    }


    @Test
    void shouldRejectWhenIpLimitExceeded() {

        LoginRateLimiterService service =
                new LoginRateLimiterService(10, 2, 60);

        service.checkLoginAttempt(
                "user1",
                "192.168.1.10"
        );

        service.checkLoginAttempt(
                "user2",
                "192.168.1.10"
        );

        assertThrows(
                LoginRateLimitExceededException.class,
                () -> service.checkLoginAttempt(
                        "user3",
                        "192.168.1.10"
                )
        );
    }

    @Test
    void shouldAllowDifferentUsersAndDifferentIps() {

        LoginRateLimiterService service =
                new LoginRateLimiterService(1, 1, 60);

        assertDoesNotThrow(() ->
                service.checkLoginAttempt(
                        "user1",
                        "192.168.1.10"
                )
        );

        assertDoesNotThrow(() ->
                service.checkLoginAttempt(
                        "user2",
                        "192.168.1.11"
                )
        );
    }

    @Test
    void shouldEnforceIpLimitIndependentlyFromUserLimit() {

        LoginRateLimiterService service =
                new LoginRateLimiterService(10, 2, 60);

        assertDoesNotThrow(() ->
                service.checkLoginAttempt(
                        "user1",
                        "192.168.1.10"
                )
        );

        assertDoesNotThrow(() ->
                service.checkLoginAttempt(
                        "user2",
                        "192.168.1.10"
                )
        );

        assertThrows(
                LoginRateLimitExceededException.class,
                () -> service.checkLoginAttempt(
                        "user3",
                        "192.168.1.10"
                )
        );
    }
}


