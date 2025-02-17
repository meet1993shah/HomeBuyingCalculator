document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("costForm");
    const recalculateBtn = document.getElementById("recalculate");

    let chartInstance = null;  // Store the chart instance

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
        .then(response => {
            // Log the raw response text before parsing it as JSON
            return response.text().then(text => {
                console.log("Raw response text:", text); // Log the raw response to see its content
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return JSON.parse(text);  // Parse the raw text as JSON manually
            });
        })
        .then(data => {
            // Ensure that data is populated only after everything is ready
            populateTable(data);
            populateUtilitiesTable(data);
            updateChart(data);
        })
        .catch(error => {
            console.error("Error fetching results:", error);
            alert("Failed to fetch results from server.");
        });
    }

    function populateTable(data) {
        try {
            document.getElementById("mortgage").textContent = data.mortgage;
            document.getElementById("property_taxes").textContent = data.property_taxes;
            document.getElementById("hoa_fees").textContent = data.hoa_fees;
            document.getElementById("home_insurance").textContent = data.home_insurance;
            document.getElementById("maintenance").textContent = data.maintenance;
            document.getElementById("utilities").textContent = data.utilities;
            document.getElementById("total_cost").textContent = data.total_cost;
        } catch (error) {
            console.error("Error populating table:", error);
            alert("Error populating table. Please check the console for details.");
        }
    }

    function populateUtilitiesTable(data) {
        try {
            document.getElementById("electricity").textContent = data.electricity;
            document.getElementById("water").textContent = data.water;
            document.getElementById("gas").textContent = data.gas;
            document.getElementById("internet").textContent = data.internet;
        } catch (error) {
            console.error("Error populating utilities table:", error);
            alert("Error populating utilities table. Please check the console for details.");
        }
    }

    function updateChart(data) {
        const ctx = document.getElementById("costChart");

        // Destroy the existing chart if it exists
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Create a new chart
        chartInstance = new Chart(ctx.getContext("2d"), {
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

            fetch("/results", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            })
            .then(response => {
                console.log("Response from recalculation:", response);

                // Log the raw text of the response
                return response.text().then(text => {
                    console.log("Raw response text from recalculate:", text);
                    if (!response.ok) {
                        throw new Error("Server error, failed to recalculate.");
                    }
                    return JSON.parse(text);  // Parse the raw text as JSON manually
                });
            })
            .then(data => {
                populateTable(data);
                populateUtilitiesTable(data);
                updateChart(data);
            })
            .catch(error => {
                console.error("Recalculation failed:", error);
                alert("Failed to recalculate. Please try again.");
            });
        });
    }

    fetchResults();
});
