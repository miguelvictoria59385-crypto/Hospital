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

    // Si es Afiliado, cargamos centros y profesionales
    if (role === 'AFILIADO') {
        loadCentros();
        loadProfesionales();
        loadCitasInicio();
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
