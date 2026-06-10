# 📁 STRUCTURE.md — Sistema de Gestión EPS Hospital

> Guía técnica completa del proyecto. Versión actualizada a Junio 2026.

---

## 📂 Árbol de Archivos

```
Hospital1/
├── 📄 setup_database.sql          # Script completo: crea tablas + inserta datos de prueba
├── 📄 consultas.sql               # Consultas SQL analíticas (reportes)
├── 📄 DOCUMENTACION_CONSULTAS.md  # Explicación detallada de las consultas
├── 📄 README.md
├── 📄 run_sql.bat                 # Utilidad para ejecutar setup_database.sql en Windows
│
├── 📁 backend/                    # API REST — Spring Boot (Java 17)
│   ├── 📄 pom.xml                 # Dependencias Maven
│   ├── 📄 mvnw / mvnw.cmd         # Maven Wrapper (no requiere Maven instalado)
│   └── 📁 src/main/
│       ├── 📁 java/com/eps/hospital/
│       │   ├── 📄 HospitalApplication.java        # Punto de entrada Spring Boot
│       │   ├── 📁 controller/                     # Endpoints REST
│       │   │   ├── 📄 AuthController.java          # POST /api/auth/login, register
│       │   │   ├── 📄 CitaController.java           # CRUD /api/citas
│       │   │   ├── 📄 DataController.java           # CRUD /api/data (usuarios, centros...)
│       │   │   ├── 📄 FacturaController.java        # GET /api/facturas
│       │   │   ├── 📄 HistorialClinicoController.java # GET+POST /api/historial
│       │   │   └── 📄 RecetaController.java         # CRUD /api/recetas y medicamentos
│       │   ├── 📁 model/                           # Entidades JPA (mapean a tablas MySQL)
│       │   │   ├── 📄 Usuario.java
│       │   │   ├── 📄 Afiliado.java
│       │   │   ├── 📄 Profesional.java
│       │   │   ├── 📄 CentroSalud.java
│       │   │   ├── 📄 Cita.java
│       │   │   ├── 📄 HistorialClinico.java
│       │   │   ├── 📄 Factura.java
│       │   │   ├── 📄 Medicamento.java
│       │   │   ├── 📄 RecetaMedica.java
│       │   │   ├── 📄 Rol.java                     # enum: ADMINISTRATIVO, AFILIADO, PROFESIONAL
│       │   │   ├── 📄 EstadoCita.java               # enum: PROGRAMADA, COMPLETADA, CANCELADA
│       │   │   └── 📄 EstadoPago.java               # enum: PAGADA, PENDIENTE
│       │   ├── 📁 repository/                      # Interfaces JPA (acceso a datos)
│       │   │   ├── 📄 UsuarioRepository.java
│       │   │   ├── 📄 AfiliadoRepository.java
│       │   │   ├── 📄 ProfesionalRepository.java
│       │   │   ├── 📄 CentroSaludRepository.java
│       │   │   ├── 📄 CitaRepository.java
│       │   │   ├── 📄 HistorialClinicoRepository.java
│       │   │   ├── 📄 FacturaRepository.java
│       │   │   ├── 📄 MedicamentoRepository.java
│       │   │   └── 📄 RecetaMedicaRepository.java
│       │   ├── 📁 dto/                             # Objetos de transferencia
│       │   │   ├── 📄 AuthRequest.java              # { email, password }
│       │   │   └── 📄 AuthResponse.java             # { token, email, nombre, rol, entityId }
│       │   └── 📁 security/                        # Seguridad JWT
│       │       ├── 📄 SecurityConfig.java           # Filtros, CORS, rutas públicas/privadas
│       │       ├── 📄 JwtUtil.java                  # Genera y valida tokens JWT (HS256, 10h)
│       │       ├── 📄 JwtRequestFilter.java         # Intercepta cada petición HTTP
│       │       └── 📄 UserDetailsServiceImpl.java   # Carga usuario por email desde BD
│       └── 📁 resources/
│           └── 📄 application.properties            # Config: puerto, BD, JPA, JWT secret
│
└── 📁 frontend/                   # Interfaz Web — HTML + CSS + JavaScript puro
    ├── 📄 index.html              # Página de login y registro
    ├── 📄 dashboard.html          # Panel principal (tras autenticación)
    ├── 📄 app.js                  # Toda la lógica del frontend (~500 líneas)
    └── 📄 style.css               # Estilos globales (~300 líneas)
```

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│   index.html + dashboard.html + app.js           │
│   (Navegador — archivos estáticos locales)       │
└──────────────────┬──────────────────────────────┘
                   │  HTTP + JWT Token
                   │  fetch() → localhost:8080/api
                   ▼
┌─────────────────────────────────────────────────┐
│              BACKEND (Spring Boot)               │
│                  Puerto: 8080                    │
│                                                  │
│  JwtRequestFilter → Controllers → Repositories  │
│                                                  │
│  Spring Security (BCrypt + JWT HS256)            │
│  Spring Data JPA (Hibernate ORM)                 │
│  Sesión STATELESS (sin cookies/sesiones)         │
└──────────────────┬──────────────────────────────┘
                   │  JDBC (mysql-connector-j)
                   │  localhost:3306
                   ▼
┌─────────────────────────────────────────────────┐
│              BASE DE DATOS                       │
│          MySQL 8.4 — eps_hospital                │
│          9 tablas — InnoDB Engine                │
└─────────────────────────────────────────────────┘
```

### Patrón de Capas (Layered Architecture)

| Capa | Paquete | Responsabilidad |
|---|---|---|
| **Controller** | `controller/` | Recibe HTTP, valida, devuelve JSON |
| **Repository** | `repository/` | Consultas a BD vía JPA |
| **Model** | `model/` | Entidades que mapean a tablas |
| **DTO** | `dto/` | Datos de entrada/salida de Auth |
| **Security** | `security/` | JWT, BCrypt, filtros HTTP |

---

## 🔐 Sistema de Seguridad (JWT)

### Flujo de Autenticación
```
1. Cliente → POST /api/auth/login { email, password }
2. Spring Security autentica con BCrypt
3. JwtUtil genera token HS256 con expiración 10 horas
4. Cliente recibe: { token, email, nombre, rol, entityId }
5. Cliente almacena token en localStorage
6. Cada petición posterior lleva header: Authorization: Bearer <token>
7. JwtRequestFilter intercepta → valida token → permite acceso
```

### Rutas Públicas vs Protegidas
```
✅ Públicas (sin token):
   POST /api/auth/login
   POST /api/auth/register
   GET  /api/auth/hash

🔒 Protegidas (requieren JWT):
   GET/POST/PUT/DELETE /api/citas/**
   GET/POST/PUT/DELETE /api/data/**
   GET/POST            /api/historial/**
   GET/POST/PUT/DELETE /api/recetas/**
   GET                 /api/facturas/**
```

### Configuración CORS
- Permite todos los orígenes (`*`) — configurado para desarrollo
- Métodos permitidos: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Authorization, Cache-Control, Content-Type`

---

## 🌐 API REST — Endpoints Completos

### 🔑 Auth — `/api/auth`
| Método | Ruta | Descripción | Body |
|---|---|---|---|
| POST | `/login` | Iniciar sesión | `{ email, password }` |
| POST | `/register` | Registrar afiliado | `{ nombre, email, password }` |
| GET | `/hash` | Generar hash BCrypt de "password" | — |

### 📅 Citas — `/api/citas`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Todas las citas |
| GET | `/afiliado/{id}` | Citas de un afiliado |
| GET | `/profesional/{id}` | Citas de un profesional |
| POST | `/` | Agendar nueva cita |
| PUT | `/{id}/estado` | Actualizar estado de cita |

### 📊 Datos — `/api/data`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/centros` | Listar centros de salud |
| GET | `/profesionales` | Listar profesionales |
| GET | `/usuarios` | Listar todos los usuarios |
| POST | `/usuarios` | Crear usuario (admin) |
| PUT | `/usuarios/{id}` | Actualizar usuario |
| DELETE | `/usuarios/{id}` | Eliminar usuario |

### 🏥 Historial Clínico — `/api/historial`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/afiliado/{id}` | Historial de un afiliado |
| POST | `/` | Agregar registro clínico |

### 💊 Recetas y Medicamentos — `/api/recetas`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/medicamentos` | Listar medicamentos |
| POST | `/medicamentos` | Crear medicamento |
| PUT | `/medicamentos/{id}` | Actualizar medicamento |
| DELETE | `/medicamentos/{id}` | Eliminar medicamento |
| GET | `/historial/{id}` | Recetas de un historial |
| POST | `/` | Crear receta médica |

### 🧾 Facturas — `/api/facturas`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/afiliado/{id}` | Facturas de un afiliado |

---

## 🗄️ BASE DE DATOS — Análisis Profundo

### Motor y Configuración
```
Motor:    MySQL 8.4 (InnoDB)
Schema:   eps_hospital
Charset:  utf8mb4 (por defecto MySQL 8)
Collation: utf8mb4_0900_ai_ci
ORM:      Hibernate (Spring Data JPA)
DDL-Auto: update (Hibernate actualiza esquema automáticamente)
```

### Diagrama Entidad-Relación

```mermaid
erDiagram
    USUARIO {
        bigint id PK
        varchar nombre
        varchar email UK
        varchar password
        enum rol "ADMINISTRATIVO|AFILIADO|PROFESIONAL"
    }
    CENTRO_SALUD {
        bigint id PK
        varchar nombre
        varchar direccion
        varchar ciudad
    }
    AFILIADO {
        bigint id PK
        bigint usuario_id FK UK
        varchar direccion
        date fecha_nacimiento
        varchar plan_salud
        varchar telefono
    }
    PROFESIONAL {
        bigint id PK
        bigint usuario_id FK UK
        bigint centro_salud_id FK
        varchar especialidad
    }
    CITA {
        bigint id PK
        bigint afiliado_id FK
        bigint profesional_id FK
        bigint centro_salud_id FK
        datetime fecha_hora
        enum estado "PROGRAMADA|COMPLETADA|CANCELADA"
    }
    HISTORIAL_CLINICO {
        bigint id PK
        bigint afiliado_id FK
        bigint profesional_id FK
        date fecha
        text diagnostico
        text tratamiento
    }
    FACTURA {
        bigint id PK
        bigint afiliado_id FK
        date fecha_emision
        float monto
        enum estado_pago "PAGADA|PENDIENTE"
    }
    MEDICAMENTO {
        bigint id PK
        varchar nombre
        varchar descripcion
        varchar dosis_recomendada
    }
    RECETA_MEDICA {
        bigint id PK
        bigint historial_clinico_id FK
        bigint medicamento_id FK
        date fecha_emision
        varchar indicaciones
    }

    USUARIO ||--o| AFILIADO        : "tiene perfil"
    USUARIO ||--o| PROFESIONAL     : "tiene perfil"
    CENTRO_SALUD ||--o{ PROFESIONAL : "alberga"
    AFILIADO ||--o{ CITA           : "agenda"
    PROFESIONAL ||--o{ CITA        : "atiende"
    CENTRO_SALUD ||--o{ CITA       : "sede de"
    AFILIADO ||--o{ HISTORIAL_CLINICO : "posee"
    PROFESIONAL ||--o{ HISTORIAL_CLINICO : "genera"
    AFILIADO ||--o{ FACTURA        : "recibe"
    HISTORIAL_CLINICO ||--o{ RECETA_MEDICA : "contiene"
    MEDICAMENTO ||--o{ RECETA_MEDICA : "incluido en"
```

---

### Descripción Detallada de cada Tabla

#### 🧑 `usuario` — Tabla Base de Identidad
```sql
CREATE TABLE usuario (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(255) NOT NULL UNIQUE,  -- Login credential
    nombre   VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,          -- BCrypt hash
    rol      ENUM('ADMINISTRATIVO','AFILIADO','PROFESIONAL') NOT NULL
);
```
> Centraliza la autenticación. Toda persona del sistema es primero un `usuario`.
> La contraseña se almacena como hash BCrypt (nunca en texto plano).

**Datos de prueba:** 10 usuarios (1 admin + 4 profesionales + 5 afiliados)

---

#### 🏥 `centro_salud` — Sedes Médicas
```sql
CREATE TABLE centro_salud (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    ciudad    VARCHAR(255)
);
```
> Representa las sedes donde trabajan profesionales y se realizan citas.

**Datos de prueba:** 4 centros (Bogotá, Medellín, Cali, Cartagena)

---

#### 👤 `afiliado` — Pacientes del Sistema
```sql
CREATE TABLE afiliado (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id       BIGINT NOT NULL UNIQUE,    -- FK → usuario (relación 1:1)
    direccion        VARCHAR(255),
    fecha_nacimiento DATE,
    plan_salud       VARCHAR(255),              -- BÁSICO, PREMIUM, COMPLEMENTARIO
    telefono         VARCHAR(255),
    CONSTRAINT FK_afiliado_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
```
> Extiende `usuario` con datos médicos/personales del paciente.
> El UNIQUE en `usuario_id` garantiza relación 1:1 estricta.

**Datos de prueba:** 5 afiliados con planes PREMIUM, BÁSICO y COMPLEMENTARIO

---

#### 👨‍⚕️ `profesional` — Médicos y Especialistas
```sql
CREATE TABLE profesional (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id     BIGINT NOT NULL UNIQUE,      -- FK → usuario (relación 1:1)
    centro_salud_id BIGINT,                     -- FK → centro_salud
    especialidad   VARCHAR(255),
    CONSTRAINT FK_prof_usuario  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    CONSTRAINT FK_prof_centro   FOREIGN KEY (centro_salud_id) REFERENCES centro_salud(id)
);
```
> Extiende `usuario` con datos laborales del médico.

**Datos de prueba:** 4 profesionales (House, Cameron, Chase, Cuddy)

---

#### 📅 `cita` — Agenda Médica
```sql
CREATE TABLE cita (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    afiliado_id     BIGINT NOT NULL,            -- FK → afiliado
    profesional_id  BIGINT NOT NULL,            -- FK → profesional
    centro_salud_id BIGINT NOT NULL,            -- FK → centro_salud
    fecha_hora      DATETIME(6),                -- Precisión en microsegundos
    estado          ENUM('PROGRAMADA','COMPLETADA','CANCELADA'),
    CONSTRAINT FK_cita_afiliado FOREIGN KEY (afiliado_id) REFERENCES afiliado(id),
    CONSTRAINT FK_cita_prof     FOREIGN KEY (profesional_id) REFERENCES profesional(id),
    CONSTRAINT FK_cita_centro   FOREIGN KEY (centro_salud_id) REFERENCES centro_salud(id)
);
```
> Punto central del sistema. Une afiliado + profesional + lugar + tiempo.
> El `centro_salud_id` directo permite que un médico atienda en centros distintos al suyo habitual.

**Datos de prueba:** 6 citas (2 PROGRAMADAS, 2 COMPLETADAS, 1 CANCELADA)

---

#### 📋 `historial_clinico` — Expediente Médico
```sql
CREATE TABLE historial_clinico (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    afiliado_id    BIGINT NOT NULL,             -- FK → afiliado
    profesional_id BIGINT NOT NULL,             -- FK → profesional
    fecha          DATE,
    diagnostico    TEXT,                        -- Longitud ilimitada
    tratamiento    TEXT,
    CONSTRAINT FK_historial_afiliado FOREIGN KEY (afiliado_id) REFERENCES afiliado(id),
    CONSTRAINT FK_historial_prof     FOREIGN KEY (profesional_id) REFERENCES profesional(id)
);
```
> Registro permanente de cada consulta médica completada.
> Usa `TEXT` (hasta 65,535 bytes) para diagnósticos y tratamientos extensos.

**Datos de prueba:** 3 registros (gripe, lupus, fractura)

---

#### 💊 `medicamento` — Catálogo Farmacológico
```sql
CREATE TABLE medicamento (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(255) NOT NULL,
    descripcion      VARCHAR(255) NOT NULL,
    dosis_recomendada VARCHAR(255) NOT NULL
);
```
> Catálogo central de medicamentos disponibles para recetar.

**Datos de prueba:** 4 medicamentos (Paracetamol, Ibuprofeno, Amoxicilina, Loratadina)

---

#### 📜 `receta_medica` — Prescripciones
```sql
CREATE TABLE receta_medica (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    historial_clinico_id  BIGINT NOT NULL,      -- FK → historial_clinico
    medicamento_id        BIGINT NOT NULL,      -- FK → medicamento
    fecha_emision         DATE NOT NULL,
    indicaciones          VARCHAR(255) NOT NULL,
    CONSTRAINT FK_receta_historial   FOREIGN KEY (historial_clinico_id) REFERENCES historial_clinico(id),
    CONSTRAINT FK_receta_medicamento FOREIGN KEY (medicamento_id) REFERENCES medicamento(id)
);
```
> Cada registro = 1 medicamento recetado en 1 consulta.
> Para múltiples medicamentos por consulta → múltiples filas con el mismo `historial_clinico_id`.

**Datos de prueba:** 2 recetas (Paracetamol + Ibuprofeno para una consulta de gripe)

---

#### 🧾 `factura` — Gestión de Cobros
```sql
CREATE TABLE factura (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    afiliado_id   BIGINT NOT NULL,              -- FK → afiliado
    fecha_emision DATE,
    monto         FLOAT(53),                    -- Doble precisión
    estado_pago   ENUM('PAGADA','PENDIENTE'),
    CONSTRAINT FK_factura_afiliado FOREIGN KEY (afiliado_id) REFERENCES afiliado(id)
);
```
> Registro de cobros generados al afiliado.

**Datos de prueba:** 6 facturas (montos entre $30.000 y $200.000 COP)

---

### Claves Foráneas y Restricciones

| Constraint | Tabla | Columna | Referencia |
|---|---|---|---|
| `UK_email` | usuario | email | — (UNIQUE) |
| `UK_afiliado_usuario` | afiliado | usuario_id | — (UNIQUE) |
| `UK_prof_usuario` | profesional | usuario_id | — (UNIQUE) |
| `FK_afiliado_usuario` | afiliado | usuario_id | usuario.id |
| `FK_prof_usuario` | profesional | usuario_id | usuario.id |
| `FK_prof_centro` | profesional | centro_salud_id | centro_salud.id |
| `FK_cita_afiliado` | cita | afiliado_id | afiliado.id |
| `FK_cita_prof` | cita | profesional_id | profesional.id |
| `FK_cita_centro` | cita | centro_salud_id | centro_salud.id |
| `FK_historial_afiliado` | historial_clinico | afiliado_id | afiliado.id |
| `FK_historial_prof` | historial_clinico | profesional_id | profesional.id |
| `FK_factura_afiliado` | factura | afiliado_id | afiliado.id |
| `FK_receta_historial` | receta_medica | historial_clinico_id | historial_clinico.id |
| `FK_receta_medicamento` | receta_medica | medicamento_id | medicamento.id |

---

### Consultas SQL Analíticas (`consultas.sql`)

```sql
-- 1. Próximas citas de un afiliado (con médico y centro)
SELECT c.id, c.fecha_hora, p.especialidad, u.nombre AS medico, cs.nombre AS centro
FROM cita c
JOIN profesional p ON c.profesional_id = p.id
JOIN usuario u ON p.usuario_id = u.id
JOIN centro_salud cs ON c.centro_salud_id = cs.id
WHERE c.afiliado_id = 1 AND c.fecha_hora > NOW()
ORDER BY c.fecha_hora ASC;

-- 2. Diagnósticos más frecuentes por especialidad
SELECT p.especialidad, h.diagnostico, COUNT(h.id) AS frecuencia
FROM historial_clinico h
JOIN profesional p ON h.profesional_id = p.id
GROUP BY p.especialidad, h.diagnostico
ORDER BY p.especialidad, frecuencia DESC;

-- 3. Afiliados con deudas pendientes
SELECT a.id, u.nombre, u.email, f.monto, f.fecha_emision
FROM factura f
JOIN afiliado a ON f.afiliado_id = a.id
JOIN usuario u ON a.usuario_id = u.id
WHERE f.estado_pago = 'PENDIENTE';

-- 4. Facturación total por plan de salud
SELECT a.plan_salud, SUM(f.monto) AS total
FROM factura f JOIN afiliado a ON f.afiliado_id = a.id
GROUP BY a.plan_salud;

-- 5. Centros de salud más utilizados
SELECT cs.nombre, COUNT(c.id) AS total_citas
FROM cita c JOIN centro_salud cs ON c.centro_salud_id = cs.id
GROUP BY cs.id ORDER BY total_citas DESC;
```

---

## 🖥️ Frontend — Interfaz Web

### Páginas
| Archivo | Descripción |
|---|---|
| `index.html` | Login + Registro (tabs switchables) |
| `dashboard.html` | Panel principal con secciones por rol |

### Secciones del Dashboard por Rol

| Sección | AFILIADO | PROFESIONAL | ADMINISTRATIVO |
|---|---|---|---|
| Mis Citas | ✅ | ✅ | ✅ |
| Agendar Cita | ✅ | ❌ | ✅ |
| Historial Clínico | ✅ | ✅ (para sus pacientes) | ✅ |
| Recetas Médicas | ✅ (ver) | ✅ (crear) | ✅ |
| Facturas | ✅ (propias) | ❌ | ✅ |
| Gestión Usuarios | ❌ | ❌ | ✅ |
| Medicamentos | ❌ | ✅ | ✅ |

### Tecnologías Frontend
- HTML5 semántico
- CSS3 puro (sin frameworks)
- JavaScript ES6+ (fetch API, async/await, localStorage)
- Sin dependencias externas

---

## ⚙️ Configuración (`application.properties`)

```properties
# Servidor
server.port=8080

# Base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/eps_hospital
    ?createDatabaseIfNotExist=true
    &useSSL=false
    &serverTimezone=UTC
    &allowPublicKeyRetrieval=true   ← Necesario para MySQL 8 con caching_sha2_password
spring.datasource.username=root
spring.datasource.password=1234    ← Tu contraseña local

# Hibernate
spring.jpa.hibernate.ddl-auto=update   ← Actualiza schema sin borrar datos
spring.jpa.show-sql=true               ← Muestra SQL en consola (útil en dev)
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT
jwt.secret=5367566B59703373367639792F...  ← Clave HMAC-SHA256 en Base64
```

---

## 🚀 Guía de Arranque

### Prerequisitos
| Software | Versión | Estado |
|---|---|---|
| Java JDK | 17 (Temurin) | ✅ Instalado |
| MySQL Server | 8.4 | ✅ Instalado y corriendo |
| Maven | Wrapper incluido | ✅ (mvnw.cmd) |

### Iniciar los Servicios

```powershell
# 1. Verificar MySQL corriendo
Get-Service -Name "MySQL80"   # → debe decir "Running"

# 2. Iniciar backend Spring Boot
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd C:\Users\Miguel\Desktop\Hospital1\backend
.\mvnw.cmd spring-boot:run
# → Espera mensaje: "Started HospitalApplication in X.XX seconds"

# 3. Abrir frontend
# Abre en el navegador: C:\Users\Miguel\Desktop\Hospital1\frontend\index.html
```

### Credenciales de Prueba
| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| Super Admin | `admin@eps.com` | `password` | ADMINISTRATIVO |
| Dr. House | `house@eps.com` | `password` | PROFESIONAL |
| Miguel Angel | `miguel@eps.com` | `password` | AFILIADO |
| Ana María | `ana@eps.com` | `password` | AFILIADO |

---

## 📦 Dependencias Maven (`pom.xml`)

| Dependencia | Versión | Uso |
|---|---|---|
| `spring-boot-starter-webmvc` | 4.0.6 | API REST, controladores HTTP |
| `spring-boot-starter-data-jpa` | 4.0.6 | ORM con Hibernate |
| `spring-boot-starter-security` | 4.0.6 | Autenticación y autorización |
| `spring-boot-starter-validation` | 4.0.6 | Validación de beans |
| `mysql-connector-j` | 9.7.0 | Driver JDBC para MySQL |
| `lombok` | latest | Reduce boilerplate (getters/setters) |
| `jjwt-api` | 0.11.5 | Generación y validación JWT |
| `jjwt-impl` | 0.11.5 | Implementación JWT |
| `jjwt-jackson` | 0.11.5 | Serialización JWT |

---

## 🔗 Repositorio GitHub

```
https://github.com/miguelvictoria59385-crypto/Hospital
Rama principal: main
```
