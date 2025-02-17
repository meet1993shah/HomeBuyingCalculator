document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("costForm");
    
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

    if (window.location.pathname === "/results") {
        fetchResults();
    }

    function fetchResults() {
        fetch("/results", {
            headers: { "X-Requested-With": "XMLHttpRequest" }  // Request JSON format
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch data from server.");
            }
            return response.json();
        })
        .then(data => {
            populateTable(data);
            updateChart(data);
        })
        .catch(error => console.error("Error fetching results:", error));
    }

    function populateTable(data) {
        const ids = ["mortgage", "electricity", "water", "gas", "internet", "property_taxes", "hoa_fees", "home_insurance", "maintenance", "total_cost"];
        ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = data[id];
            }
        });
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
});
