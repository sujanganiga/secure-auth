package org.hdfclife.backend.repository;

import org.hdfclife.backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    boolean existsByTokenHash(String tokenHash);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.tokenHash = :tokenHash")
    void deleteByTokenHash(String tokenHash);

    @Modifying
    @Transactional
    @Query("delete from RefreshToken token where token.expiresAt <= :now")
    int deleteExpiredTokens(@Param("now") Instant now);
}