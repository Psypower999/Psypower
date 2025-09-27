// Background Canvas Class (unchanged)
class BackgroundCanvas {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.container.appendChild(this.canvas);
        
        this.createParticles();
        this.animate();
    }
    
    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                color: `rgba(113, 125, 159, ${Math.random() * 0.5 + 0.2})`,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const distance = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(113, 125, 159, ${0.2 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', this.resize);
    }
}

class FileEncryption {
    constructor(password) {
        this.password = password;
    }

    encryptFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const encrypted = this._xorEncrypt(content, this.password);
                resolve(encrypted);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    decryptFile(encryptedData) {
        return this._xorEncrypt(encryptedData, this.password);
    }

    _xorEncrypt(data, password) {
        const encoder = new TextEncoder();
        const passwordBytes = encoder.encode(password);
        const dataView = new DataView(data);
        const result = new ArrayBuffer(data.byteLength);
        const resultView = new DataView(result);

        for (let i = 0; i < data.byteLength; i++) {
            const passwordByte = passwordBytes[i % passwordBytes.length];
            resultView.setUint8(i, dataView.getUint8(i) ^ passwordByte);
        }

        return result;
    }
}

class SecurityManager {
    constructor() {
        this.devMode = true;
        this.db = null;
        this.allUsers = {}; // Cache for all users
        this.usedCodes = []; // Cache for used codes
        
        if (this.devMode) {
            this.initSecurity();
        } else {
            this.performIntegrityCheck().then(() => {
                if (!this.verifySignature()) {
                    this.handleTampering();
                }
                
                this.validateWithServer().catch(error => {
                    console.error('Server validation failed:', error);
                });
                
                this.initSecurity();
            }).catch(error => {
                console.error('Integrity check failed:', error);
                this.handleTampering();
            });
        }
    }
    
    async initSecurity() {
        // Initialize available codes
        this.correctCode = [
            "020PSY969666POWER900", "030PSY969666POWER800", "040PSY969666POWER700", 
            "050PSY969666POWER600", "060PSY969666POWER500", "070PSY969666POWER400", 
            "080PSY969666POWER300", "090PSY969666POWER200", "100PSY969666POWER001", 
            "200PSY969666POWER002", "0a2b0c9x6y9z61626392010", "0a2b0c9x6y9z62626392010", 
            "0a2b0c9x6z9z62696392010", "0a2b0c9x6y9w62626392810", "0a2f0c9x6y9z62626390010", 
            "0a2bhc9x6y9z62w26392010", "0a2x0c9xwy9z6262y392010"
        ];
        
        this.maxAttempts = 3;
        this.lockoutTime = 300000;
        this.isLocked = false;
        this.lockoutEndTime = 0;
        this.fileEncryption = null;
        this.backgroundCanvas = null;
        
        // Initialize IndexedDB for more persistent storage
        await this.initIndexedDB();
        
        // Load all users and used codes from both storage systems
        await this.loadAllData();
        
        this.loadSecurityState();
        this.init();
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('PsychStudioDB', 2); // Increment version to trigger upgrade
            
            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create users object store if it doesn't exist
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'username' });
                }
                
                // Create usedCodes object store if it doesn't exist
                if (!db.objectStoreNames.contains('usedCodes')) {
                    const codeStore = db.createObjectStore('usedCodes', { keyPath: 'code' });
                    codeStore.createIndex('username', 'username', { unique: false });
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
        });
    }
    
    async loadAllData() {
        try {
            // Get users from IndexedDB
            const indexedDBUsers = await this.getAllUsersFromIndexedDB();
            
            // Get used codes from IndexedDB
            const indexedDBUsedCodes = await this.getAllUsedCodesFromIndexedDB();
            
            // Get users from localStorage
            const localUsers = this.getUsers();
            
            // Get used codes from localStorage
            const localUsedCodes = this.getUsedCodes();
            
            // Merge both sources, with IndexedDB taking precedence
            this.allUsers = {...localUsers, ...indexedDBUsers};
            
            // Merge used codes
            this.usedCodes = [...new Set([...localUsedCodes, ...indexedDBUsedCodes])];
            
            // Sync any users that are only in localStorage to IndexedDB
            for (const username in localUsers) {
                if (!indexedDBUsers[username]) {
                    await this.saveUserToIndexedDB(localUsers[username]);
                }
            }
            
            // Sync any used codes that are only in localStorage to IndexedDB
            for (const codeData of localUsedCodes) {
                if (!indexedDBUsedCodes.some(c => c.code === codeData.code)) {
                    await this.saveUsedCodeToIndexedDB(codeData);
                }
            }
            
            // Update localStorage with any data only in IndexedDB
            localStorage.setItem('psychStudioUsers', JSON.stringify(this.allUsers));
            localStorage.setItem('psychStudioUsedCodes', JSON.stringify(this.usedCodes));
            
            // Filter out used codes from available codes
            const usedCodeStrings = this.usedCodes.map(c => c.code);
            this.correctCode = this.correctCode.filter(code => !usedCodeStrings.includes(code));
            
            return { users: this.allUsers, usedCodes: this.usedCodes };
        } catch (error) {
            console.error('Error loading data:', error);
            return { users: {}, usedCodes: [] };
        }
    }
    
    async registerUser(username, password, code) {
        // Check both localStorage and IndexedDB for existing user
        if (this.allUsers[username]) {
            return {
                success: false,
                message: "Username already exists"
            };
        }
        
        // Check if code is valid
        if (!this.correctCode.includes(code)) {
            // Check if it's a used code
            const codeData = this.usedCodes.find(c => c.code === code);
            if (codeData) {
                return {
                    success: false,
                    message: `This code is already registered to user: ${codeData.username}`
                };
            }
            return {
                success: false,
                message: "Invalid registration code"
            };
        }
        
        const passwordHash = this.simpleHash(password);
        
        const user = {
            username: username,
            passwordHash: passwordHash,
            created: new Date().toISOString(),
            lastLogin: null,
            registrationCode: code // Store the code used for registration
        };
        
        // Store in localStorage as backup
        const localUsers = this.getUsers();
        localUsers[username] = user;
        localStorage.setItem('psychStudioUsers', JSON.stringify(localUsers));
        
        // Store in IndexedDB for persistence
        await this.saveUserToIndexedDB(user);
        
        // Update cache
        this.allUsers[username] = user;
        
        // Mark code as used and tie it to the username
        const codeUsageData = {
            code: code,
            username: username,
            usedAt: new Date().toISOString()
        };
        
        // Store in localStorage
        const localUsedCodes = this.getUsedCodes();
        localUsedCodes.push(codeUsageData);
        localStorage.setItem('psychStudioUsedCodes', JSON.stringify(localUsedCodes));
        
        // Store in IndexedDB
        await this.saveUsedCodeToIndexedDB(codeUsageData);
        
        // Update cache
        this.usedCodes.push(codeUsageData);
        
        // Remove code from available codes
        const codeIndex = this.correctCode.indexOf(code);
        if (codeIndex !== -1) {
            this.correctCode.splice(codeIndex, 1);
        }
        
        return {
            success: true,
            message: "User registered successfully"
        };
    }
    
    async saveUserToIndexedDB(user) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction('users', 'readwrite');
            const objectStore = transaction.objectStore('users');
            const request = objectStore.put(user);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async saveUsedCodeToIndexedDB(codeData) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction('usedCodes', 'readwrite');
            const objectStore = transaction.objectStore('usedCodes');
            const request = objectStore.put(codeData);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async getUserFromIndexedDB(username) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction('users', 'readonly');
            const objectStore = transaction.objectStore('users');
            const request = objectStore.get(username);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllUsersFromIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction('users', 'readonly');
            const objectStore = transaction.objectStore('users');
            const request = objectStore.getAll();
            
            request.onsuccess = () => {
                const users = {};
                request.result.forEach(user => {
                    users[user.username] = user;
                });
                resolve(users);
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllUsedCodesFromIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            const transaction = this.db.transaction('usedCodes', 'readonly');
            const objectStore = transaction.objectStore('usedCodes');
            const request = objectStore.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    getUsers() {
        const usersJson = localStorage.getItem('psychStudioUsers');
        return usersJson ? JSON.parse(usersJson) : {};
    }
    
    getUsedCodes() {
        const usedCodesJson = localStorage.getItem('psychStudioUsedCodes');
        return usedCodesJson ? JSON.parse(usedCodesJson) : [];
    }
    
    async authenticateUser(username, password) {
        // Check if user exists in our cache
        let user = this.allUsers[username];
        
        if (!user) {
            // If not in cache, try to get from storage
            user = await this.getUserFromIndexedDB(username);
            
            // If not found in IndexedDB, try localStorage
            if (!user) {
                const localUsers = this.getUsers();
                user = localUsers[username];
                
                // If found in localStorage but not IndexedDB, sync to IndexedDB
                if (user) {
                    await this.saveUserToIndexedDB(user);
                    this.allUsers[username] = user;
                }
            } else {
                // Update cache with user from IndexedDB
                this.allUsers[username] = user;
            }
        }
        
        if (!user) {
            return {
                success: false,
                message: "User not found"
            };
        }
        
        const passwordHash = this.simpleHash(password);
        if (user.passwordHash !== passwordHash) {
            return {
                success: false,
                message: "Invalid password"
            };
        }
        
        // Update last login time
        user.lastLogin = new Date().toISOString();
        
        // Update in both storage systems
        await this.saveUserToIndexedDB(user);
        
        const localUsers = this.getUsers();
        localUsers[username] = user;
        localStorage.setItem('psychStudioUsers', JSON.stringify(localUsers));
        
        // Update cache
        this.allUsers[username] = user;
        
        return {
            success: true,
            message: "Authentication successful",
            user: user
        };
    }
    
    async recoverAccount(code, newPassword) {
        // Find the code in used codes
        const codeData = this.usedCodes.find(c => c.code === code);
        
        if (!codeData) {
            // Check if it's a valid unused code
            if (this.correctCode.includes(code)) {
                return {
                    success: false,
                    message: "This code hasn't been used to register an account yet"
                };
            }
            return {
                success: false,
                message: "Invalid registration code"
            };
        }
        
        // Get the user associated with this code
        const username = codeData.username;
        let user = this.allUsers[username];
        
        if (!user) {
            // Try to get from storage
            user = await this.getUserFromIndexedDB(username);
            
            if (!user) {
                const localUsers = this.getUsers();
                user = localUsers[username];
                
                if (user) {
                    await this.saveUserToIndexedDB(user);
                    this.allUsers[username] = user;
                }
            } else {
                this.allUsers[username] = user;
            }
        }
        
        if (!user) {
            return {
                success: false,
                message: "User associated with this code not found"
            };
        }
        
        // Update password
        user.passwordHash = this.simpleHash(newPassword);
        
        // Update in both storage systems
        await this.saveUserToIndexedDB(user);
        
        const localUsers = this.getUsers();
        localUsers[username] = user;
        localStorage.setItem('psychStudioUsers', JSON.stringify(localUsers));
        
        // Update cache
        this.allUsers[username] = user;
        
        return {
            success: true,
            message: "Password reset successful",
            username: username
        };
    }
    
    init() {
        if (this.isUserAuthenticated()) {
            this.showApp();
            return;
        }
        
        if (this.isAuthenticated()) {
            this.showApp();
        } else {
            this.showLoginScreen();
        }
    }
    
    isUserAuthenticated() {
        const authData = localStorage.getItem('psychStudioUserAuth');
        if (!authData) return false;
        
        try {
            const { username, token, expiry } = JSON.parse(authData);
            
            if (new Date().getTime() >= expiry) {
                return false;
            }
            
            // Check if user exists in our cache
            const user = this.allUsers[username];
            
            if (!user) {
                return false;
            }
            
            const expectedToken = this.generateUserToken(username, user);
            
            return token === expectedToken;
        } catch (e) {
            return false;
        }
    }
    
    generateUserToken(username, user) {
        const fingerprint = this.getDeviceFingerprint();
        return btoa(username + user.passwordHash + fingerprint).substring(0, 32);
    }
    
    showLoginScreen() {
        const existingLoginScreen = document.getElementById('login-screen');
        if (existingLoginScreen) {
            existingLoginScreen.remove();
        }
        
        const loginScreen = document.createElement('div');
        loginScreen.id = 'login-screen';
        loginScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
            overflow: hidden;
        `;
        
        this.backgroundCanvas = new BackgroundCanvas(loginScreen);
        
        const loginForm = document.createElement('div');
        loginForm.style.cssText = `
            position: relative;
            z-index: 10;
            text-align: center; 
            max-width: 400px; 
            padding: 40px; 
            background: rgba(0,0,0,0.3); 
            border-radius: 10px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
        `;
        
        loginForm.innerHTML = `
            <h1 style="margin-bottom: 30px; color: #717d9f;">Psychological Studio</h1>
            
            <div style="display: flex; margin-bottom: 20px;">
                <button id="code-login-tab" class="login-tab active" style="
                    flex: 1;
                    padding: 10px;
                    background: rgba(113, 125, 159, 0.3);
                    color: white;
                    border: none;
                    border-radius: 5px 0 0 5px;
                    cursor: pointer;
                ">License</button>
                <button id="user-login-tab" class="login-tab" style="
                    flex: 1;
                    padding: 10px;
                    background: rgba(113, 125, 159, 0.1);
                    color: white;
                    border: none;
                    border-radius: 0 5px 5px 0;
                    cursor: pointer;
                ">User Login</button>
            </div>
            
            <div id="code-login-form" class="login-form">
                <p style="margin-bottom: 20px; color: #aaa;">Enter Registration Code</p>
                <input type="password" id="unlock-code" placeholder="Enter code" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 20px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 18px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <button id="unlock-btn" style="
                    width: 100%;
                    padding: 15px;
                    background: #930018;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                ">Unlock</button>
            </div>
            
            <div id="user-login-form" class="login-form" style="display: none;">
                <p style="margin-bottom: 20px; color: #aaa;">Enter your ID</p>
                <input type="text" id="username" placeholder="Username" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 15px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <input type="password" id="password" placeholder="Password" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 20px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <button id="user-login-btn" style="
                    width: 100%;
                    padding: 15px;
                    background: #930018;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                    margin-bottom: 15px;
                ">Login</button>
                <button id="register-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    color: #717d9f;
                    border: 1px solid #717d9f;
                    border-radius: 5px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">Create New Account</button>
                <div style="margin-top: 15px;">
                    <button id="recover-account-btn" style="
                        background: transparent;
                        color: #717d9f;
                        border: none;
                        font-size: 12px;
                        cursor: pointer;
                        text-decoration: underline;
                    ">Recover Account with Code</button>
                </div>
            </div>
            
            <div id="error-message" style="color: #ff4444; margin-top: 15px; min-height: 20px;"></div>
            <div id="attempts-left" style="color: #aaa; margin-top: 10px; font-size: 14px;"></div>
        `;
        
        loginScreen.appendChild(loginForm);
        document.body.appendChild(loginScreen);
        
        // Store original user login form HTML
        this.originalUserLoginFormHTML = document.getElementById('user-login-form').innerHTML;
        
        const unlockBtn = document.getElementById('unlock-btn');
        const unlockInput = document.getElementById('unlock-code');
        const userLoginBtn = document.getElementById('user-login-btn');
        const registerBtn = document.getElementById('register-btn');
        const recoverAccountBtn = document.getElementById('recover-account-btn');
        const codeLoginTab = document.getElementById('code-login-tab');
        const userLoginTab = document.getElementById('user-login-tab');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => this.attemptUnlock());
        }
        
        if (unlockInput) {
            unlockInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.attemptUnlock();
            });
        }
        
        if (userLoginBtn) {
            userLoginBtn.addEventListener('click', () => this.attemptUserLogin());
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegistrationForm());
        }
        
        if (recoverAccountBtn) {
            recoverAccountBtn.addEventListener('click', () => this.showAccountRecoveryForm());
        }
        
        if (codeLoginTab) {
            codeLoginTab.addEventListener('click', () => this.showCodeLoginForm());
        }
        
        if (userLoginTab) {
            userLoginTab.addEventListener('click', () => this.showUserLoginForm());
        }
        
        if (usernameInput && passwordInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.attemptUserLogin();
            });
            
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.attemptUserLogin();
            });
        }
        
        this.updateAttemptsDisplay();
        
        if (this.isLocked) {
            this.startLockoutCountdown();
        }
    }
    
    showCodeLoginForm() {
        const codeLoginForm = document.getElementById('code-login-form');
        const userLoginForm = document.getElementById('user-login-form');
        const codeLoginTab = document.getElementById('code-login-tab');
        const userLoginTab = document.getElementById('user-login-tab');
        
        if (codeLoginForm) codeLoginForm.style.display = 'block';
        if (userLoginForm) userLoginForm.style.display = 'none';
        if (codeLoginTab) {
            codeLoginTab.classList.add('active');
            codeLoginTab.style.background = 'rgba(113, 125, 159, 0.3)';
        }
        if (userLoginTab) {
            userLoginTab.classList.remove('active');
            userLoginTab.style.background = 'rgba(113, 125, 159, 0.1)';
        }
    }
    
    showUserLoginForm() {
        const codeLoginForm = document.getElementById('code-login-form');
        const userLoginForm = document.getElementById('user-login-form');
        const codeLoginTab = document.getElementById('code-login-tab');
        const userLoginTab = document.getElementById('user-login-tab');
        
        if (codeLoginForm) codeLoginForm.style.display = 'none';
        if (userLoginForm) {
            userLoginForm.style.display = 'block';
            // Restore original user login form content
            if (this.originalUserLoginFormHTML) {
                userLoginForm.innerHTML = this.originalUserLoginFormHTML;
                // Re-attach event listeners
                this.attachUserLoginFormEventListeners();
            }
        }
        if (codeLoginTab) {
            codeLoginTab.classList.remove('active');
            codeLoginTab.style.background = 'rgba(113, 125, 159, 0.1)';
        }
        if (userLoginTab) {
            userLoginTab.classList.add('active');
            userLoginTab.style.background = 'rgba(113, 125, 159, 0.3)';
        }
    }
    
    attachUserLoginFormEventListeners() {
        const userLoginBtn = document.getElementById('user-login-btn');
        const registerBtn = document.getElementById('register-btn');
        const recoverAccountBtn = document.getElementById('recover-account-btn');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (userLoginBtn) {
            userLoginBtn.addEventListener('click', () => this.attemptUserLogin());
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegistrationForm());
        }
        
        if (recoverAccountBtn) {
            recoverAccountBtn.addEventListener('click', () => this.showAccountRecoveryForm());
        }
        
        if (usernameInput && passwordInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.attemptUserLogin();
            });
            
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.attemptUserLogin();
            });
        }
    }
    
    showRegistrationForm() {
        const userLoginForm = document.getElementById('user-login-form');
        
        if (userLoginForm) {
            userLoginForm.innerHTML = `
                <p style="margin-bottom: 20px; color: #aaa;">Create a new account</p>
                <input type="text" id="reg-username" placeholder="Username" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 15px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <input type="password" id="reg-password" placeholder="Password" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 15px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <input type="password" id="reg-confirm-password" placeholder="Confirm Password" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 15px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <input type="password" id="reg-code" placeholder="Registration Code" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 20px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <button id="complete-registration-btn" style="
                    width: 100%;
                    padding: 15px;
                    background: #930018;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                    margin-bottom: 15px;
                ">Register</button>
                <button id="back-to-login-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    color: #717d9f;
                    border: 1px solid #717d9f;
                    border-radius: 5px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">Back to Login</button>
            `;
            
            const completeRegistrationBtn = document.getElementById('complete-registration-btn');
            const backToLoginBtn = document.getElementById('back-to-login-btn');
            const regUsername = document.getElementById('reg-username');
            const regPassword = document.getElementById('reg-password');
            const regConfirmPassword = document.getElementById('reg-confirm-password');
            const regCode = document.getElementById('reg-code');
            
            if (completeRegistrationBtn) {
                completeRegistrationBtn.addEventListener('click', () => this.completeRegistration());
            }
            
            if (backToLoginBtn) {
                backToLoginBtn.addEventListener('click', () => this.showUserLoginForm());
            }
            
            if (regUsername && regPassword && regConfirmPassword && regCode) {
                [regUsername, regPassword, regConfirmPassword, regCode].forEach(input => {
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') this.completeRegistration();
                    });
                });
            }
        }
    }
    
    showAccountRecoveryForm() {
        const userLoginForm = document.getElementById('user-login-form');
        
        if (userLoginForm) {
            userLoginForm.innerHTML = `
                <p style="margin-bottom: 20px; color: #aaa;">Recover your account</p>
                <input type="password" id="recovery-code" placeholder="Registration Code" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 15px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <input type="password" id="new-password" placeholder="New Password" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 15px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <input type="password" id="confirm-new-password" placeholder="Confirm New Password" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 20px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    box-sizing: border-box;
                ">
                <button id="complete-recovery-btn" style="
                    width: 100%;
                    padding: 15px;
                    background: #930018;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                    margin-bottom: 15px;
                ">Recover Account</button>
                <button id="back-to-login-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    color: #717d9f;
                    border: 1px solid #717d9f;
                    border-radius: 5px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">Back to Login</button>
            `;
            
            const completeRecoveryBtn = document.getElementById('complete-recovery-btn');
            const backToLoginBtn = document.getElementById('back-to-login-btn');
            
            if (completeRecoveryBtn) {
                completeRecoveryBtn.addEventListener('click', () => this.completeAccountRecovery());
            }
            
            if (backToLoginBtn) {
                backToLoginBtn.addEventListener('click', () => this.showUserLoginForm());
            }
        }
    }
    
    async completeRegistration() {
        const username = document.getElementById('reg-username')?.value.trim();
        const password = document.getElementById('reg-password')?.value;
        const confirmPassword = document.getElementById('reg-confirm-password')?.value;
        const code = document.getElementById('reg-code')?.value.trim();
        
        if (!username || !password || !confirmPassword || !code) {
            this.showError('All fields are required');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }
        
        const registrationResult = await this.registerUser(username, password, code);
        
        if (!registrationResult.success) {
            this.showError(registrationResult.message);
            return;
        }
        
        this.authenticateWithUsername(username);
    }
    
    async attemptUserLogin() {
        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value;
        
        if (!username || !password) {
            this.showError('Username and password are required');
            return;
        }
        
        const authResult = await this.authenticateUser(username, password);
        
        if (!authResult.success) {
            this.showError(authResult.message);
            return;
        }
        
        this.authenticateWithUsername(username);
    }
    
    async authenticateWithUsername(username) {
        // Get user from cache
        let user = this.allUsers[username];
        
        if (!user) {
            this.showError('User not found');
            return;
        }
        
        const token = this.generateUserToken(username, user);
        const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem('psychStudioUserAuth', JSON.stringify({ username, token, expiry }));
        
        this.fileEncryption = new FileEncryption(username + user.passwordHash);
        
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            if (this.backgroundCanvas) {
                this.backgroundCanvas.destroy();
                this.backgroundCanvas = null;
            }
            loginScreen.remove();
        }
        
        this.showApp();
        
        this.loadProtectedFiles().catch(error => {
            console.error('Failed to load protected files:', error);
        });
    }
    
    attemptUnlock() {
        if (this.isLocked) {
            const remainingTime = Math.ceil((this.lockoutEndTime - new Date().getTime()) / 1000);
            this.showError(`Too many attempts. Try again in ${remainingTime} seconds.`);
            return;
        }
        
        const codeInput = document.getElementById('unlock-code');
        const enteredCode = codeInput ? codeInput.value.trim() : '';
        
        // Check if it's a valid code
        if (this.correctCode.includes(enteredCode)) {
            if (confirm('Would you like to create a permanent account with this code?')) {
                this.showRegistrationForm();
                const regCodeInput = document.getElementById('reg-code');
                if (regCodeInput) {
                    regCodeInput.value = enteredCode;
                }
            } else {
                this.authenticate();
            }
        } else {
            // Check if it's a used code
            const codeData = this.usedCodes.find(c => c.code === enteredCode);
            if (codeData) {
                this.showError(`This code is already registered to user: ${codeData.username}`);
            } else {
                this.attemptCount++;
                this.saveSecurityState();
                
                this.updateAttemptsDisplay();
                
                if (this.attemptCount >= this.maxAttempts) {
                    this.lockout();
                } else {
                    this.showError(`Incorrect code. ${this.maxAttempts - this.attemptCount} attempts remaining.`);
                }
                
                if (codeInput) {
                    codeInput.value = '';
                }
            }
        }
    }
    
    async completeAccountRecovery() {
        const code = document.getElementById('recovery-code')?.value.trim();
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-new-password')?.value;
        
        if (!code || !newPassword || !confirmPassword) {
            this.showError('All fields are required');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }
        
        const recoveryResult = await this.recoverAccount(code, newPassword);
        
        if (!recoveryResult.success) {
            this.showError(recoveryResult.message);
            return;
        }
        
        if (recoveryResult.username) {
            this.authenticateWithUsername(recoveryResult.username);
        } else {
            this.showError('Account recovery failed');
        }
    }
    
    async performIntegrityCheck() {
        if (this.devMode) return;
        
        const expectedHash = "b532c6ebad579dfd840d30b3fad6dff3e3140621f3db1ba589c4fa7bcab0f3d7";
        
        const currentHash = await this.calculateScriptHash();
        
        if (currentHash !== expectedHash) {
            this.handleTampering();
        }
    }
    
    calculateScriptHash() {
        const scripts = document.getElementsByTagName('script');
        let currentScript = '';
        
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.includes('security.js') || 
                scripts[i].textContent.includes('class SecurityManager')) {
                currentScript = scripts[i].textContent;
                break;
            }
        }
        
        if (!currentScript) {
            return "default";
        }
        
        let hash = 0;
        for (let i = 0; i < currentScript.length; i++) {
            const char = currentScript.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return hash.toString();
    }
    
    verifySignature() {
        if (this.devMode) return true;
        
        const scripts = document.getElementsByTagName('script');
        let scriptContent = '';
        
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.includes('security.js') || 
                scripts[i].textContent.includes('class SecurityManager')) {
                scriptContent = scripts[i].textContent;
                break;
            }
        }
        
        if (!scriptContent) return false;
        
        const signatureMatch = scriptContent.match(/\/\/ SIGNATURE:([a-f0-9]+)/);
        if (!signatureMatch) return false;
        
        const signature = signatureMatch[1];
        const content = scriptContent.replace(/\/\/ SIGNATURE:[a-f0-9]+/, '');
        
        const calculatedSignature = this.simpleHash(content);
        return calculatedSignature === signature;
    }
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    
    async validateWithServer() {
        if (this.devMode) return true;
        
        try {
            const requestId = this.generateRequestId();
            const fingerprint = this.getScriptFingerprint();
            
            const response = await fetch('https://your-secure-server.com/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId
                },
                body: JSON.stringify({
                    fingerprint: fingerprint,
                    timestamp: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error('Server validation failed');
            }
            
            const data = await response.json();
            
            if (!data.valid) {
                this.handleTampering();
            }
            
            return true;
        } catch (error) {
            console.error('Server validation error:', error);
            return false;
        }
    }
    
    generateRequestId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    getScriptFingerprint() {
        const scripts = document.getElementsByTagName('script');
        let scriptContent = '';
        
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.includes('security.js') || 
                scripts[i].textContent.includes('class SecurityManager')) {
                scriptContent = scripts[i].textContent;
                break;
            }
        }
        
        return btoa(scriptContent)
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 32);
    }
    
    handleTampering() {
        localStorage.clear();
        sessionStorage.clear();
        
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                color: #f00;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: monospace;
                z-index: 999999;
            ">
                <h1>SECURITY BREACH DETECTED</h1>
                <p>The application has been tampered with.</p>
                <p>All data has been erased.</p>
            </div>
        `;
        
        throw new Error("Security script tampered with");
    }
    
    loadSecurityState() {
        const securityState = localStorage.getItem('psychStudioSecurity');
        
        if (securityState) {
            try {
                const state = JSON.parse(securityState);
                this.attemptCount = state.attemptCount || 0;
                this.lockoutEndTime = state.lockoutEndTime || 0;
                
                if (this.lockoutEndTime > 0 && new Date().getTime() > this.lockoutEndTime) {
                    this.resetSecurityState();
                } else {
                    this.isLocked = this.lockoutEndTime > 0;
                }
            } catch (e) {
                this.resetSecurityState();
            }
        } else {
            this.resetSecurityState();
        }
    }
    
    saveSecurityState() {
        const state = {
            attemptCount: this.attemptCount,
            lockoutEndTime: this.lockoutEndTime
        };
        localStorage.setItem('psychStudioSecurity', JSON.stringify(state));
    }
    
    resetSecurityState() {
        this.attemptCount = 0;
        this.isLocked = false;
        this.lockoutEndTime = 0;
        this.saveSecurityState();
    }
    
    isAuthenticated() {
        const authData = localStorage.getItem('psychStudioAuth');
        if (!authData) return false;
        
        try {
            const { token, expiry } = JSON.parse(authData);
            return token === this.generateToken() && new Date().getTime() < expiry;
        } catch (e) {
            return false;
        }
    }
    
    generateToken() {
        const fingerprint = this.getDeviceFingerprint();
        return btoa(this.correctCode[0] + fingerprint).substring(0, 32);
    }
    
    getDeviceFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Psychological Studio', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Psychological Studio', 4, 17);
        
        return canvas.toDataURL();
    }
    
    authenticate() {
        const codeInput = document.getElementById('unlock-code');
        const enteredCode = codeInput ? codeInput.value.trim() : '';
        
        const token = this.generateToken();
        const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem('psychStudioAuth', JSON.stringify({ token, expiry }));
        
        this.fileEncryption = new FileEncryption(enteredCode);
        this.resetSecurityState();
        
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            if (this.backgroundCanvas) {
                this.backgroundCanvas.destroy();
                this.backgroundCanvas = null;
            }
            loginScreen.remove();
        }
        
        this.showApp();
        
        this.loadProtectedFiles().catch(error => {
            console.error('Failed to load protected files:', error);
        });
    }
    
    lockout() {
        this.isLocked = true;
        this.lockoutEndTime = new Date().getTime() + this.lockoutTime;
        this.saveSecurityState();
        
        this.showError('Too many failed attempts. Application locked for 300 seconds.');
        
        const attemptsLeft = document.getElementById('attempts-left');
        if (attemptsLeft) {
            attemptsLeft.textContent = 'Application locked. Please wait...';
        }
        
        this.startLockoutCountdown();
    }
    
    startLockoutCountdown() {
        const countdown = setInterval(() => {
            const remainingTime = Math.ceil((this.lockoutEndTime - new Date().getTime()) / 1000);
            
            if (remainingTime <= 0) {
                clearInterval(countdown);
                this.isLocked = false;
                this.attemptCount = 0;
                this.saveSecurityState();
                this.updateAttemptsDisplay();
            } else {
                const attemptsLeft = document.getElementById('attempts-left');
                if (attemptsLeft) {
                    attemptsLeft.textContent = `Application locked. Try again in ${remainingTime} seconds.`;
                }
            }
        }, 1000);
    }
    
    updateAttemptsDisplay() {
        const attemptsLeft = document.getElementById('attempts-left');
        if (attemptsLeft) {
            if (this.isLocked) {
                const remainingTime = Math.ceil((this.lockoutEndTime - new Date().getTime()) / 1000);
                attemptsLeft.textContent = `Application locked. Try again in ${remainingTime} seconds.`;
            } else {
                attemptsLeft.textContent = `Attempts remaining: ${this.maxAttempts - this.attemptCount}`;
            }
        }
    }
    
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            setTimeout(() => {
                errorElement.textContent = '';
            }, 5000);
        }
    }
    
    showApp() {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.display = 'flex';
            window.dispatchEvent(new Event('resize'));
        }
    }
    
    logout() {
        localStorage.removeItem('psychStudioAuth');
        localStorage.removeItem('psychStudioUserAuth');
        this.resetSecurityState();
        location.reload();
    }
    
    async loadProtectedFiles() {
        console.log("Loading protected files...");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.securityManager = new SecurityManager();
});
// SIGNATURE:4a8e2d6c9b1f5e7a3c0d9b4e6f1a5c8d2e7b9a0f3c6d1e8b4a5f7c2d9e1b6a0