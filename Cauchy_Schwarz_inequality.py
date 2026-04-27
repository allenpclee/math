# Visualize Cauchy-Schwarz Inequality for two vectors
import matplotlib.pyplot as plt

number_list = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
two_vector_length_multiply = []
two_vector_numbers = []
img_part_in_final_vector = []


# choose number for
# a+bi and c+di
# prove (a^2 + b^2)(c^2 + d^2) >= (ad + bc)^2
for a in number_list: 
    for b in number_list:
        for c in number_list:
            for d in number_list:
                two_vector_numbers.append((a,b,c,d))
                # (a^2 + b^2)(c^2 + d^2)
                length_multiply = (a**2+b**2)*(c**2+d**2)
                two_vector_length_multiply.append(length_multiply)
                
                # (ad + bc)^2 (Imaginary part squared)
                img_part = (a*d+b*c)**2
                img_part_in_final_vector.append(img_part)
                
                # (ac - bd)^2 (Real part squared)
                real_part = (a*c-b*d)**2
                
                # PROGRAMMATIC PROOF:
                # Brahmagupta-Fibonacci identity / Complex number modulus property:
                # |z1|^2 * |z2|^2 = |z1 * z2|^2 = Re(z1*z2)^2 + Im(z1*z2)^2
                # Because real_part >= 0, it proves that length_multiply >= img_part.
                assert length_multiply == real_part + img_part

print("Inequality mathematically and computationally proven for all combinations!")
print("For every (a,b,c,d): (a² + b²)(c² + d²) = (ac - bd)² + (ad + bc)²")
print(f"Successfully verified {len(two_vector_numbers)} combinations using assertion.")


# Plotting the results
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Subplot 1: Scatter plot of both sides
# A scatter plot makes it obvious that all points fall below the line of equality
ax1.scatter(two_vector_length_multiply, img_part_in_final_vector, color='blue', alpha=0.5, edgecolors='none')
max_val = max(max(two_vector_length_multiply), max(img_part_in_final_vector))
ax1.plot([0, max_val], [0, max_val], color='red', linestyle='--', label='y = x (Equality)')
ax1.set_xlabel('LHS: (a^2 + b^2)(c^2 + d^2)')
ax1.set_ylabel('RHS: (ad + bc)^2')
ax1.set_title('Scatter Plot: RHS <= LHS')
ax1.legend()
ax1.grid(True, linestyle=':', alpha=0.7)

# Subplot 2: Difference Plot
# The difference between LHS and RHS is exactly the real part squared: (ac - bd)^2
# Since any real number squared is >= 0, LHS - RHS >= 0 is mathematically proven.
differences = [L - R for L, R in zip(two_vector_length_multiply, img_part_in_final_vector)]
ax2.plot(range(len(differences)), differences, color='purple', alpha=0.7, label='LHS - RHS = (ac - bd)²')
ax2.axhline(0, color='red', linestyle='--', label='Difference = 0')
ax2.set_xlabel('Index of Combination (a, b, c, d)')
ax2.set_ylabel('Difference: LHS - RHS')
ax2.set_title('Difference = (ac - bd)² ≥ 0')
ax2.legend()
ax2.grid(True, linestyle=':', alpha=0.7)

plt.suptitle("Visualizing Cauchy-Schwarz Inequality", fontsize=16)
plt.tight_layout()
plt.show()
