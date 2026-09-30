package org.hdfclife.backend.repository;

import org.hdfclife.backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    boolean existsByTokenHash(String tokenHash);

    void deleteByTokenHash(String tokenHash);
}