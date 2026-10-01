package org.hdfclife.backend.repository;

import org.hdfclife.backend.entity.RefreshToken;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenStoreTest {

    @Mock
    private RefreshTokenRepository repository;

    @Test
    void storesOnlyHashWithExpiration() throws Exception {
        RefreshTokenStore store = new RefreshTokenStore(repository);
        Instant expiration = Instant.parse("2030-01-01T00:00:00Z");

        store.addToken("raw-refresh-token", expiration);

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository).save(captor.capture());
        String expectedHash = HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256")
                        .digest("raw-refresh-token".getBytes(StandardCharsets.UTF_8)));
        assertEquals(expectedHash, captor.getValue().getTokenHash());
        assertEquals(expiration, captor.getValue().getExpiresAt());
    }

    @Test
    void hashesTokensForLookupAndRemoval() {
        RefreshTokenStore store = new RefreshTokenStore(repository);
        when(repository.existsByTokenHash(any())).thenReturn(true);

        assertEquals(true, store.containsToken("raw-refresh-token"));

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(repository).existsByTokenHash(captor.capture());
        store.removeToken("raw-refresh-token");
        verify(repository).deleteByTokenHash(captor.getValue());
    }

    @Test
    void removesExpiredTokensUsingCurrentTime() {
        RefreshTokenStore store = new RefreshTokenStore(repository);

        store.removeExpiredTokens();

        verify(repository).deleteExpiredTokens(any(Instant.class));
    }
}