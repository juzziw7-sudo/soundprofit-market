// API Client
const API_URL = '/api';

const api = {
    token: localStorage.getItem('token'),

    async request(endpoint, method = 'GET', body = null, isFile = false) {
        const headers = {};
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
        if (!isFile) headers['Content-Type'] = 'application/json';

        const config = { method, headers };
        if (body) config.body = isFile ? body : JSON.stringify(body);

        try {
            const res = await fetch(`${API_URL}${endpoint}`, config);
            return await res.json();
        } catch (err) {
            console.error('API Error:', err);
            return null;
        }
    },

    async login(email, password) {
        const res = await this.request('/auth/login', 'POST', { email, password });
        if (res && res.token) {
            this.token = res.token;
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            return res.user;
        }
        return null;
    },

    async register(username, email, password, role) {
        return await this.request('/auth/register', 'POST', { username, email, password, role });
    },

    async getSongs() {
        return await this.request('/songs');
    },

    async uploadSong(formData) {
        return await this.request('/songs', 'POST', formData, true);
    },

    async getFeed() {
        return await this.request('/social/feed');
    },

    async getMessages() {
        return await this.request('/social/messages');
    },

    async sendMessage(receiver_id, content) {
        return await this.request('/social/messages', 'POST', { receiver_id, content });
    }
};

// State
const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    songs: [],
    posts: [],
    messages: []
};

// Router
const router = {
    routes: {
        'market': renderMarket,
        'social': renderSocial,
        'dashboard': renderDashboard,
        'login': renderLogin,
        'register': renderRegister,
        'upload': renderUpload,
        'messages': renderMessages,
        'settings': renderSettings,
        'affiliates': renderAffiliates,
        'admin': renderAdmin
    },
    async navigate(route) {
        window.location.hash = route;
        await this.loadRoute(route);
    },
    async loadRoute(route) {
        // Pre-fetch data
        if (route === 'market') state.songs = await api.getSongs() || [];
        if (route === 'social') state.posts = await api.getFeed() || [];
        if (route === 'messages') state.messages = await api.getMessages() || [];

        const view = this.routes[route] || renderMarket;
        const app = document.getElementById('app-container');
        app.innerHTML = view();

        // Update Nav
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeLink = document.querySelector(`a[href="#${route}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Post-render hooks
        if (route === 'upload') initUploadDropzone();
        updateAuthUI();
    }
};

// --- Views (Updated to use state) ---

function renderMarket() {
    return `
        <header style="margin-bottom: 3rem;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">Discover <span style="color: var(--primary-glow)">Rare</span> Audio</h1>
            <p style="color: var(--text-muted); font-size: 1.2rem;">Direct from artists. Secure P2P transactions. Verified ownership.</p>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
            ${state.songs.length > 0 ? state.songs.map(song => `
                <div class="song-card" style="display: block; padding: 0; overflow: hidden;">
                    <div style="height: 200px; background: #333; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-music" style="font-size: 3rem; color: #555;"></i>
                    </div>
                    <div style="padding: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h3 style="margin-bottom: 0.5rem;">${song.title}</h3>
                                <div style="color: var(--text-muted); font-size: 0.9rem;">${song.artist_name || 'Unknown Artist'}</div>
                            </div>
                            <div class="song-price">$${song.price_amount}</div>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-primary" style="flex: 1;" onclick="startTransaction('${song.id}')">Buy Now</button>
                            <button class="btn btn-secondary" onclick="player.play('${song.id}')"><i class="fa-solid fa-play"></i></button>
                        </div>
                    </div>
                </div>
            `).join('') : '<p>No songs available yet.</p>'}
        </div>
    `;
}

function renderSocial() {
    return `
        <div class="dashboard-grid">
            <div class="sidebar glass">
                <h3 style="margin-bottom: 1.5rem;">Trending Artists</h3>
                <!-- Dynamic list would go here -->
            </div>
            <div>
                <div class="post-card">
                    <div style="display: flex; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: #444; border-radius: 50%;"></div>
                        <input type="text" placeholder="Share something..." class="form-input" style="border: none; background: transparent;">
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="btn btn-primary">Post</button>
                    </div>
                </div>

                ${state.posts.map(post => `
                    <div class="post-card">
                        <div class="post-header">
                            <img src="${post.avatar_url || 'https://via.placeholder.com/40'}" class="avatar">
                            <div>
                                <div style="font-weight: 600;">${post.username}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${new Date(post.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <p style="margin-bottom: 1rem; line-height: 1.5;">${post.content_text}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ... (Keep other render functions mostly the same, but check state.user)

function renderDashboard() {
    if (!state.user) return renderLogin();
    // ... (Existing dashboard HTML)
    return `
        <div class="dashboard-grid">
            <div class="sidebar glass">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h3>${state.user.username}</h3>
                    <div style="color: var(--text-muted);">${state.user.role}</div>
                </div>
                <nav>
                    <div style="padding: 10px; background: rgba(109, 40, 217, 0.1); border-radius: 8px; color: var(--primary); margin-bottom: 0.5rem;"><i class="fa-solid fa-chart-line"></i> Overview</div>
                    <div style="padding: 10px; cursor: pointer; color: var(--text-muted); margin-bottom: 0.5rem;" onclick="router.navigate('upload')"><i class="fa-solid fa-cloud-arrow-up"></i> Upload Track</div>
                    <div style="padding: 10px; cursor: pointer; color: var(--text-muted); margin-bottom: 0.5rem;" onclick="router.navigate('messages')"><i class="fa-solid fa-envelope"></i> Messages</div>
                    <div style="padding: 10px; cursor: pointer; color: var(--text-muted); margin-bottom: 0.5rem;" onclick="router.navigate('affiliates')"><i class="fa-solid fa-users"></i> Affiliates</div>
                    <div style="padding: 10px; cursor: pointer; color: var(--text-muted); margin-bottom: 0.5rem;" onclick="router.navigate('settings')"><i class="fa-solid fa-gear"></i> Settings</div>
                </nav>
            </div>
            <div><h2>Welcome to your Dashboard</h2></div>
        </div>
    `;
}

function renderLogin() {
    return `
        <div style="max-width: 400px; margin: 5rem auto; text-align: center;">
            <h2 style="margin-bottom: 2rem;">Login</h2>
            <div class="glass" style="padding: 2rem; border-radius: 16px;">
                <div class="form-group">
                    <input type="email" id="login-email" class="form-input" placeholder="Email Address">
                </div>
                <div class="form-group">
                    <input type="password" id="login-pass" class="form-input" placeholder="Password">
                </div>
                <button class="btn btn-primary" style="width: 100%;" onclick="handleLogin()">Login</button>
            </div>
        </div>
    `;
}

// --- Logic ---

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const user = await api.login(email, pass);

    if (user) {
        state.user = user;
        router.navigate('dashboard');
    } else {
        alert('Login failed');
    }
}

function updateAuthUI() {
    if (state.user) {
        document.getElementById('auth-buttons').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-name').innerText = state.user.username;
    } else {
        document.getElementById('auth-buttons').classList.remove('hidden');
        document.getElementById('user-profile').classList.add('hidden');
    }
}

function renderRegister() {
    return `
        <div style="max-width: 400px; margin: 5rem auto; text-align: center;">
            <h2 style="margin-bottom: 2rem;">Join SoundProfit</h2>
            <div class="glass" style="padding: 2rem; border-radius: 16px;">
                <div class="form-group">
                    <input type="text" id="reg-username" class="form-input" placeholder="Username">
                </div>
                <div class="form-group">
                    <input type="email" id="reg-email" class="form-input" placeholder="Email Address">
                </div>
                <div class="form-group">
                    <input type="password" id="reg-pass" class="form-input" placeholder="Password">
                </div>
                <div class="form-group">
                    <select id="reg-role" class="form-input">
                        <option value="buyer">Music Fan (Buyer)</option>
                        <option value="artist">Artist (Seller)</option>
                    </select>
                </div>
                <button class="btn btn-primary" style="width: 100%;" onclick="handleRegister()">Create Account</button>
                <p style="margin-top: 1rem; color: var(--text-muted);">Already have an account? <a href="#login" onclick="router.navigate('login')">Login</a></p>
            </div>
        </div>
    `;
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const role = document.getElementById('reg-role').value;

    const res = await api.register(username, email, pass, role);
    if (res && res.id) {
        alert('Registration successful! Please login.');
        router.navigate('login');
    } else {
        alert('Registration failed: ' + (res?.error || 'Unknown error'));
    }
}

function renderUpload() {
    return `
        <div class="dashboard-grid">
            <div class="sidebar glass">
                <h3>Upload Track</h3>
                <p style="color: var(--text-muted); margin-top: 1rem;">Supported formats: MP3, WAV, FLAC. Max size: 50MB.</p>
            </div>
            <div class="glass" style="padding: 2rem;">
                <h2 style="margin-bottom: 2rem;">New Release</h2>
                <div class="form-group">
                    <label>Track Title</label>
                    <input type="text" id="up-title" class="form-input" placeholder="e.g. Midnight City">
                </div>
                <div class="form-group">
                    <label>Genre</label>
                    <select id="up-genre" class="form-input">
                        <option value="pop">Pop</option>
                        <option value="hiphop">Hip Hop</option>
                        <option value="electronic">Electronic</option>
                        <option value="rock">Rock</option>
                        <option value="jazz">Jazz</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Price ($)</label>
                    <input type="number" id="up-price" class="form-input" value="0.99" step="0.01">
                </div>
                 <div class="form-group">
                    <label>ISRC Code (Optional)</label>
                    <input type="text" id="up-isrc" class="form-input" placeholder="CC-XXX-YY-NNNNN">
                </div>
                <div class="form-group" style="border: 2px dashed #444; padding: 2rem; text-align: center; border-radius: 8px; cursor: pointer;" id="dropzone">
                    <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Drag & Drop audio file here or click to browse</p>
                    <input type="file" id="up-file" style="display: none" accept="audio/*">
                    <div id="file-name" style="margin-top: 1rem; color: var(--primary);"></div>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 2rem;" onclick="handleUpload()">Publish Track</button>
            </div>
        </div>
    `;
}

async function handleUpload() {
    const title = document.getElementById('up-title').value;
    const genre = document.getElementById('up-genre').value;
    const price = document.getElementById('up-price').value;
    const isrc = document.getElementById('up-isrc').value;
    const fileInput = document.getElementById('up-file');

    if (!fileInput.files[0]) return alert('Please select a file');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('price', price);
    formData.append('isrc', isrc);
    formData.append('audioFile', fileInput.files[0]);

    const res = await api.uploadSong(formData);
    if (res && res.id) {
        alert('Upload successful!');
        router.navigate('market');
    } else {
        alert('Upload failed');
    }
}

function initUploadDropzone() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('up-file');
    const fileName = document.getElementById('file-name');

    if (!dropzone) return;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) fileName.innerText = fileInput.files[0].name;
    });
}

function renderMessages() {
    return `
        <div class="dashboard-grid">
             <div class="sidebar glass">
                <h3>Messages</h3>
                <div style="margin-top: 1rem;">
                    ${state.messages.length > 0 ? [...new Set(state.messages.map(m => m.sender_name))].map(name => `
                        <div style="padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer;">
                            <strong>${name}</strong>
                        </div>
                    `).join('') : '<p style="color: var(--text-muted);">No conversations yet.</p>'}
                </div>
            </div>
            <div class="glass" style="padding: 2rem; display: flex; flex-direction: column; height: 600px;">
                <div style="flex: 1; overflow-y: auto; padding-bottom: 1rem;" id="message-container">
                    ${state.messages.length > 0 ? state.messages.map(msg => `
                        <div style="margin-bottom: 1rem; text-align: ${msg.sender_id === state.user.id ? 'right' : 'left'};">
                            <div style="font-weight: bold; margin-bottom: 0.2rem;">${msg.sender_name || 'User'} <span style="font-weight: normal; font-size: 0.8rem; color: #666;">${new Date(msg.created_at).toLocaleTimeString()}</span></div>
                            <div style="background: ${msg.sender_id === state.user.id ? 'var(--primary)' : '#333'}; padding: 1rem; border-radius: 12px; display: inline-block;">
                                ${msg.content}
                            </div>
                        </div>
                    `).join('') : '<p>Select a conversation or start a new one.</p>'}
                </div>
                <div style="display: flex; gap: 1rem;">
                    <input type="text" id="msg-input" class="form-input" placeholder="Type a message..." style="flex: 1;">
                    <input type="number" id="msg-receiver" class="form-input" placeholder="ID" style="width: 80px;">
                    <button class="btn btn-primary" onclick="handleSendMessage()"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
}

async function handleSendMessage() {
    const content = document.getElementById('msg-input').value;
    const receiverId = document.getElementById('msg-receiver').value; // Temporary: manually input ID

    if (!content || !receiverId) return;

    const res = await api.sendMessage(receiverId, content);
    if (res && res.id) {
        document.getElementById('msg-input').value = '';
        // Refresh messages
        state.messages = await api.getMessages();
        router.loadRoute('messages');
    } else {
        alert('Failed to send message');
    }
}

function renderSettings() {
    return `
        <div class="glass" style="max-width: 600px; margin: 2rem auto; padding: 2rem;">
            <h2>Settings</h2>
            <div class="form-group" style="margin-top: 2rem;">
                <label>Display Name</label>
                <input type="text" class="form-input" value="${state.user?.username || ''}">
            </div>
            <div class="form-group">
                <label>Email Notification</label>
                <div style="margin-top: 0.5rem;">
                    <label><input type="checkbox" checked> New Sales</label><br>
                    <label><input type="checkbox" checked> New Messages</label>
                </div>
            </div>
            <button class="btn btn-primary">Save Changes</button>
            <button class="btn btn-secondary" onclick="handleLogout()" style="margin-left: 1rem; background: #ef4444; border: none;">Logout</button>
        </div>
    `;
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    state.user = null;
    window.location.reload();
}

function renderAffiliates() {
    return `
        <div class="glass" style="padding: 2rem;">
            <h2>Affiliate Dashboard</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
                <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">0</div>
                    <div style="color: var(--text-muted);">Total Referrals</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: #10b981;">$0.00</div>
                    <div style="color: var(--text-muted);">Earnings</div>
                </div>
            </div>
            <div style="margin-top: 2rem;">
                <h3>Your Referral Link</h3>
                <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                    <input type="text" class="form-input" value="https://soundprofit.market/?ref=${state.user?.username}" readonly>
                    <button class="btn btn-secondary">Copy</button>
                </div>
            </div>
        </div>
    `;
}

function renderAdmin() {
    return `
        <div class="glass" style="padding: 2rem;">
            <h2>Admin Panel</h2>
            <p>Dispute Resolution & Transaction Monitoring</p>
            <table style="width: 100%; margin-top: 2rem; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; border-bottom: 1px solid #444;">
                        <th style="padding: 1rem;">ID</th>
                        <th style="padding: 1rem;">Buyer</th>
                        <th style="padding: 1rem;">Amount</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 1rem;">#1023</td>
                        <td style="padding: 1rem;">user_123</td>
                        <td style="padding: 1rem;">$0.99</td>
                        <td style="padding: 1rem;"><span style="color: #f59e0b;">Pending</span></td>
                        <td style="padding: 1rem;"><button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">Review</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Audio Player
const player = {
    audio: new Audio(),
    isPlaying: false,
    currentSongId: null,

    init() {
        this.audio.volume = 0.8;

        // Play/Pause Button
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());

        // Volume
        const volInput = document.querySelector('.volume-control input');
        if (volInput) volInput.addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updateUI();
        });
    },

    play(songId) {
        const song = state.songs.find(s => s.id == songId);
        if (!song) return;

        if (this.currentSongId == songId) {
            this.togglePlay();
            return;
        }

        this.currentSongId = songId;
        this.audio.src = song.file_url_secure;
        this.audio.play().catch(e => console.error("Playback failed:", e));
        this.isPlaying = true;
        this.updateUI(song);
    },

    togglePlay() {
        if (!this.currentSongId) return;

        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updateUI();
    },

    updateUI(song = null) {
        const btnIcon = document.querySelector('.play-btn i');

        if (this.isPlaying) {
            btnIcon.classList.remove('fa-play');
            btnIcon.classList.add('fa-pause');
        } else {
            btnIcon.classList.remove('fa-pause');
            btnIcon.classList.add('fa-play');
        }

        if (song) {
            document.querySelector('.track-title').innerText = song.title;
            document.querySelector('.track-artist').innerText = song.artist_name || 'Unknown';
        }
    }
};

// Init
window.addEventListener('load', () => {
    router.navigate('market');
    player.init();
});
