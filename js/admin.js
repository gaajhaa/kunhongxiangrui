// ============================================
// 鲲鸿祥瑞产品展示 - 后台管理逻辑（重写）
// 更新日期：20260616
// ============================================

(function () {
  "use strict";

  // ============ State ============
  var products = PRODUCT_DATA.slice();
  var editingId = null;
  var posterBase64 = "";
  var itineraryBase64 = "";
  var itineraryFileName = "";
  var logoBase64 = "";

  // 从 SITE_CONFIG 初始化本地管理状态
  var siteCategories = (SITE_CONFIG.starredCategories || []).slice();
  var starredCategories = (SITE_CONFIG.starredCategories || []).slice();
  var detailUsers = (SITE_CONFIG.detailUsers || []).slice();

  // 确保所有已用 category 都出现在 siteCategories（用于 datalist）
  function syncCategoriesFromProducts() {
    products.forEach(function (item) {
      if (item.category && siteCategories.indexOf(item.category) === -1) {
        siteCategories.push(item.category);
      }
    });
  }

  // ============ Elements ============
  var loginContainer = document.getElementById("loginContainer");
  var adminPanel = document.getElementById("adminPanel");
  var loginForm = document.getElementById("loginForm");
  var loginError = document.getElementById("loginError");
  var usernameInput = document.getElementById("username");
  var passwordInput = document.getElementById("password");

  var tabNav = document.getElementById("tabNav");
  var tabPanels = document.querySelectorAll(".tab-panel");

  var productForm = document.getElementById("productForm");
  var formTitle = document.getElementById("formTitle");
  var cancelEditBtn = document.getElementById("cancelEditBtn");
  var posterInput = document.getElementById("posterInput");
  var posterPreview = document.getElementById("posterPreview");
  var itineraryInput = document.getElementById("itineraryInput");
  var itineraryName = document.getElementById("itineraryName");
  var productListBody = document.getElementById("productListBody");
  var noDataEl = document.getElementById("noData");

  var modalOverlay = document.getElementById("modalOverlay");
  var modalCancel = document.getElementById("modalCancel");
  var modalConfirm = document.getElementById("modalConfirm");
  var modalTitle = document.getElementById("modalTitle");
  var modalMessage = document.getElementById("modalMessage");

  // User modal
  var userModalOverlay = document.getElementById("userModalOverlay");
  var userModalTitle = document.getElementById("userModalTitle");
  var userForm = document.getElementById("userForm");
  var userFormUsername = document.getElementById("userFormUsername");
  var userFormPassword = document.getElementById("userFormPassword");
  var userFormConfirm = document.getElementById("userFormConfirm");
  var userFormError = document.getElementById("userFormError");
  var userModalCancel = document.getElementById("userModalCancel");
  var editingUserIndex = null;

  // Logo
  var logoFileInput = document.getElementById("logoFileInput");
  var logoPreviewImg = document.getElementById("logoPreviewImg");
  var headerLogoImg = document.getElementById("headerLogoImg");

  // Config tab
  var categoryList = document.getElementById("categoryList");
  var newCategoryInput = document.getElementById("newCategoryInput");
  var addCategoryBtn = document.getElementById("addCategoryBtn");

  // User tab
  var userTableBody = document.getElementById("userTableBody");
  var addUserBtn = document.getElementById("addUserBtn");

  // Export
  var exportDataBtn = document.getElementById("exportDataBtn");
  var exportConfigBtn = document.getElementById("exportConfigBtn");
  var exportAllBtn = document.getElementById("exportAllBtn");
  var categoryDatalist = document.getElementById("categoryDatalist");

  // ============ Auth ============
  if (sessionStorage.getItem("admin_logged_in") === "1") {
    showPanel();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = usernameInput.value.trim();
      var p = passwordInput.value.trim();
      if (
        u === CONFIG.adminAuth.username &&
        p === CONFIG.adminAuth.password
      ) {
        sessionStorage.setItem("admin_logged_in", "1");
        showPanel();
      } else {
        if (loginError) {
          loginError.textContent = "用户名或密码错误";
          loginError.classList.add("show");
        }
      }
    });
  }

  function showPanel() {
    if (loginContainer) loginContainer.style.display = "none";
    if (adminPanel) adminPanel.style.display = "block";
    syncCategoriesFromProducts();
    refreshCategoryDatalist();
    renderProductList();
    renderCategoryList();
    renderUserTable();
  }

  // ============ Tab Switching ============
  if (tabNav) {
    tabNav.addEventListener("click", function (e) {
      var btn = e.target.closest(".tab-btn");
      if (!btn) return;
      var tabId = btn.getAttribute("data-tab");

      tabNav.querySelectorAll(".tab-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      tabPanels.forEach(function (panel) {
        panel.classList.remove("active");
      });
      var targetPanel = document.getElementById(tabId);
      if (targetPanel) targetPanel.classList.add("active");
    });
  }

  // ============ Category Datalist ============
  function refreshCategoryDatalist() {
    if (!categoryDatalist) return;
    categoryDatalist.innerHTML = "";
    siteCategories.forEach(function (cat) {
      var opt = document.createElement("option");
      opt.value = cat;
      categoryDatalist.appendChild(opt);
    });
  }

  // ============ File -> Base64 ============
  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  }

  // ============ Poster input ============
  if (posterInput) {
    posterInput.addEventListener("change", function () {
      var file = posterInput.files[0];
      if (!file) return;
      fileToBase64(file).then(function (b64) {
        posterBase64 = b64;
        if (posterPreview) {
          posterPreview.src = b64;
          posterPreview.style.display = "block";
        }
      });
    });
  }

  // ============ Itinerary input ============
  if (itineraryInput) {
    itineraryInput.addEventListener("change", function () {
      var file = itineraryInput.files[0];
      if (!file) return;
      itineraryFileName = file.name;
      fileToBase64(file).then(function (b64) {
        itineraryBase64 = b64;
        if (itineraryName) {
          itineraryName.textContent = file.name;
          itineraryName.style.display = "inline";
        }
      });
    });
  }

  // ============ Product Form Submit ============
  if (productForm) {
    productForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var category = document.getElementById("prodCategory").value.trim();
      var name = document.getElementById("prodName").value.trim();
      var days = document.getElementById("prodDays").value.trim();
      var policy = document.getElementById("prodPolicy").value.trim();

      if (!category || !name || !days || !policy) {
        showToast("请填写所有必填字段", "error");
        return;
      }

      // 如果输入了新的 category，自动加入 siteCategories
      if (siteCategories.indexOf(category) === -1) {
        siteCategories.push(category);
        refreshCategoryDatalist();
        renderCategoryList();
      }

      var now = new Date();
      var uploadTime =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0");

      if (editingId !== null) {
        var idx = products.findIndex(function (p) { return p.id === editingId; });
        if (idx !== -1) {
          var existing = products[idx];
          products[idx] = {
            id: existing.id,
            category: category,
            name: name,
            days: days,
            policy: policy,
            image: posterBase64 || existing.image,
            itinerary: itineraryFileName || existing.itinerary,
            uploadTime: existing.uploadTime
          };
        }
        editingId = null;
        if (formTitle) formTitle.textContent = "添加新产品";
        if (cancelEditBtn) cancelEditBtn.style.display = "none";
        showToast("产品已更新", "success");
      } else {
        var newId = products.length > 0
          ? Math.max.apply(null, products.map(function (p) { return p.id; })) + 1
          : 1;

        products.push({
          id: newId,
          category: category,
          name: name,
          days: days,
          policy: policy,
          image: posterBase64 || "images/poster_placeholder.jpg",
          itinerary: itineraryFileName || "无行程文件",
          uploadTime: uploadTime
        });
        showToast("产品添加成功", "success");
      }

      productForm.reset();
      posterBase64 = "";
      itineraryBase64 = "";
      itineraryFileName = "";
      if (posterPreview) posterPreview.style.display = "none";
      if (itineraryName) itineraryName.style.display = "none";

      renderProductList();
    });
  }

  // ============ Cancel Edit ============
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", function () {
      editingId = null;
      productForm.reset();
      posterBase64 = "";
      itineraryBase64 = "";
      itineraryFileName = "";
      if (posterPreview) posterPreview.style.display = "none";
      if (itineraryName) itineraryName.style.display = "none";
      if (formTitle) formTitle.textContent = "添加新产品";
      cancelEditBtn.style.display = "none";
    });
  }

  // ============ Render Product List ============
  function renderProductList() {
    if (!productListBody) return;
    productListBody.innerHTML = "";

    if (products.length === 0) {
      if (noDataEl) noDataEl.style.display = "block";
      return;
    }
    if (noDataEl) noDataEl.style.display = "none";

    products.forEach(function (item, index) {
      var tr = document.createElement("tr");

      var tdNo = document.createElement("td");
      tdNo.textContent = index + 1;

      var tdCat = document.createElement("td");
      tdCat.textContent = item.category;

      var tdName = document.createElement("td");
      tdName.textContent = item.name;

      var tdTime = document.createElement("td");
      tdTime.textContent = formatTime(item.uploadTime);

      var tdAct = document.createElement("td");
      tdAct.className = "action-btns";

      var editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-outline";
      editBtn.textContent = "编辑";
      editBtn.addEventListener("click", function () {
        editProduct(item);
      });

      var delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-danger";
      delBtn.textContent = "删除";
      delBtn.addEventListener("click", function () {
        confirmDelete(item);
      });

      tdAct.appendChild(editBtn);
      tdAct.appendChild(delBtn);

      tr.appendChild(tdNo);
      tr.appendChild(tdCat);
      tr.appendChild(tdName);
      tr.appendChild(tdTime);
      tr.appendChild(tdAct);

      productListBody.appendChild(tr);
    });
  }

  function formatTime(raw) {
    if (!raw || raw.length < 12) return raw;
    return raw.slice(0, 4) + "/" + raw.slice(4, 6) + "/" + raw.slice(6, 8) + " " + raw.slice(8, 10) + ":" + raw.slice(10, 12);
  }

  function editProduct(item) {
    editingId = item.id;
    if (formTitle) formTitle.textContent = "编辑产品";
    if (cancelEditBtn) cancelEditBtn.style.display = "inline-block";

    document.getElementById("prodCategory").value = item.category;
    document.getElementById("prodName").value = item.name;
    document.getElementById("prodDays").value = item.days;
    document.getElementById("prodPolicy").value = item.policy;

    if (item.image && item.image.startsWith("data:")) {
      posterBase64 = item.image;
      if (posterPreview) {
        posterPreview.src = item.image;
        posterPreview.style.display = "block";
      }
    } else {
      posterBase64 = "";
      if (posterPreview) posterPreview.style.display = "none";
    }

    itineraryFileName = item.itinerary;
    itineraryBase64 = "";
    if (itineraryName && itineraryFileName !== "无行程文件") {
      itineraryName.textContent = itineraryFileName;
      itineraryName.style.display = "inline";
    } else {
      itineraryName.style.display = "none";
    }

    // 切换到产品管理标签页
    switchTab("tab-products");
    productForm.scrollIntoView({ behavior: "smooth" });
  }

  function switchTab(tabId) {
    tabNav.querySelectorAll(".tab-btn").forEach(function (b) {
      b.classList.remove("active");
      if (b.getAttribute("data-tab") === tabId) b.classList.add("active");
    });
    tabPanels.forEach(function (p) {
      p.classList.remove("active");
    });
    var target = document.getElementById(tabId);
    if (target) target.classList.add("active");
  }

  // ============ Delete Product Modal ============
  var deleteTarget = null;

  function confirmDelete(item) {
    deleteTarget = item;
    if (modalTitle) modalTitle.textContent = "确认删除";
    if (modalMessage) {
      modalMessage.textContent = '确定要删除产品"' + item.name + '"吗？此操作不可恢复。';
    }
    if (modalOverlay) modalOverlay.classList.add("show");
  }

  if (modalConfirm) {
    modalConfirm.addEventListener("click", function () {
      if (deleteTarget) {
        products = products.filter(function (p) { return p.id !== deleteTarget.id; });
        deleteTarget = null;
        renderProductList();
        showToast("产品已删除", "success");
      }
      if (modalOverlay) modalOverlay.classList.remove("show");
    });
  }

  if (modalCancel) {
    modalCancel.addEventListener("click", function () {
      deleteTarget = null;
      if (modalOverlay) modalOverlay.classList.remove("show");
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        deleteTarget = null;
        modalOverlay.classList.remove("show");
      }
    });
  }

  // ============ Logo Upload ============
  if (logoFileInput) {
    logoFileInput.addEventListener("change", function () {
      var file = logoFileInput.files[0];
      if (!file) return;
      fileToBase64(file).then(function (b64) {
        logoBase64 = b64;
        if (logoPreviewImg) logoPreviewImg.src = b64;
        if (headerLogoImg) headerLogoImg.src = b64;
        showToast("Logo 已更新（预览），导出 config.js 后生效", "success");
      });
    });
  }

  // ============ Category Management ============
  function renderCategoryList() {
    if (!categoryList) return;
    categoryList.innerHTML = "";

    siteCategories.forEach(function (cat, index) {
      var isStarred = starredCategories.indexOf(cat) !== -1;

      var row = document.createElement("div");
      row.className = "category-row";

      var noSpan = document.createElement("span");
      noSpan.className = "category-index";
      noSpan.textContent = (index + 1) + ".";

      var nameSpan = document.createElement("span");
      nameSpan.className = "category-name";
      nameSpan.textContent = cat;

      var starBtn = document.createElement("button");
      starBtn.className = "star-btn" + (isStarred ? " starred" : "");
      starBtn.title = isStarred ? "取消星标" : "设为星标";
      starBtn.innerHTML = "&#9733;";
      starBtn.addEventListener("click", function () {
        toggleStar(cat, starBtn);
      });

      var delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-danger";
      delBtn.textContent = "删除";
      delBtn.addEventListener("click", function () {
        confirmDeleteCategory(cat, index);
      });

      row.appendChild(noSpan);
      row.appendChild(nameSpan);
      row.appendChild(starBtn);
      row.appendChild(delBtn);

      categoryList.appendChild(row);
    });
  }

  function toggleStar(cat, btn) {
    var idx = starredCategories.indexOf(cat);
    if (idx !== -1) {
      // 取消星标
      starredCategories.splice(idx, 1);
      btn.classList.remove("starred");
      btn.title = "设为星标";
    } else {
      // 设为星标
      if (starredCategories.length >= 5) {
        alert("最多5个星标分类");
        return;
      }
      starredCategories.push(cat);
      btn.classList.add("starred");
      btn.title = "取消星标";
    }
  }

  var deleteCategoryTarget = null;

  function confirmDeleteCategory(cat, index) {
    deleteCategoryTarget = { cat: cat, index: index };
    if (modalTitle) modalTitle.textContent = "确认删除分类";
    if (modalMessage) {
      modalMessage.textContent = '确定要删除分类"' + cat + '"吗？已有产品仍保留原分类值不变。';
    }
    if (modalOverlay) modalOverlay.classList.add("show");

    // 覆写 modalConfirm 行为（通过标记区分）
    modalConfirm._deleteCategory = true;
  }

  // 扩展 modalConfirm 处理分类删除
  if (modalConfirm) {
    var origClick = modalConfirm.onclick;
    modalConfirm.addEventListener("click", function () {
      if (modalConfirm._deleteCategory && deleteCategoryTarget) {
        var dc = deleteCategoryTarget;
        // 从 siteCategories 移除
        var idx = siteCategories.indexOf(dc.cat);
        if (idx !== -1) siteCategories.splice(idx, 1);
        // 从 starredCategories 移除
        var sidx = starredCategories.indexOf(dc.cat);
        if (sidx !== -1) starredCategories.splice(sidx, 1);
        deleteCategoryTarget = null;
        modalConfirm._deleteCategory = false;
        renderCategoryList();
        refreshCategoryDatalist();
        showToast("分类已删除", "success");
      }
    });
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", function () {
      var val = (newCategoryInput.value || "").trim();
      if (!val) {
        showToast("请输入分类名称", "error");
        return;
      }
      if (siteCategories.indexOf(val) !== -1) {
        showToast("该分类已存在", "error");
        return;
      }
      siteCategories.push(val);
      newCategoryInput.value = "";
      renderCategoryList();
      refreshCategoryDatalist();
      showToast("分类已添加", "success");
    });
  }

  if (newCategoryInput) {
    newCategoryInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (addCategoryBtn) addCategoryBtn.click();
      }
    });
  }

  // ============ User Management ============
  function renderUserTable() {
    if (!userTableBody) return;
    userTableBody.innerHTML = "";

    detailUsers.forEach(function (user, index) {
      var tr = document.createElement("tr");

      var tdNo = document.createElement("td");
      tdNo.textContent = index + 1;

      var tdUser = document.createElement("td");
      tdUser.textContent = user.username;

      var tdPass = document.createElement("td");
      tdPass.className = "password-cell";
      tdPass.textContent = "********";
      tdPass.style.cursor = "pointer";
      tdPass.title = "点击切换显示/隐藏";
      tdPass.addEventListener("click", function () {
        if (tdPass.textContent === "********") {
          tdPass.textContent = user.password;
        } else {
          tdPass.textContent = "********";
        }
      });

      var tdAct = document.createElement("td");
      tdAct.className = "action-btns";

      var editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-outline";
      editBtn.textContent = "编辑";
      editBtn.addEventListener("click", function () {
        openUserModal(index);
      });

      var delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-danger";
      delBtn.textContent = "删除";
      if (detailUsers.length <= 1) {
        delBtn.disabled = true;
        delBtn.style.opacity = "0.4";
        delBtn.title = "至少保留1个用户";
      }
      delBtn.addEventListener("click", function () {
        if (detailUsers.length <= 1) {
          showToast("至少保留1个用户", "error");
          return;
        }
        confirmDeleteUser(index);
      });

      tdAct.appendChild(editBtn);
      tdAct.appendChild(delBtn);

      tr.appendChild(tdNo);
      tr.appendChild(tdUser);
      tr.appendChild(tdPass);
      tr.appendChild(tdAct);

      userTableBody.appendChild(tr);
    });
  }

  function openUserModal(index) {
    editingUserIndex = index;
    var user = detailUsers[index];
    if (userModalTitle) userModalTitle.textContent = "编辑用户";
    if (userFormUsername) userFormUsername.value = user.username;
    if (userFormPassword) userFormPassword.value = user.password;
    if (userFormConfirm) userFormConfirm.value = user.password;
    if (userFormError) userFormError.textContent = "";
    if (userModalOverlay) userModalOverlay.classList.add("show");
  }

  if (userForm) {
    userForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var uname = userFormUsername.value.trim();
      var pwd = userFormPassword.value.trim();
      var confirm = userFormConfirm.value.trim();

      if (!uname || !pwd || !confirm) {
        if (userFormError) userFormError.textContent = "请填写所有字段";
        return;
      }
      if (pwd !== confirm) {
        if (userFormError) userFormError.textContent = "两次密码不一致";
        return;
      }

      if (editingUserIndex !== null) {
        // 编辑
        detailUsers[editingUserIndex] = { username: uname, password: pwd };
        editingUserIndex = null;
        showToast("用户已更新", "success");
      } else {
        // 新增
        detailUsers.push({ username: uname, password: pwd });
        showToast("用户已添加", "success");
      }

      if (userModalOverlay) userModalOverlay.classList.remove("show");
      renderUserTable();
    });
  }

  if (userModalCancel) {
    userModalCancel.addEventListener("click", function () {
      editingUserIndex = null;
      if (userModalOverlay) userModalOverlay.classList.remove("show");
    });
  }

  if (userModalOverlay) {
    userModalOverlay.addEventListener("click", function (e) {
      if (e.target === userModalOverlay) {
        editingUserIndex = null;
        userModalOverlay.classList.remove("show");
      }
    });
  }

  if (addUserBtn) {
    addUserBtn.addEventListener("click", function () {
      editingUserIndex = null;
      if (userModalTitle) userModalTitle.textContent = "新增用户";
      if (userFormUsername) userFormUsername.value = "";
      if (userFormPassword) userFormPassword.value = "";
      if (userFormConfirm) userFormConfirm.value = "";
      if (userFormError) userFormError.textContent = "";
      if (userModalOverlay) userModalOverlay.classList.add("show");
    });
  }

  var deleteUserTarget = null;

  function confirmDeleteUser(index) {
    deleteUserTarget = index;
    if (modalTitle) modalTitle.textContent = "确认删除";
    if (modalMessage) {
      modalMessage.textContent = '确定要删除用户"' + detailUsers[index].username + '"吗？';
    }
    if (modalOverlay) modalOverlay.classList.add("show");
    modalConfirm._deleteUser = true;
  }

  // 扩展 modalConfirm 处理用户删除
  if (modalConfirm) {
    modalConfirm.addEventListener("click", function () {
      if (modalConfirm._deleteUser && deleteUserTarget !== null) {
        if (detailUsers.length <= 1) {
          showToast("至少保留1个用户", "error");
        } else {
          detailUsers.splice(deleteUserTarget, 1);
          showToast("用户已删除", "success");
          renderUserTable();
        }
        deleteUserTarget = null;
        modalConfirm._deleteUser = false;
      }
    });
  }

  // ============ Export ============
  function buildConfigContent() {
    var configObj = {
      title: "鲲鸿祥瑞产品展示",
      logoPath: logoBase64 || SITE_CONFIG.logoPath || "images/logo.svg",
      primaryColor: SITE_CONFIG.primaryColor || "#4eb3f0",
      starredCategories: starredCategories.slice(),
      detailUsers: detailUsers.slice()
    };

    var today = new Date();
    var dateStr =
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");

    return (
      "// ============================================\n" +
      "// 鲲鸿祥瑞产品展示 - 全局配置\n" +
      "// 更新日期：" + dateStr + "\n" +
      "// ============================================\n\n" +
      "const SITE_CONFIG = " + JSON.stringify(configObj, null, 2) + ";\n\n" +
      "const CONFIG = {\n" +
      "  siteTitle: SITE_CONFIG.title,\n" +
      "  logoColor: SITE_CONFIG.primaryColor,\n" +
      "  logoPath: SITE_CONFIG.logoPath,\n" +
      "  detailAuth: SITE_CONFIG.detailUsers[0] || { username: \"\", password: \"\" },\n" +
      "  adminAuth: {\n" +
      "    username: \"admin_manager\",\n" +
      "    password: \"khxr_admin_2026\"\n" +
      "  },\n" +
      "  categories: SITE_CONFIG.starredCategories,\n" +
      "  version: \"更新日期：" + dateStr + "\",\n" +
      "  lastUpdate: \"最后更新：2026/6/16 14:02\"\n" +
      "};\n"
    );
  }

  function buildDataContent() {
    var today = new Date();
    var dateStr =
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");

    return (
      "// ============================================\n" +
      "// 鲲鸿祥瑞产品展示 - 产品数据\n" +
      "// 更新日期：" + dateStr + "\n" +
      "// ============================================\n\n" +
      "const PRODUCT_DATA = " + JSON.stringify(products, null, 2) + ";\n"
    );
  }

  function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (exportDataBtn) {
    exportDataBtn.addEventListener("click", function () {
      downloadFile(buildDataContent(), "data.js", "application/javascript");
      showToast("data.js 已导出", "success");
    });
  }

  if (exportConfigBtn) {
    exportConfigBtn.addEventListener("click", function () {
      downloadFile(buildConfigContent(), "config.js", "application/javascript");
      showToast("config.js 已导出", "success");
    });
  }

  if (exportAllBtn) {
    exportAllBtn.addEventListener("click", function () {
      downloadFile(buildDataContent(), "data.js", "application/javascript");
      setTimeout(function () {
        downloadFile(buildConfigContent(), "config.js", "application/javascript");
        showToast("data.js 和 config.js 已导出", "success");
      }, 500);
    });
  }

  // ============ Toast ============
  function showToast(msg, type) {
    var existing = document.querySelector(".toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "toast " + (type || "");
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.add("show");
    }, 10);

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 3000);
  }
})();
