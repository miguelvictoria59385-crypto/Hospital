package com.eps.hospital.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class CentroSalud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;
    private String direccion;
    private String ciudad;
}
