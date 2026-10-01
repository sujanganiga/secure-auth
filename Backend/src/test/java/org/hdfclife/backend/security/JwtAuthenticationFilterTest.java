package org.hdfclife.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hdfclife.backend.repository.TokenStore;
import org.hdfclife.backend.service.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private TokenStore tokenStore;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        filter = new JwtAuthenticationFilter(jwtService, tokenStore);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesActiveAccessTokenAndContinuesChain() throws ServletException, IOException {
        MockHttpServletRequest request = requestWithAuthorization("Bearer access-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(tokenStore.containsToken("access-token")).thenReturn(true);
        when(jwtService.validateToken("access-token")).thenReturn(true);
        when(jwtService.isRefreshToken("access-token")).thenReturn(false);
        when(jwtService.extractUsername("access-token")).thenReturn("user@example.com");

        filter.doFilterInternal(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals("user@example.com", authentication.getName());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doesNotAuthenticateWhenAuthorizationHeaderIsAbsent() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/auth");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(tokenStore, jwtService);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doesNotAuthenticateRefreshToken() throws ServletException, IOException {
        MockHttpServletRequest request = requestWithAuthorization("Bearer refresh-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(tokenStore.containsToken("refresh-token")).thenReturn(true);
        when(jwtService.validateToken("refresh-token")).thenReturn(true);
        when(jwtService.isRefreshToken("refresh-token")).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doesNotAuthenticateTokenMissingFromStore() throws ServletException, IOException {
        MockHttpServletRequest request = requestWithAuthorization("Bearer unknown-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(tokenStore.containsToken("unknown-token")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(jwtService);
        verify(filterChain).doFilter(request, response);
    }

    private MockHttpServletRequest requestWithAuthorization(String authorization) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/auth");
        request.addHeader("Authorization", authorization);
        return request;
    }
}