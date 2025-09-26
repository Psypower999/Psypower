// Background Canvas Class
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
        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Add canvas to container
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.container.appendChild(this.canvas);
        
        // Create particles
        this.createParticles();
        
        // Start animation
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
        
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Bounce off edges
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            
            // Draw connections
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

// File encryption utility
class FileEncryption {
    constructor(password) {
        this.password = password;
    }

    // Simple XOR encryption for demonstration (use stronger encryption in production)
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

// Security Manager with enhanced protection
class SecurityManager {
    constructor() {
        // DEVELOPMENT MODE FLAG - Set to false for production
        this.devMode = true;
        
        if (this.devMode) {
            // Skip security checks in development mode
            this.initSecurity();
        } else {
            // SECURITY CHECK: Perform integrity check first
            this.performIntegrityCheck().then(() => {
                // SECURITY CHECK: Verify signature
                if (!this.verifySignature()) {
                    this.handleTampering();
                }
                
                // SECURITY CHECK: Validate with server
                this.validateWithServer().catch(error => {
                    console.error('Server validation failed:', error);
                });
                
                // Original initialization code
                this.initSecurity();
            }).catch(error => {
                console.error('Integrity check failed:', error);
                this.handleTampering();
            });
        }
    }
    
    initSecurity() {
        this.correctCode = "020PSY969666POWER900";
        this.maxAttempts = 3;
        this.lockoutTime = 300000; // 300 seconds lockout (5 minutes)
        this.isLocked = false;
        this.lockoutEndTime = 0;
        this.fileEncryption = null;
        this.backgroundCanvas = null;
        
        // Load security state from localStorage
        this.loadSecurityState();
        
        // Initialize security
        this.init();
    }
    
    // SECURITY METHOD: Integrity check
    async performIntegrityCheck() {
        // In development mode, skip this check
        if (this.devMode) return;
        
        // Expected hash of the original script (will be calculated after obfuscation)
        const expectedHash = "4481938e61b7d351f309cd9e052f0fb46aa5436ab38f44f31a9a55cc143a1c11";
        
        // Calculate hash of current script
        const currentHash = await this.calculateScriptHash();
        
        if (currentHash !== expectedHash) {
            this.handleTampering();
        }
    }
    
    // SECURITY METHOD: Calculate script hash
    calculateScriptHash() {
        // Get current script content
        const scripts = document.getElementsByTagName('script');
        let currentScript = '';
        
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.includes('security.js') || 
                scripts[i].textContent.includes('class SecurityManager')) {
                currentScript = scripts[i].textContent;
                break;
            }
        }
        
        // If no script content found, return a default value
        if (!currentScript) {
            return "default";
        }
        
        // Simple hash function (use a stronger one in production)
        let hash = 0;
        for (let i = 0; i < currentScript.length; i++) {
            const char = currentScript.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return hash.toString();
    }
    
    // SECURITY METHOD: Verify digital signature
    verifySignature() {
        // In development mode, skip this check
        if (this.devMode) return true;
        
        // Extract signature from the end of the script
        const scripts = document.getElementsByTagName('script');
        let scriptContent = '';
        
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.includes('security.js') || 
                scripts[i].textContent.includes('class SecurityManager')) {
                scriptContent = scripts[i].textContent;
                break;
            }
        }
        
        // If no script content found, return false
        if (!scriptContent) return false;
        
        // Extract signature
        const signatureMatch = scriptContent.match(/\/\/ SIGNATURE:([a-f0-9]+)/);
        if (!signatureMatch) return false;
        
        const signature = signatureMatch[1];
        const content = scriptContent.replace(/\/\/ SIGNATURE:[a-f0-9]+/, '');
        
        // For demonstration, we'll use a simple verification
        // In production, use proper cryptographic verification
        const calculatedSignature = this.simpleHash(content);
        return calculatedSignature === signature;
    }
    
    // SECURITY METHOD: Simple hash for signature verification
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    
    // SECURITY METHOD: Remote validation
    async validateWithServer() {
        // In development mode, skip this check
        if (this.devMode) return true;
        
        try {
            // Generate a unique request ID
            const requestId = this.generateRequestId();
            
            // Get script fingerprint
            const fingerprint = this.getScriptFingerprint();
            
            // Send validation request to your secure server
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
            // For development, we'll allow continuation
            // In production, you might want to call handleTampering() here
            return false;
        }
    }
    
    // SECURITY METHOD: Generate unique request ID
    generateRequestId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // SECURITY METHOD: Get script fingerprint
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
        
        // Create a fingerprint of the script
        return btoa(scriptContent)
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 32);
    }
    
    // SECURITY METHOD: Handle tampering
    handleTampering() {
        // Clear all sensitive data
        localStorage.clear();
        sessionStorage.clear();
        
        // Display tampering warning
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
        
        // Prevent further execution
        throw new Error("Security script tampered with");
    }
    
    // Original methods continue below
    loadSecurityState() {
        const securityState = localStorage.getItem('psychStudioSecurity');
        
        if (securityState) {
            try {
                const state = JSON.parse(securityState);
                this.attemptCount = state.attemptCount || 0;
                this.lockoutEndTime = state.lockoutEndTime || 0;
                
                // Check if lockout has expired
                if (this.lockoutEndTime > 0 && new Date().getTime() > this.lockoutEndTime) {
                    this.resetSecurityState();
                } else {
                    this.isLocked = this.lockoutEndTime > 0;
                }
            } catch (e) {
                // If parsing fails, reset state
                this.resetSecurityState();
            }
        } else {
            // No saved state, initialize
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
    
    init() {
        // Check if user is already authenticated
        if (this.isAuthenticated()) {
            this.showApp();
        } else {
            this.showLoginScreen();
        }
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
        // Generate a token based on the correct code and device fingerprint
        const fingerprint = this.getDeviceFingerprint();
        return btoa(this.correctCode + fingerprint).substring(0, 32);
    }
    
    getDeviceFingerprint() {
        // Simple device fingerprinting
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
    
    showLoginScreen() {
        // Remove any existing login screen
        const existingLoginScreen = document.getElementById('login-screen');
        if (existingLoginScreen) {
            existingLoginScreen.remove();
        }
        
        // Create login screen
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
        
        // Create background canvas
        this.backgroundCanvas = new BackgroundCanvas(loginScreen);
        
        // Create login form
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
            <p style="margin-bottom: 20px; color: #aaa;">Enter unlock code to continue</p>
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
            <div id="error-message" style="color: #ff4444; margin-top: 15px; min-height: 20px;"></div>
            <div id="attempts-left" style="color: #aaa; margin-top: 10px; font-size: 14px;"></div>
        `;
        
        loginScreen.appendChild(loginForm);
        document.body.appendChild(loginScreen);
        
        // Add event listeners with arrow functions to maintain context
        const unlockBtn = document.getElementById('unlock-btn');
        const unlockInput = document.getElementById('unlock-code');
        
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => this.attemptUnlock());
        }
        
        if (unlockInput) {
            unlockInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.attemptUnlock();
            });
        }
        
        // Update attempts display
        this.updateAttemptsDisplay();
        
        // If locked, start countdown
        if (this.isLocked) {
            this.startLockoutCountdown();
        }
    }
    
    attemptUnlock() {
        if (this.isLocked) {
            const remainingTime = Math.ceil((this.lockoutEndTime - new Date().getTime()) / 1000);
            this.showError(`Too many attempts. Try again in ${remainingTime} seconds.`);
            return;
        }
        
        const codeInput = document.getElementById('unlock-code');
        const enteredCode = codeInput ? codeInput.value.trim() : '';
        
        if (enteredCode === this.correctCode) {
            this.authenticate();
        } else {
            this.attemptCount++;
            this.saveSecurityState(); // Save updated attempt count
            
            this.updateAttemptsDisplay();
            
            if (this.attemptCount >= this.maxAttempts) {
                this.lockout();
            } else {
                this.showError(`Incorrect code. ${this.maxAttempts - this.attemptCount} attempts remaining.`);
            }
            
            // Clear input
            if (codeInput) {
                codeInput.value = '';
            }
        }
    }
    
    authenticate() {
        // Store authentication token
        const token = this.generateToken();
        const expiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('psychStudioAuth', JSON.stringify({ token, expiry }));
        
        // Initialize file encryption with the correct code
        this.fileEncryption = new FileEncryption(this.correctCode);
        
        // Reset security state on successful authentication
        this.resetSecurityState();
        
        // Remove login screen
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            // Clean up background canvas
            if (this.backgroundCanvas) {
                this.backgroundCanvas.destroy();
                this.backgroundCanvas = null;
            }
            loginScreen.remove();
        }
        
        // Show app
        this.showApp();
        
        // Decrypt and load protected files
        this.loadProtectedFiles().catch(error => {
            console.error('Failed to load protected files:', error);
        });
    }
    
    lockout() {
        this.isLocked = true;
        this.lockoutEndTime = new Date().getTime() + this.lockoutTime;
        this.saveSecurityState(); // Save lockout state
        
        this.showError('Too many failed attempts. Application locked for 300 seconds.');
        
        // Update display
        const attemptsLeft = document.getElementById('attempts-left');
        if (attemptsLeft) {
            attemptsLeft.textContent = 'Application locked. Please wait...';
        }
        
        // Start countdown
        this.startLockoutCountdown();
    }
    
    startLockoutCountdown() {
        const countdown = setInterval(() => {
            const remainingTime = Math.ceil((this.lockoutEndTime - new Date().getTime()) / 1000);
            
            if (remainingTime <= 0) {
                clearInterval(countdown);
                this.isLocked = false;
                this.attemptCount = 0;
                this.saveSecurityState(); // Save reset state
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
        // The app is already in the HTML, just make sure it's visible
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.display = 'flex';
            
            // Trigger resize event to fix grid sizing issue
            window.dispatchEvent(new Event('resize'));
        }
    }
    
    logout() {
        // Clear all stored data
        localStorage.removeItem('psychStudioAuth');
        this.resetSecurityState();
        location.reload();
    }
    
    async loadProtectedFiles() {
        console.log("Loading protected files...");
        // Implementation would go here
    }
}

// Initialize security when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
});

// SIGNATURE:7f4a1b9c3e8d6f2a5c7b9e1d4f6a8b2c