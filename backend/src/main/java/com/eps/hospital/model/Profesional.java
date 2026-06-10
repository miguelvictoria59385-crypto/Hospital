package com.eps.hospital.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Profesional {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    private String especialidad;

    @ManyToOne
    @JoinColumn(name = "centro_salud_id")
    private CentroSalud centroSalud;
}
