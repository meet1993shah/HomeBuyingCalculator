from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
import platform

app = Flask(__name__)
app.secret_key = os.urandom(24)

def get_monthly_mortgage(house_price, down_payment, interest_rate, loan_term):
    loan_amount = house_price * (1 - down_payment / 100.0)
    monthly_rate = interest_rate / (12 * 100.0)
    term = loan_term * 12.0
    return (loan_amount * monthly_rate) / (1 - ((1 + monthly_rate) ** -term))

def calculate_total_monthly_expenses(data):
    house_price = float(data["house_price"])
    mortgage = get_monthly_mortgage(house_price, float(data["down_payment"]), float(data["interest_rate"]), float(data["loan_term"]))
    
    # Property Taxes and Home Insurance come from the form, no need for defaults
    property_taxes = float(data["property_taxes"]) / 12  # Monthly property taxes
    utilities = sum(float(data.get(k, 0)) for k in ["electricity", "water", "gas", "internet"])
    hoa_fees = float(data.get("hoa_fees", 100.0))  # Default HOA fees if not provided
    home_insurance = float(data["home_insurance"]) / 12  # Monthly home insurance
    maintenance = house_price * 0.01 / 12  # Maintenance (1% of house price annually)

    return {
        "mortgage": round(mortgage, 2),
        "property_taxes": round(property_taxes, 2),
        "utilities": round(utilities, 2),
        "hoa_fees": round(hoa_fees, 2),
        "home_insurance": round(home_insurance, 2),
        "maintenance": round(maintenance, 2),
        "total_cost": round(mortgage + property_taxes + utilities + hoa_fees + home_insurance + maintenance, 2),
        "electricity": round(float(data.get("electricity", 250.0)), 2),
        "water": round(float(data.get("water", 50.0)), 2),
        "gas": round(float(data.get("gas", 50.0)), 2),
        "internet": round(float(data.get("internet", 50.0)), 2)
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    form_data = request.form.to_dict()
    required_fields = ["house_price", "down_payment", "interest_rate", "loan_term", "property_taxes", "home_insurance"]
    
    # Ensure all required fields are present in the form data
    if not all(field in form_data and form_data[field].strip() for field in required_fields):
        return "Missing required form data", 400  # Return an error if any required field is missing

    # Store the form data in session after converting to float
    session["form_data"] = {key: float(value) for key, value in form_data.items() if value.strip()}
    return redirect(url_for('results'))

@app.route('/results', methods=['GET', 'POST'])
def results():
    if "form_data" not in session:
        return redirect(url_for('index'))  # Redirect to index if no form data is found

    if request.method == 'POST':
        return recalculate_results()

    return render_results()

def render_results():
    # Calculate the total monthly expenses using the form data stored in the session
    results_data = calculate_total_monthly_expenses(session["form_data"])
    
    # If the request is an AJAX call, return JSON response
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify(results_data)  # Return JSON for AJAX requests

    return render_template('results.html', results=results_data)

def recalculate_results():
    try:
        updated_data = request.json
        # Update the session data with the updated values
        session["form_data"].update(updated_data)
        results_data = calculate_total_monthly_expenses(session["form_data"])
        return jsonify(results_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Send error response if something goes wrong

if __name__ == '__main__':
    if platform.system() == 'Android':
        from android.permissions import Permission, request_permissions
        request_permissions([Permission.INTERNET, Permission.READ_EXTERNAL_STORAGE, Permission.WRITE_EXTERNAL_STORAGE])
    app.run(debug=True, port=5000)
