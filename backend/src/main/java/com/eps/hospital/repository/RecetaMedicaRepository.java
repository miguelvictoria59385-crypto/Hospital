package com.eps.hospital.repository;

import com.eps.hospital.model.RecetaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecetaMedicaRepository extends JpaRepository<RecetaMedica, Long> {
    List<RecetaMedica> findByHistorialClinicoId(Long historialClinicoId);
}
