package org.hdfclife.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;

class BackendConfigurationTest {

    @Test
    void createsOpenApiDefinitionWithBearerAuthentication() {
        OpenAPI openAPI = new OpenApiConfig().customOpenAPI();

        assertEquals("Secure Auth API", openAPI.getInfo().getTitle());
        assertEquals("1.0", openAPI.getInfo().getVersion());
        assertEquals("bearer", openAPI.getComponents()
                .getSecuritySchemes().get("bearerAuth").getScheme());
        assertEquals("JWT", openAPI.getComponents()
                .getSecuritySchemes().get("bearerAuth").getBearerFormat());
    }

    @Test
    void createsRestClientBuilder() {
        RestClient.Builder builder = new RestClientConfig().restClientBuilder();

        assertNotNull(builder);
        assertNotNull(builder.build());
    }

    @Test
    void configuresCorsOriginsMethodsHeadersAndCredentials() {
        CorsConfigurationSource source = new CorsConfig().corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/auth");
        CorsConfiguration configuration = source.getCorsConfiguration(request);

        assertNotNull(configuration);
        assertTrue(configuration.getAllowedOrigins().contains("http://localhost:3000"));
        assertTrue(configuration.getAllowedMethods().contains("POST"));
        assertEquals("*", configuration.getAllowedHeaders().get(0));
        assertTrue(configuration.getAllowCredentials());
    }
}