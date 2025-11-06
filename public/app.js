const API_URL = 'http://localhost:3000/api';

// DOM Elements
const operationsList = document.getElementById('operations-list');
const resultsContainer = document.getElementById('results-container');
const runAllBtn = document.getElementById('run-all-btn');
const refreshStatsBtn = document.getElementById('refresh-stats-btn');
const clearResultsBtn = document.getElementById('clear-results-btn');
const toggleDataBtn = document.getElementById('toggle-data-btn');
const closeDataBtn = document.getElementById('close-data-btn');
const dataSection = document.getElementById('data-section');
const dbName = document.getElementById('db-name');
const docCount = document.getElementById('doc-count');
const majorsEl = document.getElementById('majors');
const studentsTable = document.getElementById('students-table');
const studentCount = document.getElementById('student-count');
const addStudentForm = document.getElementById('add-student-form');
const searchForm = document.getElementById('search-form');
const clearSearchBtn = document.getElementById('clear-search-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

// State
let operations = [];
let currentStudents = [];

// Initialize
async function init() {
    await loadOperations();
    await loadStats();
}

// Load available operations
async function loadOperations() {
    try {
        const response = await fetch(`${API_URL}/operations`);
        const data = await response.json();
        operations = data.operations;
        renderOperations();
    } catch (err) {
        console.error('Failed to load operations:', err);
        operationsList.innerHTML = '<p style="color: red;">Failed to load operations</p>';
    }
}

// Render operations list
function renderOperations() {
    operationsList.innerHTML = operations.map(op => `
        <button class="operation-btn" data-operation="${op}" onclick="runOperation('${op}')">
            ${formatOperationName(op)}
        </button>
    `).join('');
}

// Format operation name for display
function formatOperationName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        dbName.textContent = data.database;
        docCount.textContent = data.totalDocuments;
        majorsEl.textContent = data.uniqueMajors.join(', ') || 'None';
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

// Run single operation
async function runOperation(operationName) {
    const btn = document.querySelector(`[data-operation="${operationName}"]`);
    btn.classList.add('running');
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/run/${operationName}`, {
            method: 'POST'
        });
        const data = await response.json();
        
        addResultCard({
            operation: operationName,
            success: data.success,
            result: data.result,
            error: data.error,
            timestamp: data.timestamp
        });

        await loadStats();
    } catch (err) {
        addResultCard({
            operation: operationName,
            success: false,
            error: err.message
        });
    } finally {
        btn.classList.remove('running');
        btn.disabled = false;
    }
}

// Run all operations
async function runAllOperations() {
    runAllBtn.disabled = true;
    runAllBtn.innerHTML = '<span class="spinner"></span> Running...';
    
    // Clear previous results
    resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Running all operations...</p></div>';

    try {
        const response = await fetch(`${API_URL}/run-all`, {
            method: 'POST'
        });
        const data = await response.json();
        
        resultsContainer.innerHTML = '';
        
        data.results.forEach(result => {
            addResultCard(result);
        });

        await loadStats();
    } catch (err) {
        resultsContainer.innerHTML = '';
        addResultCard({
            operation: 'Run All',
            success: false,
            error: err.message
        });
    } finally {
        runAllBtn.disabled = false;
        runAllBtn.innerHTML = '▶ Run All Operations';
    }
}

// Add result card to display
function addResultCard(data) {
    const card = document.createElement('div');
    card.className = `result-card ${data.success ? 'success' : 'error'}`;
    
    const resultContent = data.success 
        ? JSON.stringify(data.result, null, 2)
        : `Error: ${data.error}`;
    
    const timestamp = data.timestamp 
        ? new Date(data.timestamp).toLocaleString()
        : new Date().toLocaleString();
    
    card.innerHTML = `
        <div class="result-header">
            <span class="result-title">${formatOperationName(data.operation)}</span>
            <span class="result-badge ${data.success ? 'success' : 'error'}">
                ${data.success ? '✓ Success' : '✗ Error'}
            </span>
        </div>
        <div class="result-timestamp">${timestamp}</div>
        <div class="result-body">
            <pre>${resultContent}</pre>
        </div>
    `;
    
    // Remove welcome message if it exists
    const welcomeMsg = resultsContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    resultsContainer.insertBefore(card, resultsContainer.firstChild);
}

// Clear all results
function clearResults() {
    resultsContainer.innerHTML = `
        <div class="welcome-message">
            <h2>Results Cleared! 👋</h2>
            <p>Click on any operation from the sidebar to run it individually, or use "Run All Operations" to execute all 18 operations sequentially.</p>
        </div>
    `;
}

// Event Listeners
runAllBtn.addEventListener('click', runAllOperations);
refreshStatsBtn.addEventListener('click', loadStats);
clearResultsBtn.addEventListener('click', clearResults);
toggleDataBtn.addEventListener('click', toggleDataSection);
closeDataBtn.addEventListener('click', toggleDataSection);
addStudentForm.addEventListener('submit', handleAddStudent);
searchForm.addEventListener('submit', handleSearch);
clearSearchBtn.addEventListener('click', clearSearchFilters);
clearAllBtn.addEventListener('click', clearAllStudents);

// Initialize on page load
init();

// Toggle data section visibility
function toggleDataSection() {
    const isVisible = dataSection.style.display !== 'none';
    dataSection.style.display = isVisible ? 'none' : 'block';
    toggleDataBtn.textContent = isVisible ? '👥 View Students' : '✕ Hide Students';
    
    if (!isVisible) {
        loadStudents();
    }
}

// Load students from database
async function loadStudents() {
    try {
        studentsTable.innerHTML = '<p class="loading">Loading students...</p>';
        const response = await fetch(`${API_URL}/students`);
        const data = await response.json();
        
        if (data.success) {
            currentStudents = data.students;
            studentCount.textContent = currentStudents.length;
            renderStudentsTable(currentStudents);
        }
    } catch (err) {
        console.error('Failed to load students:', err);
        studentsTable.innerHTML = '<p style="color: red;">Failed to load students</p>';
    }
}

// Render students table
function renderStudentsTable(students) {
    if (students.length === 0) {
        studentsTable.innerHTML = `
            <div class="empty-state">
                <h3>📭 No Students Found</h3>
                <p>Add a student using the form above to get started!</p>
            </div>
        `;
        return;
    }

    const tableHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Major</th>
                    <th>GPA</th>
                    <th>Bio</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => `
                    <tr>
                        <td><strong>${student.name}</strong></td>
                        <td>${student.age}</td>
                        <td>${student.major}</td>
                        <td>${student.gpa !== undefined ? student.gpa.toFixed(2) : 'N/A'}</td>
                        <td>${student.bio || '-'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-icon btn-edit" onclick="editStudent('${student._id}')">✏️ Edit</button>
                                <button class="btn-icon btn-delete" onclick="deleteStudent('${student._id}', '${student.name}')">🗑️ Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    studentsTable.innerHTML = tableHTML;
}

// Handle add student form submission
async function handleAddStudent(e) {
    e.preventDefault();
    
    const studentData = {
        name: document.getElementById('student-name').value,
        age: document.getElementById('student-age').value,
        major: document.getElementById('student-major').value,
        gpa: document.getElementById('student-gpa').value || undefined,
        bio: document.getElementById('student-bio').value || undefined
    };

    try {
        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            addStudentForm.reset();
            await loadStudents();
            await loadStats();
            showNotification('✅ Student added successfully!', 'success');
        } else {
            showNotification('❌ ' + data.error, 'error');
        }
    } catch (err) {
        showNotification('❌ Failed to add student', 'error');
        console.error(err);
    }
}

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();
    
    const query = {};
    const major = document.getElementById('search-major').value;
    const gpa = document.getElementById('search-gpa').value;
    const age = document.getElementById('search-age').value;
    
    if (major) query.major = major;
    if (gpa) query.minGpa = gpa;
    if (age) query.maxAge = age;

    try {
        const response = await fetch(`${API_URL}/students/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderStudentsTable(data.students);
            showNotification(`🔍 Found ${data.count} student(s)`, 'success');
        }
    } catch (err) {
        showNotification('❌ Search failed', 'error');
        console.error(err);
    }
}

// Clear search filters
function clearSearchFilters() {
    searchForm.reset();
    loadStudents();
}

// Delete student
async function deleteStudent(id, name) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadStudents();
            await loadStats();
            showNotification('✅ Student deleted successfully', 'success');
        }
    } catch (err) {
        showNotification('❌ Failed to delete student', 'error');
        console.error(err);
    }
}

// Edit student
async function editStudent(id) {
    const student = currentStudents.find(s => s._id === id);
    if (!student) return;

    const name = prompt('Name:', student.name);
    if (!name) return;
    
    const age = prompt('Age:', student.age);
    if (!age) return;
    
    const major = prompt('Major:', student.major);
    if (!major) return;
    
    const gpa = prompt('GPA (optional):', student.gpa || '');
    const bio = prompt('Bio (optional):', student.bio || '');

    try {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, age, major, gpa: gpa || undefined, bio: bio || undefined })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadStudents();
            await loadStats();
            showNotification('✅ Student updated successfully', 'success');
        }
    } catch (err) {
        showNotification('❌ Failed to update student', 'error');
        console.error(err);
    }
}

// Clear all students
async function clearAllStudents() {
    if (!confirm('⚠️ Are you sure you want to delete ALL students? This cannot be undone!')) return;

    try {
        const response = await fetch(`${API_URL}/students`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadStudents();
            await loadStats();
            showNotification(`✅ Cleared ${data.deletedCount} student(s)`, 'success');
        }
    } catch (err) {
        showNotification('❌ Failed to clear students', 'error');
        console.error(err);
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
