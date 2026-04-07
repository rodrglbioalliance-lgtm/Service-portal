/********************************
 * 1. HELPER FUNCTIONS
 ********************************/

function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[-\s]/g, "")
    .trim();
}

function highlight(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, `<mark>$1</mark>`);
}


/********************************
 * 2. GLOBAL DATA STORAGE
 ********************************/

let troubleshootingData = [];


/********************************
 * 3. LOAD JSON DATA
 ********************************/

fetch("troubleshooting_data.json")
  .then(response => response.text())
  .then(text => {
    // 🔥 Replace NaN with null before parsing
    const cleanText = text.replace(/\bNaN\b/g, "null");
    const data = JSON.parse(cleanText);

    console.log("✅ Loaded records:", data.length);
    troubleshootingData = data;
    populateMachineDropdown(data);
  })
  .catch(error => {
    console.error("❌ Error loading JSON:", error);
  });


/********************************
 * 4. POPULATE MACHINE DROPDOWN
 ********************************/

function populateMachineDropdown(data) {
  const machineSelect = document.getElementById("machineSelect");
  if (!machineSelect) {
    console.error("❌ machineSelect not found in HTML");
    return;
  }

  const machines = [...new Set(
    data
      .map(item => item.machine)
      .filter(m => m && m.trim() !== "")
  )].sort();

  machines.forEach(machine => {
    const option = document.createElement("option");
    option.value = machine;
    option.textContent = machine;
    machineSelect.appendChild(option);
  });
}


/********************************
 * 5. MAIN SEARCH FUNCTION
 ********************************/

function searchData() {
  const selectedMachine =
    document.getElementById("machineSelect").value;
  const keyword =
    document.getElementById("keywordInput").value;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const matches = troubleshootingData.filter(item =>
    normalizeText(item.machine).includes(normalizeText(selectedMachine)) &&
    normalizeText(item.concern).includes(normalizeText(keyword))
  );

  if (matches.length === 0) {
    resultsDiv.innerHTML = "<p>No matching resolutions found.</p>";
    return;
  }

  // GROUP BY CONCERN
  const grouped = {};

  matches.forEach(item => {
    const key = normalizeText(item.concern);
    if (!grouped[key]) {
      grouped[key] = {
        concern: item.concern,
        items: []
      };
    }
    grouped[key].items.push(item);
  });

  // SORT BY MOST RECENT
  Object.values(grouped).forEach(group => {
    group.items.sort(
      (a, b) => new Date(b.date_received) - new Date(a.date_received)
    );
  });

  // RENDER RESULTS
  Object.values(grouped).forEach(group => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h4>
        ${highlight(group.concern, keyword)}
        <small>(${group.items.length} occurrence${group.items.length > 1 ? "s" : ""})</small>
      </h4>
    `;

    group.items.forEach(item => {
      div.innerHTML += `
        <div style="margin-left:15px;margin-bottom:8px;">
          <strong>Resolution:</strong> ${item.resolution || "N/A"}<br>
          <strong>Remarks:</strong> ${item.remarks || "N/A"}<br>
          <small>Date: ${item.date_received}</small>
        </div>
        <hr>
      `;
    });

    resultsDiv.appendChild(div);
  });
}
``