# show the result of natural exponential history, how the calculation of e was done
from decimal import Decimal, getcontext
import sympy
import numpy as np
import matplotlib.pyplot as plt

getcontext().prec = 50

def print_natural_exp():
    result = Decimal(1).exp()
    print(f"{"natural exponential function: e =":<40}{result}")
    return result

# -------------- Napierian logarithm - 1550 AD --------------
def  napierian_log():
    n_exp = print_natural_exp()
    # (1-10^-7)^10^7  -> 1/e
    n = Decimal('10')**7
    m = 1- Decimal('1')/Decimal('10')**7
    napier = 1/(m**n)
    print(f"{'Napierian Logrithm e = ':40}{napier}")
    print(f"{'diff: ':40}{abs(n_exp-napier)}")
    print()

# -------------- Huygens series - 1661 AD --------------
# Huygens approximated e using the following definition:
# when f(x) = 1/x, the area under the curve from 1 to x is exactly 1
def huygens_series():
    t, x = sympy.symbols('t x')
    # Define the integral of 1/t from 1 to x
    area = sympy.integrate(1/t, (t, 1, x))
    # Solve for area = 1
    huygens_x = sympy.solve(sympy.Eq(area, 1), x)[0].evalf(50)
    n_exp = print_natural_exp()
    print(f"{'The Huygens y=1/x, area=1 of x =':<40}{huygens_x}")
    print(f"{'diff: ':40}{abs(n_exp-huygens_x)}")
    print()

# -------------- Jacob Bernoulli series - 1683 AD --------------
# The concept is when APR is 100%, principle is 1, year is 1
# Bring them to financial equation
# A = P(1 + r/n)^(nt) when n goes from 1 to infinity
# the upper limit to the A is e
def jacob_bernoulli_series():
    x = [100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000]
    y = [(Decimal('1') + Decimal('1')/Decimal(n))**Decimal(n) for n in x]
    n_exp = print_natural_exp()
    for i in range(len(x)):
        print(f"{f'The Jacob Bernoulli x={x[i]}, y=':<40}{y[i]:.50f}")
        print(f"{'diff: ':40}{abs(n_exp-y[i]):.50f}")
    print()
    
def jacob_bernoulli_series_plot():
    # Generate n from 1 to 10^5 using logarithmic spacing
    # This ensures we have high density for small n and cover the full range.
    n = np.logspace(0, 5, 10000) 
    y = (1 + 1/n)**n
    e_val = np.exp(1)

    plt.figure(figsize=(10, 6))
    plt.plot(n, y, label=r'$(1 + \frac{1}{n})^n$', color='blue', linewidth=2)

    # Add a dashed line for the actual value of e
    plt.axhline(y=e_val, color='red', linestyle='--', label=f'e ≈ {e_val:.6f}')

    # Use a log scale for the x-axis to clearly see the growth
    plt.xscale('log') 
    plt.xlabel('n (log scale)')
    plt.ylabel('Value')
    plt.title(r'Convergence of $(1 + \frac{1}{n})^n$ to $e$')
    plt.grid(True, which="both", ls="-", alpha=0.3)
    plt.legend()

    plt.show()



if __name__ == "__main__":
    napierian_log()
    huygens_series()
    jacob_bernoulli_series()