let lastScannedCode = "";
const barcodeData = [];

const html5QrCode = new Html5Qrcode("reader");

function startScanner() {
    Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
        const cameraId = devices[0].id;
        html5QrCode.start(
        cameraId,
        {
            fps: 10,
            qrbox: { width: 250, height: 150 }
        },
        onScanSuccess,
        errorMessage => {}
        );
    }
    }).catch(err => {
    alert("無法存取相機：" + err);
    });
}

function onScanSuccess(decodedText, decodedResult) {
    if (decodedText === lastScannedCode) return;
    lastScannedCode = decodedText;

    document.getElementById("barcodeDisplay").innerText = decodedText;
    document.getElementById("quantityInput").value = 1;
    document.getElementById("orderInput").value = "";

    document.getElementById("dialog").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function confirmEntry() {
    const code = lastScannedCode;
    const quantity = parseInt(document.getElementById("quantityInput").value);
    const order = document.getElementById("orderInput").value;
    const time = formatTime(new Date());

    if (!code || !quantity || quantity <= 0) {
    alert("請輸入有效數量");
    return;
    }

    barcodeData.push({ code, quantity, order, time });
    updateTable();
    resetScan();
}

function resetScan() {
    document.getElementById("dialog").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    lastScannedCode = "";
}

function formatTime(date) {
    return date.toLocaleString("zh-TW");
}

function updateTable() {
    const tableBody = document.getElementById("barcodeTableBody");
    tableBody.innerHTML = "";
    barcodeData.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${item.code}</td>
        <td>
        <input type="number" value="${item.quantity}" min="1"
            onchange="onQuantityChange(${index}, this.value)" />
        </td>
        <td>${item.order}</td>
        <td>${item.time}</td>
        <td><button onclick="deleteRow(${index})">❌</button></td>
    `;
    tableBody.appendChild(row);
    });
}

function onQuantityChange(index, value) {
    const quantity = parseInt(value);
    if (!quantity || quantity <= 0) {
    alert("請輸入有效的數量");
    updateTable();
    return;
    }
    barcodeData[index].quantity = quantity;
    barcodeData[index].time = formatTime(new Date());
    updateTable();
}

function deleteRow(index) {
    if (confirm("確定要刪除此筆資料？")) {
    barcodeData.splice(index, 1);
    updateTable();
    }
}

startScanner();