package com.eps.hospital.repository;

import com.eps.hospital.model.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistorialClinicoRepository extends JpaRepository<HistorialClinico, Long> {
    List<HistorialClinico> findByAfiliadoId(Long afiliadoId);
}
