// Security Manager - OFFLINE VERSION
// No backend server needed - all validation is client-side

class SecurityManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.fileEncryption = null;
        this.backgroundCanvas = null;
        
        // Valid security codes - ONLY these work
        this.validCodes = [
            "020PSY969666POWER900", "030PSY969666POWER800", "040PSY969666POWER700", "050PSY969666POWER600", 
            "060PSY969666POWER500", "070PSY969666POWER400", "080PSY969666POWER300", "090PSY969666POWER200", 
            "100PSY969666POWER001", "200PSY969666POWER002", "0a2b0c9x6y9z61626392010", "0a2b0c9x6y9z62626392010", 
            "0a2b0c9x6z9z62696392010", "0a2b0c9x6y9w62626392810", "0a2f0c9x6y9z62626390010", 
            "0a2bhc9x6y9z62w26392010", "0a2x0c9xwy9z6262y392010"
        ];
        
        this.devMode = false;
        this.maxAttempts = 3;
        this.attemptCount = 0;
        this.lockoutTime = 300000; // 5 minutes
        this.isLocked = false;
        this.lockoutEndTime = 0;
    }

    /**
     * Initialize security (check if already authenticated)
     */
    async init() {
        try {
            // Check if we have a valid token
            if (this.token) {
                console.log('✅ User already authenticated (offline mode)');
                return true;
            } else {
                this.showLoginScreen();
                return false;
            }
        } catch (error) {
            console.error('Error initializing security:', error);
            this.showLoginScreen();
            return false;
        }
    }

    /**
     * Authenticate with security code (offline mode)
     */
    async authenticateWithCode(code) {
        try {
            // Check if code is valid
            if (!this.validCodes.includes(code)) {
                this.attemptCount++;
                
                if (this.attemptCount >= this.maxAttempts) {
                    this.isLocked = true;
                    this.lockoutEndTime = Date.now() + this.lockoutTime;
                    localStorage.setItem('lockoutEndTime', this.lockoutEndTime);
                    throw new Error(`Too many attempts. Locked for ${this.lockoutTime / 1000 / 60} minutes.`);
                }
                
                throw new Error(`Invalid code. ${this.maxAttempts - this.attemptCount} attempts remaining.`);
            }

            // Code is valid - authenticate user
            this.token = 'offline_token_' + Date.now();
            this.user = { authenticated: true, code: code, timestamp: new Date().toISOString() };
            
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            localStorage.setItem('usedCode', code);
            this.attemptCount = 0;

            console.log('✅ Authentication successful (offline mode)');
            return { authenticated: true, user: this.user };
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    /**
     * Check if code is valid (offline mode)
     */
    isCodeValid(code) {
        return this.validCodes.includes(code);
    }

    /**
     * Check if user is currently locked out
     */
    isLockedOut() {
        const lockoutEnd = localStorage.getItem('lockoutEndTime');
        if (lockoutEnd && Date.now() < parseInt(lockoutEnd)) {
            return true;
        }
        localStorage.removeItem('lockoutEndTime');
        return false;
    }

    /**
     * Logout user
     */
    logout() {
        this.clearAuth();
        this.showLoginScreen();
        console.log('✅ Logged out');
    }

    /**
     * Clear authentication
     */
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    /**
     * Show login screen
     */
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
            
            <div id="auth-form" class="login-form">
                <p style="margin-bottom: 20px; color: #aaa;">Enter Security Code</p>
                
                <input type="password" id="code-input" placeholder="Security Code" style="
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 20px;
                    border: none;
                    border-radius: 5px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    font-size: 16px;
                    box-sizing: border-box;
                ">
                
                <button id="login-btn" style="
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
                ">Unlock</button>
                
                <p id="login-status" style="margin-top: 15px; color: #aaa; font-size: 12px;"></p>
            </div>
        `;

        document.body.appendChild(loginScreen);

        // Add event listeners
        const loginBtn = document.getElementById('login-btn');
        const statusMsg = document.getElementById('login-status');

        loginBtn.addEventListener('click', async () => {
            await this.attemptLogin(statusMsg);
        });

        // Allow Enter key to login
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && document.getElementById('login-screen')) {
                this.attemptLogin(statusMsg);
            }
        });
    }

    /**
     * Attempt authentication with code
     */
    async attemptLogin(statusMsg) {
        // Check if user is locked out
        if (this.isLockedOut()) {
            const lockoutEnd = localStorage.getItem('lockoutEndTime');
            const remainingTime = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 1000 / 60);
            this.showAuthError(`Too many attempts. Try again in ${remainingTime} minute(s).`, statusMsg);
            return;
        }

        const codeInput = document.getElementById('code-input');
        const code = codeInput.value.trim();

        if (!code) {
            this.showAuthError('Please enter a security code.', statusMsg);
            return;
        }

        try {
            statusMsg.textContent = 'Verifying code...';
            statusMsg.style.color = '#717d9f';

            // Authenticate with code (offline validation)
            await this.authenticateWithCode(code);
            
            statusMsg.textContent = 'Access granted!';
            statusMsg.style.color = '#66cc00';
            
            setTimeout(() => {
                this.removeLoginScreen();
            }, 500);
        } catch (error) {
            console.error('Auth error:', error);
            this.showAuthError(error.message, statusMsg);
            codeInput.value = '';
        }
    }

    /**
     * Show authentication error
     */
    showAuthError(message, statusMsg) {
        statusMsg.textContent = message;
        statusMsg.style.color = '#ff6b6b';
    }

    /**
     * Show welcome popup
     */
    showWelcomePopup() {
        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'welcome-popup-overlay';
        popupOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            font-family: Arial, sans-serif;
        `;

        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #930018;
            border-radius: 10px;
            padding: 50px;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            color: white;
        `;

        popupContent.innerHTML = `
            <h2 style="color: #717d9f; margin-bottom: 20px; font-size: 28px;">Welcome ${this.user.username}!</h2>
            <p style="color: #aaa; margin-bottom: 10px; font-size: 18px;">You now have access to <span style="color: #930018; font-weight: bold;">Pro</span>!</p>
            
            <h3 style="color: #717d9f; margin-top: 30px; margin-bottom: 20px; font-size: 20px;">You can now access:</h3>
            
            <ul style="text-align: left; display: inline-block; color: #aaa; list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;">✅ Full Psychological Studio</li>
                <li style="margin-bottom: 10px;">✅ All Audio Effects</li>
                <li style="margin-bottom: 10px;">✅ Advanced EQ System</li>
                <li style="margin-bottom: 10px;">✅ LFO Automation</li>
                <li style="margin-bottom: 10px;">✅ Arrangement Tools</li>
                <li style="margin-bottom: 10px;">✅ Premium Features</li>
            </ul>
            
            <p style="color: #999; margin-top: 30px; font-size: 14px; font-style: italic;">Click anywhere to continue</p>
        `;

        popupOverlay.appendChild(popupContent);
        document.body.appendChild(popupOverlay);

        popupOverlay.addEventListener('click', () => {
            popupOverlay.remove();
        });

        popupContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Remove login screen
     */
    removeLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            if (this.backgroundCanvas) {
                this.backgroundCanvas.destroy();
                this.backgroundCanvas = null;
            }
            loginScreen.remove();
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    /**
     * Get current user
     */
    getUser() {
        return this.user;
    }
}

// Initialize on page load
let securityManager;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize security manager (connect to backend)
    const backendUrl = window.BACKEND_URL || 'http://localhost:3000';
    securityManager = new SecurityManager(backendUrl);

    // Check authentication
    const isAuth = await securityManager.init();

    if (!isAuth) {
        console.log('User not authenticated, showing login screen');
    } else {
        console.log('User authenticated:', securityManager.getUser());
    }
});
