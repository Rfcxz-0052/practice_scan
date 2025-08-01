let count = 0;
const scannedData = [];

function renderTable() {
  const tbody = document.getElementById("dataTableBody");
  tbody.innerHTML = "";
  scannedData.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.code}</td>
      <td>${item.note || ""}</td>
      <td>${item.time}</td>
      <td><button onclick="deleteEntry(${index})">刪除</button></td>
    `;
    tbody.appendChild(row);
  });
}

function addData(code, note = "") {
  const now = new Date().toLocaleString();
  scannedData.push({ code, note, time: now });
  renderTable();
}

function deleteEntry(index) {
  scannedData.splice(index, 1);
  renderTable();
}

function addManualEntry() {
  const code = document.getElementById("manualInput").value.trim();
  const note = document.getElementById("noteInput").value.trim();
  if (!code) {
    alert("請輸入條碼");
    return;
  }
  addData(code, note);
  document.getElementById("manualInput").value = "";
  document.getElementById("noteInput").value = "";
}

function exportCSV() {
  let csv = "序號,條碼,備註,時間\n";
  scannedData.forEach((item, index) => {
    csv += `${index + 1},"${item.code}","${item.note}","${item.time}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "掃描資料.csv";
  link.click();
}

function onScanSuccess(decodedText) {
  const note = document.getElementById("noteInput").value.trim();
  addData(decodedText, note);
}

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

Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      onScanSuccess
    );
  }
}).catch(err => console.error("Camera error", err));