CREATE DATABASE IF NOT EXISTS eps_hospital;
USE eps_hospital;

-- Eliminar tablas si existen (para empezar desde cero limpiamente)
DROP TABLE IF EXISTS receta_medica;
DROP TABLE IF EXISTS medicamento;
DROP TABLE IF EXISTS historial_clinico;
DROP TABLE IF EXISTS factura;
DROP TABLE IF EXISTS cita;
DROP TABLE IF EXISTS profesional;
DROP TABLE IF EXISTS afiliado;
DROP TABLE IF EXISTS centro_salud;
DROP TABLE IF EXISTS usuario;

-- 1. Crear Tablas
CREATE TABLE usuario (
    id bigint not null auto_increment, 
    email varchar(255) not null, 
    nombre varchar(255) not null, 
    password varchar(255) not null, 
    rol enum ('ADMINISTRATIVO','AFILIADO','PROFESIONAL') not null, 
    primary key (id),
    constraint UK_email unique (email)
) engine=InnoDB;

CREATE TABLE centro_salud (
    id bigint not null auto_increment, 
    ciudad varchar(255), 
    direccion varchar(255), 
    nombre varchar(255) not null, 
    primary key (id)
) engine=InnoDB;

CREATE TABLE afiliado (
    id bigint not null auto_increment, 
    direccion varchar(255), 
    fecha_nacimiento date, 
    plan_salud varchar(255), 
    telefono varchar(255), 
    usuario_id bigint not null, 
    primary key (id),
    constraint UK_afiliado_usuario unique (usuario_id),
    constraint FK_afiliado_usuario foreign key (usuario_id) references usuario (id)
) engine=InnoDB;

CREATE TABLE profesional (
    id bigint not null auto_increment, 
    especialidad varchar(255), 
    centro_salud_id bigint, 
    usuario_id bigint not null, 
    primary key (id),
    constraint UK_prof_usuario unique (usuario_id),
    constraint FK_prof_centro foreign key (centro_salud_id) references centro_salud (id),
    constraint FK_prof_usuario foreign key (usuario_id) references usuario (id)
) engine=InnoDB;

CREATE TABLE cita (
    id bigint not null auto_increment, 
    estado enum ('CANCELADA','COMPLETADA','PROGRAMADA'), 
    fecha_hora datetime(6), 
    afiliado_id bigint not null, 
    centro_salud_id bigint not null, 
    profesional_id bigint not null, 
    primary key (id),
    constraint FK_cita_afiliado foreign key (afiliado_id) references afiliado (id),
    constraint FK_cita_centro foreign key (centro_salud_id) references centro_salud (id),
    constraint FK_cita_prof foreign key (profesional_id) references profesional (id)
) engine=InnoDB;

CREATE TABLE factura (
    id bigint not null auto_increment, 
    estado_pago enum ('PAGADA','PENDIENTE'), 
    fecha_emision date, 
    monto float(53), 
    afiliado_id bigint not null, 
    primary key (id),
    constraint FK_factura_afiliado foreign key (afiliado_id) references afiliado (id)
) engine=InnoDB;

CREATE TABLE historial_clinico (
    id bigint not null auto_increment, 
    diagnostico TEXT, 
    fecha date, 
    tratamiento TEXT, 
    afiliado_id bigint not null, 
    profesional_id bigint not null, 
    primary key (id),
    constraint FK_historial_afiliado foreign key (afiliado_id) references afiliado (id),
    constraint FK_historial_prof foreign key (profesional_id) references profesional (id)
) engine=InnoDB;


CREATE TABLE medicamento (
    id bigint not null auto_increment,
    descripcion varchar(255) not null,
    dosis_recomendada varchar(255) not null,
    nombre varchar(255) not null,
    primary key (id)
) engine=InnoDB;

CREATE TABLE receta_medica (
    id bigint not null auto_increment,
    fecha_emision date not null,
    indicaciones varchar(255) not null,
    historial_clinico_id bigint not null,
    medicamento_id bigint not null,
    primary key (id),
    constraint FK_receta_historial foreign key (historial_clinico_id) references historial_clinico (id),
    constraint FK_receta_medicamento foreign key (medicamento_id) references medicamento (id)
) engine=InnoDB;

-- 2. Insertar Datos Iniciales

-- Todas las cuentas usan la contraseña: password
SET @pass = '$2a$10$4/rPeRn1.LBnRm4cAtEIKeu04rgXiEK/JgWjunvydDjux8Ca3Fi5G';

-- =============== USUARIOS ===============
-- Administrador
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Super Admin', 'admin@eps.com', @pass, 'ADMINISTRATIVO');

-- Profesionales
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Dr. Gregory House', 'house@eps.com', @pass, 'PROFESIONAL');
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Dra. Allison Cameron', 'cameron@eps.com', @pass, 'PROFESIONAL');
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Dr. Robert Chase', 'chase@eps.com', @pass, 'PROFESIONAL');
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Dra. Lisa Cuddy', 'cuddy@eps.com', @pass, 'PROFESIONAL');

-- Afiliados
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Miguel Angel', 'miguel@eps.com', @pass, 'AFILIADO');
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Ana María López', 'ana@eps.com', @pass, 'AFILIADO');
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Carlos Ramirez', 'carlos@eps.com', @pass, 'AFILIADO');
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Laura Gómez', 'laura@eps.com', @pass, 'AFILIADO');
INSERT INTO usuario (nombre, email, password, rol) VALUES ('Pedro Pascal', 'pedro@eps.com', @pass, 'AFILIADO');

-- =============== CENTROS DE SALUD ===============
INSERT INTO centro_salud (nombre, direccion, ciudad) VALUES ('Hospital Central', 'Av Siempre Viva 123', 'Bogotá');
INSERT INTO centro_salud (nombre, direccion, ciudad) VALUES ('Clínica del Norte', 'Calle 45 # 12-34', 'Medellín');
INSERT INTO centro_salud (nombre, direccion, ciudad) VALUES ('Centro Médico Especializado', 'Carrera 7 # 100-20', 'Cali');
INSERT INTO centro_salud (nombre, direccion, ciudad) VALUES ('Clínica San José', 'Av Principal 400', 'Cartagena');

-- =============== PROFESIONALES ===============
-- id 1: Dr. House (Infectología, Hospital Central - 1)
INSERT INTO profesional (especialidad, usuario_id, centro_salud_id) VALUES ('Infectología', 1, 1);
-- id 2: Dra. Cameron (Inmunología, Clínica del Norte - 2)
INSERT INTO profesional (especialidad, usuario_id, centro_salud_id) VALUES ('Inmunología', 2, 2);
-- id 3: Dr. Chase (Cirugía, Centro Médico - 3)
INSERT INTO profesional (especialidad, usuario_id, centro_salud_id) VALUES ('Cirugía General', 3, 3);
-- id 4: Dra. Cuddy (Endocrinología, Hospital Central - 1)
INSERT INTO profesional (especialidad, usuario_id, centro_salud_id) VALUES ('Endocrinología', 4, 1);

-- =============== AFILIADOS ===============
-- (id 1 a 5) = usuario_id 5 a 9
INSERT INTO afiliado (direccion, fecha_nacimiento, plan_salud, telefono, usuario_id) VALUES ('Calle 10', '1990-05-15', 'PREMIUM', '3001234567', 5);
INSERT INTO afiliado (direccion, fecha_nacimiento, plan_salud, telefono, usuario_id) VALUES ('Cra 20', '1985-08-20', 'BÁSICO', '3109876543', 6);
INSERT INTO afiliado (direccion, fecha_nacimiento, plan_salud, telefono, usuario_id) VALUES ('Av 30', '1992-12-01', 'COMPLEMENTARIO', '3205554433', 7);
INSERT INTO afiliado (direccion, fecha_nacimiento, plan_salud, telefono, usuario_id) VALUES ('Diag 40', '1978-03-10', 'PREMIUM', '3157778899', 8);
INSERT INTO afiliado (direccion, fecha_nacimiento, plan_salud, telefono, usuario_id) VALUES ('Transv 50', '2000-01-25', 'BÁSICO', '3182223344', 9);

-- =============== CITAS ===============
-- Programadas, Completadas, Canceladas
INSERT INTO cita (estado, fecha_hora, afiliado_id, centro_salud_id, profesional_id) VALUES ('PROGRAMADA', '2026-06-15 10:00:00', 1, 1, 1);
INSERT INTO cita (estado, fecha_hora, afiliado_id, centro_salud_id, profesional_id) VALUES ('COMPLETADA', '2026-04-10 14:30:00', 1, 2, 2);
INSERT INTO cita (estado, fecha_hora, afiliado_id, centro_salud_id, profesional_id) VALUES ('PROGRAMADA', '2026-06-20 09:00:00', 2, 3, 3);
INSERT INTO cita (estado, fecha_hora, afiliado_id, centro_salud_id, profesional_id) VALUES ('CANCELADA', '2026-05-01 11:00:00', 3, 1, 4);
INSERT INTO cita (estado, fecha_hora, afiliado_id, centro_salud_id, profesional_id) VALUES ('COMPLETADA', '2026-03-25 08:15:00', 4, 1, 1);
INSERT INTO cita (estado, fecha_hora, afiliado_id, centro_salud_id, profesional_id) VALUES ('PROGRAMADA', '2026-07-10 16:45:00', 5, 2, 2);

-- =============== HISTORIAL CLÍNICO ===============
INSERT INTO historial_clinico (diagnostico, fecha, tratamiento, afiliado_id, profesional_id) 
VALUES ('Gripe estacional severa', '2026-04-10', 'Descanso, hidratación y paracetamol cada 8 horas.', 1, 2);

INSERT INTO historial_clinico (diagnostico, fecha, tratamiento, afiliado_id, profesional_id) 
VALUES ('Lupus', '2026-03-25', 'Iniciar inmunosupresores y control mensual en reumatología.', 4, 1);

INSERT INTO historial_clinico (diagnostico, fecha, tratamiento, afiliado_id, profesional_id) 
VALUES ('Fractura de clavícula', '2025-11-20', 'Inmovilización por 6 semanas y cirugía de reducción.', 3, 3);

-- =============== FACTURAS ===============
INSERT INTO factura (estado_pago, fecha_emision, monto, afiliado_id) VALUES ('PENDIENTE', '2026-05-01', 50000.0, 1);
INSERT INTO factura (estado_pago, fecha_emision, monto, afiliado_id) VALUES ('PAGADA', '2026-04-15', 120000.0, 1);
INSERT INTO factura (estado_pago, fecha_emision, monto, afiliado_id) VALUES ('PENDIENTE', '2026-05-10', 85000.0, 2);
INSERT INTO factura (estado_pago, fecha_emision, monto, afiliado_id) VALUES ('PAGADA', '2026-02-28', 200000.0, 3);
INSERT INTO factura (estado_pago, fecha_emision, monto, afiliado_id) VALUES ('PENDIENTE', '2026-05-17', 45000.0, 4);
INSERT INTO factura (estado_pago, fecha_emision, monto, afiliado_id) VALUES ('PENDIENTE', '2026-05-17', 30000.0, 5);

-- =============== MEDICAMENTOS ===============
INSERT INTO medicamento (nombre, descripcion, dosis_recomendada) VALUES ('Paracetamol 500mg', 'Analgésico y antipirético', '1 tableta cada 8 horas');
INSERT INTO medicamento (nombre, descripcion, dosis_recomendada) VALUES ('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', '1 tableta cada 8 horas con comida');
INSERT INTO medicamento (nombre, descripcion, dosis_recomendada) VALUES ('Amoxicilina 500mg', 'Antibiótico de amplio espectro', '1 cápsula cada 8 horas por 7 días');
INSERT INTO medicamento (nombre, descripcion, dosis_recomendada) VALUES ('Loratadina 10mg', 'Antihistamínico', '1 tableta al día');

-- =============== RECETAS MÉDICAS ===============
INSERT INTO receta_medica (fecha_emision, indicaciones, historial_clinico_id, medicamento_id) VALUES ('2026-04-10', 'Tomar para fiebre', 1, 1);
INSERT INTO receta_medica (fecha_emision, indicaciones, historial_clinico_id, medicamento_id) VALUES ('2026-04-10', 'Tomar para el dolor si es necesario', 1, 2);
