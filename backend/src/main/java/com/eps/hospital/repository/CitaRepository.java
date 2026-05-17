package com.eps.hospital.repository;

import com.eps.hospital.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByAfiliadoId(Long afiliadoId);
    List<Cita> findByProfesionalId(Long profesionalId);
}
