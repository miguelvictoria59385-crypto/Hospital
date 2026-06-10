-- Contraseña para todos es: password
-- BCrypt: $2a$10$x4wE.J92H/P.Ew4J9uP0XOgIq5v7JzZ2xP/OqR0TzN1Yx.qj4W9XG

-- Insertar Centro de Salud
INSERT INTO centro_salud (nombre, direccion, ciudad) VALUES ('Hospital Central', 'Av Siempre Viva 123', 'Bogotá');
INSERT INTO centro_salud (nombre, direccion, ciudad) VALUES ('Clínica del Norte', 'Calle 45 # 12-34', 'Medellín');

-- Insertar Usuarios (Profesional)
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Dr. House', 'house@eps.com', '$2a$10$x4wE.J92H/P.Ew4J9uP0XOgIq5v7JzZ2xP/OqR0TzN1Yx.qj4W9XG', 'PROFESIONAL');

-- Insertar Profesional (usuario_id = 1, centro_salud_id = 1)
INSERT INTO profesional (especialidad, usuario_id, centro_salud_id) VALUES ('Medicina General', 1, 1);
