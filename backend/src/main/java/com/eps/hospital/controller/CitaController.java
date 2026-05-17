package com.eps.hospital.controller;

import com.eps.hospital.model.Cita;
import com.eps.hospital.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;

    @GetMapping("/afiliado/{id}")
    public List<Cita> getCitasByAfiliado(@PathVariable Long id) {
        return citaRepository.findByAfiliadoId(id);
    }
    
    @GetMapping("/profesional/{id}")
    public List<Cita> getCitasByProfesional(@PathVariable Long id) {
        return citaRepository.findByProfesionalId(id);
    }

    @PostMapping
    public ResponseEntity<Cita> agendarCita(@RequestBody Cita cita) {
        return ResponseEntity.ok(citaRepository.save(cita));
    }
}
