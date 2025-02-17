from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
import platform

app = Flask(__name__)
app.secret_key = os.urandom(24)

DEFAULTS = {
    "electricity": 250.0,
    "water": 50.0,
    "gas": 50.0,
    "internet": 50.0,
    "hoa_fees": 100.0,
    "home_insurance": 2000.0,
    "property_tax_rate": 0.012,
    "maintenance_rate": 0.01
}

def get_monthly_mortgage(house_price, down_payment, interest_rate, loan_term):
    loan_amount = house_price * (1 - down_payment / 100.0)
    monthly_rate = interest_rate / (12 * 100.0)
    term = loan_term * 12.0
    return (loan_amount * monthly_rate) / (1 - ((1 + monthly_rate) ** -term))

def get_total_monthly_expenses(data):
    house_price = float(data["house_price"])
    mortgage = get_monthly_mortgage(house_price, float(data["down_payment"]), float(data["interest_rate"]), float(data["loan_term"]))
    property_taxes = float(data.get("property_taxes", DEFAULTS["property_tax_rate"] * house_price)) / 12
    utilities = sum(float(data.get(k, DEFAULTS[k])) for k in ["electricity", "water", "gas", "internet"])
    hoa_fees = float(data.get("hoa_fees", DEFAULTS["hoa_fees"]))
    home_insurance = float(data.get("home_insurance", DEFAULTS["home_insurance"])) / 12
    maintenance = DEFAULTS["maintenance_rate"] * house_price / 12

    return {
        "mortgage": round(mortgage, 2),
        "property_taxes": round(property_taxes, 2),
        "utilities": round(utilities, 2),
        "hoa_fees": round(hoa_fees, 2),
        "home_insurance": round(home_insurance, 2),
        "maintenance": round(maintenance, 2),
        "total_cost": round(mortgage + property_taxes + utilities + hoa_fees + home_insurance + maintenance, 2),
        "electricity": round(float(data.get("electricity", DEFAULTS["electricity"])), 2),
        "water": round(float(data.get("water", DEFAULTS["water"])), 2),
        "gas": round(float(data.get("gas", DEFAULTS["gas"])), 2),
        "internet": round(float(data.get("internet", DEFAULTS["internet"])), 2)
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    form_data = request.form.to_dict()

    # Ensure required fields are present
    required_fields = ["house_price", "down_payment", "interest_rate", "loan_term"]
    for field in required_fields:
        if field not in form_data or not form_data[field].strip():
            return "Missing required form data", 400  # Return an error response if any required field is missing

    # Convert values to float before storing in session to avoid KeyError later
    session["form_data"] = {key: float(value) for key, value in form_data.items() if value.strip()}

    return redirect(url_for('results'))

@app.route('/results', methods=['GET', 'POST'])
def results():
    if "form_data" not in session:
        return redirect(url_for('index'))  # Redirect if session is missing

    results_data = get_total_monthly_expenses(session["form_data"])

    # If request is from JS expecting JSON, return JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify(results_data)  # Ensure JSON response

    return render_template('results.html', results=results_data)

if __name__ == '__main__':
    if platform.system() == 'Android':
        from android.permissions import Permission, request_permissions
        request_permissions([Permission.INTERNET, Permission.READ_EXTERNAL_STORAGE, Permission.WRITE_EXTERNAL_STORAGE])
    app.run(debug=True, port=5000)
