// Get DOM elements
const complexCanvas = document.getElementById('complexCanvas');
const ctx1 = complexCanvas.getContext('2d');

const sineCanvas = document.getElementById('sineCanvas');
const ctx2 = sineCanvas.getContext('2d');

const xDisplay = document.getElementById('xDisplay');
const speedSlider = document.getElementById('speedSlider');
const speedVal = document.getElementById('speedVal');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

// State
let isRunning = true;
let x_val = 0;
let animationId = null;
let pathHistory = []; // Stores {x, y} for complex plane
let sineHistory = []; // Stores {xVal, y} for sine wave

// Constants
const BASE_SPEED = 0.03; // Adjust speed of x per frame
const MAX_SINE_POINTS = 500; // Limit trail length for performance

// Update speed text on slider move
speedSlider.addEventListener('input', () => {
    speedVal.textContent = parseFloat(speedSlider.value).toFixed(1);
});

// Coordinate systems mappings
// Complex Plane: Center is (0,0), scale [-1.5, 1.5] -> [0, 400]
function mapComplex(x, y) {
    const scale = 400 / 3; // 1.5 - (-1.5) = 3
    return {
        cx: (x + 1.5) * scale,
        cy: 400 - (y + 1.5) * scale // Flip Y for canvas
    };
}

// Sine Canvas: X is from `currentXOffset` to `currentXOffset + X_RANGE`, Y is [-1.5, 1.5]
let currentXOffset = 0;
const X_RANGE = 4 * Math.PI;

function mapSine(xVal, y) {
    const scaleY = 400 / 3;
    // Map x from [currentXOffset, currentXOffset + X_RANGE] to [0, 600]
    const cx = ((xVal - currentXOffset) / X_RANGE) * 600;
    return {
        cx: cx,
        cy: 400 - (y + 1.5) * scaleY
    };
}

// Draw grids
function drawGrid(ctx, width, height, isComplex) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Complex plane grid
    if (isComplex) {
        ctx.beginPath();
        ctx.moveTo(0, height/2); ctx.lineTo(width, height/2);
        ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height);
        ctx.stroke();
        
        // Ticks and values for X and Y [-1, 0, 1]
        const vals = [-1, 0, 1];
        vals.forEach(v => {
            if (v !== 0) {
                // X axis
                const ptX = mapComplex(v, 0);
                ctx.fillText(v.toString(), ptX.cx, height/2 + 15);
                ctx.fillRect(ptX.cx - 1, height/2 - 4, 2, 8); // Tick mark
                
                // Y axis
                const ptY = mapComplex(0, v);
                ctx.fillText(v.toString() + 'i', width/2 - 20, ptY.cy);
                ctx.fillRect(width/2 - 4, ptY.cy - 1, 8, 2); // Tick mark
            }
        });
        ctx.fillText('0', width/2 - 10, height/2 + 15);
        
    } else {
        // Sine plane grid
        ctx.beginPath();
        ctx.moveTo(0, height/2); ctx.lineTo(width, height/2);
        ctx.stroke();
        
        // Y axis ticks
        const vals = [-1, 0, 1];
        ctx.textAlign = 'left';
        vals.forEach(v => {
            const ptY = mapSine(0, v);
            if (v !== 0) {
                ctx.fillText(v.toString(), 5, ptY.cy);
            } else {
                ctx.fillText('0', 5, ptY.cy + 15);
            }
        });
        
        // X axis ticks (multiples of pi/2)
        ctx.textAlign = 'center';
        const pi2 = Math.PI / 2;
        const startIdx = Math.ceil(currentXOffset / pi2);
        const endIdx = Math.floor((currentXOffset + X_RANGE) / pi2);
        
        for (let i = startIdx; i <= endIdx; i++) {
            const val = i * pi2;
            const ptX = mapSine(val, 0);
            
            let label = "";
            if (i === 0) label = "0";
            else if (i === 1) label = "π/2";
            else if (i === 2) label = "π";
            else if (i % 2 === 0) label = (i/2) + "π";
            else label = i + "π/2";
            
            ctx.fillText(label, ptX.cx, height/2 + 15);
            ctx.fillRect(ptX.cx - 1, height/2 - 4, 2, 8); // Tick mark
        }
    }
}

// Draw vector with arrow
function drawArrow(ctx, fromX, fromY, toX, toY, color) {
    const headlen = 10; // length of head in pixels
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fill();
}

function render() {
    // Clear canvases
    ctx1.clearRect(0, 0, complexCanvas.width, complexCanvas.height);
    ctx2.clearRect(0, 0, sineCanvas.width, sineCanvas.height);
    
    // Draw Grids
    drawGrid(ctx1, 400, 400, true);
    drawGrid(ctx2, 600, 400, false);
    
    // Math
    const r_x = Math.cos(x_val);
    const r_y = Math.sin(x_val);
    const v_x = -Math.sin(x_val); // Derivative real part
    const v_y = Math.cos(x_val);  // Derivative imag part
    
    // Store history
    pathHistory.push({x: r_x, y: r_y});
    sineHistory.push({xVal: x_val, y: r_y});
    
    if (sineHistory.length > MAX_SINE_POINTS * 2) {
        sineHistory.shift();
    }
    if (pathHistory.length > MAX_SINE_POINTS) {
        pathHistory.shift(); // Keep only recent path
    }

    // Scroll sine canvas if needed
    if (x_val > currentXOffset + X_RANGE * 0.9) {
        currentXOffset = x_val - X_RANGE * 0.9;
    }

    // ---- Draw Canvas 1: Complex Plane ----
    const origin = mapComplex(0, 0);
    const pos = mapComplex(r_x, r_y);
    const vel = mapComplex(r_x + v_x, r_y + v_y);

    // Draw unit circle
    ctx1.beginPath();
    ctx1.arc(origin.cx, origin.cy, 400/3, 0, 2 * Math.PI);
    ctx1.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx1.setLineDash([5, 5]);
    ctx1.stroke();
    ctx1.setLineDash([]); // Reset
    
    // Draw path history
    if (pathHistory.length > 0) {
        ctx1.beginPath();
        for (let i = 0; i < pathHistory.length; i++) {
            const pt = mapComplex(pathHistory[i].x, pathHistory[i].y);
            if (i === 0) ctx1.moveTo(pt.cx, pt.cy);
            else ctx1.lineTo(pt.cx, pt.cy);
        }
        ctx1.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx1.lineWidth = 2;
        ctx1.stroke();
    }

    // Draw vectors
    drawArrow(ctx1, origin.cx, origin.cy, pos.cx, pos.cy, '#3b82f6'); // Position (Blue)
    drawArrow(ctx1, pos.cx, pos.cy, vel.cx, vel.cy, '#ef4444');       // Velocity (Red)

    // ---- Draw Canvas 2: Sine Wave ----
    if (sineHistory.length > 0) {
        ctx2.beginPath();
        for (let i = 0; i < sineHistory.length; i++) {
            const pt = mapSine(sineHistory[i].xVal, sineHistory[i].y);
            // Only draw points within visible range
            if (pt.cx >= 0) {
                if (i === 0) ctx2.moveTo(pt.cx, pt.cy);
                else ctx2.lineTo(pt.cx, pt.cy);
            }
        }
        ctx2.strokeStyle = '#22c55e'; // Green sine wave
        ctx2.lineWidth = 3;
        ctx2.stroke();
    }
    
    // Draw current point on sine wave
    const currentSine = mapSine(x_val, r_y);
    ctx2.beginPath();
    ctx2.arc(currentSine.cx, currentSine.cy, 6, 0, 2 * Math.PI);
    ctx2.fillStyle = '#22c55e';
    ctx2.fill();
    
    // Update text
    xDisplay.textContent = `x = ${x_val.toFixed(2)}`;

    // Loop
    if (isRunning) {
        const speedMultiplier = parseFloat(speedSlider.value);
        x_val += BASE_SPEED * speedMultiplier;
        animationId = requestAnimationFrame(render);
    }
}

// Initial render
render();

// Controls
startBtn.addEventListener('click', () => {
    isRunning = !isRunning;
    startBtn.textContent = isRunning ? 'Pause' : 'Start';
    startBtn.style.backgroundColor = isRunning ? 'var(--success)' : '#f59e0b';
    if (isRunning) render();
});

stopBtn.addEventListener('click', () => {
    isRunning = false;
    x_val = 0;
    currentXOffset = 0;
    pathHistory = [];
    sineHistory = [];
    
    if (animationId) cancelAnimationFrame(animationId);
    
    startBtn.textContent = 'Start';
    startBtn.style.backgroundColor = '#f59e0b';
    
    render(); // Draw initial state
});
