/* =========================================================
   PDF + SAVE BUTTON UTILITIES
   Applies to ALL machine forms
   ========================================================= */

/* Clean text for filenames */
function sanitize(text) {
  return text
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
}

/* Build standard filename: [Client]_[Machine].pdf */
function buildFilename() {
  const clientInput = document.getElementById("client");
  const machineInput = document.getElementById("machine");

  if (!clientInput || !machineInput) {
    alert("Client or Machine field is missing.");
    return null;
  }

  const client = sanitize(clientInput.value);
  const machine = sanitize(machineInput.value);

  if (!client) {
    alert("Please enter Client Name before saving PDF.");
    return null;
  }

  return `${client}_${machine}.pdf`;
}

/* Live filename preview (screen only) */
function updateFilenamePreview() {
  const preview = document.getElementById("filenamePreview");
  if (!preview) return;

  const filename = buildFilename();
  if (filename) {
    preview.textContent = `PDF will be saved as: ${filename}`;
  } else {
    preview.textContent = "";
  }
}

/* Main Save as PDF action */
function generatePDF() {
  const filename = buildFilename();
  if (!filename) return;

  const pdfContent = document.getElementById("pdfContent");
  if (!pdfContent) {
    alert("PDF content container (#pdfContent) not found.");
    return;
  }

  html2pdf()
    .from(pdfContent)
    .set({
      filename: filename,
      margin: 10,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css"] }
    })
    .save();
}