package com.eps.hospital.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
