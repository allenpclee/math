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
                # (ad + bc)^2
                img_part = (a*d+b*c)**2
                img_part_in_final_vector.append(img_part)
                print(f"{(a,b,c,d)}: (a^2 + b^2)(c^2 + d^2) = {length_multiply}, (ad + bc)^2 = {img_part}, {length_multiply>=img_part}")

                

# Plotting the results
plt.figure(figsize=(12, 6))

x = range(len(two_vector_length_multiply))
plt.plot(x, two_vector_length_multiply, label="(a^2 + b^2)(c^2 + d^2)", color="blue", alpha=0.7)
plt.plot(x, img_part_in_final_vector, label="(ad + bc)^2", color="red", alpha=0.7)

# Since there are many elements (14,641), we will only show a subset of ticks on the x-axis
step = max(1, len(x) // 10)
plt.xticks(x[::step], [str(two_vector_numbers[i]) for i in x[::step]], rotation=45)

plt.xlabel("Elements in two_vector_numbers (a, b, c, d)")
plt.ylabel("Values")
plt.title("Cauchy-Schwarz Inequality Verification")
plt.legend()
plt.tight_layout()
plt.show()
