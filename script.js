let scannedCodes = [];
let index = 1;

const html5QrCode = new Html5Qrcode("reader");

const config = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  formatsToSupport: [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39
  ]
};

function onScanSuccess(decodedText, decodedResult) {
  if (!scannedCodes.includes(decodedText)) {
    scannedCodes.push(decodedText);
    const now = new Date().toLocaleString();
    const table = document.querySelector("#result-table tbody");
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index++}</td><td>${decodedText}</td><td>${now}</td>`;
    table.appendChild(row);
  }
}

html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
  .catch(err => {
    alert("啟動相機失敗：" + err);
  });

function addManualCode() {
  const input = document.getElementById("manual-input");
  const value = input.value.trim();
  if (value && !scannedCodes.includes(value)) {
    scannedCodes.push(value);
    const now = new Date().toLocaleString();
    const table = document.querySelector("#result-table tbody");
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index++}</td><td>${value}</td><td>${now}</td>`;
    table.appendChild(row);
    input.value = "";
  }
}

function exportToExcel() {
  const table = document.getElementById("result-table");
  const wb = XLSX.utils.table_to_book(table, { sheet: "掃描結果" });
  XLSX.writeFile(wb, "barcode-results.xlsx");
}