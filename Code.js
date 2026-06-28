function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('L\'Atelier Café POS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    if (sheetName === "user") {
      sheet.appendRow(["id_user", "password", "role"]);
      sheet.appendRow(["admin", "admin123", "1"]);
      sheet.appendRow(["kasir", "kasir123", "2"]);
      sheet.appendRow(["kitchen", "kitchen123", "3"]);
    }
    if (sheetName === "menu") {
      sheet.appendRow(["id_menu", "nama_menu", "harga_menu", "pajak_menu", "gambar"]);
      sheet.appendRow(["M1", "ESPRESSO", 18000, 11, "https://images.unsplash.com/photo-1510972527409-cef19039ae65?w=500&q=80"]);
      sheet.appendRow(["M2", "CAPPUCCINO", 28000, 11, "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80"]);
      sheet.appendRow(["M3", "CROISSANT DE PARIS", 25000, 11, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80"]);
    }
    if (sheetName === "order") {
      sheet.appendRow(["id_order", "menu_order", "qty_order", "nama_pengorder", "tgl_order", "status_order"]);
    }
    if (sheetName === "transaksi") {
      sheet.appendRow(["id_transaksi", "tgl_transaksi", "qty_transaksi", "harga_transaksi", "total_pembayaran", "kembalian", "jenis_pembayaran", "id_order_refrensi"]);
    }
    if (sheetName === "log_login") {
      sheet.appendRow(["id_user", "tanggal", "timestamp"]);
    }
  }

  // Double safety: if sheet exists but only has headers, seed the default values
  if (sheet.getLastRow() === 1) {
    if (sheetName === "user") {
      sheet.appendRow(["admin", "admin123", "1"]);
      sheet.appendRow(["kasir", "kasir123", "2"]);
      sheet.appendRow(["kitchen", "kitchen123", "3"]);
    }
    if (sheetName === "menu") {
      sheet.appendRow(["M1", "ESPRESSO", 18000, 11, "https://images.unsplash.com/photo-1510972527409-cef19039ae65?w=500&q=80"]);
      sheet.appendRow(["M2", "CAPPUCCINO", 28000, 11, "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80"]);
      sheet.appendRow(["M3", "CROISSANT DE PARIS", 25000, 11, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80"]);
    }
  }

  return sheet;
}

function getInitData() {
  return { menus: getMenuData(), payments: ["CASH", "QRIS", "DEBIT"] };
}

function cekLogin(idUser, pass) {
  var data = getSheet("user").getDataRange().getValues();
  var cleanId = idUser.toString().trim().toLowerCase();
  var cleanPass = pass.toString().trim();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim().toLowerCase() === cleanId && data[i][1].toString().trim() === cleanPass) {
      var roleVal = parseInt(data[i][2]);
      var resObj = { success: true, id_user: data[i][0], role: roleVal };
      try {
        var dateStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy");
        getSheet("log_login").appendRow([resObj.id_user, dateStr, new Date().getTime()]);
      } catch (e) {}
      return resObj;
    }
  }
  return { success: false, message: "ID User atau Password salah!" };
}

function getMenuData() {
  var data = getSheet("menu").getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      result.push({
        id_menu: data[i][0].toString(),
        nama_menu: data[i][1].toString(),
        harga_menu: parseFloat(data[i][2]) || 0,
        pajak_menu: parseFloat(data[i][3]) || 0,
        gambar: data[i][4] ? data[i][4].toString() : ""
      });
    }
  }
  return result;
}

function getUserData() {
  var data = getSheet("user").getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      result.push({ id_user: data[i][0].toString(), role: parseInt(data[i][2]) || 2 });
    }
  }
  return result;
}

// ==========================================
// CONFIG: MIDTRANS (SANDBOX / PRODUCTION)
// ==========================================
// PENTING: Untuk keamanan, jangan hardcode Server Key Anda di sini jika di-push ke GitHub.
// Simpan Server Key Anda di editor Google Apps Script: Project Settings -> Script Properties dengan nama property: MIDTRANS_SERVER_KEY
var MIDTRANS_SERVER_KEY = PropertiesService.getScriptProperties().getProperty("MIDTRANS_SERVER_KEY") || ""; 
var MIDTRANS_IS_PRODUCTION = false;

function simpanPesananBatch(namaPemesan, keranjang) {
  try {
    var sheetOrder = getSheet("order");
    var idOrder = "POSCAFE-" + new Date().getTime();
    var tglOrder = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
    var namaUnik = idOrder.slice(-3) + "-" + namaPemesan.toUpperCase();
    for (var i = 0; i < keranjang.length; i++) {
      sheetOrder.appendRow([idOrder, keranjang[i].id_menu, parseInt(keranjang[i].qty), namaUnik, tglOrder, "Pending"]);
    }
    return { status: 'success', idOrder: idOrder, namaUnik: namaUnik };
  } catch (e) { return { status: 'error', message: e.toString() }; }
}

function dapatkanTokenMidtrans(idOrder, grossAmount, customerName) {
  if (!MIDTRANS_SERVER_KEY) {
    // Kembalikan token simulasi jika Server Key belum dikonfigurasi
    return { 
      status: 'simulated', 
      token: 'MOCK_TOKEN_' + new Date().getTime(), 
      redirect_url: 'https://sandbox.midtrans.com' 
    };
  }
  
  try {
    var baseUrl = MIDTRANS_IS_PRODUCTION 
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";
      
    var payload = {
      "transaction_details": {
        "order_id": idOrder,
        "gross_amount": parseInt(grossAmount)
      },
      "credit_card": {
        "secure": true
      },
      "customer_details": {
        "first_name": customerName
      }
    };
    
    var headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Basic " + Utilities.base64Encode(MIDTRANS_SERVER_KEY + ":")
    };
    
    var options = {
      "method": "post",
      "headers": headers,
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };
    
    var response = UrlFetchApp.fetch(baseUrl, options);
    var json = JSON.parse(response.getContentText());
    
    if (json.token) {
      return { status: 'success', token: json.token, redirect_url: json.redirect_url };
    } else {
      return { status: 'error', message: json.error_messages ? json.error_messages.join(', ') : 'Gagal membuat transaksi' };
    }
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

function selesaikanPembayaranOnline(idOrder, total, qty) {
  try {
    return prosesPembayaran(idOrder, "ONLINE", qty, total, total, 0);
  } catch(e) {
    return { status: 'error', message: e.toString() };
  }
}

function getPesananAktif() {
  var dataOrder = getSheet("order").getDataRange().getValues();
  var dataMenu = getSheet("menu").getDataRange().getValues();
  var menuDict = {};
  for (var j = 1; j < dataMenu.length; j++) {
    if (dataMenu[j][0]) {
      menuDict[dataMenu[j][0].toString()] = {
        nama: dataMenu[j][1].toString(),
        harga: parseFloat(dataMenu[j][2]) || 0,
        pajak: parseFloat(dataMenu[j][3]) || 0
      };
    }
  }
  var result = [];
  for (var i = 1; i < dataOrder.length; i++) {
    var status = dataOrder[i][5];
    if (["Pending", "Siap Disajikan", "Lunas"].includes(status)) {
      var m = menuDict[dataOrder[i][1].toString()] || { nama: "Menu Dihapus", harga: 0, pajak: 0 };
      result.push({
        id_order: dataOrder[i][0].toString(),
        qty: parseInt(dataOrder[i][2]) || 1,
        nama_pengorder: dataOrder[i][3].toString(),
        status_order: status,
        nama_menu: m.nama,
        harga_menu: m.harga,
        pajak_menu: m.pajak
      });
    }
  }
  return result;
}

function prosesPembayaran(idOrder, jenis, qty, total, bayar, kembali) {
  var dateStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
  getSheet("transaksi").appendRow([
    "TRX-" + new Date().getTime().toString().slice(-6),
    dateStr,
    parseInt(qty) || 1,
    parseFloat(total) || 0,
    parseFloat(bayar) || 0,
    parseFloat(kembali) || 0,
    jenis.toUpperCase(),
    idOrder
  ]);

  var sheetOrder = getSheet("order");
  var data = sheetOrder.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === idOrder.toString()) {
      var statusLama = data[i][5];
      var statusBaru = (statusLama === "Pending") ? "Lunas" : "Selesai";
      sheetOrder.getRange(i + 1, 6).setValue(statusBaru);
    }
  }
  return { status: "success" };
}

function updateStatusOrder(idOrder, status) {
  var sheetOrder = getSheet("order");
  var data = sheetOrder.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === idOrder.toString()) {
      var statusLama = data[i][5];
      var statusBaru = (statusLama === "Lunas") ? "Selesai" : "Siap Disajikan";
      sheetOrder.getRange(i + 1, 6).setValue(statusBaru);
    }
  }
  return { status: "success" };
}

function getDashboardData() {
  var dataTrx = getSheet("transaksi").getDataRange().getValues();
  var dataOrder = getSheet("order").getDataRange().getValues();
  var dataMenu = getSheet("menu").getDataRange().getValues();
  var dataLog = getSheet("log_login").getDataRange().getValues();

  var total = 0; var chartMap = {}; var trxCountMap = {}; var payMethodCount = {};
  for (var i = 1; i < dataTrx.length; i++) {
    let h = parseFloat(dataTrx[i][3]) || 0;
    let jns = dataTrx[i][6] ? dataTrx[i][6].toString() : "Lainnya";
    total += h;
    let t = dataTrx[i][1].toString().split(' ')[0].substring(0, 5); // dd/MM
    chartMap[t] = (chartMap[t] || 0) + h;
    trxCountMap[t] = (trxCountMap[t] || 0) + 1;
    payMethodCount[jns] = (payMethodCount[jns] || 0) + 1;
  }

  // Hitung jumlah karyawan unik yang masuk setiap harinya
  var employeesPerDay = {};
  for (var i = 1; i < dataLog.length; i++) {
    if (dataLog[i][0] && dataLog[i][1]) {
      let tLog = dataLog[i][1].toString().substring(0, 5); // dd/MM
      let userId = dataLog[i][0].toString();
      if (!employeesPerDay[tLog]) employeesPerDay[tLog] = {};
      employeesPerDay[tLog][userId] = true;
    }
  }

  var menuSales = {}; var menuDict = {};
  for (let i = 1; i < dataMenu.length; i++) {
    if (dataMenu[i][0]) menuDict[dataMenu[i][0].toString()] = dataMenu[i][1].toString();
  }
  for (let i = 1; i < dataOrder.length; i++) {
    if (dataOrder[i][1]) {
      let idMenu = dataOrder[i][1].toString();
      menuSales[idMenu] = (menuSales[idMenu] || 0) + (parseInt(dataOrder[i][2]) || 0);
    }
  }

  var sortableMenu = [];
  for (var id in menuSales) sortableMenu.push([menuDict[id] || "Dihapus", menuSales[id]]);
  sortableMenu.sort((a, b) => b[1] - a[1]);

  var topMenuLabels = []; var topMenuValues = [];
  for (let i = 0; i < Math.min(5, sortableMenu.length); i++) {
    topMenuLabels.push(sortableMenu[i][0]);
    topMenuValues.push(sortableMenu[i][1]);
  }

  var chartLabels = Object.keys(chartMap);
  var chartStaffValues = [];
  var chartTrxCountValues = [];
  for (var i = 0; i < chartLabels.length; i++) {
    let dateKey = chartLabels[i];
    let uniqueStaff = employeesPerDay[dateKey] ? Object.keys(employeesPerDay[dateKey]).length : 0;
    chartStaffValues.push(uniqueStaff);
    chartTrxCountValues.push(trxCountMap[dateKey] || 0);
  }

  return {
    totalPendapatan: total,
    jumlahTransaksi: dataTrx.length - 1,
    chartLabels: chartLabels,
    chartValues: Object.values(chartMap),
    chartStaffValues: chartStaffValues,
    chartTrxCountValues: chartTrxCountValues,
    topMenuLabels: topMenuLabels,
    topMenuValues: topMenuValues,
    paymentLabels: Object.keys(payMethodCount),
    paymentValues: Object.values(payMethodCount)
  };
}

function tambahMenuBaru(d) {
  getSheet("menu").appendRow([
    "M" + new Date().getTime(),
    d.nama_menu.toUpperCase(),
    parseFloat(d.harga_menu) || 0,
    parseFloat(d.pajak_menu) || 0,
    d.gambar || ""
  ]);
  return { status: "success", message: "Menu ditambahkan" };
}

function tambahMenuBaruUser(id, pass, role) {
  getSheet("user").appendRow([
    id.toString().trim(),
    pass.toString().trim(),
    role.toString().trim()
  ]);
  return { status: "success", message: "User ditambahkan" };
}

function updateMenu(id, d) {
  var s = getSheet("menu");
  var val = s.getDataRange().getValues();
  for (var i = 1; i < val.length; i++) {
    if (val[i][0].toString() === id.toString()) {
      s.getRange(i + 1, 2).setValue(d.nama_menu.toUpperCase());
      s.getRange(i + 1, 3).setValue(parseFloat(d.harga_menu) || 0);
      s.getRange(i + 1, 4).setValue(parseFloat(d.pajak_menu) || 0);
      s.getRange(i + 1, 5).setValue(d.gambar || "");
      break;
    }
  }
  return { status: "success", message: "Menu diperbarui" };
}

function hapusMenu(id) {
  var s = getSheet("menu");
  var d = s.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) {
    if (d[i][0].toString() === id.toString()) {
      s.deleteRow(i + 1);
      break;
    }
  }
  return { status: "success" };
}