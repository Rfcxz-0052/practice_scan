const selectedDeviceId = null;
const codeReader = new ZXing.BrowserMultiFormatReader();
let currentCode = '';
const barcodeData = {}; // 儲存資料

// 啟動相機
codeReader
    .listVideoInputDevices()
    .then(videoInputDevices => {
    codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
        if (result) {
        currentCode = result.text;
        pauseScan();
        showDialog(currentCode);
        }
    });
    })
    .catch(err => console.error(err));

function pauseScan() {
    codeReader.reset();
    document.getElementById('video').style.display = 'none';
}

function resumeScan() {
    document.getElementById('dialog').style.display = 'none';
    document.getElementById('video').style.display = 'block';
    document.getElementById('qtyInput').value = 1;
    document.getElementById('orderInput').value = '';
    codeReader
    .decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
        if (result) {
        currentCode = result.text;
        pauseScan();
        showDialog(currentCode);
        }
    });
}

function showDialog(code) {
    document.getElementById('scannedCode').textContent = code;
    document.getElementById('dialog').style.display = 'block';
}

function confirmEntry() {
    const qty = parseInt(document.getElementById('qtyInput').value, 10);
    const order = document.getElementById('orderInput').value.trim();
    const now = new Date().toLocaleString();

    if (!barcodeData[currentCode]) {
    barcodeData[currentCode] = { count: qty, order, time: now };
    } else {
    barcodeData[currentCode].count += qty;
    barcodeData[currentCode].order = order || barcodeData[currentCode].order;
    barcodeData[currentCode].time = now;
    }

    updateTable();
    resumeScan();
}

function updateTable() {
    const tableBody = document.getElementById('barcodeTableBody');
    tableBody.innerHTML = '';

    Object.entries(barcodeData).forEach(([code, data]) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${code}</td>
        <td>
        <input type="number" min="1" value="${data.count}"
            onchange="updateCount('${code}', this.value)">
        </td>
        <td>${data.order}</td>
        <td>${data.time}</td>
        <td><button onclick="deleteBarcode('${code}')">❌</button></td>
    `;
    tableBody.appendChild(row);
    });
}

function updateCount(code, newValue) {
    const count = Number(newValue);
    if (!isNaN(count) && count >= 0) {
    barcodeData[code].count = count;
    barcodeData[code].time = new Date().toLocaleString();
    updateTable();
    } else {
    alert('請輸入有效的數字');
    }
}

function deleteBarcode(code) {
    delete barcodeData[code];
    updateTable();
}