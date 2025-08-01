  const barcodeData = [];
  const tableBody = document.getElementById("barcodeTableBody");
  const beepSound = document.getElementById("beepSound");

  const popup = document.getElementById("popup");
  const scannedCodeText = document.getElementById("scannedCodeText");
  const quantityInput = document.getElementById("quantityInput");
  const orderInput = document.getElementById("orderInput");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  let currentScannedCode = "";

  function formatTime(date) {
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth()+1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function updateTable() {
    tableBody.innerHTML = "";
    barcodeData.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.code}</td>
        <td>${item.quantity}</td>
        <td>${item.order}</td>
        <td>${item.time}</td>
        <td><button onclick="deleteRow(${index})">❌</button></td>
      `;
      tableBody.appendChild(row);
    });
  }

  function deleteRow(index) {
    if (confirm("確定要刪除這筆資料？")) {
      barcodeData.splice(index, 1);
      updateTable();
    }
  }

  function showPopup(code) {
    currentScannedCode = code;
    scannedCodeText.textContent = code;
    quantityInput.value = "";
    orderInput.value = "";
    popup.style.display = "flex";
  }

  function hidePopup() {
    popup.style.display = "none";
    currentScannedCode = "";
  }

  confirmBtn.addEventListener("click", () => {
    const quantity = parseInt(quantityInput.value);
    const order = orderInput.value.trim();
    if (!quantity || quantity <= 0 || order === "") {
      alert("請輸入正確的數量和單號");
      return;
    }

    beepSound.play();
    barcodeData.push({
      code: currentScannedCode,
      quantity: quantity,
      order: order,
      time: formatTime(new Date())
    });
    updateTable();
    hidePopup();
    html5QrCode.resume(); // ✅ 繼續掃描
  });

  cancelBtn.addEventListener("click", () => {
    hidePopup();
    html5QrCode.resume(); // ✅ 繼續掃描
  });

  const html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 400,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF
      ]
    },
    (decodedText) => {
      html5QrCode.pause();
      showPopup(decodedText);
    },
    (error) => {
      // 忽略掃描錯誤
    }
  );

  // 點擊儲存格編輯
  tableBody.addEventListener("click", function (e) {
    const target = e.target;
    if (target.tagName === "TD" && target.parentElement.tagName === "TR") {
      const rowIndex = target.parentElement.rowIndex - 1;
      const cellIndex = target.cellIndex;
      if (cellIndex === 4) return;

      const oldValue = target.textContent;
      const input = document.createElement("input");
      input.value = oldValue;
      input.style.width = "100%";
      target.textContent = "";
      target.appendChild(input);
      input.focus();

      input.addEventListener("blur", function () {
        const newValue = input.value.trim();
        if (newValue !== "") {
          if (cellIndex === 0) barcodeData[rowIndex].code = newValue;
          if (cellIndex === 1) barcodeData[rowIndex].quantity = parseInt(newValue);
          if (cellIndex === 2) barcodeData[rowIndex].order = newValue;
          if (cellIndex === 3) barcodeData[rowIndex].time = newValue;
          updateTable();
        } else {
          target.textContent = oldValue;
        }
      });

      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") input.blur();
        if (event.key === "Escape") {
          input.value = oldValue;
          input.blur();
        }
      });
    }
  });

  function exportToExcel() {
    if (barcodeData.length === 0) {
      alert("目前沒有資料可匯出！");
      return;
    }

    const sheetData = [["條碼", "數量", "單號", "掃描時間"]];
    barcodeData.forEach(item => {
      sheetData.push([item.code, item.quantity, item.order, item.time]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "掃描資料");

    const now = new Date();
    const pad = n => n.toString().padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `條碼掃描紀錄_${dateStr}_${timeStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
  }