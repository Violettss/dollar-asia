// Authentication Management
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // Check for existing session
    const storedUser = localStorage.getItem("dolarasia_user");
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.updateUI();
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("dolarasia_user");
      }
    }

    // Initialize admin user if not exists
    this.initializeAdminUser();
  }

  initializeAdminUser() {
    const users = this.getUsers();
    const adminExists = users.find((u) => u.email === "admin@dolarasia.com");

    if (!adminExists) {
      const adminUser = {
        id: "admin-1",
        email: "admin@dolarasia.com",
        password: "admin123",
        fullName: "Admin Dolarasia",
        phone: "+62123456789",
        address: "Jakarta Office",
        idNumber: "ADMIN001",
        isAdmin: true,
        createdAt: new Date().toISOString(),
      };

      users.push(adminUser);
      this.saveUsers(users);
    }
  }

  getUsers() {
    const users = localStorage.getItem("dolarasia_users");
    return users ? JSON.parse(users) : [];
  }

  saveUsers(users) {
    localStorage.setItem("dolarasia_users", JSON.stringify(users));
  }

  async login(email, password) {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      // Remove password from stored user data
      const { password: _, ...userWithoutPassword } = user;
      this.currentUser = userWithoutPassword;
      localStorage.setItem("dolarasia_user", JSON.stringify(this.currentUser));
      this.updateUI();
      return { success: true, user: this.currentUser };
    }

    return { success: false, message: "Email atau password salah" };
  }

  async register(userData) {
    const users = this.getUsers();

    // Check if user already exists
    if (users.find((u) => u.email === userData.email)) {
      return { success: false, message: "Email sudah terdaftar" };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto-login after registration
    const { password: _, ...userWithoutPassword } = newUser;
    this.currentUser = userWithoutPassword;
    localStorage.setItem("dolarasia_user", JSON.stringify(this.currentUser));
    this.updateUI();

    return { success: true, user: this.currentUser };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("dolarasia_user");
    this.updateUI();

    // Redirect to home page
    if (
      window.location.pathname !== "/index.html" &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "index.html";
    }
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.isAdmin;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  updateUI() {
    // Update navigation
    this.updateNavigation();

    // Update hero actions
    this.updateHeroActions();

    // Update auth buttons
    this.updateAuthButtons();
  }

  updateNavigation() {
    const navDashboard = document.getElementById("nav-dashboard");
    const navExchange = document.getElementById("nav-exchange");
    const navHistory = document.getElementById("nav-history");
    const navAdmin = document.getElementById("nav-admin");
    const navDatabase = document.getElementById("nav-database");

    if (this.isAuthenticated()) {
      if (navDashboard) navDashboard.style.display = "block";
      if (navExchange) navExchange.style.display = "block";
      if (navHistory) navHistory.style.display = "block";

      if (this.isAdmin()) {
        if (navAdmin) navAdmin.style.display = "block";
        if (navDatabase) navDatabase.style.display = "block";
      }
    } else {
      if (navDashboard) navDashboard.style.display = "none";
      if (navExchange) navExchange.style.display = "none";
      if (navHistory) navHistory.style.display = "none";
      if (navAdmin) navAdmin.style.display = "none";
      if (navDatabase) navDatabase.style.display = "none";
    }
  }

  updateHeroActions() {
    const heroActions = document.getElementById("hero-actions");
    if (!heroActions) return;

    if (this.isAuthenticated()) {
      heroActions.innerHTML = `
        <a href="dashboard.html" class="btn btn-primary btn-large">Dashboard</a>
        <a href="exchange.html" class="btn btn-outline btn-large">Tukar Uang</a>
      `;
    } else {
      heroActions.innerHTML = `
        <a href="register.html" class="btn btn-primary btn-large">Daftar Sekarang</a>
        <a href="login.html" class="btn btn-outline btn-large">Masuk</a>
      `;
    }
  }

  updateAuthButtons() {
    const authButtons = document.getElementById("auth-buttons");
    const userDropdown = document.getElementById("user-dropdown");
    const userName = document.getElementById("user-name");

    if (this.isAuthenticated()) {
      if (authButtons) authButtons.style.display = "none";
      if (userDropdown) userDropdown.style.display = "block";
      if (userName) userName.textContent = this.currentUser.fullName;
    } else {
      if (authButtons) authButtons.style.display = "flex";
      if (userDropdown) userDropdown.style.display = "none";
    }
  }

  // Check if current page requires authentication
  requireAuth() {
    const protectedPages = [
      "dashboard.html",
      "exchange.html",
      "history.html",
      "admin.html",
      "database.html",
    ];

    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage) && !this.isAuthenticated()) {
      window.location.href = "login.html";
      return false;
    }

    return true;
  }

  // Check if current page requires admin access
  requireAdmin() {
    const adminPages = ["admin.html", "database.html"];
    const currentPage = window.location.pathname.split("/").pop();

    if (adminPages.includes(currentPage)) {
      if (!this.isAuthenticated()) {
        window.location.href = "login.html";
        return false;
      }
      if (!this.isAdmin()) {
        window.location.href = "dashboard.html";
        return false;
      }
    }

    return true;
  }
}

// Global auth manager instance
window.authManager = new AuthManager();

// Initialize authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Check authentication requirements
  window.authManager.requireAuth();
  window.authManager.requireAdmin();

  // Setup logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.authManager.logout();
    });
  }

  // Setup user dropdown
  const userBtn = document.getElementById("user-btn");
  const dropdownMenu = document.getElementById("dropdown-menu");

  if (userBtn && dropdownMenu) {
    userBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function () {
      dropdownMenu.classList.remove("show");
    });
  }
});
