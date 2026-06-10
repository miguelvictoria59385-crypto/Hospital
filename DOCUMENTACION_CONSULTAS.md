# Documentación de Consultas SQL - Sistema de Gestión de EPS

Esta documentación contiene una colección de consultas SQL optimizadas para la base de datos `eps_hospital`. Están organizadas por categorías de utilidad (Gestión Médica, Administración/Finanzas y Análisis Demográfico).

---

## 📋 Índice
1. [Gestión Médica y Citas](#1-gestión-médica-y-citas)
   - [1.1 Citas Programadas por Afiliado](#11-citas-programadas-por-afiliado)
   - [1.2 Historial Clínico Completo y Tratamiento de un Paciente](#12-historial-clínico-completo-y-tratamiento-de-un-paciente)
   - [1.3 Medicamentos Más Recetados](#13-medicamentos-más-recetados)
2. [💼 Administración y Finanzas](#2-administración-y-finanzas)
   - [2.1 Estado de Cuenta y Facturación por Afiliado](#21-estado-de-cuenta-y-facturación-por-afiliado)
   - [2.2 Facturación Total y Promedio por Plan de Salud](#22-facturación-total-y-promedio-por-plan-de-salud)
   - [2.3 Ocupación y Citas por Centro de Salud](#23-ocupación-y-citas-por-centro-de-salud)
3. [📊 Análisis y Reportes Estratégicos](#3-análisis-y-reportes-estratégicos)
   - [3.1 Productividad y Citas por Profesional Médico](#31-productividad-y-citas-por-profesional-médico)
   - [3.2 Distribución Demográfica de Afiliados (Rangos de Edad)](#32-distribución-demográfica-de-afiliados-rangos-de-edad)
   - [3.3 Tasa de Cancelación de Citas por Especialidad](#33-tasa-de-cancelación-de-citas-por-especialidad)
   - [3.4 Pacientes Sin Citas Programadas (Prevención y Control)](#34-pacientes-sin-citas-programadas-prevención-y-control)

---

## 1. Gestión Médica y Citas

### 1.1 Citas Programadas por Afiliado
**Descripción:** Obtiene las citas del paciente ordenadas cronológicamente de forma ascendente.
```sql
SELECT 
    c.id AS cita_id, 
    c.fecha_hora, 
    p.especialidad, 
    u.nombre AS medico, 
    cs.nombre AS centro_salud,
    c.estado
FROM cita c
JOIN profesional p ON c.profesional_id = p.id
JOIN usuario u ON p.usuario_id = u.id
JOIN centro_salud cs ON c.centro_salud_id = cs.id
WHERE c.afiliado_id = 1 AND c.estado = 'PROGRAMADA'
ORDER BY c.fecha_hora ASC;
```
* **Tablas involucradas:** `cita` (c), `profesional` (p), `usuario` (u), `centro_salud` (cs).
* **Propósito:** Mostrar al afiliado sus próximas citas en el portal web o aplicación móvil.

---

### 1.2 Historial Clínico Completo y Tratamiento de un Paciente
**Descripción:** Muestra los diagnósticos de un paciente específico junto con las recetas, los nombres de los medicamentos y las indicaciones asignadas.
```sql
SELECT 
    hc.fecha AS fecha_consulta,
    u_med.nombre AS medico_tratante,
    prof.especialidad,
    hc.diagnostico,
    hc.tratamiento,
    m.nombre AS medicamento_recetado,
    rm.indicaciones
FROM historial_clinico hc
JOIN profesional prof ON hc.profesional_id = prof.id
JOIN usuario u_med ON prof.usuario_id = u_med.id
LEFT JOIN receta_medica rm ON rm.historial_clinico_id = hc.id
LEFT JOIN medicamento m ON rm.medicamento_id = m.id
WHERE hc.afiliado_id = 1
ORDER BY hc.fecha DESC;
```
* **Tablas involucradas:** `historial_clinico`, `profesional`, `usuario`, `receta_medica`, `medicamento`.
* **Propósito:** Ofrecer al personal de salud y al paciente una visualización de su historia clínica consolidada.

---

### 1.3 Medicamentos Más Recetados
**Descripción:** Identifica los medicamentos más solicitados y recetados en el sistema de salud.
```sql
SELECT 
    m.nombre AS medicamento,
    m.descripcion,
    COUNT(rm.id) AS total_veces_recetado
FROM receta_medica rm
JOIN medicamento m ON rm.medicamento_id = m.id
GROUP BY m.id, m.nombre, m.descripcion
ORDER BY total_veces_recetado DESC;
```
* **Tablas involucradas:** `receta_medica`, `medicamento`.
* **Propósito:** Control de inventarios en farmacias y análisis de patologías prevalentes.

---

## 2. Base de Datos: Administración y Finanzas

### 2.1 Estado de Cuenta y Facturación por Afiliado
**Descripción:** Calcula el monto total facturado, lo pagado y lo pendiente por cada afiliado.
```sql
SELECT 
    a.id AS afiliado_id,
    u.nombre AS afiliado_nombre,
    a.plan_salud,
    SUM(CASE WHEN f.estado_pago = 'PAGADA' THEN f.monto ELSE 0 END) AS total_pagado,
    SUM(CASE WHEN f.estado_pago = 'PENDIENTE' THEN f.monto ELSE 0 END) AS total_pendiente,
    SUM(f.monto) AS total_facturado
FROM afiliado a
JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN factura f ON f.afiliado_id = a.id
GROUP BY a.id, u.nombre, a.plan_salud
ORDER BY total_pendiente DESC;
```
* **Tablas involucradas:** `afiliado`, `usuario`, `factura`.
* **Propósito:** Generar reportes de cartera y auditoría financiera de cobros.

---

### 2.2 Facturación Total y Promedio por Plan de Salud
**Descripción:** Agrupa la facturación por tipo de plan de salud (`BÁSICO`, `PREMIUM`, `COMPLEMENTARIO`) para comparar los ingresos promedio por plan.
```sql
SELECT 
    a.plan_salud,
    COUNT(DISTINCT a.id) AS total_afiliados,
    SUM(f.monto) AS ingresos_totales,
    ROUND(AVG(f.monto), 2) AS promedio_por_factura
FROM factura f
JOIN afiliado a ON f.afiliado_id = a.id
GROUP BY a.plan_salud
ORDER BY ingresos_totales DESC;
```
* **Tablas involucradas:** `factura`, `afiliado`.
* **Propósito:** Tomar decisiones sobre el costo de planes y la viabilidad de los modelos comerciales.

---

### 2.3 Ocupación y Citas por Centro de Salud
**Descripción:** Lista el volumen total de citas gestionadas en cada IPS/Centro de salud.
```sql
SELECT 
    cs.nombre AS centro_salud,
    cs.ciudad,
    COUNT(c.id) AS total_citas_gestionadas,
    SUM(CASE WHEN c.estado = 'COMPLETADA' THEN 1 ELSE 0 END) AS citas_completadas,
    SUM(CASE WHEN c.estado = 'CANCELADA' THEN 1 ELSE 0 END) AS citas_canceladas
FROM centro_salud cs
LEFT JOIN cita c ON c.centro_salud_id = cs.id
GROUP BY cs.id, cs.nombre, cs.ciudad
ORDER BY total_citas_gestionadas DESC;
```
* **Tablas involucradas:** `centro_salud`, `cita`.
* **Propósito:** Analizar la saturación física de cada sede.

---

## 3. Análisis y Reportes Estratégicos

### 3.1 Productividad y Citas por Profesional Médico
**Descripción:** Cuenta el número de citas atendidas de forma exitosa por cada médico.
```sql
SELECT 
    u.nombre AS medico,
    p.especialidad,
    COUNT(c.id) AS citas_atendidas
FROM profesional p
JOIN usuario u ON p.usuario_id = u.id
JOIN cita c ON c.profesional_id = p.id
WHERE c.estado = 'COMPLETADA'
GROUP BY p.id, u.nombre, p.especialidad
ORDER BY citas_atendidas DESC;
```
* **Tablas involucradas:** `profesional`, `usuario`, `cita`.
* **Propósito:** Evaluación de desempeño clínico del personal médico.

---

### 3.2 Distribución Demográfica de Afiliados (Rangos de Edad)
**Descripción:** Clasifica a los afiliados en grupos etarios calculando su edad a partir de la fecha de nacimiento.
```sql
SELECT 
    CASE 
        WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) < 18 THEN 'Niños y Adolescentes (<18)'
        WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 18 AND 34 THEN 'Jóvenes Adultos (18-34)'
        WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 35 AND 64 THEN 'Adultos (35-64)'
        ELSE 'Adultos Mayores (65+)'
    END AS grupo_etario,
    COUNT(*) AS cantidad_afiliados
FROM afiliado
GROUP BY grupo_etario
ORDER BY cantidad_afiliados DESC;
```
* **Tablas involucradas:** `afiliado`.
* **Propósito:** Conocer el público objetivo de la EPS para campañas de prevención y promoción de la salud.

---

### 3.3 Tasa de Cancelación de Citas por Especialidad
**Descripción:** Mide la relación entre citas canceladas frente a citas programadas totales por especialidad.
```sql
SELECT 
    p.especialidad,
    COUNT(c.id) AS total_citas,
    SUM(CASE WHEN c.estado = 'CANCELADA' THEN 1 ELSE 0 END) AS citas_canceladas,
    ROUND((SUM(CASE WHEN c.estado = 'CANCELADA' THEN 1 ELSE 0 END) / COUNT(c.id)) * 100, 2) AS porcentaje_cancelacion
FROM cita c
JOIN profesional p ON c.profesional_id = p.id
GROUP BY p.especialidad
ORDER BY porcentaje_cancelacion DESC;
```
* **Tablas involucradas:** `cita`, `profesional`.
* **Propósito:** Evaluar y reducir el ausentismo en consultas externas críticas.

---

### 3.4 Pacientes Sin Citas Programadas (Prevención y Control)
**Descripción:** Detecta afiliados activos que no tienen ninguna cita programada a futuro para seguimiento médico.
```sql
SELECT 
    a.id AS afiliado_id,
    u.nombre AS paciente,
    u.email,
    a.telefono
FROM afiliado a
JOIN usuario u ON a.usuario_id = u.id
WHERE a.id NOT IN (
    SELECT DISTINCT afiliado_id 
    FROM cita 
    WHERE estado = 'PROGRAMADA' AND fecha_hora >= NOW()
);
```
* **Tablas involucradas:** `afiliado`, `usuario`, `cita`.
* **Propósito:** Identificar y contactar pacientes con enfermedades crónicas para agendar controles de salud preventivos.
