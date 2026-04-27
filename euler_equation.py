# Shows the animation of e^(ix)
# the e^(ix) is always on the unit circle
# The derivative of e^(ix) is the velocity vector of the point on the unit circle
# it always points to the direction perpendicular to the position vector
# Final equation = e^(iπ) + 1 = 0
import math
import numpy as np
import matplotlib.pyplot as plt
import sympy as sp
import matplotlib.animation as animation
from matplotlib.widgets import Button

# create f(x) = e^(ix) from sympy
x = sp.Symbol('x')
f = sp.exp(sp.I*x)

# the derivative of f(x) looks like spin counterclockwise by 90 degrees
# when x = 0, f(0) = 1. And then the change of movement (speed) always perpendicular to position
# so f(x) = e^(ix) also can be seen as a circle with radius 1 and center at origin
df = sp.diff(f, x)
print("original function: f(x) = e^(ix)")
print("the derivative of f(x) = ", df)
print("the derivative of f(x) looks like spin counterclockwise by 90 degrees")

# --- Animation Code ---
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
plt.subplots_adjust(bottom=0.2) # Make space for buttons

# --- Subplot 1: Complex Plane ---
ax1.set_xlim(-1.5, 1.5)
ax1.set_ylim(-1.5, 1.5)
ax1.set_aspect('equal')
ax1.grid(True, linestyle='--', alpha=0.7)
ax1.set_title("Animation of f(x) = e^(ix)")
ax1.set_xlabel("Real Part")
ax1.set_ylabel("Imaginary Part")
ax1.axhline(0, color='black', linewidth=1)
ax1.axvline(0, color='black', linewidth=1)

# Draw the unit circle
circle = plt.Circle((0, 0), 1, fill=False, color='gray', linestyle='--')
ax1.add_patch(circle)

# Initial vectors (Quivers)
pos_quiver = ax1.quiver(0, 0, 1, 0, angles='xy', scale_units='xy', scale=1, color='blue', label='Position $e^{ix}$')
vel_quiver = ax1.quiver(1, 0, 0, 1, angles='xy', scale_units='xy', scale=1, color='red', label='Velocity $i e^{ix}$')

# Track the path on the complex plane
path_line, = ax1.plot([], [], color='blue', alpha=0.3)

# Text for x value
x_text = ax1.text(0.05, 0.95, 'x = 0.00', transform=ax1.transAxes, fontsize=12, 
                 verticalalignment='top', bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

ax1.legend(loc='upper right')

# --- Subplot 2: Sine Wave (Imaginary Part vs Time) ---
ax2.set_xlim(0, 4*np.pi)
ax2.set_ylim(-1.5, 1.5)
ax2.grid(True, linestyle='--', alpha=0.7)
ax2.set_title("Imaginary Part (y) vs x")
ax2.set_xlabel("x")
ax2.set_ylabel("Imaginary Part (sin(x))")
ax2.axhline(0, color='black', linewidth=1)

sine_line, = ax2.plot([], [], color='green', linewidth=2, label='y = sin(x)')
current_point, = ax2.plot([], [], 'go', markersize=8)
ax2.legend(loc='upper right')

# --- State manager ---
class AnimationState:
    def __init__(self):
        self.x_val = 0.0
        self.x_history = []
        self.path_x = []
        self.path_y = []
        self.is_running = True

state = AnimationState()

def animate(frame):
    if not state.is_running:
        return pos_quiver, vel_quiver, path_line, x_text, sine_line, current_point
        
    state.x_val += 0.05
    
    pos_x = np.cos(state.x_val)
    pos_y = np.sin(state.x_val)
    vel_x = -np.sin(state.x_val)
    vel_y = np.cos(state.x_val)
    
    # Subplot 1 Updates
    pos_quiver.set_UVC(pos_x, pos_y)
    vel_quiver.set_offsets([[pos_x, pos_y]])
    vel_quiver.set_UVC(vel_x, vel_y)
    
    state.path_x.append(pos_x)
    state.path_y.append(pos_y)
    path_line.set_data(state.path_x, state.path_y)
    x_text.set_text(f'x = {state.x_val:.2f}')
    
    # Subplot 2 Updates
    state.x_history.append(state.x_val)
    sine_line.set_data(state.x_history, state.path_y)
    current_point.set_data([state.x_val], [pos_y])
    
    # Auto-scroll x-axis of subplot 2 if needed
    if state.x_val > ax2.get_xlim()[1] * 0.9:
        ax2.set_xlim(0, ax2.get_xlim()[1] + 2*np.pi)
        fig.canvas.draw_idle()
    
    return pos_quiver, vel_quiver, path_line, x_text, sine_line, current_point

# Create animation
ani = animation.FuncAnimation(fig, animate, interval=50, blit=False, cache_frame_data=False)

# --- Buttons ---
ax_start = plt.axes([0.4, 0.05, 0.1, 0.075])
btn_start = Button(ax_start, 'Start')

ax_stop = plt.axes([0.55, 0.05, 0.15, 0.075])
btn_stop = Button(ax_stop, 'Stop & Reset')

def start(event):
    state.is_running = True
    ani.event_source.start()

def stop_reset(event):
    state.is_running = False
    ani.event_source.stop()
    state.x_val = 0.0
    state.x_history = []
    state.path_x = []
    state.path_y = []
    
    # Reset visuals
    pos_quiver.set_UVC(1, 0)
    vel_quiver.set_offsets([[1, 0]])
    vel_quiver.set_UVC(0, 1)
    path_line.set_data([], [])
    x_text.set_text('x = 0.00')
    
    sine_line.set_data([], [])
    current_point.set_data([], [])
    ax2.set_xlim(0, 4*np.pi)
    
    fig.canvas.draw_idle()

btn_start.on_clicked(start)
btn_stop.on_clicked(stop_reset)

plt.show()
