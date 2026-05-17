package com.eps.hospital.controller;

import com.eps.hospital.dto.AuthRequest;
import com.eps.hospital.dto.AuthResponse;
import com.eps.hospital.model.Afiliado;
import com.eps.hospital.model.Profesional;
import com.eps.hospital.model.Rol;
import com.eps.hospital.model.Usuario;
import com.eps.hospital.repository.AfiliadoRepository;
import com.eps.hospital.repository.ProfesionalRepository;
import com.eps.hospital.repository.UsuarioRepository;
import com.eps.hospital.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AfiliadoRepository afiliadoRepository;

    @Autowired
    private ProfesionalRepository profesionalRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);
        
        Usuario usuario = usuarioRepository.findByEmail(authRequest.getEmail()).get();
        Long entityId = usuario.getId();
        
        if (usuario.getRol() == Rol.AFILIADO) {
            Afiliado af = afiliadoRepository.findByUsuarioId(usuario.getId()).orElse(null);
            if (af != null) entityId = af.getId();
        } else if (usuario.getRol() == Rol.PROFESIONAL) {
            Profesional pr = profesionalRepository.findByUsuarioId(usuario.getId()).orElse(null);
            if (pr != null) entityId = pr.getId();
        }

        return ResponseEntity.ok(new AuthResponse(jwt, usuario.getEmail(), usuario.getNombre(), usuario.getRol(), entityId));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerAfiliado(@RequestBody Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("El email ya está registrado");
        }
        
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setRol(Rol.AFILIADO);
        Usuario savedUser = usuarioRepository.save(usuario);
        
        Afiliado afiliado = new Afiliado();
        afiliado.setUsuario(savedUser);
        afiliado.setPlanSalud("BÁSICO");
        afiliadoRepository.save(afiliado);
        
        return ResponseEntity.ok("Afiliado registrado exitosamente");
    }

    @GetMapping("/hash")
    public ResponseEntity<String> getHash() {
        return ResponseEntity.ok(passwordEncoder.encode("password"));
    }
}
