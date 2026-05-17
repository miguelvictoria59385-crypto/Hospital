package com.eps.hospital.controller;

import com.eps.hospital.model.CentroSalud;
import com.eps.hospital.model.Profesional;
import com.eps.hospital.repository.CentroSaludRepository;
import com.eps.hospital.repository.ProfesionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/data")
public class DataController {

    @Autowired
    private CentroSaludRepository centroSaludRepository;

    @Autowired
    private ProfesionalRepository profesionalRepository;

    @GetMapping("/centros")
    public List<CentroSalud> getCentrosSalud() {
        return centroSaludRepository.findAll();
    }

    @GetMapping("/profesionales")
    public List<Profesional> getProfesionales() {
        return profesionalRepository.findAll();
    }
}
