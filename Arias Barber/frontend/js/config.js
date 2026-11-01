const CONFIG = {
    API_URL: `${window.location.protocol}//${window.location.hostname}:3000/api`
};

// Función global contra ataques XSS en innerHTML (FE-01)
window.escapeHTML = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// Cliente API centralizado con inyección automática de JWT (FE-12)
window.api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = { ...(options.headers || {}) };

        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'index.html';
            throw new Error('Sesión expirada');
        }

        return response.json();
    },
    get(endpoint) { return this.request(endpoint, { method: 'GET' }); },
    post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
    put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};