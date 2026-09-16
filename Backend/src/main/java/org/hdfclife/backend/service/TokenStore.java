package org.hdfclife.backend.service;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {
    private final Set<String> activeTokens =
            ConcurrentHashMap.newKeySet();

    public void addToken(String token) {
        activeTokens.add(token);
    }

    public boolean containsToken(String token) {
        return activeTokens.contains(token);
    }

    public void removeToken(String token) {
        activeTokens.remove(token);
    }
}
