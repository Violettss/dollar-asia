// Main Application Logic
document.addEventListener("DOMContentLoaded", function () {
  // Initialize fraud modal
  initializeFraudModal();

  // Initialize mobile menu
  initializeMobileMenu();

  // Initialize forms based on current page
  initializeForms();

  // Initialize page-specific functionality
  initializePageSpecific();
});

// Fraud Warning Modal
function initializeFraudModal() {
  const modal = document.getElementById("fraud-modal");
  const closeBtn = document.getElementById("modal-close");

  if (modal) {
    // Show modal on page load (only on homepage)
    if (
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("index.html")
    ) {
      // Show modal after 1 second
      setTimeout(() => {
        modal.classList.remove("hidden");
      }, 1000);
    }

    // Close modal
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        modal.classList.add("hidden");
      });
    }

    // Close modal when clicking outside
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  }
}

// Mobile Menu
function initializeMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const nav = document.getElementById("nav");

  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener("click", function () {
      nav.classList.toggle("show");
      mobileMenuBtn.classList.toggle("active");
    });
  }
}

// Form Initialization
function initializeForms() {
  // Login Form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    initializeLoginForm(loginForm);
  }

  // Register Form
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    initializeRegisterForm(registerForm);
  }

  // Exchange Form
  const exchangeForm = document.getElementById("exchange-form");
  if (exchangeForm) {
    initializeExchangeForm(exchangeForm);
  }
}

// Login Form Handler
function initializeLoginForm(form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Memproses...";
    submitBtn.disabled = true;

    try {
      const result = await window.authManager.login(email, password);

      if (result.success) {
        showNotification("Login berhasil! Selamat datang kembali.", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Register Form Handler
function initializeRegisterForm(form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const userData = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      idNumber: formData.get("idNumber"),
      password: formData.get("password"),
    };

    // Validate password confirmation
    const confirmPassword = formData.get("confirmPassword");
    if (userData.password !== confirmPassword) {
      showNotification("Password dan konfirmasi password tidak sama", "error");
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Mendaftar...";
    submitBtn.disabled = true;

    try {
      const result = await window.authManager.register(userData);

      if (result.success) {
        showNotification(
          "Pendaftaran berhasil! Selamat bergabung dengan Dolarasia.",
          "success",
        );
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Exchange Form Handler
function initializeExchangeForm(form) {
  // This will be implemented in exchange.js
  console.log("Exchange form initialized");
}

// Page-specific initialization
function initializePageSpecific() {
  const currentPage = window.location.pathname.split("/").pop();

  switch (currentPage) {
    case "dashboard.html":
      initializeDashboard();
      break;
    case "exchange.html":
      initializeExchange();
      break;
    case "history.html":
      initializeHistory();
      break;
    case "admin.html":
      initializeAdmin();
      break;
    case "database.html":
      initializeDatabase();
      break;
  }
}

// Dashboard initialization
function initializeDashboard() {
  loadExchangeRates();
  loadRecentTransactions();
}

// Exchange page initialization
function initializeExchange() {
  loadExchangeRates();
  initializeExchangeCalculator();
}

// History page initialization
function initializeHistory() {
  loadTransactionHistory();
}

// Admin page initialization
function initializeAdmin() {
  loadAllTransactions();
  loadAdminStats();
}

// Database page initialization
function initializeDatabase() {
  loadDatabaseData();
}

// Load exchange rates
async function loadExchangeRates() {
  const exchangeRatesContainer = document.getElementById("exchange-rates");
  if (!exchangeRatesContainer) return;

  try {
    // Mock exchange rates data
    const rates = [
      {
        currency: "USD",
        currencyName: "US Dollar",
        buyRate: 15850,
        sellRate: 15750,
        flag: "🇺🇸",
      },
      {
        currency: "EUR",
        currencyName: "Euro",
        buyRate: 17200,
        sellRate: 17050,
        flag: "🇪🇺",
      },
      {
        currency: "GBP",
        currencyName: "British Pound",
        buyRate: 19800,
        sellRate: 19600,
        flag: "🇬🇧",
      },
      {
        currency: "JPY",
        currencyName: "Japanese Yen",
        buyRate: 106,
        sellRate: 104,
        flag: "🇯🇵",
      },
      {
        currency: "AUD",
        currencyName: "Australian Dollar",
        buyRate: 10450,
        sellRate: 10300,
        flag: "🇦🇺",
      },
      {
        currency: "SGD",
        currencyName: "Singapore Dollar",
        buyRate: 11750,
        sellRate: 11600,
        flag: "🇸🇬",
      },
    ];

    // Add small random fluctuation
    const fluctuatedRates = rates.map((rate) => ({
      ...rate,
      buyRate: Math.round(rate.buyRate * (0.995 + Math.random() * 0.01)),
      sellRate: Math.round(rate.sellRate * (0.995 + Math.random() * 0.01)),
    }));

    // Render rates
    exchangeRatesContainer.innerHTML = fluctuatedRates
      .map(
        (rate) => `
      <div class="rate-item">
        <div class="rate-currency">
          <span class="rate-flag">${rate.flag}</span>
          <div class="rate-info">
            <div class="rate-code">${rate.currency}</div>
            <div class="rate-name">${rate.currencyName}</div>
          </div>
        </div>
        <div class="rate-values">
          <div class="rate-buy">Beli: ${rate.buyRate.toLocaleString()}</div>
          <div class="rate-sell">Jual: ${rate.sellRate.toLocaleString()}</div>
        </div>
      </div>
    `,
      )
      .join("");

    // Store rates globally for use in other functions
    window.currentRates = fluctuatedRates;
  } catch (error) {
    console.error("Error loading exchange rates:", error);
    exchangeRatesContainer.innerHTML =
      '<p class="error">Gagal memuat kurs. Silakan refresh halaman.</p>';
  }
}

// Load recent transactions
function loadRecentTransactions() {
  const recentTransactionsContainer = document.getElementById(
    "recent-transactions",
  );
  if (!recentTransactionsContainer) return;

  const user = window.authManager.getCurrentUser();
  if (!user) return;

  const transactions = getTransactionsByUserId(user.id).slice(0, 5);

  if (transactions.length === 0) {
    recentTransactionsContainer.innerHTML = `
      <div class="no-transactions">
        <p>Belum ada transaksi</p>
        <a href="exchange.html" class="btn btn-primary">Mulai Tukar Mata Uang</a>
      </div>
    `;
    return;
  }

  recentTransactionsContainer.innerHTML = transactions
    .map(
      (transaction) => `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-type">${transaction.type === "buy" ? "Beli" : "Jual"} ${transaction.toCurrency}</div>
        <div class="transaction-date">${new Date(transaction.createdAt).toLocaleDateString()}</div>
      </div>
      <div class="transaction-amount">${transaction.totalAmount.toLocaleString()} ${transaction.toCurrency}</div>
      <div class="transaction-status status-${transaction.status}">${getStatusText(transaction.status)}</div>
    </div>
  `,
    )
    .join("");
}

// Load transaction history
function loadTransactionHistory() {
  const historyContainer = document.getElementById("transaction-history");
  if (!historyContainer) return;

  const user = window.authManager.getCurrentUser();
  if (!user) return;

  const transactions = getTransactionsByUserId(user.id);

  if (transactions.length === 0) {
    historyContainer.innerHTML = `
      <div class="no-transactions">
        <p>Belum ada riwayat transaksi</p>
        <a href="exchange.html" class="btn btn-primary">Mulai Tukar Mata Uang</a>
      </div>
    `;
    return;
  }

  historyContainer.innerHTML = `
    <div class="transactions-table">
      <div class="table-header">
        <div class="col-date">Tanggal</div>
        <div class="col-type">Tipe</div>
        <div class="col-currency">Mata Uang</div>
        <div class="col-amount">Jumlah</div>
        <div class="col-total">Total</div>
        <div class="col-status">Status</div>
      </div>
      ${transactions
        .map(
          (transaction) => `
        <div class="table-row">
          <div class="col-date">${new Date(transaction.createdAt).toLocaleDateString()}</div>
          <div class="col-type">${transaction.type === "buy" ? "Beli" : "Jual"}</div>
          <div class="col-currency">${transaction.fromCurrency} → ${transaction.toCurrency}</div>
          <div class="col-amount">${transaction.amount.toLocaleString()}</div>
          <div class="col-total">${transaction.totalAmount.toLocaleString()}</div>
          <div class="col-status">
            <span class="status-badge status-${transaction.status}">${getStatusText(transaction.status)}</span>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

// Utility functions
function getTransactionsByUserId(userId) {
  const transactions = localStorage.getItem("dolarasia_transactions");
  if (!transactions) return [];

  return JSON.parse(transactions)
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getAllTransactions() {
  const transactions = localStorage.getItem("dolarasia_transactions");
  return transactions
    ? JSON.parse(transactions).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )
    : [];
}

function getStatusText(status) {
  const statusMap = {
    pending: "Menunggu",
    completed: "Selesai",
    rejected: "Ditolak",
  };
  return statusMap[status] || status;
}

// Notification system
function showNotification(message, type = "info", duration = 5000) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Auto remove
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, duration);
}

// Initialize exchange calculator
function initializeExchangeCalculator() {
  const currencySelect = document.getElementById("currency-select");
  const amountInput = document.getElementById("amount-input");
  const typeSelect = document.getElementById("type-select");
  const calculatedResult = document.getElementById("calculated-result");

  if (!currencySelect || !amountInput || !typeSelect || !calculatedResult)
    return;

  function updateCalculation() {
    const currency = currencySelect.value;
    const amount = parseFloat(amountInput.value) || 0;
    const type = typeSelect.value;

    if (!currency || !amount || !window.currentRates) {
      calculatedResult.innerHTML = "";
      return;
    }

    const rate = window.currentRates.find((r) => r.currency === currency);
    if (!rate) return;

    const exchangeRate = type === "buy" ? rate.buyRate : rate.sellRate;
    const result =
      type === "buy"
        ? Math.round((amount / exchangeRate) * 100) / 100
        : Math.round(amount * exchangeRate);

    calculatedResult.innerHTML = `
      <div class="calculation-result">
        <h4>Hasil Perhitungan:</h4>
        <p>Anda ${type === "buy" ? "membeli" : "menjual"}: ${amount.toLocaleString()} ${type === "buy" ? "IDR" : currency}</p>
        <p>Anda mendapat: ${result.toLocaleString()} ${type === "buy" ? currency : "IDR"}</p>
        <p>Kurs: ${exchangeRate.toLocaleString()} IDR</p>
      </div>
    `;
  }

  // Add event listeners
  currencySelect.addEventListener("change", updateCalculation);
  amountInput.addEventListener("input", updateCalculation);
  typeSelect.addEventListener("change", updateCalculation);

  // Populate currency options
  if (window.currentRates) {
    currencySelect.innerHTML =
      '<option value="">Pilih mata uang</option>' +
      window.currentRates
        .map(
          (rate) =>
            `<option value="${rate.currency}">${rate.flag} ${rate.currency} - ${rate.currencyName}</option>`,
        )
        .join("");
  }
}
