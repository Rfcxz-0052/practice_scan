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
  });

  cancelBtn.addEventListener("click", () => {
    hidePopup();
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
      html5QrCode.pause(); // 暫停掃描直到處理完
      showPopup(decodedText);
    },
    (error) => {
      // 忽略錯誤
    }
  );