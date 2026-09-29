package org.hdfclife.backend.resilience;

import org.springframework.dao.DataAccessException;
import org.hdfclife.backend.entity.User;
import org.hdfclife.backend.exception.DatabaseServiceUnavailableException;
import org.hdfclife.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class DatabaseCircuitBreakerServiceTest {

    @Mock
    private UserRepository userRepository;

    private DatabaseCircuitBreakerService databaseService;

    @BeforeEach
    void setUp() {

        databaseService = new DatabaseCircuitBreakerService(
                userRepository,
                50,
                3,
                10,
                10,
                2
        );
    }

    @Test
    void shouldCheckUsernameSuccessfully() {

        when(userRepository.existsByUsername("test@gmail.com"))
                .thenReturn(true);

        boolean result =
                databaseService.existsByUsername("test@gmail.com");

        assertTrue(result);

        verify(userRepository)
                .existsByUsername("test@gmail.com");
    }

    @Test
    void shouldSaveUserSuccessfully() {

        User user =
                new User("test@gmail.com", "hashedPassword");

        when(userRepository.save(user))
                .thenReturn(user);

        User result =
                databaseService.save(user);

        assertEquals(user, result);

        verify(userRepository).save(user);
    }

    @Test
    void shouldFallbackWhenDatabaseFails() {

        when(userRepository.existsByUsername("test@gmail.com"))
                .thenThrow(new RuntimeException("Database unavailable"));

        assertThrows(
                DatabaseServiceUnavailableException.class,
                () -> databaseService.existsByUsername("test@gmail.com")
        );
    }

    @Test
    void shouldOpenCircuitAfterRepeatedDatabaseFailures() {

        when(userRepository.existsByUsername("test@gmail.com"))
                .thenThrow(new DataAccessException("Database unavailable") {});
        for (int i = 0; i < 3; i++) {
            assertThrows(
                    DatabaseServiceUnavailableException.class,
                    () -> databaseService.existsByUsername("test@gmail.com")
            );
        }

        assertThrows(
                DatabaseServiceUnavailableException.class,
                () -> databaseService.existsByUsername("test@gmail.com")
        );

        verify(
                userRepository,
                times(3)
        ).existsByUsername("test@gmail.com");
    }
}