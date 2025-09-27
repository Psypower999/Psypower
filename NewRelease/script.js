const canvas = document.getElementById("backgroundCanvas");
const ctx = canvas.getContext("2d");

// Function to set canvas size
function setCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
    
    // Update gradient with consistent radius relative to canvas size
    const radius = Math.min(canvas.width, canvas.height) * 0.5;
    gradient = ctx.createRadialGradient(
        canvas.width/(2*dpr), canvas.height/(2*dpr), radius * 0.1, 
        canvas.width/(2*dpr), canvas.height/(2*dpr), radius
    );
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.2, 'yellow');
    gradient.addColorStop(0.4, 'green');
    gradient.addColorStop(0.6, 'cyan');
    gradient.addColorStop(0.8, 'blue');
    gradient.addColorStop(1, 'magenta');
}

// Initialize canvas size
setCanvasSize();

let gradient = ctx.createRadialGradient(
    canvas.width/2, canvas.height/2, 100, 
    canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height) * 0.5
);
gradient.addColorStop(0, 'red');
gradient.addColorStop(0.2, 'yellow');
gradient.addColorStop(0.4, 'green');
gradient.addColorStop(0.6, 'cyan');
gradient.addColorStop(0.8, 'blue');
gradient.addColorStop(1, 'magenta');

class Symbol {
    constructor(x, y, fontSize, canvasHeight){
        this.characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.text = '';
        this.canvasHeight = canvasHeight;
    }
    draw(context){
        this.text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
        context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);
        if (this.y * this.fontSize > this.canvasHeight && Math.random() > 0.95){
            this.y = 0;
        } else {
            this.y += 1;
        }
    }
}

class Effect {
    constructor(canvasWidth, canvasHeight){
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.fontSize = 25;
        this.columns = this.canvasWidth / this.fontSize;
        this.symbols = [];
        this.#initialize();
    }
    #initialize(){
        for (let i = 0; i < this.columns; i++){
            this.symbols[i] = new Symbol(i, 0, this.fontSize, this.canvasHeight);
        }
    }
    resize(width, height){
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.columns = this.canvasWidth/this.fontSize;
        this.symbols = [];
        this.#initialize();
    }
}

const effect = new Effect(canvas.width, canvas.height);
let lastTime = 0;
const fps = 30;
const nextFrame = 1000/fps;
let timer = 0;

function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    if (timer > nextFrame){
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.textAlign = 'center';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#801070';
        ctx.font = effect.fontSize + 'px monospace';
        ctx.fillStyle = gradient;
        effect.symbols.forEach(symbol => symbol.draw(ctx));
        timer = 0;
    } else {
        timer += deltaTime;
    }
    requestAnimationFrame(animate);
}

// Debounced resize handler
let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setCanvasSize();
        effect.resize(canvas.width, canvas.height);
    }, 100);
}

// Initial animation start with a small delay to ensure proper viewport calculation
setTimeout(() => {
    animate(0);
}, 100);

window.addEventListener('resize', handleResize);

// Also listen for orientation change as it sometimes doesn't trigger resize properly
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 200);
});

