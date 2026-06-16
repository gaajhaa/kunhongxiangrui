// ============================================
// 鲲鸿祥瑞产品展示 - 详情页逻辑
// 更新日期：20260616
// ============================================

(function () {
  "use strict";

  const loginContainer = document.getElementById("loginContainer");
  const mainContent = document.getElementById("mainContent");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const navBar = document.getElementById("navBar");
  const tableBody = document.getElementById("tableBody");
  const noDataEl = document.getElementById("noData");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentCategory = null;

  if (sessionStorage.getItem("detail_logged_in") === "1") {
    showMain();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = usernameInput.value.trim();
      var p = passwordInput.value.trim();

      var users = SITE_CONFIG.detailUsers || [];
      var matched = users.some(function (user) {
        return user.username === u && user.password === p;
      });

      if (matched) {
        sessionStorage.setItem("detail_logged_in", "1");
        showMain();
      } else {
        if (loginError) {
          loginError.textContent = "用户名或密码错误";
          loginError.classList.add("show");
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem("detail_logged_in");
      location.reload();
    });
  }

  function showMain() {
    if (loginContainer) loginContainer.style.display = "none";
    if (mainContent) mainContent.style.display = "block";
    buildNav();
    renderTable();
  }

  function buildNav() {
    if (!navBar) return;

    var allBtn = document.createElement("button");
    allBtn.className = "nav-btn active";
    allBtn.textContent = "全部";
    allBtn.addEventListener("click", function () {
      currentCategory = null;
      updateNav();
      renderTable();
    });
    navBar.appendChild(allBtn);

    var categories = SITE_CONFIG.starredCategories || CONFIG.categories || [];
    categories.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.className = "nav-btn";
      btn.textContent = cat;
      btn.addEventListener("click", function () {
        currentCategory = cat;
        updateNav();
        renderTable();
      });
      navBar.appendChild(btn);
    });
  }

  function updateNav() {
    if (!navBar) return;
    var btns = navBar.querySelectorAll(".nav-btn");
    btns.forEach(function (btn) {
      if (
        (btn.textContent === "全部" && currentCategory === null) ||
        btn.textContent === currentCategory
      ) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function formatTime(raw) {
    if (!raw || raw.length < 12) return raw;
    return raw.slice(0, 4) + "/" + raw.slice(4, 6) + "/" + raw.slice(6, 8) + " " + raw.slice(8, 10) + ":" + raw.slice(10, 12);
  }

  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    var data = PRODUCT_DATA.slice().sort(function (a, b) {
      return b.uploadTime.localeCompare(a.uploadTime);
    });

    if (currentCategory) {
      data = data.filter(function (item) {
        return item.category === currentCategory;
      });
    }

    if (data.length === 0) {
      if (noDataEl) noDataEl.style.display = "block";
      return;
    }
    if (noDataEl) noDataEl.style.display = "none";

    data.forEach(function (item) {
      var tr = document.createElement("tr");

      var tdCat = document.createElement("td");
      tdCat.textContent = item.category;
      tdCat.setAttribute("data-label", "产品方向");

      var tdName = document.createElement("td");
      tdName.textContent = item.name;
      tdName.setAttribute("data-label", "海报名称");

      var tdDays = document.createElement("td");
      tdDays.textContent = item.days;
      tdDays.setAttribute("data-label", "天数");

      var tdPolicy = document.createElement("td");
      tdPolicy.className = "policy-cell";
      tdPolicy.textContent = item.policy;
      tdPolicy.title = "点击展开/收起";
      tdPolicy.setAttribute("data-label", "收客细则");
      tdPolicy.addEventListener("click", function () {
        tdPolicy.classList.toggle("expanded");
      });

      var tdPoster = document.createElement("td");
      tdPoster.setAttribute("data-label", "海报预览");
      var img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      img.className = "thumb-img";
      img.style.width = "80px";
      img.addEventListener("click", function () {
        window.open(item.image, "_blank");
      });
      tdPoster.appendChild(img);

      var tdFile = document.createElement("td");
      tdFile.setAttribute("data-label", "行程下载");
      var fileLink = document.createElement("span");
      fileLink.className = "file-icon-link";
      fileLink.innerHTML = "&#128196; " + item.itinerary;
      fileLink.title = "点击选择预览或下载";
      fileLink.addEventListener("click", function (e) {
        e.stopPropagation();
        showFileModal(item.itinerary);
      });
      tdFile.appendChild(fileLink);

      var tdTime = document.createElement("td");
      tdTime.textContent = formatTime(item.uploadTime);
      tdTime.setAttribute("data-label", "上传时间");

      tr.appendChild(tdCat);
      tr.appendChild(tdName);
      tr.appendChild(tdDays);
      tr.appendChild(tdPolicy);
      tr.appendChild(tdPoster);
      tr.appendChild(tdFile);
      tr.appendChild(tdTime);

      tableBody.appendChild(tr);
    });
  }

  function showFileModal(fileName) {
    var existing = document.querySelector(".modal-overlay");
    if (existing) existing.remove();

    var overlay = document.createElement("div");
    overlay.className = "modal-overlay show";

    var box = document.createElement("div");
    box.className = "modal-box";
    box.innerHTML =
      '<h3>行程文件：' +
      fileName +
      "</h3>" +
      '<p style="margin-bottom:16px;color:#666;">请选择操作方式：</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-outline" id="modalPreview">预览</button>' +
      '<button class="btn btn-primary" id="modalDownload">下载</button>' +
      '<button class="btn btn-sm" id="modalCancel" style="background:#999;color:#fff;">取消</button>' +
      "</div>";

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    var filePath = "images/" + fileName;

    box.querySelector("#modalPreview").addEventListener("click", function () {
      window.open(filePath, "_blank");
      overlay.remove();
    });

    box.querySelector("#modalDownload").addEventListener("click", function () {
      var a = document.createElement("a");
      a.href = filePath;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      overlay.remove();
    });

    box.querySelector("#modalCancel").addEventListener("click", function () {
      overlay.remove();
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }
})();
