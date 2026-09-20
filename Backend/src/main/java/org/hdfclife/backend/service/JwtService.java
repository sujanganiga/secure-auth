package org.hdfclife.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey secretKey;
    private final long expiration;
    private final long refresh_expiration;
    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration}") long expiration,@Value("${jwt.refresh-expiration}") long refresh_expiration)
    {
        this.secretKey= Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration=expiration;
        this.refresh_expiration=refresh_expiration;

    }

    public String generateToken(String username) {

        Date now = new Date();
        Date expiry = new Date(
                now.getTime() + expiration
        );

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiry)
                .claim("type","access")
                .signWith(secretKey)
                .compact();
    }

    public String generateRefreshToken(String username)
    {
        Date now=new Date();
        Date expiry=new Date(now.getTime()+refresh_expiration);
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiry)
                .claim("type","refresh")
                .signWith(secretKey)
                .compact();

    }

    public Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {

        return extractClaims(token).getSubject();
    }

    public boolean validateToken(String token) {

        try {

            Claims claims = extractClaims(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    public boolean isRefreshToken(String token) {

        try {

            Claims claims = extractClaims(token);

            return "refresh".equals(
                    claims.get("type", String.class)
            );

        } catch (Exception e) {

            return false;
        }
    }
}
