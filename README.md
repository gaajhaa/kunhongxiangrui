---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 54fcf42af7b345dc31b73309a8f10b6c_3407fc80694e11f1a0095254002afed2
    ReservedCode1: za5eLVxghTpfBL7jJ+2lhH1Sif5XWsj+ufcZ3DXLDL7UvUvuaEZXVRefxVCnf970zaA3DrkS/AaHEDLCZB/zn4gzbwmmBf4xAZxwC6RRLwgvlaSCsWyUNS4tbfKkdstf266nkEi1peMWnOR/A9qNHOhjZIgcT9sSLHWCst0TrGam/gcXd+y9LftMN3Q=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 54fcf42af7b345dc31b73309a8f10b6c_3407fc80694e11f1a0095254002afed2
    ReservedCode2: za5eLVxghTpfBL7jJ+2lhH1Sif5XWsj+ufcZ3DXLDL7UvUvuaEZXVRefxVCnf970zaA3DrkS/AaHEDLCZB/zn4gzbwmmBf4xAZxwC6RRLwgvlaSCsWyUNS4tbfKkdstf266nkEi1peMWnOR/A9qNHOhjZIgcT9sSLHWCst0TrGam/gcXd+y9LftMN3Q=
---

# 鲲鸿祥瑞产品展示网站

内部使用的旅游产品展示网站，纯静态实现，部署于 GitHub Pages。

## 目录结构

```
├── index.html          # 公开展示页（瀑布流海报展示）
├── detail.html         # 内部详情页（需登录，产品详情表格）
├── admin.html          # 后台管理页（需登录，增删改查 + 导出）
├── css/
│   └── style.css       # 全局样式（响应式）
├── js/
│   ├── config.js       # 全局配置（登录凭据、分类等）
│   ├── data.js         # 产品数据存储
│   ├── main.js         # 主页瀑布流逻辑
│   ├── detail.js       # 详情页逻辑
│   └── admin.js        # 后台管理逻辑
├── images/
│   └── logo.svg        # 网站 Logo
└── README.md
```

## 页面说明

### 公开展示页 (index.html)
- CSS Columns 瀑布流展示所有产品海报
- 右侧固定导航：按分类筛选 + 搜索
- 移动端导航自动切换为底部横排

### 内部详情页 (detail.html)
- 登录凭据：`admin_detail` / `khxr2026`
- 表格形式展示产品详情（收客细则可展开/收起）
- 海报缩略图预览 + 行程文件下载

### 后台管理页 (admin.html)
- 登录凭据：`admin_manager` / `khxr_admin_2026`
- 添加/编辑/删除产品
- 海报图片使用 base64 存储（适用小批量场景）
- 导出 data.js 文件，替换后上传 GitHub 即可更新

## 使用说明

### 更新网站数据
1. 登录后台管理页
2. 添加/编辑产品
3. 点击「导出数据文件」下载 data.js
4. 将下载的 data.js 替换 `js/data.js`
5. 提交到 GitHub 仓库

### 本地预览
直接用浏览器打开 `index.html` 即可。

## 技术栈
- 纯 HTML/CSS/JS，无框架依赖
- 响应式设计（手机/平板/桌面）
- sessionStorage 管理登录状态

## 更新日期
20260616
*（内容由AI生成，仅供参考）*
