package com.eps.hospital.repository;

import com.eps.hospital.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
    List<Factura> findByAfiliadoId(Long afiliadoId);
}
