package org.hdfclife.backend.repository;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TokenStoreTest {

    @Test
    void addsChecksAndRemovesActiveToken() {
        TokenStore tokenStore = new TokenStore();

        assertFalse(tokenStore.containsToken("access-token"));

        tokenStore.addToken("access-token");
        assertTrue(tokenStore.containsToken("access-token"));

        tokenStore.removeToken("access-token");
        assertFalse(tokenStore.containsToken("access-token"));
    }
}