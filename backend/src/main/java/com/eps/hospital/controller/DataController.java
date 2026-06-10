package com.eps.hospital.controller;

import com.eps.hospital.model.CentroSalud;
import com.eps.hospital.model.Profesional;
import com.eps.hospital.model.Usuario;
import com.eps.hospital.repository.CentroSaludRepository;
import com.eps.hospital.repository.ProfesionalRepository;
import com.eps.hospital.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data")
public class DataController {

    @Autowired
    private CentroSaludRepository centroSaludRepository;

    @Autowired
    private ProfesionalRepository profesionalRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/centros")
    public List<CentroSalud> getCentrosSalud() {
        return centroSaludRepository.findAll();
    }

    @GetMapping("/profesionales")
    public List<Profesional> getProfesionales() {
        return profesionalRepository.findAll();
    }

    @GetMapping("/usuarios")
    public List<Usuario> getUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("El email ya está registrado");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok("Usuario eliminado");
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioRepository.findById(id).map(u -> {
            u.setNombre(usuario.getNombre());
            u.setEmail(usuario.getEmail());
            if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
                u.setPassword(passwordEncoder.encode(usuario.getPassword()));
            }
            if (usuario.getRol() != null) {
                u.setRol(usuario.getRol());
            }
            return ResponseEntity.ok(usuarioRepository.save(u));
        }).orElse(ResponseEntity.notFound().build());
    }
}
