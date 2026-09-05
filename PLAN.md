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

| # | 模块 | 落地 |
|---|---|---|
| 1 | 公告栏(免邮/促销轮播) | 原生 header-announcements |
| 2 | 吸顶导航 | 原生 header |
| 3 | Hero 大图 + 旗舰产品 CTA | 原生 hero |
| 4 | 信任条(免邮/2年保修/30天退换/CE认证) | 原生 icon blocks |
| 5 | 旗舰产品 spotlight 大图区 | 原生 featured-product / media-with-content |
| 6 | 畅销网格 + 快速加购 | 原生 product-list |
| 7 | 分类瓷片(按设备:手机/平板/笔记本) | 原生 collection-list |
| 8 | 参数对比 / before-after | 原生 comparison-slider |
| 9 | 品牌故事 | 原生 media-with-content |
| 10 | 评价 + 媒体 Logo 滚动 | 原生 review block + marquee |
| 11 | 博客预览 | 原生 featured-blog-posts |
| 12 | 邮件订阅(首单 9 折) | 原生 email-signup |
| 13 | Footer(政策/社媒/支付图标) | 原生 footer 组 |

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
