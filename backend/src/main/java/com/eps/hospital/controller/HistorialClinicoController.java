package com.eps.hospital.controller;

import com.eps.hospital.model.HistorialClinico;
import com.eps.hospital.repository.HistorialClinicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
public class HistorialClinicoController {

    @Autowired
    private HistorialClinicoRepository historialClinicoRepository;

    @GetMapping("/afiliado/{id}")
    public List<HistorialClinico> getHistorialByAfiliado(@PathVariable Long id) {
        return historialClinicoRepository.findByAfiliadoId(id);
    }

    @PostMapping
    public ResponseEntity<HistorialClinico> agregarRegistro(@RequestBody HistorialClinico historial) {
        return ResponseEntity.ok(historialClinicoRepository.save(historial));
    }
}
