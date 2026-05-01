const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const speedInput = document.getElementById('speedInput');
const gravityInput = document.getElementById('gravityInput');
const heightInput = document.getElementById('heightInput');
const timeWarpInput = document.getElementById('timeWarpInput');
const timeWarpDisplay = document.getElementById('timeWarpDisplay');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const resetGravityBtn = document.getElementById('resetGravityBtn');
const distanceValue = document.getElementById('distanceValue');
const heightValue = document.getElementById('heightValue');
const outOfBoundsAlert = document.getElementById('outOfBoundsAlert');

let animationId;
let isAnimating = false;

// Physics constants & state
const R_p = 6371000; // Earth radius in meters
let g = 9.81;

let t = 0; 
let h0_m = 1000000; // default 1000 km
let px = 0, py = R_p + h0_m;
let vx = 0, vy = 0;
let trajectory = [];

let lastTheta = 0;
let totalTheta = 0;

// Visual state
let E_x = 0;
let E_y = 0;
let currentScale = 1;
let baseScale = 1;

function updateTimeWarpDisplay() {
    let power = parseFloat(timeWarpInput.value);
    let warp = Math.pow(10, power);
    timeWarpDisplay.innerText = warp >= 1000 ? (warp/1000).toFixed(0) + "kx" : Math.floor(warp) + "x";
}
timeWarpInput.addEventListener('input', updateTimeWarpDisplay);
updateTimeWarpDisplay();

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    E_x = canvas.width / 2;
    E_y = canvas.height / 2;
    baseScale = (Math.min(canvas.width, canvas.height) * 0.25) / R_p;
    if (!isAnimating) {
        currentScale = baseScale;
        draw();
    }
}

const orbitSpeedBtn = document.getElementById('orbitSpeedBtn');

window.addEventListener('resize', resizeCanvas);

resetGravityBtn.addEventListener('click', () => {
    gravityInput.value = "9.81";
});

orbitSpeedBtn.addEventListener('click', () => {
    let current_g = parseFloat(gravityInput.value) || 9.81;
    let current_h_m = (parseFloat(heightInput.value) || 0) * 1000;
    let r = R_p + current_h_m;
    
    let v_ms = Math.sqrt(current_g * (R_p * R_p) / r);
    let v_kmh = v_ms * 3.6;
    
    speedInput.value = v_kmh.toFixed(0);
    updateDynamicEquations();
});

const escapeSpeedBtn = document.getElementById('escapeSpeedBtn');
escapeSpeedBtn.addEventListener('click', () => {
    let current_g = parseFloat(gravityInput.value) || 9.81;
    let current_h_m = (parseFloat(heightInput.value) || 0) * 1000;
    let r = R_p + current_h_m;
    
    // v_escape = sqrt(2 * g * R_p^2 / r) = sqrt(2) * v_orbit
    let v_ms = Math.sqrt(2 * current_g * (R_p * R_p) / r);
    let v_kmh = v_ms * 3.6;
    
    speedInput.value = v_kmh.toFixed(0);
    updateDynamicEquations();
});

function updateDynamicEquations() {
    let current_g = parseFloat(gravityInput.value) || 9.81;
    let current_h_m = (parseFloat(heightInput.value) || 0) * 1000;
    let r0 = R_p + current_h_m;
    let v_kmh = parseFloat(speedInput.value) || 0;
    let v_ms = v_kmh / 3.6;

    let mu = current_g * R_p * R_p;
    let v_o = Math.sqrt(mu / r0);
    let v_e = Math.sqrt(2 * mu / r0);

    let html = "";
    let epsilon = 1.0; 
    
    if (v_ms >= v_e) {
        // 4. nothing to show if it escapes
        html = "";
    } else if (Math.abs(v_ms - v_o) < epsilon) {
        // 2. Circular orbit equation from center
        html = `
            <div style="color: #4ade80; font-weight: 600; margin-bottom: 5px;">Trajectory: Circular Orbit</div>
            <div><strong>Cartesian Equation:</strong> x&sup2; + y&sup2; = r&sup2;</div>
            <div style="font-size: 12px; margin-top: 5px; color: var(--text-secondary);">
                <em>r</em> = orbit radius = ${(r0/1000).toFixed(0)} km
            </div>
        `;
    } else {
        let p = (r0 * r0 * v_ms * v_ms) / mu;
        let e = (v_ms > v_o) ? ((p / r0) - 1) : (1 - (p / r0));
        let r_p = p / (1 + e);

        if (r_p > R_p) {
            // 3. Oval (Elliptical) orbit equation from center
            let a = p / (1 - e*e);
            let b = a * Math.sqrt(1 - e*e);
            html = `
                <div style="color: #38bdf8; font-weight: 600; margin-bottom: 5px;">Trajectory: Elliptical Orbit (Oval)</div>
                <div><strong>Cartesian Equation:</strong> x&sup2; / a&sup2; + y&sup2; / b&sup2; = 1</div>
                <div style="font-size: 12px; margin-top: 5px; color: var(--text-secondary);">
                    <em>a</em> = semi-major axis = ${(a/1000).toFixed(0)} km<br>
                    <em>b</em> = semi-minor axis = ${(b/1000).toFixed(0)} km
                </div>
            `;
        } else {
            // 1. Sub-orbital (Impact) distance equation and variable explanation
            let cosTheta = (1 - p / R_p) / e;
            let d_km = 0;
            if (cosTheta >= -1 && cosTheta <= 1) {
                let theta = Math.acos(cosTheta);
                d_km = (R_p * theta) / 1000;
            }
            html = `
                <div style="color: #fbbf24; font-weight: 600; margin-bottom: 5px;">Trajectory: Sub-orbital (Impact)</div>
                <div><strong>Impact Dist (d):</strong> R<sub>e</sub> &times; arccos[(1 - p/R<sub>e</sub>)/e]</div>
                <div style="font-size: 12px; margin-top: 5px; color: var(--text-secondary); line-height: 1.4;">
                    <em>arccos</em> = inverse cosine trigonometric function<br>
                    <em>p</em> = orbital parameter = ${(p/1000).toFixed(0)} km<br>
                    <em>e</em> = orbit eccentricity = ${e.toFixed(3)}
                </div>
                <div style="margin-top: 5px; color: var(--text-primary);"><strong>d &approx; ${d_km.toFixed(2)} km</strong></div>
            `;
        }
    }

    const container = document.getElementById('dynamicEquationContainer');
    const hr = document.getElementById('dynamicEquationDivider');
    if (container) {
        container.innerHTML = html;
        if (hr) hr.style.display = html === "" ? 'none' : 'block';
    }
}

speedInput.addEventListener('input', updateDynamicEquations);
heightInput.addEventListener('input', updateDynamicEquations);
gravityInput.addEventListener('input', updateDynamicEquations);

function worldToCanvas(worldX, worldY) {
    return {
        cx: E_x + worldX * currentScale,
        cy: E_y - worldY * currentScale
    };
}

function drawEarth() {
    ctx.beginPath();
    let r_vis = R_p * currentScale;
    ctx.arc(E_x, E_y, Math.max(1, r_vis), 0, Math.PI * 2);
    
    let grad = ctx.createRadialGradient(E_x - r_vis*0.3, E_y - r_vis*0.3, r_vis*0.1, E_x, E_y, r_vis);
    grad.addColorStop(0, '#4ade80');
    grad.addColorStop(0.5, '#3b82f6');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (r_vis > 5) {
        ctx.beginPath();
        ctx.ellipse(E_x, E_y, r_vis, r_vis*0.3, 0, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(E_x, E_y, r_vis*0.3, r_vis, 0, 0, Math.PI*2);
        ctx.stroke();
    }
}

function drawPerson() {
    let ground = worldToCanvas(0, R_p);
    let top = worldToCanvas(0, R_p + h0_m);
    
    // Draw tower/mountain if starting high
    if (h0_m > 0) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ground.cx, ground.cy);
        ctx.lineTo(top.cx, top.cy);
        ctx.stroke();
    }

    const visualHeight = 20; 
    let head_cx = top.cx;
    let head_cy = top.cy - visualHeight;

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Body
    ctx.moveTo(top.cx, top.cy); 
    ctx.lineTo(head_cx, top.cy - visualHeight * 0.7); 
    // Head
    ctx.arc(head_cx, top.cy - visualHeight * 0.85, 4, 0, Math.PI * 2);
    // Arm throwing
    ctx.moveTo(head_cx, top.cy - visualHeight * 0.6);
    ctx.lineTo(head_cx + 8, head_cy);
    ctx.stroke();
}

function drawTrajectory() {
    if (trajectory.length === 0) return;

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    
    let startPoint = worldToCanvas(trajectory[0].x, trajectory[0].y);
    ctx.moveTo(startPoint.cx, startPoint.cy);
    
    for (let i = 1; i < trajectory.length; i++) {
        let pt = worldToCanvas(trajectory[i].x, trajectory[i].y);
        ctx.lineTo(pt.cx, pt.cy);
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawBall() {
    const pt = worldToCanvas(px, py);
    
    // Draw the ball slightly exaggerated so it's always visible
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#6366f1';
    
    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.arc(pt.cx, pt.cy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0; 
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEarth();
    if (currentScale > baseScale * 0.05) {
        drawPerson();
    }
    drawTrajectory();
    drawBall();
}

function formatDist(m) {
    if (m >= 10000) {
        return (m / 1000).toFixed(2) + ' km';
    }
    return m.toFixed(2) + ' m';
}

let lastTimestamp = 0;
let lastTrajTime = 0;

function animate(timestamp) {
    if (!isAnimating) return;

    if (!lastTimestamp) lastTimestamp = timestamp;
    let deltaSec = (timestamp - lastTimestamp) / 1000; 
    lastTimestamp = timestamp;

    if (deltaSec > 0.1) deltaSec = 0.1; // Prevent massive jumps
    
    let power = parseFloat(timeWarpInput.value);
    let timeMultiplier = Math.pow(10, power);
    let simDelta = deltaSec * timeMultiplier;

    let dt = 0.05; // 50ms internal physics step for stability
    let steps = Math.ceil(simDelta / dt);
    let actualDt = simDelta / steps;

    for (let i = 0; i < steps; i++) {
        let r = Math.sqrt(px*px + py*py);
        
        // Hit the Earth
        if (r <= R_p) {
            let factor = R_p / r;
            px *= factor;
            py *= factor;
            isAnimating = false;
            
            // final update
            updateStats(R_p);
            trajectory.push({x: px, y: py});
            draw();
            
            setTimeout(() => {
                resetAnimation();
            }, 1500);
            return;
        }

        let a = g * Math.pow(R_p / r, 2);
        let ax = -a * (px / r);
        let ay = -a * (py / r);

        vx += ax * actualDt;
        vy += ay * actualDt;
        px += vx * actualDt;
        py += vy * actualDt;
        
        t += actualDt;

        // Escape check: Mechanical energy >= 0
        let v2 = vx*vx + vy*vy;
        let energy = v2/2 - (g * R_p * R_p) / r;
        
        // If energy > 0 and moving away, and far enough
        if (energy >= 0 && (px*vx + py*vy) > 0 && r > R_p * 10) {
            isAnimating = false;
            outOfBoundsAlert.innerText = "Escape Velocity Reached! Ball left Earth.";
            outOfBoundsAlert.classList.remove('hidden');
            draw();
            return;
        }
    }

    let r = Math.sqrt(px*px + py*py);
    updateStats(r);

    // Save trajectory points periodically based on sim time
    if (t - lastTrajTime > Math.max(1, timeMultiplier * 0.02)) {
        trajectory.push({x: px, y: py});
        lastTrajTime = t;
        if (trajectory.length > 3000) {
            trajectory.shift();
        }
    }

    // Dynamic Camera Zoom
    let targetScale = baseScale;
    if (r * targetScale > (canvas.height / 2) * 0.8) {
        targetScale = ((canvas.height / 2) * 0.8) / r;
    }
    currentScale += (targetScale - currentScale) * 0.05;

    draw();
    animationId = requestAnimationFrame(animate);
}

function updateStats(r) {
    let currentTheta = Math.atan2(px, py);
    let deltaTheta = currentTheta - lastTheta;
    if (deltaTheta > Math.PI) deltaTheta -= 2*Math.PI;
    if (deltaTheta < -Math.PI) deltaTheta += 2*Math.PI;
    totalTheta += deltaTheta;
    lastTheta = currentTheta;

    let distanceTraveled = Math.abs(totalTheta) * R_p;
    let altitude = r - R_p;

    distanceValue.innerText = formatDist(distanceTraveled);
    heightValue.innerText = formatDist(Math.max(0, altitude));
}

function startAnimation() {
    if (isAnimating) return;
    
    outOfBoundsAlert.classList.add('hidden');
    
    let speed_kmh = parseFloat(speedInput.value);
    g = parseFloat(gravityInput.value);
    h0_m = parseFloat(heightInput.value) * 1000;

    if (speed_kmh > 500000) speed_kmh = 500000;
    if (g <= 0) g = 0.1;

    let v0 = speed_kmh / 3.6;
    let theta_rad = 0; // Forced to 0 degrees for horizontal orbit throws

    px = 0;
    py = R_p + h0_m;
    // Angle 0 = horizontal throw (along X)
    // Angle 90 = straight up (along Y)
    vx = v0 * Math.cos(theta_rad);
    vy = v0 * Math.sin(theta_rad);

    t = 0;
    trajectory = [];
    isAnimating = true;
    lastTimestamp = 0;
    lastTrajTime = 0;

    lastTheta = Math.atan2(px, py);
    totalTheta = 0;

    distanceValue.innerText = "0.00 m";
    heightValue.innerText = formatDist(h0_m);

    animationId = requestAnimationFrame(animate);
}

function resetAnimation() {
    isAnimating = false;
    cancelAnimationFrame(animationId);
    outOfBoundsAlert.classList.add('hidden');
    
    h0_m = parseFloat(heightInput.value) * 1000 || 0;
    px = 0;
    py = R_p + h0_m;
    
    currentScale = baseScale;
    draw();
}

startBtn.addEventListener('click', startAnimation);
resetBtn.addEventListener('click', resetAnimation);

// Initialization
resizeCanvas();
resetAnimation();
updateDynamicEquations();
