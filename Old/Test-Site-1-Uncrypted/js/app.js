const result = document.getElementById("result");
const jsStatus = document.getElementById("jsStatus");
const jsonOutput = document.getElementById("jsonOutput");
const jsonStatus = document.getElementById("jsonStatus");
const testButton = document.getElementById("testButton");

jsStatus.textContent = "Loaded";

testButton.addEventListener("click", () => {
    result.textContent = "JavaScript is working correctly.";
});

fetch("data/test.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load JSON");
        }

        return response.json();
    })
    .then(data => {
        jsonOutput.textContent = JSON.stringify(data, null, 2);
        jsonStatus.textContent = "Loaded";
    })
    .catch(error => {
        jsonOutput.textContent = error.message;
        jsonStatus.textContent = "Failed";
    });