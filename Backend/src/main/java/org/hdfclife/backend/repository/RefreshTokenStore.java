package org.hdfclife.backend.repository;

import org.hdfclife.backend.entity.RefreshToken;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Repository
public class RefreshTokenStore {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenStore(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public void addToken(String token) {
        refreshTokenRepository.save(new RefreshToken(hashToken(token)));
    }

    public boolean containsToken(String token) {
        return refreshTokenRepository.existsByTokenHash(hashToken(token));
    }
    @Transactional
    public void removeToken(String token) {
        refreshTokenRepository.deleteByTokenHash(hashToken(token));
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(token.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
