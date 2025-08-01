const scannedResults = [];

function renderTable() {
  const body = document.getElementById('resultBody');
  body.innerHTML = '';
  scannedResults.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.code}</td>
      <td>${item.time}</td>
      <td>${item.note}</td>
      <td><button onclick="deleteRow(${index})">🗑️ 刪除</button></td>
    `;
    body.appendChild(row);
  });
}

function addResult(code) {
  const customNote = document.getElementById('customInfo').value;
  const time = new Date().toLocaleString();
  scannedResults.push({ code, time, note: customNote });
  renderTable();
}

function deleteRow(index) {
  scannedResults.splice(index, 1);
  renderTable();
}

function manualAdd() {
  const input = document.getElementById('manualInput');
  const code = input.value.trim();
  if (code) {
    addResult(code);
    input.value = '';
  }
}

function exportExcel() {
  const ws_data = [["條碼", "時間", "自訂資訊"]];
  scannedResults.forEach(r => {
    ws_data.push([r.code, r.time, r.note]);
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "掃描記錄");
  XLSX.writeFile(wb, "scan-results.xlsx");
}

// 啟動掃描器
const html5QrCode = new Html5Qrcode("reader");
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
  if (!decodedText) return;
  html5QrCode.pause(); // 暫停掃描
  addResult(decodedText);
  setTimeout(() => {
    html5QrCode.resume(); // 繼續掃描
  }, 1000);
};

Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
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
    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
  }
}).catch(err => {
  console.error("相機載入失敗", err);
  alert("無法啟動相機，請確認權限已開啟。");
});