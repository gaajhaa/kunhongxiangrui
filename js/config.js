// ============================================
// 鲲鸿祥瑞产品展示 - 全局配置
// 更新日期：20260616
// ============================================

const SITE_CONFIG = {
  title: "鲲鸿祥瑞产品展示",
  logoPath: "images/logo.svg",
  primaryColor: "#4eb3f0",
  starredCategories: ["新疆","四川","甘/青","邮轮","云南"],
  detailUsers: [
    { username: "admin_detail", password: "khxr2026" }
  ]
};

// 兼容旧引用
const CONFIG = {
  siteTitle: SITE_CONFIG.title,
  logoColor: SITE_CONFIG.primaryColor,
  logoPath: SITE_CONFIG.logoPath,
  detailAuth: SITE_CONFIG.detailUsers[0] || { username: "", password: "" },
  adminAuth: {
    username: "admin_manager",
    password: "khxr_admin_2026"
  },
  categories: SITE_CONFIG.starredCategories,
  version: "更新日期：20260616",
  lastUpdate: "最后更新：2026/6/16 14:02"
};
