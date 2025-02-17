// results.js
document.addEventListener("DOMContentLoaded", function() {
    let chartInstance = null;  // Store the chart instance
    const recalculateBtn = document.getElementById("recalculate");

    // Fetch results and display them
    function fetchResults() {
        fetch("/results", {
            headers: { "X-Requested-With": "XMLHttpRequest" }
        })
        .then(response => {
            if (response.ok) {
                return response.json();  // Only parse JSON if the response is OK
            }
            throw new Error('Failed to fetch results');
        })
        .then(data => {
            populateTable(data);
            populateUtilitiesTable(data);
            updateChart(data);
        })
        .catch(handleError);
    }

    // Populate results table
    function populateTable(data) {
        updateElementContent("mortgage", data.mortgage);
        updateElementContent("property_taxes", data.property_taxes);  // non-editable
        updateElementContent("hoa_fees", data.hoa_fees);
        updateElementContent("home_insurance", data.home_insurance);  // non-editable
        updateElementContent("maintenance", data.maintenance);
        updateElementContent("utilities", data.utilities);
        updateElementContent("total_cost", data.total_cost);
    }

    // Update content of elements
    function updateElementContent(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Populate utilities table
    function populateUtilitiesTable(data) {
        updateElementContent("electricity", data.electricity);
        updateElementContent("water", data.water);
        updateElementContent("gas", data.gas);
        updateElementContent("internet", data.internet);
    }

    // Update the pie chart with data
    function updateChart(data) {
        const ctx = document.getElementById("costChart");

        if (chartInstance) {
            chartInstance.destroy();
        }

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

    // Handle recalculate logic
    function recalculate() {
        const updatedData = getUpdatedData();
        fetch("/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(data => {
            populateTable(data);
            populateUtilitiesTable(data);
            updateChart(data);
        })
        .catch(handleError);
    }

    // Get updated data from editable fields
    function getUpdatedData() {
        return {
            electricity: parseFloat(document.getElementById("electricity").textContent),
            water: parseFloat(document.getElementById("water").textContent),
            gas: parseFloat(document.getElementById("gas").textContent),
            internet: parseFloat(document.getElementById("internet").textContent),
            hoa_fees: parseFloat(document.getElementById("hoa_fees").textContent),
        };
    }

    // Handle errors
    function handleError(error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }

    // Recalculate button handler
    if (recalculateBtn) {
        recalculateBtn.addEventListener("click", recalculate);
    }

    // Fetch and display results
    fetchResults();
});
