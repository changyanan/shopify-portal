# shopify-portal

基于 **Shopify 官方主题 Tinker v4.1.5**(Horizon 家族,Blocks 架构)定制的店铺主题。

## 基线与升级策略

- git 标签 **`tinker-4.1.5-stock`** = 官方原始代码,未做任何改动。
- 查看全部定制改动:`git diff tinker-4.1.5-stock`
- 官方发布新版时:获取新版文件后与该标签对比,把官方变更合并进定制代码。

## 本地开发

```bash
npm install -g @shopify/cli        # 已安装 (v4.7.1)
shopify theme dev --store <店铺域名>   # 本地热预览
shopify theme check                # 代码校验(当前 0 错误,提交前请保持)
shopify theme push                 # 推送到店铺
```

也可在 Shopify 后台「在线商店 → 主题 → 添加主题 → 连接 GitHub」绑定本仓库,分支自动同步。

## 定制约定(重要)

**所有自定义文件统一加 `portal-` 前缀**,与官方代码区分,便于升级合并。改动优先级从低到高:

1. 主题编辑器配置(`config/settings_data.json`)—— 零代码
2. 样式微调:新增 snippet(`{% stylesheet %}`)或 CSS 变量覆盖,**不改 `base.css`**
3. 新功能:新增 `sections/portal-*.liquid`、`blocks/portal-*.liquid`
4. 修改官方文件(最后手段,尽量只改 snippets)

其他规则:

- schema 与界面文案一律走 `locales/*.schema.json` / `*.json` 的 `t:` 翻译键;新增键时**所有带 schema 的语言文件都要补齐**(theme check 会查),中文简繁 + 英文必加
- 自定义 section 样板参考:`sections/portal-cta.liquid` + `snippets/portal-cta-styles.liquid`
- 复用官方 blocks(text / button / group)与 snippets(spacing-padding、size-style 等),不重写
- `{% doc %}` 标签只能用于 snippets 和 blocks,section 里用 `{% comment %}`

## 分支策略

- `main`:与线上主题同步(接 GitHub 集成后推送即发布)
- 功能开发:`feature/*` 分支 → 合回 `main`

## 目录速览

| 目录 | 内容 |
|---|---|
| `layout/` | 主布局 theme.liquid、密码页布局 |
| `templates/` | 13 个 JSON 页面模板(首页/商品/集合/购物车/博客/搜索…) |
| `sections/` | 页面区块;`_blocks.liquid` 覆盖 AI 生成区块的包装器 |
| `blocks/` | ~107 个主题区块(Horizon 新架构,编辑器里自由组合) |
| `snippets/` | ~170 个片段,大量 `*-styles.liquid` 样式片段 |
| `assets/` | ES Module Web Components(JS)+ base.css + 图标 |
| `locales/` | 34 种语言文案 + schema 翻译 |
| `config/` | 主题设置定义(settings_schema)与当前值(settings_data) |
