# Gravity & Orbital Physics Simulator

This interactive web application is a modern physics simulator heavily inspired by Isaac Newton's famous "Cannonball" thought experiment. It visually demonstrates how simple parabolic projectile motion (like throwing a ball horizontally) scales up into complex orbital mechanics when extreme speeds and altitudes are involved.

## How the Simulator Works

The simulator uses a true **Newtonian 2-body numerical integration engine** to calculate the ball's trajectory frame-by-frame. To perfectly simulate orbital insertions, **all throws are strictly horizontal (0&deg; angle)**.

- **Slow Speeds (Sub-orbital Impact):** The ball travels a distance and drops to the ground. The Earth appears essentially flat from the ball's perspective if thrown slowly.
- **Orbital Speeds (Circular Orbit):** The ball moves forward so fast that as gravity pulls it down, the Earth curves away at the exact same rate. The ball is in a constant state of "free fall" but never hits the ground, resulting in a perfectly circular orbit.
- **Between Orbital & Escape Speeds (Elliptical Orbit):** The orbit becomes an oval (an ellipse) as described by Kepler's First Law of Planetary Motion. The starting point becomes the lowest point (perigee), and it swings out much further on the other side (apogee).
- **Escape Speeds (Hyperbola):** The kinetic energy of the ball is so high that Earth's gravitational pull can never slow it down enough to bring it back. The ball leaves Earth permanently.

## The Physics & Governing Equations

### 1. Local Gravity Acceleration ($a$)
Gravity is not constant; it gets weaker the further you are from the center of the Earth (an inverse-square law).
* $g$ = Surface gravity (default $9.81\ m/s^2$)
* $R_e$ = Radius of the Earth ($6,371\ km$)
* $r$ = Current distance from the center of the Earth to the ball

**Equation:**
$$a = g \times \left(\frac{R_e}{r}\right)^2$$

### 2. Circular Orbital Velocity ($v_o$)
To achieve a perfect circular orbit, the centripetal acceleration required to keep the ball moving in a circle must perfectly match the local gravitational acceleration.
**Equation:**
$$v_o = \sqrt{\frac{g \times R_e^2}{r}}$$

### 3. Escape Velocity ($v_e$)
Escape velocity is the exact speed required where the ball's kinetic energy matches its gravitational potential energy. Once it reaches this speed, gravity will never be able to pull it back.
**Equation:**
$$v_e = \sqrt{\frac{2 \times g \times R_e^2}{r}}$$

---

## Dynamic Trajectory Equations

Based on the initial speed ($v$), the simulator dynamically classifies the trajectory and calculates the exact Cartesian shapes and impact distances. It utilizes the orbital parameter ($p$) and eccentricity ($e$).

**1. Sub-Orbital Impact ($v < v_o$)**
If the ball hits the ground, the exact distance traveled along the curvature of the Earth ($d$) is calculated using the inverse cosine (`arccos`) trigonometric function:
* $d \approx R_e \times \arccos{\left(\frac{1 - p/R_e}{e}\right)}$

**2. Circular Orbit ($v = v_o$)**
The ball follows a perfect circle. Its Cartesian equation from the center of the Earth is:
* $x^2 + y^2 = r^2$

**3. Elliptical Orbit ($v_o < v < v_e$)**
The ball follows an oval. Its Cartesian equation relative to its own center uses the semi-major axis ($a$) and semi-minor axis ($b$):
* $\frac{x^2}{a^2} + \frac{y^2}{b^2} = 1$

---

### Key Features of the Simulation
- **Dynamic Time-Warp:** Because a low-Earth orbit takes about 90 minutes in real life, the engine automatically scales the passage of time (Time Warp) based on your input to let you watch orbits complete in seconds.
- **Dynamic Scale:** The camera starts zoomed to fit the Earth but will seamlessly zoom out to track the ball if it enters a high-altitude elliptical orbit or escapes completely.
