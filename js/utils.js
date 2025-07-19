// Utility Functions

// Format currency number
function formatCurrency(amount, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number with thousand separators
function formatNumber(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

// Format date to Indonesian locale
function formatDate(date, options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("id-ID", defaultOptions).format(
    new Date(date),
  );
}

// Format datetime
function formatDateTime(date) {
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Deep clone object
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// Validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Indonesian format)
function isValidPhone(phone) {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ""));
}

// Validate password strength
function validatePassword(password) {
  const minLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: minLength,
    strength: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    },
    score: [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(
      Boolean,
    ).length,
  };
}

// Local storage helpers
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Storage get error:", error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage remove error:", error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  },
};

// API helpers (for future backend integration)
const api = {
  get: async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("API GET error:", error);
      throw error;
    }
  },

  post: async (url, data) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("API POST error:", error);
      throw error;
    }
  },

  put: async (url, data) => {
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("API PUT error:", error);
      throw error;
    }
  },

  delete: async (url) => {
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("API DELETE error:", error);
      throw error;
    }
  },
};

// DOM helpers
const dom = {
  $: (selector) => document.querySelector(selector),
  $$: (selector) => document.querySelectorAll(selector),

  create: (tag, attributes = {}, content = "") => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "innerHTML") {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    if (content) element.textContent = content;
    return element;
  },

  remove: (element) => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },

  hide: (element) => {
    if (element) element.style.display = "none";
  },

  show: (element, display = "block") => {
    if (element) element.style.display = display;
  },

  toggle: (element) => {
    if (element) {
      element.style.display =
        element.style.display === "none" ? "block" : "none";
    }
  },

  addClass: (element, className) => {
    if (element) element.classList.add(className);
  },

  removeClass: (element, className) => {
    if (element) element.classList.remove(className);
  },

  toggleClass: (element, className) => {
    if (element) element.classList.toggle(className);
  },

  hasClass: (element, className) => {
    return element ? element.classList.contains(className) : false;
  },
};

// Form validation helpers
const validation = {
  required: (value) => {
    return (
      value !== null && value !== undefined && value.toString().trim() !== ""
    );
  },

  email: (value) => {
    return isValidEmail(value);
  },

  phone: (value) => {
    return isValidPhone(value);
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return value && value.length <= max;
  },

  numeric: (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },

  positive: (value) => {
    return parseFloat(value) > 0;
  },

  match: (value1, value2) => {
    return value1 === value2;
  },
};

// Currency calculation helpers
const currency = {
  calculate: (amount, rate, type) => {
    if (type === "buy") {
      // User buying foreign currency with IDR
      return Math.round((amount / rate) * 100) / 100;
    } else {
      // User selling foreign currency for IDR
      return Math.round(amount * rate);
    }
  },

  formatIDR: (amount) => {
    return formatCurrency(amount, "IDR");
  },

  formatUSD: (amount) => {
    return formatCurrency(amount, "USD");
  },

  formatEUR: (amount) => {
    return formatCurrency(amount, "EUR");
  },

  addFluctuation: (rate, percentage = 0.01) => {
    const fluctuation = rate * percentage * (Math.random() - 0.5) * 2;
    return Math.round(rate + fluctuation);
  },
};

// URL helpers
const url = {
  getParams: () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  getParam: (name) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  setParam: (name, value) => {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, "", url);
  },

  removeParam: (name) => {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, "", url);
  },
};

// Animation helpers
const animate = {
  fadeIn: (element, duration = 300) => {
    element.style.opacity = "0";
    element.style.display = "block";

    const start = performance.now();
    const animate = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = progress.toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  fadeOut: (element, duration = 300) => {
    const start = performance.now();
    const initialOpacity = parseFloat(element.style.opacity) || 1;

    const animate = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.opacity = (initialOpacity * (1 - progress)).toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = "none";
      }
    };

    requestAnimationFrame(animate);
  },

  slideDown: (element, duration = 300) => {
    element.style.height = "0";
    element.style.overflow = "hidden";
    element.style.display = "block";

    const targetHeight = element.scrollHeight;
    const start = performance.now();

    const animate = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.height = `${targetHeight * progress}px`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.height = "auto";
        element.style.overflow = "visible";
      }
    };

    requestAnimationFrame(animate);
  },

  slideUp: (element, duration = 300) => {
    const targetHeight = element.scrollHeight;
    element.style.height = `${targetHeight}px`;
    element.style.overflow = "hidden";

    const start = performance.now();

    const animate = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      element.style.height = `${targetHeight * (1 - progress)}px`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = "none";
        element.style.height = "auto";
        element.style.overflow = "visible";
      }
    };

    requestAnimationFrame(animate);
  },
};

// Export to global scope for use in other scripts
window.utils = {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  generateId,
  debounce,
  throttle,
  deepClone,
  isValidEmail,
  isValidPhone,
  validatePassword,
  storage,
  api,
  dom,
  validation,
  currency,
  url,
  animate,
};
