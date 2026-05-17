package com.eps.hospital.controller;

import com.eps.hospital.model.Factura;
import com.eps.hospital.repository.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    @Autowired
    private FacturaRepository facturaRepository;

    @GetMapping("/afiliado/{id}")
    public List<Factura> getFacturasByAfiliado(@PathVariable Long id) {
        return facturaRepository.findByAfiliadoId(id);
    }
}
