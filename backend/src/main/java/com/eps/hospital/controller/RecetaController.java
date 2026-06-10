package com.eps.hospital.controller;

import com.eps.hospital.model.Medicamento;
import com.eps.hospital.model.RecetaMedica;
import com.eps.hospital.repository.MedicamentoRepository;
import com.eps.hospital.repository.RecetaMedicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recetas")
public class RecetaController {

    @Autowired
    private RecetaMedicaRepository recetaMedicaRepository;

    @Autowired
    private MedicamentoRepository medicamentoRepository;

    @GetMapping("/medicamentos")
    public List<Medicamento> getMedicamentos() {
        return medicamentoRepository.findAll();
    }

    @PostMapping("/medicamentos")
    public ResponseEntity<Medicamento> crearMedicamento(@RequestBody Medicamento medicamento) {
        return ResponseEntity.ok(medicamentoRepository.save(medicamento));
    }

    @GetMapping("/historial/{id}")
    public List<RecetaMedica> getRecetasByHistorial(@PathVariable Long id) {
        return recetaMedicaRepository.findByHistorialClinicoId(id);
    }

    @PostMapping
    public ResponseEntity<RecetaMedica> crearReceta(@RequestBody RecetaMedica recetaMedica) {
        return ResponseEntity.ok(recetaMedicaRepository.save(recetaMedica));
    }
}
