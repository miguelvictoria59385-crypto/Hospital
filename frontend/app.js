const API_URL = 'http://localhost:8080/api';

// Auth functions
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active-form');
        form.classList.add('hidden-form');
    });

    if (tab === 'login') {
        document.getElementById('tabLogin').classList.add('active');
        document.getElementById('loginForm').classList.add('active-form');
        document.getElementById('loginForm').classList.remove('hidden-form');
    } else {
        document.getElementById('tabRegister').classList.add('active');
        document.getElementById('registerForm').classList.add('active-form');
        document.getElementById('registerForm').classList.remove('hidden-form');
    }
}

// Handle Login
if(document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorMsg = document.getElementById('loginError');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userName', data.nombre);
                localStorage.setItem('userRole', data.rol);
                localStorage.setItem('userId', data.id);
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.innerText = 'Credenciales incorrectas';
            }
        } catch (error) {
            errorMsg.innerText = 'Error al conectar con el servidor';
        }
    });
}

// Handle Register
if(document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const errorMsg = document.getElementById('regError');
        const successMsg = document.getElementById('regSuccess');

        errorMsg.innerText = '';
        successMsg.innerText = '';

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            if (res.ok) {
                successMsg.innerText = 'Registro exitoso. Ya puedes iniciar sesión.';
                setTimeout(() => switchTab('login'), 2000);
            } else {
                errorMsg.innerText = 'Error al registrar. Intenta otro email.';
            }
        } catch (error) {
            errorMsg.innerText = 'Error al conectar con el servidor';
        }
    });
}

// Dashboard Functions
function showSection(sectionId, fromInit = false) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden-section');
    });

    // Activate matching nav button
    const navBtn = document.getElementById('nav-' + sectionId);
    if (navBtn) navBtn.classList.add('active');
    else if (!fromInit && event && event.target) event.target.classList.add('active');

    const targetSection = document.getElementById('sec-' + sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden-section');
        targetSection.classList.add('active-section');
    }
    
    // Load Data
    if(sectionId === 'citas') loadCitas();
    if(sectionId === 'historial') loadHistorial();
    if(sectionId === 'facturas') loadFacturas();
    if(sectionId === 'agenda-doc') loadAgendaDoc();
    if(sectionId === 'pacientes-doc') loadPacientesDoc();
    if(sectionId === 'admin-resumen') loadAdminResumen();
    if(sectionId === 'admin-usuarios') loadAdminUsuarios();
    if(sectionId === 'admin-profesionales') loadAdminProfesionales();
    if(sectionId === 'admin-medicamentos') loadAdminMedicamentos();
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

async function initDashboard() {
    if (!document.getElementById('userGreeting')) return;
    
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    
    document.getElementById('userGreeting').innerText = `Bienvenid@, ${name || email}`;
    document.getElementById('userRoleBadge').innerText = role;

    // Control UI elements by role
    document.querySelectorAll('.afiliado-only').forEach(el => el.style.display = role === 'AFILIADO' ? 'block' : 'none');
    document.querySelectorAll('.profesional-only').forEach(el => el.style.display = role === 'PROFESIONAL' ? 'block' : 'none');
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = role === 'ADMINISTRATIVO' ? 'block' : 'none');

    if (role === 'AFILIADO') {
        loadCentros();
        loadProfesionales();
        loadCitasInicio();
    } else if (role === 'PROFESIONAL') {
        showSection('agenda-doc', true);
    } else if (role === 'ADMINISTRATIVO') {
        showSection('admin-resumen', true);
    }
}

function getAuthHeader() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };
}

async function loadCentros() {
    try {
        const res = await fetch(`${API_URL}/data/centros`, { headers: getAuthHeader() });
        const data = await res.json();
        const select = document.getElementById('selectCentro');
        select.innerHTML = '<option value="">Seleccione Centro</option>';
        data.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
    } catch (e) { console.error(e); }
}

async function loadProfesionales() {
    try {
        const res = await fetch(`${API_URL}/data/profesionales`, { headers: getAuthHeader() });
        const data = await res.json();
        const select = document.getElementById('selectProfesional');
        select.innerHTML = '<option value="">Seleccione Profesional</option>';
        data.forEach(p => select.innerHTML += `<option value="${p.id}">${p.especialidad} - Dr. ${p.usuario.nombre}</option>`);
    } catch (e) { console.error(e); }
}

async function loadCitasInicio() {
    try {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`${API_URL}/citas/afiliado/${userId}`, { headers: getAuthHeader() });
        const citas = await res.json();
        if (citas.length > 0) {
            document.getElementById('nextAppointment').innerText = `Cita programada para: ${new Date(citas[0].fechaHora).toLocaleString()}`;
        }
    } catch (e) { console.error(e); }
}

async function loadCitas() {
    try {
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('userRole');
        let url = `${API_URL}/citas/afiliado/${userId}`;
        if (role === 'PROFESIONAL') url = `${API_URL}/citas/profesional/${userId}`;
        
        const res = await fetch(url, { headers: getAuthHeader() });
        const citas = await res.json();
        const list = document.getElementById('listaCitas');
        list.innerHTML = '';
        if(citas.length === 0) list.innerHTML = '<li>No tienes citas programadas</li>';
        
        citas.forEach(c => {
            list.innerHTML += `<li><strong>Fecha:</strong> ${new Date(c.fechaHora).toLocaleString()} | <strong>Estado:</strong> ${c.estado}</li>`;
        });
    } catch (e) { console.error(e); }
}

async function loadHistorial() {
    try {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`${API_URL}/historial/afiliado/${userId}`, { headers: getAuthHeader() });
        const data = await res.json();
        const list = document.getElementById('listaHistorial');
        list.innerHTML = '';
        if(data.length === 0) list.innerHTML = '<li>No hay historial clínico</li>';
        
        data.forEach(h => {
            list.innerHTML += `<li><strong>Fecha:</strong> ${h.fecha} <br> <strong>Diagnóstico:</strong> ${h.diagnostico} <br> <strong>Tratamiento:</strong> ${h.tratamiento}</li>`;
        });
    } catch (e) { console.error(e); }
}

async function loadFacturas() {
    try {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`${API_URL}/facturas/afiliado/${userId}`, { headers: getAuthHeader() });
        const data = await res.json();
        const list = document.getElementById('listaFacturas');
        list.innerHTML = '';
        if(data.length === 0) list.innerHTML = '<li>No tienes facturas pendientes</li>';
        
        data.forEach(f => {
            list.innerHTML += `<li><strong>Monto:</strong> $${f.monto} | <strong>Estado:</strong> ${f.estadoPago} | <strong>Emisión:</strong> ${f.fechaEmision}</li>`;
        });
    } catch (e) { console.error(e); }
}

async function loadAgendaDoc() {
    try {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`${API_URL}/citas/profesional/${userId}`, { headers: getAuthHeader() });
        const citas = await res.json();
        const list = document.getElementById('listaAgendaDoc');
        list.innerHTML = '';
        if(citas.length === 0) list.innerHTML = '<li>No tienes citas pendientes</li>';
        
        citas.forEach(c => {
            list.innerHTML += `<li><strong>Fecha:</strong> ${new Date(c.fechaHora).toLocaleString()} | <strong>Paciente:</strong> ${c.afiliado.usuario.nombre} | <strong>Estado:</strong> ${c.estado} 
            ${c.estado === 'PROGRAMADA' ? `<button onclick="completarCita(${c.id})" class="btn-primary" style="padding: 5px 10px; font-size: 12px; margin-left: 10px;">Completar</button>` : ''}
            </li>`;
        });
    } catch (e) { console.error(e); }
}

async function completarCita(citaId) {
    try {
        await fetch(`${API_URL}/citas/${citaId}/estado`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ estado: 'COMPLETADA' })
        });
        loadAgendaDoc();
    } catch(e) { console.error(e); }
}

let pacienteSeleccionado = null;
let historialActualId = null; // Para vincular la receta

async function loadMedicamentosList() {
    try {
        const resMed = await fetch(`${API_URL}/recetas/medicamentos`, { headers: getAuthHeader() });
        const medicamentos = await resMed.json();
        const selMed = document.getElementById('selectMedicamento');
        const prevVal = selMed.value;
        selMed.innerHTML = '<option value="">Seleccione Medicamento...</option>';
        medicamentos.forEach(m => selMed.innerHTML += `<option value="${m.id}">${m.nombre} - ${m.dosisRecomendada}</option>`);
        if (prevVal) selMed.value = prevVal;
    } catch(e) { console.error(e); }
}

async function loadPacientesDoc() {
    try {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`${API_URL}/citas/profesional/${userId}`, { headers: getAuthHeader() });
        const citas = await res.json();
        
        // Extraer pacientes únicos
        const pacientesMap = new Map();
        citas.forEach(c => pacientesMap.set(c.afiliado.id, c.afiliado));
        
        const select = document.getElementById('selectPacienteDoc');
        select.innerHTML = '<option value="">Seleccione Paciente...</option>';
        pacientesMap.forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.usuario.nombre}</option>`;
        });

        // Cargar catálogo de medicamentos
        await loadMedicamentosList();

        // Cargar profesionales y centros para remisión
        const [resProf, resCen] = await Promise.all([
            fetch(`${API_URL}/data/profesionales`, { headers: getAuthHeader() }),
            fetch(`${API_URL}/data/centros`, { headers: getAuthHeader() })
        ]);
        
        const profesionales = await resProf.json();
        const centros = await resCen.json();
        
        const selProf = document.getElementById('selectProfRemision');
        selProf.innerHTML = '<option value="">Seleccione Especialista...</option>';
        profesionales.forEach(p => {
            if (p.id != userId) {
                selProf.innerHTML += `<option value="${p.id}">${p.usuario.nombre} - ${p.especialidad}</option>`;
            }
        });

        const selCen = document.getElementById('selectCentroRemision');
        selCen.innerHTML = '<option value="">Seleccione Centro...</option>';
        centros.forEach(c => selCen.innerHTML += `<option value="${c.id}">${c.nombre} (${c.ciudad})</option>`);

    } catch(e) { console.error(e); }
}

function seleccionarPaciente() {
    const val = document.getElementById('selectPacienteDoc').value;
    const panel = document.getElementById('panelAccionesPaciente');
    if (val) {
        pacienteSeleccionado = val;
        panel.style.display = 'block';
        historialActualId = null; // Reseteamos historial al cambiar de paciente
    } else {
        pacienteSeleccionado = null;
        panel.style.display = 'none';
    }
}

// Formulario de Historial Clínico
if(document.getElementById('formHistorialDoc')) {
    document.getElementById('formHistorialDoc').addEventListener('submit', async (e) => {
        e.preventDefault();
        const diagnostico = document.getElementById('diagHistorial').value;
        const tratamiento = document.getElementById('tratHistorial').value;
        const profId = localStorage.getItem('userId');
        
        const body = {
            diagnostico,
            tratamiento,
            fecha: new Date().toISOString().split('T')[0],
            afiliado: { id: pacienteSeleccionado },
            profesional: { id: profId }
        };

        try {
            const res = await fetch(`${API_URL}/historial`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });
            if(res.ok) {
                const data = await res.json();
                historialActualId = data.id; // Lo guardamos para la receta
                alert('Historial clínico guardado con éxito. Ahora puedes emitir recetas si lo deseas.');
                document.getElementById('formHistorialDoc').reset();
            } else { alert('Error al guardar historial'); }
        } catch(e) { console.error(e); }
    });
}

// Formulario de Receta Médica
if(document.getElementById('formRecetaDoc')) {
    document.getElementById('formRecetaDoc').addEventListener('submit', async (e) => {
        e.preventDefault();
        if(!historialActualId) {
            alert('Debes crear un registro de historial clínico primero en esta sesión para vincular la receta.');
            return;
        }

        const medicamentoId = document.getElementById('selectMedicamento').value;
        const indicaciones = document.getElementById('indReceta').value;

        const body = {
            fechaEmision: new Date().toISOString().split('T')[0],
            indicaciones,
            historialClinico: { id: historialActualId },
            medicamento: { id: medicamentoId }
        };

        try {
            const res = await fetch(`${API_URL}/recetas`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });
            if(res.ok) {
                alert('Receta emitida correctamente.');
                document.getElementById('formRecetaDoc').reset();
            } else { alert('Error al emitir receta'); }
        } catch(e) { console.error(e); }
    });
}

// Formulario Nuevo Medicamento
if (document.getElementById('formNuevoMed')) {
    document.getElementById('formNuevoMed').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            nombre: document.getElementById('nuevoMedNombre').value,
            descripcion: document.getElementById('nuevoMedDesc').value,
            dosisRecomendada: document.getElementById('nuevoMedDosis').value
        };

        try {
            const res = await fetch(`${API_URL}/recetas/medicamentos`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });
            if(res.ok) {
                const newMed = await res.json();
                document.getElementById('modalNuevoMed').style.display = 'none';
                document.getElementById('formNuevoMed').reset();
                await loadMedicamentosList();
                document.getElementById('selectMedicamento').value = newMed.id;
                alert('Medicamento añadido al catálogo.');
            } else { alert('Error al añadir medicamento'); }
        } catch(e) { console.error(e); }
    });
}

// Formulario Remisión
if (document.getElementById('formRemisionDoc')) {
    document.getElementById('formRemisionDoc').addEventListener('submit', async (e) => {
        e.preventDefault();
        if(!pacienteSeleccionado) return;

        const body = {
            afiliado: { id: pacienteSeleccionado },
            profesional: { id: document.getElementById('selectProfRemision').value },
            centroSalud: { id: document.getElementById('selectCentroRemision').value },
            fechaHora: document.getElementById('fechaRemision').value
        };

        try {
            const res = await fetch(`${API_URL}/citas`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });
            if (res.ok) {
                alert('Paciente remitido exitosamente (Cita Agendada).');
                document.getElementById('formRemisionDoc').reset();
            } else {
                alert('Error al agendar la remisión');
            }
        } catch(e) { console.error(e); }
    });
}

// ==================== ADMIN FUNCTIONS ====================

// ---------- RESUMEN ----------
let _adminUsuariosCache = [];
let _adminProfesionalesCache = [];
let _adminMedicamentosCache = [];

async function loadAdminResumen() {
    try {
        const [resUsers, resCitas, resProfs, resMeds] = await Promise.all([
            fetch(`${API_URL}/data/usuarios`, { headers: getAuthHeader() }),
            fetch(`${API_URL}/citas`, { headers: getAuthHeader() }),
            fetch(`${API_URL}/data/profesionales`, { headers: getAuthHeader() }),
            fetch(`${API_URL}/recetas/medicamentos`, { headers: getAuthHeader() })
        ]);
        const usuarios = await resUsers.json();
        const citas    = await resCitas.json();
        const profs    = await resProfs.json();
        const meds     = await resMeds.json();

        // Calcular estadísticas
        const afiliadosActivos = usuarios.filter(u => u.rol === 'AFILIADO').length;
        const programadas = citas.filter(c => c.estado === 'PROGRAMADA').length;
        const completadas = citas.filter(c => c.estado === 'COMPLETADA').length;

        document.getElementById('totalUsuarios').innerText = usuarios.length;
        document.getElementById('totalAfiliados').innerText = afiliadosActivos;
        document.getElementById('totalProfesionales').innerText = profs.length;
        document.getElementById('totalMedicamentos').innerText = meds.length;
        document.getElementById('totalCitas').innerText = citas.length;
        document.getElementById('citasProgramadas').innerText = programadas;
        document.getElementById('citasCompletadas').innerText = completadas;

        // Citas recientes (ordenadas de más reciente a más antigua)
        const citasOrdenadas = [...citas].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
        const citasRecientes = citasOrdenadas.slice(0, 5);
        
        renderTablaResumenCitas(citasRecientes);
        renderTablaUsuarios('tablaResumenUsuarios', usuarios, false);
    } catch(e) { console.error(e); }
}

function renderTablaResumenCitas(citas) {
    const wrap = document.getElementById('tablaResumenCitas');
    if (!citas.length) {
        wrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><p>No hay citas registradas.</p></div>`;
        return;
    }
    let html = `<table class="admin-table">
        <thead><tr>
            <th>Fecha y Hora</th><th>Paciente</th><th>Médico / Especialidad</th><th>Estado</th>
        </tr></thead><tbody>`;
    citas.forEach(c => {
        const pacienteNom = c.afiliado && c.afiliado.usuario ? c.afiliado.usuario.nombre : 'Desconocido';
        const medicoNom = c.profesional && c.profesional.usuario ? `Dr. ${c.profesional.usuario.nombre} (${c.profesional.especialidad})` : 'Desconocido';
        const estadoClase = c.estado === 'COMPLETADA' ? 'role-AFILIADO' : (c.estado === 'CANCELADA' ? 'btn-danger' : 'role-PROFESIONAL');
        html += `<tr>
            <td>${new Date(c.fechaHora).toLocaleString()}</td>
            <td>${pacienteNom}</td>
            <td>${medicoNom}</td>
            <td><span class="role-badge ${estadoClase}">${c.estado}</span></td>
        </tr>`;
    });
    html += `</tbody></table>`;
    wrap.innerHTML = html;
}

// ---------- USUARIOS ----------
async function loadAdminUsuarios() {
    try {
        const res = await fetch(`${API_URL}/data/usuarios`, { headers: getAuthHeader() });
        _adminUsuariosCache = await res.json();
        renderTablaUsuarios('tablaUsuarios', _adminUsuariosCache, true);
    } catch(e) { console.error(e); }
}

function filtrarTablaUsuarios() {
    const q = document.getElementById('buscarUsuario').value.toLowerCase();
    const filtered = _adminUsuariosCache.filter(u =>
        u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    renderTablaUsuarios('tablaUsuarios', filtered, true);
}

function renderTablaUsuarios(containerId, usuarios, conAcciones) {
    const wrap = document.getElementById(containerId);
    if (!usuarios.length) {
        wrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-users-slash"></i><p>No se encontraron usuarios.</p></div>`;
        return;
    }
    let html = `<table class="admin-table">
        <thead><tr>
            <th>#</th><th>Nombre</th><th>Email</th><th>Rol</th>
            ${conAcciones ? '<th>Acciones</th>' : ''}
        </tr></thead><tbody>`;
    usuarios.forEach(u => {
        html += `<tr>
            <td>${u.id}</td>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td><span class="role-badge role-${u.rol}">${u.rol}</span></td>
            ${conAcciones ? `<td>
                <button class="btn-secondary btn-sm" onclick="abrirModalEditarUsuario(${u.id})" style="padding: 0.4rem 0.85rem; font-size: 0.8rem; margin-right: 0.5rem;"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                <button class="btn-danger" onclick="eliminarUsuario(${u.id}, '${u.nombre}')"><i class="fa-solid fa-trash"></i> Eliminar</button>
            </td>` : ''}
        </tr>`;
    });
    html += `</tbody></table>`;
    wrap.innerHTML = html;
}

async function eliminarUsuario(id, nombre) {
    if (!confirm(`¿Seguro que quieres eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
        const res = await fetch(`${API_URL}/data/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (res.ok) {
            loadAdminUsuarios();
        } else {
            alert('No se pudo eliminar el usuario. Puede tener datos asociados.');
        }
    } catch(e) { console.error(e); }
}

function toggleFormNuevoUsuario() {
    const wrap = document.getElementById('formNuevoUsuarioWrap');
    wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
}

if (document.getElementById('formNuevoUsuario')) {
    document.getElementById('formNuevoUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('msgNuevoUsuario');
        const body = {
            nombre:   document.getElementById('nuUsuNombre').value,
            email:    document.getElementById('nuUsuEmail').value,
            password: document.getElementById('nuUsuPassword').value,
            rol:      document.getElementById('nuUsuRol').value
        };
        try {
            const res = await fetch(`${API_URL}/data/usuarios`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });
            if (res.ok) {
                msg.style.color = '#10b981';
                msg.innerText = '✅ Usuario creado exitosamente.';
                document.getElementById('formNuevoUsuario').reset();
                loadAdminUsuarios();
                setTimeout(() => { msg.innerText = ''; }, 3000);
            } else {
                const err = await res.text();
                msg.style.color = '#ef4444';
                msg.innerText = '❌ ' + err;
            }
        } catch(e) { msg.style.color = '#ef4444'; msg.innerText = 'Error de conexión.'; }
    });
}

// ---------- PROFESIONALES ----------
async function loadAdminProfesionales() {
    try {
        const res = await fetch(`${API_URL}/data/profesionales`, { headers: getAuthHeader() });
        _adminProfesionalesCache = await res.json();
        renderTablaProfesionales(_adminProfesionalesCache);
    } catch(e) { console.error(e); }
}

function filtrarTablaProfesionales() {
    const q = document.getElementById('buscarProfesional').value.toLowerCase();
    const filtered = _adminProfesionalesCache.filter(p =>
        p.usuario.nombre.toLowerCase().includes(q) ||
        (p.especialidad && p.especialidad.toLowerCase().includes(q))
    );
    renderTablaProfesionales(filtered);
}

function renderTablaProfesionales(profs) {
    const wrap = document.getElementById('tablaProfesionales');
    if (!profs.length) {
        wrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-user-doctor"></i><p>No se encontraron profesionales.</p></div>`;
        return;
    }
    let html = `<table class="admin-table">
        <thead><tr><th>#</th><th>Nombre</th><th>Email</th><th>Especialidad</th><th>Centro de Salud</th></tr></thead>
        <tbody>`;
    profs.forEach(p => {
        html += `<tr>
            <td>${p.id}</td>
            <td>${p.usuario.nombre}</td>
            <td>${p.usuario.email}</td>
            <td>${p.especialidad || '—'}</td>
            <td>${p.centroSalud ? p.centroSalud.nombre : '—'}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    wrap.innerHTML = html;
}

// ---------- MEDICAMENTOS ----------
async function loadAdminMedicamentos() {
    try {
        const res = await fetch(`${API_URL}/recetas/medicamentos`, { headers: getAuthHeader() });
        _adminMedicamentosCache = await res.json();
        renderTablaMedicamentos(_adminMedicamentosCache);
    } catch(e) { console.error(e); }
}

function filtrarTablaMedicamentos() {
    const q = document.getElementById('buscarMedicamento').value.toLowerCase();
    const filtered = _adminMedicamentosCache.filter(m =>
        m.nombre.toLowerCase().includes(q) ||
        m.descripcion.toLowerCase().includes(q)
    );
    renderTablaMedicamentos(filtered);
}

function renderTablaMedicamentos(meds) {
    const wrap = document.getElementById('tablaMedicamentos');
    if (!meds.length) {
        wrap.innerHTML = `<div class="empty-state"><i class="fa-solid fa-pills"></i><p>No se encontraron medicamentos.</p></div>`;
        return;
    }
    let html = `<table class="admin-table">
        <thead><tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Dosis Recomendada</th><th>Acciones</th></tr></thead>
        <tbody>`;
    meds.forEach(m => {
        html += `<tr>
            <td>${m.id}</td>
            <td>${m.nombre}</td>
            <td>${m.descripcion}</td>
            <td>${m.dosisRecomendada}</td>
            <td>
                <button class="btn-secondary btn-sm" onclick="abrirModalEditarMedicamento(${m.id})" style="padding: 0.4rem 0.85rem; font-size: 0.8rem; margin-right: 0.5rem;"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                <button class="btn-danger" onclick="eliminarMedicamento(${m.id}, '${m.nombre}')"><i class="fa-solid fa-trash"></i> Eliminar</button>
            </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    wrap.innerHTML = html;
}

async function eliminarMedicamento(id, nombre) {
    if (!confirm(`¿Eliminar el medicamento "${nombre}"?`)) return;
    try {
        const res = await fetch(`${API_URL}/recetas/medicamentos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (res.ok) {
            loadAdminMedicamentos();
        } else {
            alert('No se pudo eliminar. Puede estar en uso en una receta.');
        }
    } catch(e) { console.error(e); }
}

function toggleFormNuevoMed() {
    const wrap = document.getElementById('formNuevoMedAdminWrap');
    wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
}

if (document.getElementById('formNuevoMedAdmin')) {
    document.getElementById('formNuevoMedAdmin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('msgNuevoMed');
        const body = {
            nombre:           document.getElementById('adminMedNombre').value,
            descripcion:      document.getElementById('adminMedDesc').value,
            dosisRecomendada: document.getElementById('adminMedDosis').value
        };
        try {
            const res = await fetch(`${API_URL}/recetas/medicamentos`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });
            if (res.ok) {
                msg.style.color = '#10b981';
                msg.innerText = '✅ Medicamento agregado.';
                document.getElementById('formNuevoMedAdmin').reset();
                loadAdminMedicamentos();
                setTimeout(() => { msg.innerText = ''; }, 3000);
            } else {
                msg.style.color = '#ef4444';
                msg.innerText = '❌ Error al guardar.';
            }
        } catch(e) { msg.style.color = '#ef4444'; msg.innerText = 'Error de conexión.'; }
    });
}

// Legacy alias (kept for compatibility)
async function loadAdminPanel() { return loadAdminResumen(); }


// Manejar Agendamiento
if(document.getElementById('agendarCitaForm')) {
    document.getElementById('agendarCitaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const profesionalId = document.getElementById('selectProfesional').value;
        const centroSaludId = document.getElementById('selectCentro').value;
        const fechaHora = document.getElementById('citaFecha').value;
        const afiliadoId = localStorage.getItem('userId');

        const body = {
            fechaHora,
            afiliado: { id: afiliadoId },
            profesional: { id: profesionalId },
            centroSalud: { id: centroSaludId },
            estado: 'PROGRAMADA'
        };

        try {
            const res = await fetch(`${API_URL}/citas`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });
            if(res.ok) {
                alert('Cita agendada con éxito');
                loadCitas();
            } else {
                alert('Error al agendar cita');
            }
        } catch (e) {
            console.error(e);
        }
    });
}

// ---------- FUNCIONES DE EDICIÓN (MODALES Y PUT) ----------

// -- USUARIOS --
function abrirModalEditarUsuario(id) {
    const usuario = _adminUsuariosCache.find(u => u.id === id);
    if (!usuario) {
        alert('Usuario no encontrado en la caché.');
        return;
    }
    document.getElementById('editUsuId').value = usuario.id;
    document.getElementById('editUsuNombre').value = usuario.nombre;
    document.getElementById('editUsuEmail').value = usuario.email;
    document.getElementById('editUsuRol').value = usuario.rol;
    document.getElementById('editUsuPassword').value = ''; // contraseña vacía por defecto
    
    document.getElementById('modalEditUsuario').style.display = 'flex';
}

function cerrarModalEditarUsuario() {
    document.getElementById('modalEditUsuario').style.display = 'none';
    document.getElementById('formEditUsuario').reset();
}

if (document.getElementById('formEditUsuario')) {
    document.getElementById('formEditUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editUsuId').value;
        const nombre = document.getElementById('editUsuNombre').value;
        const email = document.getElementById('editUsuEmail').value;
        const password = document.getElementById('editUsuPassword').value;
        const rol = document.getElementById('editUsuRol').value;

        const body = { nombre, email, rol };
        if (password.trim() !== '') {
            body.password = password;
        }

        try {
            const res = await fetch(`${API_URL}/data/usuarios/${id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert('Usuario actualizado exitosamente.');
                cerrarModalEditarUsuario();
                loadAdminUsuarios();
            } else {
                const errMsg = await res.text();
                alert('Error al actualizar usuario: ' + errMsg);
            }
        } catch (error) {
            console.error(error);
            alert('Error de red al actualizar usuario.');
        }
    });
}

// -- MEDICAMENTOS --
function abrirModalEditarMedicamento(id) {
    const med = _adminMedicamentosCache.find(m => m.id === id);
    if (!med) {
        alert('Medicamento no encontrado en la caché.');
        return;
    }
    document.getElementById('editMedId').value = med.id;
    document.getElementById('editMedNombre').value = med.nombre;
    document.getElementById('editMedDesc').value = med.descripcion;
    document.getElementById('editMedDosis').value = med.dosisRecomendada;
    
    document.getElementById('modalEditMedicamento').style.display = 'flex';
}

function cerrarModalEditarMedicamento() {
    document.getElementById('modalEditMedicamento').style.display = 'none';
    document.getElementById('formEditMedicamento').reset();
}

if (document.getElementById('formEditMedicamento')) {
    document.getElementById('formEditMedicamento').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editMedId').value;
        const nombre = document.getElementById('editMedNombre').value;
        const descripcion = document.getElementById('editMedDesc').value;
        const dosisRecomendada = document.getElementById('editMedDosis').value;

        const body = { nombre, descripcion, dosisRecomendada };

        try {
            const res = await fetch(`${API_URL}/recetas/medicamentos/${id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert('Medicamento actualizado exitosamente.');
                cerrarModalEditarMedicamento();
                loadAdminMedicamentos();
            } else {
                alert('Error al actualizar medicamento.');
            }
        } catch (error) {
            console.error(error);
            alert('Error de red al actualizar medicamento.');
        }
    });
}
