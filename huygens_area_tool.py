# show how the Huygens used the area of y=1/x to find the value of e
# The area under the curve of y=1/x from 1 to x is ln(x)
# When the area is 1, the value of x is e
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider, TextBox
import math

def main():
    fig, ax = plt.subplots(figsize=(10, 6))
    plt.subplots_adjust(bottom=0.35)

    # x range for drawing the curve
    x_curve = np.linspace(0.01, 4.0, 500)
    y_curve = 1 / x_curve

    ax.plot(x_curve, y_curve, 'b-', label='y = 1/x')
    ax.set_xlim(0.0, 4.0)
    ax.set_ylim(0, 2.5)
    ax.set_xlabel('x')
    ax.set_ylabel('y = 1/x')
    ax.set_title('Area under y = 1/x from 1 to x')
    ax.grid(True, linestyle='--', alpha=0.6)

    # Initial value
    initial_x = 1.0

    # Fill polygon
    x_fill = np.linspace(1.0, initial_x, 100)
    y_fill = 1 / x_fill
    poly = ax.fill_between(x_fill, 0, y_fill, color='lightblue', alpha=0.5)
    
    # Vertical bar
    vbar = ax.axvline(x=initial_x, color='red', linestyle='--', linewidth=2, label='Current x position')
    ax.legend()

    # Area text on plot
    area_text_display = ax.text(1.5, 1.5, f'Area: {math.log(initial_x):.4f}', fontsize=14,
                                bbox=dict(facecolor='white', alpha=0.8, edgecolor='gray'))

    # Ax for slider
    ax_slider = plt.axes([0.2, 0.2, 0.6, 0.03])
    slider_x = Slider(ax_slider, 'x position', 1.0, 3.5, valinit=initial_x)

    # Ax for text box
    ax_textbox = plt.axes([0.2, 0.1, 0.2, 0.05])
    text_box_area = TextBox(ax_textbox, 'Set Area: ', initial=f'{math.log(initial_x):.4f}')

    # Global state to prevent infinite recursion between widgets
    updating = {"state": False}

    def update_polygon(x_val):
        nonlocal poly
        poly.remove()
        if x_val > 1.0:
            x_f = np.linspace(1.0, x_val, 100)
            y_f = 1 / x_f
            poly = ax.fill_between(x_f, 0, y_f, color='lightblue', alpha=0.5)
        else:
            poly = ax.fill_between([1.0, 1.0], [0, 0], [1, 1], color='lightblue', alpha=0.5)

    def update_from_slider(val):
        if updating["state"]:
            return
        updating["state"] = True
        
        x_val = slider_x.val
        area_val = math.log(x_val)
        
        update_polygon(x_val)
        vbar.set_xdata([x_val, x_val])
            
        area_text_display.set_text(f'Area: {area_val:.4f}')
        text_box_area.set_val(f'{area_val:.4f}')
        fig.canvas.draw_idle()
        
        updating["state"] = False

    def update_from_textbox(text):
        if updating["state"]:
            return
        updating["state"] = True
        
        try:
            area_val = float(text)
            if area_val < 0:
                area_val = 0.0
            x_val = math.exp(area_val)
            
            # Bound x to 3.5
            if x_val > 3.5:
                x_val = 3.5
                area_val = math.log(x_val)
                text_box_area.set_val(f'{area_val:.4f}')
            
            slider_x.set_val(x_val)
            
            update_polygon(x_val)
            vbar.set_xdata([x_val, x_val])
                
            area_text_display.set_text(f'Area: {area_val:.4f}')
            fig.canvas.draw_idle()
            
        except ValueError:
            pass # ignore invalid input
            
        updating["state"] = False

    slider_x.on_changed(update_from_slider)
    text_box_area.on_submit(update_from_textbox)

    plt.show()

if __name__ == '__main__':
    main()
