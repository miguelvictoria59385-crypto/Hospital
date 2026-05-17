package com.eps.hospital.repository;

import com.eps.hospital.model.Afiliado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AfiliadoRepository extends JpaRepository<Afiliado, Long> {
    Optional<Afiliado> findByUsuarioId(Long usuarioId);
}
