// ============================================
// 鲲鸿祥瑞产品展示 - 主页瀑布流逻辑
// 更新日期：20260616
// ============================================

(function () {
  "use strict";

  const container = document.getElementById("masonryContainer");
  const sideNav = document.getElementById("sideNav");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const noDataEl = document.getElementById("noData");

  let currentCategory = null; // null = all

  // --- Format time: 202606161402 -> 20260616 1402 ---
  function formatTime(raw) {
    if (!raw || raw.length < 12) return raw;
    return raw.slice(0, 8) + " " + raw.slice(8, 12);
  }

  // --- Render ---
  function render(data) {
    if (!container) return;
    container.innerHTML = "";

    if (!data || data.length === 0) {
      if (noDataEl) noDataEl.style.display = "block";
      return;
    }
    if (noDataEl) noDataEl.style.display = "none";

    data.forEach(function (item) {
      const card = document.createElement("div");
      card.className = "masonry-item";
      card.setAttribute("data-category", item.category);

      card.innerHTML =
        '<a href="' +
        item.image +
        '" target="_blank" class="poster-link" download>' +
        '<img class="poster-img" src="' +
        item.image +
        '" alt="' +
        item.name +
        '" loading="lazy" style="max-width:400px;" />' +
        "</a>" +
        '<div class="poster-info">' +
        '<div class="poster-name">' +
        item.name +
        "</div>" +
        '<div class="poster-time">' +
        formatTime(item.uploadTime) +
        "</div>" +
        "</div>";

      container.appendChild(card);
    });
  }

  // --- Filter ---
  function filter() {
    let data = PRODUCT_DATA.slice().sort(function (a, b) {
      return b.uploadTime.localeCompare(a.uploadTime);
    });

    if (currentCategory) {
      data = data.filter(function (item) {
        return item.category === currentCategory;
      });
    }

    const keyword = searchInput ? searchInput.value.trim() : "";
    if (keyword) {
      data = data.filter(function (item) {
        return item.name.indexOf(keyword) !== -1;
      });
    }

    render(data);
  }

  // --- Debounce ---
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  // --- Side Nav ---
  function buildSideNav() {
    if (!sideNav) return;

    // Category buttons
    CONFIG.categories.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.className = "nav-btn";
      btn.textContent = cat;
      btn.addEventListener("click", function () {
        if (currentCategory === cat) {
          currentCategory = null;
          btn.classList.remove("active");
        } else {
          currentCategory = cat;
        }
        updateActiveNav();
        filter();
      });
      sideNav.appendChild(btn);
    });

    // Search
    var wrap = document.createElement("div");
    wrap.className = "search-wrap";

    var input = document.createElement("input");
    input.type = "text";
    input.className = "search-input";
    input.placeholder = "搜索...";
    input.id = "searchInput";

    var btn = document.createElement("button");
    btn.className = "search-btn";
    btn.textContent = "搜索";

    wrap.appendChild(input);
    wrap.appendChild(btn);
    sideNav.appendChild(wrap);

    // Events
    btn.addEventListener("click", function () {
      filter();
    });

    input.addEventListener(
      "keyup",
      debounce(function (e) {
        filter();
      }, 400)
    );
  }

  function updateActiveNav() {
    if (!sideNav) return;
    var btns = sideNav.querySelectorAll(".nav-btn");
    btns.forEach(function (btn) {
      if (btn.textContent === currentCategory) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // --- Init ---
  function init() {
    buildSideNav();
    // Initial render: sort by time desc
    var sorted = PRODUCT_DATA.slice().sort(function (a, b) {
      return b.uploadTime.localeCompare(a.uploadTime);
    });
    render(sorted);
  }

  // Start when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
