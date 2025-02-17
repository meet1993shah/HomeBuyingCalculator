// index.js
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("costForm");
    const housePriceInput = document.getElementById("house_price");
    const propertyTaxesInput = document.getElementById("property_taxes");
    const homeInsuranceInput = document.getElementById("home_insurance");

    // Auto-populate Property Taxes and Home Insurance when House Price is entered
    housePriceInput.addEventListener("input", function() {
        const housePrice = parseFloat(housePriceInput.value);
        if (!isNaN(housePrice)) {
            propertyTaxesInput.value = (housePrice * 0.012).toFixed(2);  // 1.2% property tax
            homeInsuranceInput.value = (housePrice * 0.0025).toFixed(2); // 0.25% home insurance
        }
    });

    if (housePriceInput.value) {
        housePriceInput.dispatchEvent(new Event("input"));
    }

    // Form submission handler
    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const formData = new FormData(form);
            sendFormData(formData);
        });
    }

    // Handle form submission
    function sendFormData(formData) {
        fetch("/calculate", {
            method: "POST",
            body: formData
        }).then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            }
        });
    }
});
