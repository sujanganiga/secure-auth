package org.hdfclife.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "01234567890123456789012345678901";
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 60_000, 7_200_000);
    }

    @Test
    void generatesAccessTokenWithConfiguredExpiry() {
        Instant before = Instant.now();

        String token = jwtService.generateToken("user@example.com");

        assertTrue(jwtService.validateToken(token));
        assertFalse(jwtService.isRefreshToken(token));
        assertEquals("user@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.extractExpiration(token).isAfter(before.plusSeconds(50)));
    }

    @Test
    void generatesRefreshTokenWithRefreshTypeAndExpiry() {
        String token = jwtService.generateRefreshToken("user@example.com");

        assertTrue(jwtService.validateToken(token));
        assertTrue(jwtService.isRefreshToken(token));
        assertEquals("user@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.extractExpiration(token).isAfter(Instant.now().plusSeconds(7_100)));
    }

    @Test
    void rejectsExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .subject("user@example.com")
                .issuedAt(new Date(System.currentTimeMillis() - 2_000))
                .expiration(new Date(System.currentTimeMillis() - 1_000))
                .claim("type", "refresh")
                .signWith(key)
                .compact();

        assertFalse(jwtService.validateToken(token));
        assertFalse(jwtService.isRefreshToken(token));
    }

    @Test
    void rejectsMalformedToken() {
        assertFalse(jwtService.validateToken("not-a-jwt"));
        assertFalse(jwtService.isRefreshToken("not-a-jwt"));
    }
}