# Consultas SQL para Sistema de Gestión EPS

-- 1. Citas próximas de un afiliado (Por ejemplo, afiliado_id = 1)
SELECT c.id AS cita_id, c.fecha_hora, p.especialidad, u.nombre AS medico, cs.nombre AS centro_salud
FROM cita c
JOIN profesional p ON c.profesional_id = p.id
JOIN usuario u ON p.usuario_id = u.id
JOIN centro_salud cs ON c.centro_salud_id = cs.id
WHERE c.afiliado_id = 1 AND c.fecha_hora > NOW()
ORDER BY c.fecha_hora ASC;

-- 2. Diagnósticos frecuentes por especialidad médica
SELECT p.especialidad, h.diagnostico, COUNT(h.id) AS frecuencia
FROM historial_clinico h
JOIN profesional p ON h.profesional_id = p.id
GROUP BY p.especialidad, h.diagnostico
ORDER BY p.especialidad, frecuencia DESC;

-- 3. Afiliados con facturas pendientes
SELECT a.id AS afiliado_id, u.nombre, u.email, f.monto, f.fecha_emision
FROM factura f
JOIN afiliado a ON f.afiliado_id = a.id
JOIN usuario u ON a.usuario_id = u.id
WHERE f.estado_pago = 'PENDIENTE';

-- 4. Facturación total por plan de salud
SELECT a.plan_salud, SUM(f.monto) AS facturacion_total
FROM factura f
JOIN afiliado a ON f.afiliado_id = a.id
GROUP BY a.plan_salud;

-- 5. Centros más utilizados para citas
SELECT cs.nombre AS centro_salud, COUNT(c.id) AS total_citas
FROM cita c
JOIN centro_salud cs ON c.centro_salud_id = cs.id
GROUP BY cs.id, cs.nombre
ORDER BY total_citas DESC;
