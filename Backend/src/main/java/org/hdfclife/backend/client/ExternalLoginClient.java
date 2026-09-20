package org.hdfclife.backend.client;

import org.hdfclife.backend.dto.ExternalLoginRequest;
import org.hdfclife.backend.dto.ExternalLoginResponse;

public interface ExternalLoginClient {

    ExternalLoginResponse login(ExternalLoginRequest request);
}