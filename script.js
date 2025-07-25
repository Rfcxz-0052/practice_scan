  const barcodeData = {};
  const tableBody = document.getElementById("barcode-table-body");

  function showInputDialog(code) {
    const quantity = prompt("請輸入數量：", "1");
    if (quantity === null || isNaN(quantity) || Number(quantity) < 1) return;

    const serial = prompt("請輸入單號（可選）：", "");
    if (serial === null) return;

    const time = new Date().toLocaleString();

    if (!barcodeData[code]) {
      barcodeData[code] = { count: Number(quantity), time, serial };
    } else {
      barcodeData[code].count += Number(quantity);
      barcodeData[code].time = time;
      if (serial) barcodeData[code].serial = serial;
    }

    updateTable();
  }

  function updateTable() {
    tableBody.innerHTML = "";
    for (const [code, data] of Object.entries(barcodeData)) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${code}</td>
        <td>
          <input type="number" class="inline-input" value="${data.count}" min="0"
            onchange="changeQuantity('${code}', this.value)">
        </td>
        <td>${data.time}</td>
        <td>
          <input type="text" class="inline-input" value="${data.serial || ''}"
            onchange="changeSerial('${code}', this.value)">
        </td>
        <td><button onclick="deleteBarcode('${code}')">❌ 刪除</button></td>
      `;
      tableBody.appendChild(row);
    }
  }

  function changeQuantity(code, value) {
    const val = parseInt(value, 10);
    if (!isNaN(val) && val >= 0) {
      barcodeData[code].count = val;
      updateTable();
    }
  }

  function changeSerial(code, value) {
    barcodeData[code].serial = value;
    updateTable();
  }

  function deleteBarcode(code) {
    if (confirm("確定要刪除這筆資料嗎？")) {
      delete barcodeData[code];
      updateTable();
    }
  }

  // 啟動相機掃描器
  const html5QrCode = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const cameraId = devices[0].id;
      html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 300, height: 200 }
        },
        (decodedText, decodedResult) => {
          html5QrCode.stop(); // 停止掃描器以防重複掃描
          showInputDialog(decodedText);
          setTimeout(() => {
            html5QrCode.start(cameraId, { fps: 10, qrbox: { width: 300, height: 200 } }, arguments.callee);
          }, 500);
        },
        errorMessage => {
          // 可以忽略錯誤訊息
        }
      );
    }
  }).catch(err => {
    alert("無法存取相機：" + err);
  });