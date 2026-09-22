package org.hdfclife.backend.resilience;

import org.hdfclife.backend.client.ExternalLoginClient;
import org.hdfclife.backend.dto.ExternalLoginRequest;
import org.hdfclife.backend.dto.ExternalLoginResponse;
import org.hdfclife.backend.exception.LoginServiceUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class LoginCircuitBreakerServiceTest {

    @Mock
    private ExternalLoginClient externalLoginClient;

    private LoginCircuitBreakerService service;


    @BeforeEach
    void setUp() {

        service = new LoginCircuitBreakerService(
                externalLoginClient,
                50.0f,
                2,
                2,
                10,
                1
        );
    }


    @Test
    void shouldReturnSuccessfulResponseWhenExternalServiceWorks() {

        ExternalLoginRequest request =
                new ExternalLoginRequest(
                        "testuser",
                        "testpassword"
                );

        ExternalLoginResponse expectedResponse =
                new ExternalLoginResponse(
                        true,
                        "testuser"
                );

        when(externalLoginClient.login(request))
                .thenReturn(expectedResponse);

        ExternalLoginResponse response =
                service.login(request);

        assertEquals(true, response.isAuthenticated());
        assertEquals("testuser", response.getUsername());

        verify(externalLoginClient)
                .login(request);
    }


    @Test
    void shouldFallbackWhenExternalServiceFails() {

        ExternalLoginRequest request =
                new ExternalLoginRequest(
                        "testuser",
                        "testpassword"
                );

        when(externalLoginClient.login(request))
                .thenThrow(
                        new RuntimeException(
                                "External service unavailable"
                        )
                );

        assertThrows(
                LoginServiceUnavailableException.class,
                () -> service.login(request)
        );

        verify(externalLoginClient)
                .login(request);
    }


    @Test
    void shouldOpenCircuitAfterRepeatedFailures() {

        ExternalLoginRequest request =
                new ExternalLoginRequest(
                        "testuser",
                        "testpassword"
                );

        when(externalLoginClient.login(request))
                .thenThrow(
                        new RuntimeException(
                                "External service unavailable"
                        )
                );

        // First failure
        assertThrows(
                LoginServiceUnavailableException.class,
                () -> service.login(request)
        );

        // Second failure
        // Failure rate becomes 100%,
        // which is greater than the 50% threshold.
        assertThrows(
                LoginServiceUnavailableException.class,
                () -> service.login(request)
        );

        // Circuit should now be OPEN.
        // External service should NOT be called again.
        assertThrows(
                LoginServiceUnavailableException.class,
                () -> service.login(request)
        );

        verify(externalLoginClient, org.mockito.Mockito.times(2))
                .login(request);
    }
}