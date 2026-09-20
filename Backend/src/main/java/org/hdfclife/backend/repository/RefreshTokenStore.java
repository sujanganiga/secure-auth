package org.hdfclife.backend.repository;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RefreshTokenStore {

    private final Set<String> activeRefreshTokens =
            ConcurrentHashMap.newKeySet();

    public void addToken(String token) {
        activeRefreshTokens.add(token);
    }

    public boolean containsToken(String token) {
        return activeRefreshTokens.contains(token);
    }

    public void removeToken(String token) {
        activeRefreshTokens.remove(token);
    }
}
