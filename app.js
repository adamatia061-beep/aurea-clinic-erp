// --- INITIAL MOCK DATA STORAGE ---
const initialServices = [
    { code: "SRV-101", name: "تنظيف وتقشير البشرة العميق", category: "جلدية وتجميل", duration: 45, price: 350, active: true },
    { code: "SRV-102", name: "جلسة تبييض الأسنان بالليزر", category: "أسنان", duration: 60, price: 800, active: true },
    { code: "SRV-103", name: "جلسة علاج طبيعي للظهر", category: "علاج طبيعي", duration: 50, price: 300, active: true },
    { code: "SRV-104", name: "استشارة جلدية تخصصية", category: "استشارات طبية", duration: 30, price: 250, active: true }
];

const initialBookings = [
    { id: "BK-801", patient: "مريم علي", service: "تنظيف وتقشير البشرة العميق", specialist: "د. سارة الشامسي", time: "10:30 صباحاً", status: "جاري الإجراء" },
    { id: "BK-802", patient: "خالد عبد الله", service: "جلسة تبييض الأسنان بالليزر", specialist: "د. عمر المهيري", time: "11:15 صباحاً", status: "مؤكد" },
    { id: "BK-803", patient: "فاطمة حسن", service: "جلسة علاج طبيعي للظهر", specialist: "د. يوسف الحوسني", time: "01:00 ظهراً", status: "مكتمل" }
];

const initialInvoices = [
    { id: "INV-2026-01", patient: "مريم علي", service: "تنظيف وتقشير البشرة العميق", amount: 350, vat: 17.5, total: 367.5, status: "مدفوع" },
    { id: "INV-2026-02", patient: "خالد عبد الله", service: "جلسة تبييض الأسنان بالليزر", amount: 800, vat: 40, total: 840, status: "معلق" }
];

// Local Storage Setup
let services = JSON.parse(localStorage.getItem('aurea_services')) || initialServices;
let bookings = JSON.parse(localStorage.getItem('aurea_bookings')) || initialBookings;
let invoices = JSON.parse(localStorage.getItem('aurea_invoices')) || initialInvoices;
let reports = JSON.parse(localStorage.getItem('aurea_reports')) || [];

// Save Helper
function saveData() {
    localStorage.setItem('aurea_services', JSON.stringify(services));
    localStorage.setItem('aurea_bookings', JSON.stringify(bookings));
    localStorage.setItem('aurea_invoices', JSON.stringify(invoices));
    localStorage.setItem('aurea_reports', JSON.stringify(reports));
}

// LOGIN HANDLER
function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('user-role').value;
    const roleMap = {
        'admin': 'مدير النظام',
        'specialist': 'دكتور / أخصائي',
        'reception': 'موظف الاستقبال'
    };
    
    document.getElementById('nav-user-role').innerText = roleMap[role];
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    
    initApp();
}

function setPreset(email, role) {
    document.getElementById('username').value = email;
    document.getElementById('user-role').value = role;
}

function logout() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

// TAB NAVIGATION
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(el => el.classList.remove('active'));

    document.getElementById(`tab-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// INIT APPLICATION VIEW
function initApp() {
    renderServices();
    renderBookings();
    renderInvoices();
    renderDashboard();
    populateReportServiceOptions();
    initCharts();
}

// RENDER SERVICES
function renderServices() {
    const search = document.getElementById('service-search').value.toLowerCase();
    const cat = document.getElementById('service-category-filter').value;
    const tbody = document.getElementById('services-table-body');
    tbody.innerHTML = '';

    const filtered = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search) || s.code.toLowerCase().includes(search);
        const matchesCat = cat === 'ALL' || s.category === cat;
        return matchesSearch && matchesCat;
    });

    filtered.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${s.code}</strong></td>
                <td>${s.name}</td>
                <td><span class="badge badge-info">${s.category}</span></td>
                <td>${s.duration} دقيقة</td>
                <td><strong>${s.price} AED</strong></td>
                <td><span class="badge ${s.active ? 'badge-success' : 'badge-warning'}">${s.active ? 'متاح' : 'متوقف'}</span></td>
                <td>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;">تعديل</button>
                </td>
            </tr>
        `;
    });

    document.getElementById('kpi-total-services').innerText = `${services.length} خدمة`;
}

// RENDER BOOKINGS
function renderBookings() {
    const tbody = document.getElementById('bookings-table-body');
    tbody.innerHTML = '';

    bookings.forEach(b => {
        let badgeClass = 'badge-info';
        if (b.status === 'مكتمل') badgeClass = 'badge-success';
        if (b.status === 'جاري الإجراء') badgeClass = 'badge-warning';

        tbody.innerHTML += `
            <tr>
                <td><strong>${b.id}</strong></td>
                <td>${b.patient}</td>
                <td>${b.service}</td>
                <td>${b.specialist}</td>
                <td>${b.time}</td>
                <td><span class="badge ${badgeClass}">${b.status}</span></td>
                <td>
                    <select class="soft-input" style="padding:4px;" onchange="updateBookingStatus('${b.id}', this.value)">
                        <option value="مؤكد" ${b.status==='مؤكد'?'selected':''}>مؤكد</option>
                        <option value="جاري الإجراء" ${b.status==='جاري الإجراء'?'selected':''}>جاري الإجراء</option>
                        <option value="مكتمل" ${b.status==='مكتمل'?'selected':''}>مكتمل</option>
                    </select>
                </td>
            </tr>
        `;
    });
}

function updateBookingStatus(id, newStatus) {
    const booking = bookings.find(b => b.id === id);
    if(booking) {
        booking.status = newStatus;
        saveData();
        renderBookings();
        renderDashboard();
    }
}

// RENDER DASHBOARD
function renderDashboard() {
    const tbody = document.getElementById('dash-today-table');
    tbody.innerHTML = '';

    bookings.slice(0, 3).forEach(b => {
        tbody.innerHTML += `
            <tr>
                <td>${b.time}</td>
                <td><strong>${b.patient}</strong></td>
                <td>${b.service}</td>
                <td>${b.specialist}</td>
                <td><span class="badge badge-info">${b.status}</span></td>
            </tr>
        `;
    });

    document.getElementById('kpi-today-sessions').innerText = `${bookings.length} جلسة`;
}

// RENDER INVOICES
function renderInvoices() {
    const tbody = document.getElementById('invoices-table-body');
    tbody.innerHTML = '';

    invoices.forEach(inv => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${inv.id}</strong></td>
                <td>${inv.patient}</td>
                <td>${inv.service}</td>
                <td>${inv.amount} AED</td>
                <td>${inv.vat} AED</td>
                <td><strong>${inv.total} AED</strong></td>
                <td><span class="badge ${inv.status === 'مدفوع' ? 'badge-success' : 'badge-warning'}">${inv.status}</span></td>
                <td>
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="alert('جار طباعة الفاتورة الرقمية...')"><i class="fa-solid fa-print"></i></button>
                </td>
            </tr>
        `;
    });
}

// POPULATE REPORT SERVICE DROPDOWN
function populateReportServiceOptions() {
    const select = document.getElementById('rep-service-select');
    select.innerHTML = '';
    services.forEach(s => {
        select.innerHTML += `<option value="${s.name}">${s.name} (${s.price} AED)</option>`;
    });
}

// SAVE REPORT
function saveSessionReport(e) {
    e.preventDefault();
    const newReport = {
        id: "REP-" + Math.floor(1000 + Math.random() * 9000),
        patient: document.getElementById('rep-patient-name').value,
        service: document.getElementById('rep-service-select').value,
        doctor: document.getElementById('rep-doctor-name').value,
        notes: document.getElementById('rep-notes').value,
        recommendations: document.getElementById('rep-recommendations').value,
        date: new Date().toLocaleDateString('ar-AE')
    };

    reports.unshift(newReport);
    saveData();
    renderSavedReports();
    alert('تم حفظ تقرير الجلسة بنجاح!');
    document.getElementById('report-form').reset();
}

function renderSavedReports() {
    const list = document.getElementById('saved-reports-list');
    list.innerHTML = '';

    reports.forEach(r => {
        list.innerHTML += `
            <div style="background:#f8fafc; padding:12px; border-radius:10px; margin-bottom:10px; border:1px solid #e2e8f0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong>${r.patient}</strong>
                    <span style="font-size:0.8rem; color:#64748b;">${r.date}</span>
                </div>
                <p style="font-size:0.85rem; color:#334155;">الخدمة: ${r.service}</p>
            </div>
        `;
    });
}

// MODAL CONTROLS
function openAddServiceModal() { document.getElementById('modal-service').style.display = 'flex'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

function saveNewService(e) {
    e.preventDefault();
    const name = document.getElementById('new-service-name').value;
    const category = document.getElementById('new-service-cat').value;
    const duration = document.getElementById('new-service-duration').value;
    const price = document.getElementById('new-service-price').value;

    const newSrv = {
        code: "SRV-" + Math.floor(100 + Math.random() * 900),
        name, category, duration, price: Number(price), active: true
    };

    services.push(newSrv);
    saveData();
    renderServices();
    closeModal('modal-service');
}

// CHARTS INITIALIZATION
function initCharts() {
    const ctxCat = document.getElementById('chart-revenue-category').getContext('2d');
    new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: ['جلدية وتجميل', 'عناية بالأسنان', 'علاج طبيعي', 'استشارات'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: ['#2563eb', '#16a34a', '#9333ea', '#ea580c']
            }]
        }
    });

    const ctxTop = document.getElementById('chart-top-services').getContext('2d');
    new Chart(ctxTop, {
        type: 'bar',
        data: {
            labels: ['تنظيف البشرة', 'تبييض الأسنان', 'العلاج الطبيعي', 'الاستشارات'],
            datasets: [{
                label: 'عدد الجلسات',
                data: [32, 24, 18, 12],
                backgroundColor: '#2563eb'
            }]
        }
    });
}