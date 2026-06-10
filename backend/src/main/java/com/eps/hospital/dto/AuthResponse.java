package com.eps.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import com.eps.hospital.model.Rol;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String nombre;
    private Rol rol;
    private Long id; // Puede ser id de afiliado o profesional
}
