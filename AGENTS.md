# Shopify Portal Theme Development Guidelines

## 项目定位

这是一个 Shopify Online Store 2.0 店铺主题项目，基于 Shopify 官方 Tinker 4.1.5 主题和 Horizon Blocks 架构。

主要技术栈：

- Liquid
- JSON Templates
- Shopify Sections
- Shopify Theme Blocks
- Snippets
- CSS / JavaScript / Web Components

## 目录职责

- `layout/`：全局布局，例如 `theme.liquid` 和密码页布局
- `templates/`：首页、商品页、集合页、购物车、博客、搜索等页面模板
- `sections/`：可以在 Theme Editor 中添加、排序和配置的页面区块
- `blocks/`：可复用的主题区块和内容组件
- `snippets/`：可复用的 Liquid、样式和功能片段
- `assets/`：CSS、JavaScript、图标和其他前端资源
- `config/`：主题设置定义和当前设置数据
- `locales/`：店铺文案和 schema 翻译

## 核心开发原则

1. 以当前代码为基础做增量开发，不要重写整个主题，也不要破坏 Tinker/Horizon 的现有结构。
2. 修改文件前先检查相关现有实现，优先复用已有官方 sections、blocks 和 snippets。
3. Shopify 原生功能优先，例如商品、变体、购物车、结账、搜索、集合筛选、分页和联系表单。
4. 不创建虚假的商品、价格、库存、折扣、配送或结账数据。
5. 保持 Shopify Theme Editor 可配置，新增功能尽量通过 section/block schema 暴露设置。
6. 保持桌面端、平板端和移动端的响应式体验。
7. 关注语义化 HTML、SEO、键盘导航、焦点状态、屏幕阅读器和错误提示。
8. 保留现有 Shopify 原生功能、主题设置和用户已有配置。

## 自定义文件命名

所有新建的自定义功能文件统一使用 `portal-` 前缀，以便与官方主题文件区分：

- `sections/portal-*.liquid`
- `blocks/portal-*.liquid`
- `snippets/portal-*.liquid`
- `assets/portal-*.css`
- `assets/portal-*.js`

除非没有安全的替代方案，否则不要直接修改官方文件。必须修改官方文件时，应尽量保持改动范围最小，并说明原因。

## Liquid 和 Shopify 规范

- 优先使用现有 snippets 和 Web Components，不重复实现已有功能。
- 使用 Shopify 原生对象和过滤器，例如 `product`、`collection`、`cart`、`paginate`、`image_url` 等。
- 商品变体切换时应同步价格、图片、库存和购买状态。
- 购物车数量变化、折扣码和错误状态必须使用真实 Shopify 数据。
- 图片需要设置合理的 `alt`、尺寸和加载策略，避免造成布局跳动。
- 不要在 Liquid 中写入与当前主题架构冲突的旧式实现。
- snippets 和 blocks 可以使用 `{% doc %}`；sections 使用 `{% comment %}` 说明。
- 样式优先使用 `{% stylesheet %}`，脚本优先使用现有的模块化 JavaScript 结构。
- 新增 CSS 尽量使用唯一的 `portal-` 类名或明确的组件作用域，避免污染官方样式。

## Schema 和多语言

- schema 中的 `name`、`label`、`category`、`info`、`content` 等界面文案必须使用 `t:` 翻译键。
- 新增 schema 翻译键时，必须补充所有现有的 `locales/*.schema.json` 文件。
- 翻译键应放在清晰的命名空间下，例如 `portal.cta_name`、`portal.category`。
- 为新增设置提供合理的默认值，确保设置为空时 Liquid 仍然安全运行。
- 不要把面向商家的可配置文案硬编码到 schema 中。
- 不要修改无关语言文件中的既有翻译。

## 页面和功能范围

实现全局框架时，需考虑公告栏、Header、Logo、搜索、账户、购物车、移动端菜单、Footer、多语言和货币切换。

实现首页时，需考虑主视觉 Banner、核心卖点、精选商品、商品分类、品牌介绍、评价、FAQ 和邮件订阅。

实现商品页时，需考虑商品图集、标题、价格、对比价、变体、数量、加入购物车、立即购买、库存、配送、描述、推荐商品和售罄状态。

实现集合页时，需考虑商品网格、筛选、排序、分页或加载更多、URL 状态、空结果和移动端筛选抽屉。

实现购物流程时，需考虑购物车商品列表、数量修改、删除商品、折扣码、订单备注、配送提示、金额汇总、空购物车和结账入口。

实现内容页面时，需考虑关于我们、联系我们、FAQ、博客、文章、政策页面、配送退货说明和 404 页面。

## 主题设置和视觉规范

- 优先使用现有 `settings_schema.json`、color palette 和 `contrast-override` 机制。
- 颜色、字体、字号、按钮、圆角、边框、阴影、页面宽度和间距优先通过 CSS 变量或主题设置控制。
- 不要随意硬编码品牌颜色和字体。
- 新增 section 应支持背景色、内容宽度、对齐方式、间距和内边距等基础设置（适用时）。
- 移动端可以提供独立图片、列数或布局设置（适用时）。

## 性能、SEO 和无障碍

- 避免重复加载 CSS 和 JavaScript。
- 非首屏图片合理使用懒加载，首屏资源设置合适的优先级。
- 避免不必要的阻塞式 JavaScript 和大型依赖。
- 保持页面标题、描述、规范链接、结构化数据和语义化标题层级。
- 表单、弹窗、抽屉、筛选器和菜单需要支持键盘操作、焦点管理和明确的错误反馈。
- 检查移动端横向溢出、点击区域、文字截断和空状态。
- 覆盖售罄、无图片、无变体、无搜索结果、无商品和请求失败等异常场景。

## 修改和验收流程

每次开发都应遵循以下流程：

1. 检查当前工作区状态和相关现有文件。
2. 明确修改范围，避免覆盖用户已有改动。
3. 使用最小必要改动完成需求。
4. 检查 Liquid 标签、schema JSON、翻译键和模板引用。
5. 运行：

   ```bash
   shopify theme check --path .
   ```

6. 修复所有 Theme Check 错误和警告。
7. 输出修改文件、实现功能、Theme Editor 配置方式和检查结果。

除非用户明确要求，不要执行 `git reset --hard`、删除用户文件、覆盖无关改动或推送到线上店铺。

