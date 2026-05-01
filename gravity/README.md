# Gravity & Orbital Physics Simulator

This interactive web application is a modern physics simulator heavily inspired by Isaac Newton's famous "Cannonball" thought experiment. It visually demonstrates how simple parabolic projectile motion (like throwing a ball) scales up into complex orbital mechanics when extreme speeds and altitudes are involved.

## How the Simulator Works

The simulator uses a true **Newtonian 2-body numerical integration engine** to calculate the ball's trajectory frame-by-frame. 

- **Slow Speeds (e.g., 50 km/h):** The ball travels a tiny distance and drops to the ground, exactly like throwing a baseball. The Earth appears essentially flat from the ball's perspective.
- **High Speeds (e.g., 20,000 km/h):** The ball travels far enough that the curvature of the Earth drops away beneath it. The trajectory stretches out significantly.
- **Orbital Speeds (e.g., 26,500 km/h):** The ball moves forward so fast that as gravity pulls it down, the Earth curves away at the exact same rate. The ball is in a constant state of "free fall" but never hits the ground, resulting in an orbit.
- **Escape Speeds (e.g., 40,000 km/h):** The kinetic energy of the ball is so high that Earth's gravitational pull can never slow it down enough to bring it back. The ball leaves Earth permanently on a hyperbolic trajectory.

## The Physics & Governing Equations

### 1. Local Gravity Acceleration ($a$)
Gravity is not constant; it gets weaker the further you are from the center of the Earth (an inverse-square law).
* $g$ = Surface gravity (default $9.81\ m/s^2$)
* $R_e$ = Radius of the Earth ($6,371\ km$)
* $r$ = Current distance from the center of the Earth to the ball

**Equation:**
$$a = g \times \left(\frac{R_e}{r}\right)^2$$
*This acceleration is constantly applied to the ball, pulling it strictly toward the center of the Earth.*

### 2. Circular Orbital Velocity ($v_o$)
To achieve a perfect circular orbit, the centripetal acceleration required to keep the ball moving in a circle must perfectly match the local gravitational acceleration.
**Equation:**
$$v_o = \sqrt{\frac{g \times R_e^2}{r}}$$
*If you throw the ball exactly at this speed horizontally, it will orbit in a perfect circle. If you throw it slightly faster, the orbit becomes an oval (an ellipse) as described by Kepler's First Law of Planetary Motion.*

### 3. Escape Velocity ($v_e$)
Escape velocity is the exact speed required where the ball's kinetic energy matches its gravitational potential energy. Once it reaches this speed, gravity will never be able to pull it back.
**Equation:**
$$v_e = \sqrt{\frac{2 \times g \times R_e^2}{r}}$$
*(Notice that escape velocity is always exactly $\sqrt{2}$ times the circular orbital velocity!)*

---

### Key Features of the Simulation
- **Dynamic Time-Warp:** Because a low-Earth orbit takes about 90 minutes in real life, the engine automatically scales the passage of time (Time Warp) based on your input to let you watch orbits complete in seconds.
- **Dynamic Scale:** The camera starts zoomed to fit the Earth but will seamlessly zoom out to track the ball if it enters a high-altitude elliptical orbit or escapes completely.
