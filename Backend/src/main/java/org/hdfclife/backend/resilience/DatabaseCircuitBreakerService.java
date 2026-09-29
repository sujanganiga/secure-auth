package org.hdfclife.backend.resilience;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.exception.DatabaseServiceUnavailableException;
import org.hdfclife.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.function.Supplier;

@Service
public class DatabaseCircuitBreakerService {

    private static final Logger logger =
            LoggerFactory.getLogger(DatabaseCircuitBreakerService.class);

    private final UserRepository userRepository;
    private final CircuitBreaker circuitBreaker;

    public DatabaseCircuitBreakerService(
            UserRepository userRepository,
            @Value("${database.circuit-breaker.failure-rate-threshold}")
            float failureRateThreshold,
            @Value("${database.circuit-breaker.minimum-number-of-calls}")
            int minimumNumberOfCalls,
            @Value("${database.circuit-breaker.sliding-window-size}")
            int slidingWindowSize,
            @Value("${database.circuit-breaker.wait-duration-in-open-state-seconds}")
            long waitDurationSeconds,
            @Value("${database.circuit-breaker.permitted-number-of-calls-in-half-open-state}")
            int halfOpenCalls) {

        this.userRepository = userRepository;

        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(failureRateThreshold)
                .minimumNumberOfCalls(minimumNumberOfCalls)
                .slidingWindowType(
                        CircuitBreakerConfig.SlidingWindowType.COUNT_BASED
                )
                .slidingWindowSize(slidingWindowSize)
                .recordException(
                        throwable -> throwable instanceof DataAccessException
                )
                .waitDurationInOpenState(
                        Duration.ofSeconds(waitDurationSeconds)
                )
                .permittedNumberOfCallsInHalfOpenState(
                        halfOpenCalls
                )
                .build();

        this.circuitBreaker = CircuitBreaker.of(
                "databaseService",
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

    public boolean existsByUsername(String username) {

        Supplier<Boolean> supplier =
                CircuitBreaker.decorateSupplier(
                        circuitBreaker,
                        () -> userRepository.existsByUsername(username)
                );

        try {

            logger.debug(
                    "Checking username existence in database: {}",
                    username
            );

            return supplier.get();

        } catch (CallNotPermittedException ex) {

            logger.warn(
                    "Database Circuit Breaker is OPEN. Request rejected."
            );

            throw new DatabaseServiceUnavailableException(
                    "Database service is temporarily unavailable"
            );

        } catch (Exception ex) {

            logger.error(
                    "Database operation failed while checking username: {}",
                    username,
                    ex
            );

            throw new DatabaseServiceUnavailableException(
                    "Database service is temporarily unavailable"
            );
        }
    }

    public User save(User user) {

        Supplier<User> supplier =
                CircuitBreaker.decorateSupplier(
                        circuitBreaker,
                        () -> userRepository.save(user)
                );

        try {

            logger.debug(
                    "Saving user to database: {}",
                    user.getUsername()
            );

            return supplier.get();

        } catch (CallNotPermittedException ex) {

            logger.warn(
                    "Database Circuit Breaker is OPEN. Save request rejected."
            );

            throw new DatabaseServiceUnavailableException(
                    "Database service is temporarily unavailable"
            );

        } catch (Exception ex) {

            logger.error(
                    "Database operation failed while saving user: {}",
                    user.getUsername(),
                    ex
            );

            throw new DatabaseServiceUnavailableException(
                    "Database service is temporarily unavailable"
            );
        }
    }
}