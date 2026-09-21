package org.hdfclife.backend.resilience;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import org.hdfclife.backend.client.ExternalLoginClient;
import org.hdfclife.backend.dto.ExternalLoginRequest;
import org.hdfclife.backend.dto.ExternalLoginResponse;
import org.hdfclife.backend.exception.LoginServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

@Service
public class LoginCircuitBreakerService {

    private static final Logger logger =
            LoggerFactory.getLogger(LoginCircuitBreakerService.class);

    private final ExternalLoginClient externalLoginClient;
    private final CircuitBreaker circuitBreaker;

    public LoginCircuitBreakerService(
            ExternalLoginClient externalLoginClient,
            @Value("${login.circuit-breaker.failure-rate-threshold}")
            float failureRateThreshold,
            @Value("${login.circuit-breaker.minimum-number-of-calls}")
            int minimumNumberOfCalls,
            @Value("${login.circuit-breaker.sliding-window-size}")
            int slidingWindowSize,
            @Value("${login.circuit-breaker.wait-duration-in-open-state-seconds}")
            long waitDurationSeconds,
            @Value("${login.circuit-breaker.permitted-number-of-calls-in-half-open-state}")
            int halfOpenCalls) {

        this.externalLoginClient = externalLoginClient;

        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(failureRateThreshold)
                .minimumNumberOfCalls(minimumNumberOfCalls)
                .slidingWindowSize(slidingWindowSize)
                .waitDurationInOpenState(
                        Duration.ofSeconds(waitDurationSeconds)
                )
                .permittedNumberOfCallsInHalfOpenState(
                        halfOpenCalls
                )
                .build();

        this.circuitBreaker = CircuitBreaker.of(
                "loginExternalService",
                config
        );

        registerCircuitBreakerListeners();
    }

    private void registerCircuitBreakerListeners() {

        circuitBreaker.getEventPublisher()
                .onStateTransition(event ->
                        logger.warn(
                                "Circuit Breaker '{}' state changed: {}",
                                event.getCircuitBreakerName(),
                                event.getStateTransition()
                        )
                );
    }

    public ExternalLoginResponse login(
            ExternalLoginRequest request) {

        Supplier<ExternalLoginResponse> supplier =
                CircuitBreaker.decorateSupplier(
                        circuitBreaker,
                        () -> externalLoginClient.login(request)
                );

        try {

            logger.debug(
                    "Calling external login service for user: {}",
                    request.getUsername()
            );

            return supplier.get();

        } catch (CallNotPermittedException ex) {

            logger.warn(
                    "Circuit Breaker is OPEN. Login request rejected for user: {}",
                    request.getUsername()
            );

            throw new LoginServiceUnavailableException(
                    "Login service is temporarily unavailable"
            );

        } catch (Exception ex) {

            logger.error(
                    "External login service failed for user: {}",
                    request.getUsername(),
                    ex
            );

            throw new LoginServiceUnavailableException(
                    "Login service is temporarily unavailable"
            );
        }
    }
}