// ============================================
// 鲲鸿祥瑞产品展示 - 后台管理逻辑
// 更新日期：20260616
// ============================================

(function () {
  "use strict";

  // --- State ---
  var products = PRODUCT_DATA.slice();
  var editingId = null;

  // --- Elements ---
  var loginContainer = document.getElementById("loginContainer");
  var adminPanel = document.getElementById("adminPanel");
  var loginForm = document.getElementById("loginForm");
  var loginError = document.getElementById("loginError");
  var usernameInput = document.getElementById("username");
  var passwordInput = document.getElementById("password");

  var productForm = document.getElementById("productForm");
  var formTitle = document.getElementById("formTitle");
  var cancelEditBtn = document.getElementById("cancelEditBtn");
  var posterInput = document.getElementById("posterInput");
  var posterPreview = document.getElementById("posterPreview");
  var itineraryInput = document.getElementById("itineraryInput");
  var itineraryName = document.getElementById("itineraryName");
  var productListBody = document.getElementById("productListBody");
  var noDataEl = document.getElementById("noData");
  var exportBtn = document.getElementById("exportBtn");
  var modalOverlay = document.getElementById("modalOverlay");
  var modalCancel = document.getElementById("modalCancel");
  var modalConfirm = document.getElementById("modalConfirm");
  var modalMessage = document.getElementById("modalMessage");

  var posterBase64 = "";
  var itineraryBase64 = "";
  var itineraryFileName = "";

  // --- Auth ---
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
    renderProductList();
  }

  // --- File -> Base64 ---
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

  // --- Poster input ---
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

  // --- Itinerary input ---
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

  // --- Form Submit ---
  if (productForm) {
    productForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var category = document.getElementById("prodCategory").value;
      var name = document.getElementById("prodName").value.trim();
      var days = document.getElementById("prodDays").value.trim();
      var policy = document.getElementById("prodPolicy").value.trim();

      if (!category || !name || !days || !policy) {
        showToast("请填写所有必填字段", "error");
        return;
      }

      var now = new Date();
      var uploadTime =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0");

      if (editingId !== null) {
        // Update existing
        var idx = products.findIndex(function (p) {
          return p.id === editingId;
        });
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
        // Add new
        var newId =
          products.length > 0
            ? Math.max.apply(
                null,
                products.map(function (p) {
                  return p.id;
                })
              ) + 1
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

      // Reset form
      productForm.reset();
      posterBase64 = "";
      itineraryBase64 = "";
      itineraryFileName = "";
      if (posterPreview) posterPreview.style.display = "none";
      if (itineraryName) itineraryName.style.display = "none";

      renderProductList();
    });
  }

  // --- Cancel Edit ---
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

  // --- Render Product List ---
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

  // --- Edit ---
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

    // Scroll to form
    productForm.scrollIntoView({ behavior: "smooth" });
  }

  // --- Delete ---
  var deleteTarget = null;

  function confirmDelete(item) {
    deleteTarget = item;
    if (modalMessage) {
      modalMessage.textContent =
        '确定要删除产品"' + item.name + '"吗？此操作不可恢复。';
    }
    if (modalOverlay) modalOverlay.classList.add("show");
  }

  if (modalConfirm) {
    modalConfirm.addEventListener("click", function () {
      if (deleteTarget) {
        products = products.filter(function (p) {
          return p.id !== deleteTarget.id;
        });
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

  // --- Export ---
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var dataStr = JSON.stringify(products, null, 2);
      var content =
        "// ============================================\n" +
        "// 鲲鸿祥瑞产品展示 - 产品数据\n" +
        "// 更新日期：" +
        new Date().toISOString().slice(0, 10).replace(/-/g, "") +
        "\n" +
        "// ============================================\n\n" +
        "const PRODUCT_DATA = " +
        dataStr +
        ";\n";

      var blob = new Blob([content], { type: "application/javascript" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "data.js";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(
        "数据文件已导出。请将其放入网站 js/ 目录替换原 data.js，然后上传到 GitHub。",
        "success"
      );
    });
  }

  // --- Toast ---
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
