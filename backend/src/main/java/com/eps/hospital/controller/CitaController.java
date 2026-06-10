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

    @GetMapping
    public List<Cita> getAllCitas() {
        return citaRepository.findAll();
    }

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

    @PutMapping("/{id}/estado")
    public ResponseEntity<Cita> updateEstado(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        return citaRepository.findById(id).map(cita -> {
            cita.setEstado(com.eps.hospital.model.EstadoCita.valueOf(body.get("estado")));
            return ResponseEntity.ok(citaRepository.save(cita));
        }).orElse(ResponseEntity.notFound().build());
    }
}
