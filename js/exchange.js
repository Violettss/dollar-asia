// Exchange Page Functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeExchangePage();
});

function initializeExchangePage() {
  // Load exchange rates
  loadExchangeRatesForExchange();

  // Initialize form handlers
  initializeExchangeForm();

  // Initialize calculator
  initializeCalculator();
}

// Exchange form handler
function initializeExchangeForm() {
  const form = document.getElementById("exchange-form");
  if (!form) return;

  form.addEventListener("submit", handleExchangeSubmit);

  // Add event listeners for real-time calculation
  const currencySelect = document.getElementById("currency-select");
  const amountInput = document.getElementById("amount-input");
  const typeRadios = document.querySelectorAll('input[name="type"]');

  currencySelect.addEventListener("change", updateCalculation);
  amountInput.addEventListener("input", updateCalculation);
  typeRadios.forEach((radio) =>
    radio.addEventListener("change", updateCalculation),
  );

  // Update amount currency label based on transaction type
  typeRadios.forEach((radio) =>
    radio.addEventListener("change", updateAmountCurrency),
  );
}

// Handle form submission
async function handleExchangeSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {
    type: formData.get("type"),
    currency: formData.get("currency"),
    amount: parseFloat(formData.get("amount")),
    paymentMethod: formData.get("paymentMethod"),
  };

  // Validate form data
  if (!validateExchangeForm(data)) {
    return;
  }

  const submitBtn = document.getElementById("submit-btn");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Memproses...";
  submitBtn.disabled = true;

  try {
    const result = await createExchangeTransaction(data);

    if (result.success) {
      showSuccessModal(result.transaction);
      e.target.reset();
      updateCalculation();
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
    console.error("Exchange error:", error);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Validate exchange form
function validateExchangeForm(data) {
  if (!data.currency) {
    showNotification("Silakan pilih mata uang", "error");
    return false;
  }

  if (!data.amount || data.amount <= 0) {
    showNotification("Jumlah harus lebih besar dari 0", "error");
    return false;
  }

  if (!data.paymentMethod) {
    showNotification("Silakan pilih metode pembayaran", "error");
    return false;
  }

  // Minimum transaction amount
  const minAmount = data.type === "buy" ? 50000 : 10; // 50k IDR or $10
  if (data.amount < minAmount) {
    const currency = data.type === "buy" ? "IDR" : data.currency;
    showNotification(
      `Jumlah minimum ${minAmount.toLocaleString()} ${currency}`,
      "error",
    );
    return false;
  }

  return true;
}

// Create exchange transaction
async function createExchangeTransaction(data) {
  const user = window.authManager.getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const rates = window.currentRates;
  if (!rates) {
    throw new Error("Exchange rates not loaded");
  }

  const rate = rates.find((r) => r.currency === data.currency);
  if (!rate) {
    throw new Error("Currency rate not found");
  }

  const exchangeRate = data.type === "buy" ? rate.buyRate : rate.sellRate;
  const totalAmount = window.utils.currency.calculate(
    data.amount,
    exchangeRate,
    data.type,
  );

  const transaction = {
    id: window.utils.generateId(),
    userId: user.id,
    type: data.type,
    fromCurrency: data.type === "buy" ? "IDR" : data.currency,
    toCurrency: data.type === "buy" ? data.currency : "IDR",
    amount: data.amount,
    exchangeRate: exchangeRate,
    totalAmount: totalAmount,
    status: "pending",
    paymentMethod: data.paymentMethod,
    createdAt: new Date().toISOString(),
  };

  // Save transaction
  const transactions = window.utils.storage.get("dolarasia_transactions", []);
  transactions.push(transaction);
  window.utils.storage.set("dolarasia_transactions", transactions);

  return {
    success: true,
    transaction: transaction,
  };
}

// Initialize calculator
function initializeCalculator() {
  const currencySelect = document.getElementById("currency-select");

  // Populate currency options when rates are loaded
  if (window.currentRates) {
    populateCurrencyOptions();
  } else {
    // Wait for rates to load and keep checking
    let attempts = 0;
    const checkRates = setInterval(() => {
      attempts++;
      if (window.currentRates || attempts > 10) {
        clearInterval(checkRates);
        if (window.currentRates) {
          populateCurrencyOptions();
        } else {
          console.error("Failed to load exchange rates");
          // Show fallback message
          currencySelect.innerHTML =
            '<option value="">Gagal memuat mata uang</option>';
        }
      }
    }, 500);
  }
}

// Populate currency select options
function populateCurrencyOptions() {
  const currencySelect = document.getElementById("currency-select");

  if (!currencySelect) {
    console.error("Currency select element not found");
    return;
  }

  if (!window.currentRates) {
    console.error("Exchange rates not loaded");
    return;
  }

  console.log(
    "Populating currency options with",
    window.currentRates.length,
    "currencies",
  );

  currencySelect.innerHTML = '<option value="">Pilih mata uang</option>';

  window.currentRates.forEach((rate) => {
    const option = document.createElement("option");
    option.value = rate.currency;
    option.textContent = `${rate.flag} ${rate.currency} - ${rate.currencyName}`;
    currencySelect.appendChild(option);
  });

  console.log("Currency options populated successfully");
}

// Update calculation
function updateCalculation() {
  const currencySelect = document.getElementById("currency-select");
  const amountInput = document.getElementById("amount-input");
  const typeRadio = document.querySelector('input[name="type"]:checked');
  const resultContainer = document.getElementById("calculated-result");
  const detailsContainer = document.getElementById("currency-details");

  const currency = currencySelect.value;
  const amount = parseFloat(amountInput.value) || 0;
  const type = typeRadio.value;

  if (!currency || !window.currentRates) {
    resultContainer.classList.add("hidden");
    detailsContainer.innerHTML =
      '<p class="select-currency-message">Pilih mata uang untuk melihat kurs</p>';
    return;
  }

  const rate = window.currentRates.find((r) => r.currency === currency);
  if (!rate) return;

  // Update currency details
  detailsContainer.innerHTML = `
    <div class="selected-currency">
      <div class="currency-header">
        <span class="currency-flag">${rate.flag}</span>
        <div class="currency-info">
          <h4>${rate.currency}</h4>
          <p>${rate.currencyName}</p>
        </div>
      </div>
      <div class="currency-rates">
        <div class="rate-item">
          <span class="rate-label">Kurs Beli:</span>
          <span class="rate-value">${rate.buyRate.toLocaleString()} IDR</span>
        </div>
        <div class="rate-item">
          <span class="rate-label">Kurs Jual:</span>
          <span class="rate-value">${rate.sellRate.toLocaleString()} IDR</span>
        </div>
      </div>
    </div>
  `;

  if (amount > 0) {
    const exchangeRate = type === "buy" ? rate.buyRate : rate.sellRate;
    const result = window.utils.currency.calculate(amount, exchangeRate, type);

    resultContainer.classList.remove("hidden");
    resultContainer.innerHTML = `
      <h4>Hasil Perhitungan:</h4>
      <div class="calc-row">
        <span>Anda ${type === "buy" ? "bayar" : "terima"}:</span>
        <strong>${amount.toLocaleString()} ${type === "buy" ? "IDR" : currency}</strong>
      </div>
      <div class="calc-row">
        <span>Anda ${type === "buy" ? "terima" : "bayar"}:</span>
        <strong>${result.toLocaleString()} ${type === "buy" ? currency : "IDR"}</strong>
      </div>
      <div class="calc-row">
        <span>Kurs digunakan:</span>
        <strong>${exchangeRate.toLocaleString()} IDR</strong>
      </div>
    `;
  } else {
    resultContainer.classList.add("hidden");
  }
}

// Update amount currency label
function updateAmountCurrency() {
  const typeRadio = document.querySelector('input[name="type"]:checked');
  const currencySelect = document.getElementById("currency-select");
  const amountCurrency = document.getElementById("amount-currency");

  if (!typeRadio || !amountCurrency) return;

  const type = typeRadio.value;
  const selectedCurrency = currencySelect.value;

  if (type === "buy") {
    amountCurrency.textContent = "IDR";
  } else {
    amountCurrency.textContent = selectedCurrency || "Currency";
  }

  // Trigger calculation update
  updateCalculation();
}

// Show success modal
function showSuccessModal(transaction) {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.remove("hidden");

    // Update modal content with transaction details
    const modalBody = modal.querySelector(".modal-body");
    const existingDetails = modalBody.querySelector(".transaction-details");

    if (!existingDetails) {
      const detailsDiv = document.createElement("div");
      detailsDiv.className = "transaction-details";
      detailsDiv.innerHTML = `
        <div class="transaction-summary">
          <h4>Detail Transaksi:</h4>
          <p><strong>ID:</strong> ${transaction.id}</p>
          <p><strong>Tipe:</strong> ${transaction.type === "buy" ? "Beli" : "Jual"} ${transaction.toCurrency}</p>
          <p><strong>Jumlah:</strong> ${transaction.amount.toLocaleString()} ${transaction.fromCurrency}</p>
          <p><strong>Total:</strong> ${transaction.totalAmount.toLocaleString()} ${transaction.toCurrency}</p>
          <p><strong>Status:</strong> Menunggu Pembayaran</p>
        </div>
      `;

      // Insert before modal actions
      const modalActions = modalBody.querySelector(".modal-actions");
      modalBody.insertBefore(detailsDiv, modalActions);
    }
  }
}

// Close success modal
function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.add("hidden");

    // Remove transaction details for next use
    const details = modal.querySelector(".transaction-details");
    if (details) {
      details.remove();
    }
  }
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const modal = document.getElementById("success-modal");
  if (modal && e.target === modal) {
    closeSuccessModal();
  }
});

// Update exchange rates display
function updateExchangeRatesDisplay() {
  const container = document.getElementById("exchange-rates");
  if (!container || !window.currentRates) return;

  container.innerHTML = window.currentRates
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
}

// Load exchange rates for exchange page
async function loadExchangeRatesForExchange() {
  // Call the global loadExchangeRates function
  if (
    window.loadExchangeRates &&
    typeof window.loadExchangeRates === "function"
  ) {
    await window.loadExchangeRates();
  }

  // Add exchange page specific updates
  setTimeout(() => {
    updateExchangeRatesDisplay();
    populateCurrencyOptions();
  }, 100);

  // Also try immediately in case rates are already loaded
  updateExchangeRatesDisplay();
  populateCurrencyOptions();
}
