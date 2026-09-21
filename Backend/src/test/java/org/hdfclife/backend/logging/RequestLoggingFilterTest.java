package org.hdfclife.backend.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import org.junit.jupiter.api.Test;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RequestLoggingFilterTest {

    @Test
    void shouldProcessRequestAndResponse() throws ServletException, IOException {

        RequestLoggingFilter filter =
                new RequestLoggingFilter();

        MockHttpServletRequest request =
                new MockHttpServletRequest("POST", "/login");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain filterChain =
                mock(FilterChain.class);

        filter.doFilter(
                request,
                response,
                filterChain
        );

        verify(filterChain).doFilter(
                request,
                response
        );
    }

    @Test
    void shouldLogResponseStatusAfterRequest() throws ServletException, IOException {

        RequestLoggingFilter filter =
                new RequestLoggingFilter();

        MockHttpServletRequest request =
                new MockHttpServletRequest("POST", "/login");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain filterChain =
                mock(FilterChain.class);

        doAnswer(invocation -> {
            response.setStatus(401);
            return null;
        }).when(filterChain).doFilter(request, response);

        filter.doFilter(
                request,
                response,
                filterChain
        );

        assertEquals(401, response.getStatus());
    }

    @Test
    void shouldCompleteLoggingWhenRequestThrowsException()
            throws ServletException, IOException {

        RequestLoggingFilter filter =
                new RequestLoggingFilter();

        MockHttpServletRequest request =
                new MockHttpServletRequest("POST", "/login");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain filterChain =
                mock(FilterChain.class);

        doThrow(new RuntimeException("Test error"))
                .when(filterChain)
                .doFilter(request, response);

        assertThrows(
                RuntimeException.class,
                () -> filter.doFilter(
                        request,
                        response,
                        filterChain
                )
        );

        verify(filterChain).doFilter(
                request,
                response
        );
    }

    @Test
    void shouldProcessDifferentRequest() throws ServletException, IOException {

        RequestLoggingFilter filter =
                new RequestLoggingFilter();

        MockHttpServletRequest request =
                new MockHttpServletRequest("GET", "/auth");

        MockHttpServletResponse response =
                new MockHttpServletResponse();

        FilterChain filterChain =
                mock(FilterChain.class);

        filter.doFilter(
                request,
                response,
                filterChain
        );

        verify(filterChain).doFilter(
                request,
                response
        );

        assertEquals("GET", request.getMethod());
        assertEquals("/auth", request.getRequestURI());
    }
}
