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
function showSection(sectionId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden-section');
    });

    event.target.classList.add('active');
    const targetSection = document.getElementById('sec-' + sectionId);
    targetSection.classList.remove('hidden-section');
    targetSection.classList.add('active-section');
    
    // Load Data
    if(sectionId === 'citas') loadCitas();
    if(sectionId === 'historial') loadHistorial();
    if(sectionId === 'facturas') loadFacturas();
    if(sectionId === 'agenda-doc') loadAgendaDoc();
    if(sectionId === 'pacientes-doc') loadPacientesDoc();
    if(sectionId === 'admin') loadAdminPanel();
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
        showSection('agenda-doc');
    } else if (role === 'ADMINISTRATIVO') {
        showSection('admin');
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

async function loadAdminPanel() {
    try {
        const resUsers = await fetch(`${API_URL}/data/usuarios`, { headers: getAuthHeader() });
        const usuarios = await resUsers.json();
        document.getElementById('totalUsuarios').innerText = usuarios.length;
        
        const list = document.getElementById('listaTodosUsuarios');
        list.innerHTML = '';
        usuarios.forEach(u => {
            list.innerHTML += `<li><strong>Nombre:</strong> ${u.nombre} | <strong>Email:</strong> ${u.email} | <strong>Rol:</strong> ${u.rol}</li>`;
        });
        
        const resCitas = await fetch(`${API_URL}/citas`, { headers: getAuthHeader() });
        const citas = await resCitas.json();
        document.getElementById('totalCitas').innerText = citas.length;
        
    } catch(e) { console.error(e); }
}


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
