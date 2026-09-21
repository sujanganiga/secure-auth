package org.hdfclife.backend.client;

import org.hdfclife.backend.dto.ExternalLoginRequest;
import org.hdfclife.backend.dto.ExternalLoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
public class MockExternalLoginClient implements ExternalLoginClient {

    private final RestClient restClient;
    private final String loginUrl;

    public MockExternalLoginClient(
            RestClient.Builder restClientBuilder,
            @Value("${mock.login.url}") String loginUrl) {

        this.restClient = restClientBuilder.build();
        this.loginUrl = loginUrl;
    }

    @Override
    public ExternalLoginResponse login(ExternalLoginRequest request) {

        try {

            return restClient
                    .post()
                    .uri(loginUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ExternalLoginResponse.class);

        } catch (HttpClientErrorException.Unauthorized ex) {

            return new ExternalLoginResponse(
                    false,
                    request.getUsername()
            );
        }
    }
}