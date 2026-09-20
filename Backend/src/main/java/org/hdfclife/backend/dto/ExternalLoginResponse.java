package org.hdfclife.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ExternalLoginResponse {

    private boolean authenticated;
    private String username;
}