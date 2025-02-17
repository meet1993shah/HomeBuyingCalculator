// Updated script.js
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("costForm");
    const recalculateBtn = document.getElementById("recalculate");
    
    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            
            const formData = new FormData(form);
            fetch("/calculate", {
                method: "POST",
                body: formData
            }).then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                }
            });
        });
    }

    function fetchResults() {
        fetch("/results", {
            headers: { "X-Requested-With": "XMLHttpRequest" }
        })
        .then(response => response.json())
        .then(data => {
            populateTable(data);
            populateUtilitiesTable(data);
            updateChart(data);
        })
        .catch(error => console.error("Error fetching results:", error));
    }

    function populateTable(data) {
        document.getElementById("mortgage").textContent = data.mortgage;
        document.getElementById("property_taxes").textContent = data.property_taxes;
        document.getElementById("hoa_fees").textContent = data.hoa_fees;
        document.getElementById("home_insurance").textContent = data.home_insurance;
        document.getElementById("maintenance").textContent = data.maintenance;
        document.getElementById("utilities").textContent = data.utilities;
        document.getElementById("total_cost").textContent = data.total_cost;
    }

    function populateUtilitiesTable(data) {
        document.getElementById("electricity").textContent = data.electricity;
        document.getElementById("water").textContent = data.water;
        document.getElementById("gas").textContent = data.gas;
        document.getElementById("internet").textContent = data.internet;
    }

    function updateChart(data) {
        const ctx = document.getElementById("costChart");
        if (!ctx) return;
        
        new Chart(ctx.getContext("2d"), {
            type: "pie",
            data: {
                labels: ["Mortgage", "Utilities", "Property Taxes", "HOA Fees", "Home Insurance", "Maintenance"],
                datasets: [{
                    data: [data.mortgage, data.utilities, data.property_taxes, data.hoa_fees, data.home_insurance, data.maintenance],
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800", "#9C27B0"]
                }]
            }
        });
    }

    if (recalculateBtn) {
        recalculateBtn.addEventListener("click", function() {
            const updatedData = {
                electricity: parseFloat(document.getElementById("electricity").textContent),
                water: parseFloat(document.getElementById("water").textContent),
                gas: parseFloat(document.getElementById("gas").textContent),
                internet: parseFloat(document.getElementById("internet").textContent),
                property_taxes: parseFloat(document.getElementById("property_taxes").textContent),
                hoa_fees: parseFloat(document.getElementById("hoa_fees").textContent),
                home_insurance: parseFloat(document.getElementById("home_insurance").textContent)
            };
            
            fetch("/recalculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            })
            .then(response => response.json())
            .then(data => {
                populateTable(data);
                populateUtilitiesTable(data);
                updateChart(data);
            });
        });
    }

    fetchResults();
});
