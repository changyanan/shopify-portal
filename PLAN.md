# shopify-portal 开发方案

> 基于官方主题 Tinker v4.1.5(Horizon 家族)。基线标签:`tinker-4.1.5-stock`。

## 1. 定位

| 项 | 决定 |
|---|---|
| 市场 | 欧洲为主(EUR 主币种,价格含 VAT) |
| 语言 | 英文默认 + 德文 + 法文 |
| 品类 | 3C / 数码配件 |
| 品牌 | **instocks**(已定,Logo 见下) |

## 2. 品牌视觉系统(方向 A 已确认)

### 已落地的品牌资产

- **Logo**:`assets/instocks-logo.png`(品牌蓝·透明底,1922×502)+ `assets/instocks-logo-white.png`(白色反色版,深色背景用)。原黑底图已转为透明并裁剪。
- **品牌蓝**(从 Logo 采样):`#155A93`
- **色板**(已写入 `config/settings_data.json`):

| 槽位 | 值 | 用途 |
|---|---|---|
| background | `#FFFFFF` | 页面底色 |
| foreground | `#111111` | 正文前景 |
| color1 | `#155A93` 品牌蓝 | 强调色、描边、链接 |
| color2 | `#F4F4F4` | 浅灰区块底 |
| color3 | `#FF4D00` 信号橙 | 促销角标 |
| color4 | `#E5E5E5` | 边框线 |

- **字体**(已写入 settings,handle 经 Shopify 官方字体库核对):
  - 标题/强调:`space_grotesk_n5`(Space Grotesk 500,欧洲科技感)
  - 正文/小标签:`inter_n4`(Inter 400)

### 视觉规则(开发时遵循)
- 参考:Apple 配件页、Nothing、Teenage Engineering
- 小圆角 2-4px、细边框、强网格、参数用等宽数字
- 大量留白,黑白灰为主,品牌蓝只做点睛(按钮/链接/图标),不做大面积色块

## 3. 信息架构 / 页面清单

- 首页、集合页(含筛选:兼容机型/品类)、商品页、购物车(抽屉+页)、搜索
- About / Our Story
- FAQ(原生 accordion 搭建,3C 权重高:物流/退换/兼容/保修)
- Contact
- 政策:Shipping、Returns & Refunds、Privacy、Terms(**欧洲法定需真实文本**)
- Warranty 保修页(3C 必备)
- 德国市场额外:Impressum + Widerrufsrecht 撤回权条款
- Blog(SEO)

## 4. 首页结构(Section 顺序)

> 2026-09 更新:首页已落地为 8 模块品牌电商结构(`templates/index.json`),全部模块独立、可拖拽、可配置。

| # | 模块 | 落地 | 说明 |
|---|---|---|---|
| 1 | 主视觉 Banner | 官方 `hero` | 图/视频 + 移动端独立媒体(`custom_mobile_media`)+ overlay + 区块链接 |
| 2 | 品牌核心卖点 | 定制 `portal-selling-points` + block `portal-selling-point` | 图标/图片 + 标题 + 描述 + 可选整卡链接;列数、移动端列数、背景、对齐、间距可配 |
| 3 | 精选商品 | 官方 `product-list` | collection 设置驱动,不写死商品 |
| 4 | 商品分类 | 官方 `collection-list` | collection_list 设置驱动,不写死集合 |
| 5 | 品牌介绍 | 定制 `portal-brand-story` | 图/视频 + 移动端独立图片(picture 艺术方向);内容区组合官方 text/button blocks |
| 6 | 用户评价 | 定制 `portal-reviews` + block `portal-review` | 星级/引文/评价人/头像均为 block 设置;figure/blockquote 语义;@app 可接评价应用 |
| 7 | FAQ | 定制 `portal-faq`(复用官方 `accordion` block) | 问答内容完全由 accordion rows 配置,details/summary 键盘可达 |
| 8 | 邮件订阅 | 定制 `portal-newsletter`(复用官方 `email-signup` block) | 背景图/视频 + 移动端独立图 + 遮罩;表单错误/成功反馈由官方 block 提供 |

公共能力:所有自定义 section 支持背景色(`contrast-override` 自动反色)、内容宽度(page/full)、对齐、四向内边距;schema 文案走 `t:portal.*` 翻译键并覆盖全部 23 个 `locales/*.schema.json`;样式走 `snippets/portal-*-styles.liquid`。原 trust-bar(icon blocks 拼装)与 marquee 已被卖点区与 8 模块结构取代,如需可随时在编辑器加回。

| 其他首页组件 | 落地 |
|---|---|
| 公告栏(免邮/促销轮播) | 原生 header-announcements |
| 吸顶导航 | 原生 header |
| Footer(政策/社媒/支付图标) | 原生 footer 组 |

## 5. PDP 规划(3C 标准)

媒体画廊(图+视频+缩放) → 标题+评分 → 价格(含VAT) → 变体色卡 → 加购 → 信任徽章(定制) → 移动端吸顶加购(原生) → 手风琴:概述/规格/兼容性/物流退换(原生) → 相关推荐(原生)。

## 6. 定制开发清单(优先级)

1. **免邮进度条** — 购物车抽屉,"还差 €XX 免运费"
2. **信任徽章组** — 加购按钮下方
3. **规格参数表 section** — 表格化 tech specs
4. **机型兼容性选择器** — 按机型过滤适配配件
5. UGC 图片墙(后期/用 app)

## 7. 排期

- **Phase 1 骨架**:视觉方向确认 → 主题设置(字体/色板)+ 首页搭建 + 页面模板 + 菜单 + 商品数据
- **Phase 2 转化**:免邮进度条、信任徽章、评价 app(Judge.me)、邮箱弹窗(Shopify Forms)、FAQ 完善
- **Phase 3 增长**:博客内容、Klaviyo 邮件流、UGC、A/B

## 8. 待用户输入

- [x] ~~视觉方向确认~~ → A「瑞士极简·科技白」
- [x] ~~品牌名 + Logo~~ → instocks,Logo 已处理为透明底(assets/instocks-logo.png)
- [ ] Logo 上传:连接店铺后在主题编辑器「主题设置 → Logo」上传 assets 里的处理版
- [ ] 产品数据(名称/价格/参数/图)
- [ ] 政策法律文本(我先搭结构放占位)
- [ ] Shopify Payments 及本地支付方式开通
- [ ] GDPR cookie 横幅后台开启(Shopify 后台 → 客户隐私)
