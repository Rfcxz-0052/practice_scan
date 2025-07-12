const barcodeData = {}; // 條碼: { count: 數量, time: 最後時間 }
const tableBody = document.getElementById("barcodeTableBody");
let lastScanned = "";

function formatTime(date) {
const pad = n => n.toString().padStart(2, '0');
return `${date.getFullYear()}/${pad(date.getMonth()+1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function updateTable() {
tableBody.innerHTML = "";
for (const [code, data] of Object.entries(barcodeData)) {
    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${code}</td>
    <td>${data.count}</td>
    <td>${data.time}</td>
    <td><button onclick="editBarcode('${code}')">✏️</button></td>
    <td><button onclick="deleteBarcode('${code}')">❌</button></td>
    `;
    tableBody.appendChild(row);
}
}

function editBarcode(code) {
const newCount = prompt(`請輸入新的數量：`, barcodeData[code].count);
if (newCount !== null && !isNaN(newCount) && Number(newCount) >= 0) {
    barcodeData[code].count = Number(newCount);
    updateTable();
}
}

function deleteBarcode(code) {
if (confirm(`確定要刪除條碼 ${code} 的記錄嗎？`)) {
    delete barcodeData[code];
    updateTable();
}
}

const html5QrCode = new Html5Qrcode("reader");

html5QrCode.start(
{ facingMode: "environment" },
{
    fps: 10,
    qrbox: 250,
    formatsToSupport: [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
    Html5QrcodeSupportedFormats.AZTEC,
    Html5QrcodeSupportedFormats.PDF_417
    ]
},
(decodedText) => {
    if (decodedText && decodedText !== lastScanned) {
    lastScanned = decodedText;
    const now = new Date();
    if (barcodeData[decodedText]) {
        barcodeData[decodedText].count++;
        barcodeData[decodedText].time = formatTime(now);
    } else {
        barcodeData[decodedText] = {
        count: 1,
        time: formatTime(now)
        };
    }
    updateTable();
    setTimeout(() => { lastScanned = ""; }, 1000);
    }
},
(error) => {
    // 可忽略錯誤
}
);