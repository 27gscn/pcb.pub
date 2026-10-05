# 信鸽子寻址 · PCB.PUB

非营利的免费子域名服务：给每个网络站点一个 `yourname.pcb.pub` 地址。申请通过邮件提交、人工审核，子域名用 CNAME 或 A 记录（IPv4）指向站长自己托管的网站，有效期 5 年，可免费续期。

本仓库是官网的全部文件，纯静态页面，部署在 GitHub Pages 上，不需要构建。

## 文件说明

| 文件 | 用途 |
| --- | --- |
| `index.html` | 首页：名称查询、两种解析方式、站点状态 |
| `apply.html` | 申请入住：步骤说明、邮件模板、常见问题 |
| `rules.html` | 使用规则 |
| `404.html` | 找不到页面 |
| `assets/config.js` | **日常配置**：邮箱、保留名称、审核中名称、统计、在线人数、信鸽 |
| `assets/lang.js` | 多语言核心：识别浏览器语言、切换语言、按需加载译文 |
| `assets/i18n/*.js` | 11 种外语译文，每种语言一个文件（简体中文直接写在 HTML 里） |
| `assets/main.js` | 页面功能：名称查询、邮件模板、运行时间、公历/农历日期、统计、在线人数、信鸽 |
| `assets/vendor/supabase.js` | 实时在线人数用的 supabase-js 库（官方文件，不用改） |
| `assets/style.css` | 样式 |
| `assets/logo.svg`、`assets/icon.svg`、`assets/icon-180.png`、`favicon.ico` | 标志与图标：航空信封造型，深蓝 `#0c3a85` + 航空邮件红 `#c2463a` |
| `CNAME` | GitHub Pages 自定义域名（内容为 `pcb.pub`） |
| `.nojekyll` | 让 GitHub Pages 原样发布文件（空文件） |

## 一、上线

1. 把所有文件上传到仓库 `27gscn/pcb.pub` 的根目录：仓库首页 → **Add file → Upload files**，把文件和 `assets` 文件夹一起拖进去 → **Commit changes**。原来的 `README.md` 直接覆盖。
   - `.nojekyll` 是隐藏文件，如果没传上去：**Add file → Create new file**，文件名填 `.nojekyll`，内容留空提交即可。
2. 仓库 **Settings → Pages**：
   - Build and deployment → Source 选 **Deploy from a branch**，Branch 选 **main**、文件夹 **/ (root)** → Save。
   - Custom domain 填 `pcb.pub` → Save。等 DNS 检查通过（见下一节），勾选 **Enforce HTTPS**。证书一般几分钟到几小时内签发。
3. **不要**在 GitHub 账号设置里验证 `pcb.pub`（Settings → Pages → Verified domains）。验证后，其他 GitHub 用户就不能把 `xxx.pcb.pub` 用在自己的 GitHub Pages 上了。

本地预览：直接用浏览器打开 `index.html` 即可。本地看不到访问统计，名称查询需要联网。

## 二、Cloudflare DNS

`pcb.pub` 的解析托管在 Cloudflare，所有记录都在 Cloudflare 后台添加：dash.cloudflare.com → 选择 `pcb.pub` → **DNS → Records**。

### 主站记录

| 类型 | 名称 | 内容 | 代理状态 |
| --- | --- | --- | --- |
| CNAME | `@` | `27gscn.github.io` | 仅 DNS（灰色云朵） |
| CNAME | `www` | `27gscn.github.io` | 仅 DNS（灰色云朵） |

Cloudflare 会自动“拉平”根域名的 CNAME（CNAME flattening），对外返回 GitHub Pages 的 IP。也可以不用根域名 CNAME，改为 4 条 A 记录：`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`（都是“仅 DNS”）。`www.pcb.pub` 会被 GitHub 自动跳转到 `pcb.pub`。

### 几条铁律

- **子域名记录默认设为“仅 DNS”**（灰色云朵）。只有站长申请、并且符合第三节“开启 Cloudflare 代理”的条件时，才打开代理（橙色云朵）。主站的 `@` 和 `www` 必须一直是“仅 DNS”，否则 GitHub Pages 签发不了证书。
- **永远不要添加通配符记录** `*.pcb.pub`。
- **不要给 `pcb.pub` 添加 CAA 记录**，否则站长的托管平台可能签发不了 HTTPS 证书。
- **不要在 `pcb.pub` 根下添加别人要求的验证记录**，例如 `_github-pages-challenge-某人.pcb.pub`、`_acme-challenge.pcb.pub`、根域名上的 `google-site-verification`。这等于把整个域名的控制权交给对方。
- 给 Cloudflare、GitHub 和 163 邮箱都开启两步验证。Cloudflare 账号就是所有子域名的“总钥匙”。

### 记录数量上限

Cloudflare 免费版每个域名最多 **200 条** DNS 记录（2024 年 9 月 1 日以后添加的域名）。主站用 2 条，大约还能容纳 195 个子域名（TXT 验证记录也占名额）。快满时，可以升级 Cloudflare 套餐，或把 DNS 迁到记录数更宽松的服务商（迁移前先核对对方的限额）。

## 三、处理申请

网页生成的邮件，主题里总会带“申请入住”或“举报”（任何语言都一样）。建议在 163 邮箱的“来信分类”里建两条规则：主题包含 `申请入住` → 放进“申请”文件夹；主题包含 `举报` → 放进“举报”文件夹并标记为重要。

**回复时限**：使用规则承诺，收到邮件后最晚 24 小时内回复，极端情况下不超过 36 小时。一时审核不完的，先回一封“已收到，正在审核”。

收到申请后，可以先把名称写进 `assets/config.js` 的 `pending`，查询时就会显示“正在审核中”。

### 审核清单

- **邮件内容**：使用规则第 2 节要求的 6 项都要写全：想要的子域名、解析方式、目标地址、网站用途、额外验证记录（没有写“无”）、确认同意规则。缺项的，回信请对方补充。
- **名称**：3–32 位，只有小写字母、数字和连字符，不以连字符开头或结尾，没有连续的连字符；不在保留名称里；不冒充品牌、机构或他人；在 Cloudflare 里搜索一下，确认没被占用。同一名称有多人申请时，按邮件到达先后处理。
- **一人一个**：对照台账，确认这个邮箱还没有子域名。
- **网站**：能打开，有实际内容（空白页、占位页、纯跳转页面不通过），不违反使用规则。
- **CNAME**：目标应是托管平台给的地址，例如 `xxx.github.io`、`xxx.pages.dev`、`xxx.vercel.app`、`xxx.netlify.app`。在浏览器里打开目标地址，确认是申请人的网站。
- **A 记录**：
  - IP 必须在中国内地以外：`curl https://ipinfo.io/203.0.113.10/country`，返回 `CN` 的不通过（香港、澳门、台湾分别是 `HK`、`MO`、`TW`）。
  - 不接受内网或保留地址：`10.x`、`172.16–31.x`、`192.168.x`、`127.x`、`100.64–127.x`、`0.0.0.0` 等。
  - 确认服务器已经在用这个地址：`curl -H "Host: yourname.pcb.pub" http://203.0.113.10/` 能返回申请人的网站。
- **TXT 验证记录**（申请人写明了才需要，例如 GitLab Pages）：记录名称必须以 `.yourname.pcb.pub` 结尾，也就是在申请人自己的子域名之下，否则一律不加。
- **Cloudflare 代理**（申请人要求开启时）：按下面“开启 Cloudflare 代理”的条件判断，不符合的照常用“仅 DNS”开通，并在回信里说明原因。

### 在 Cloudflare 添加记录

DNS → Records → **Add record**：

| 项目 | 填写 |
| --- | --- |
| Type | `CNAME` 或 `A` |
| Name | 只填子域名，例如 `blog`（不要带 `.pcb.pub`） |
| Target / IPv4 address | 申请人提供的目标地址或 IPv4 |
| Proxy status | 默认点掉橙色云朵，显示为 **DNS only**；同意开启代理的，保持橙色云朵（**Proxied**） |
| TTL | Auto |
| Comment | 可选，写申请邮箱和到期日，只有你自己能看到 |

保存后，把名称从 `pending` 里删掉（如果之前加过），再记进台账、回信通知。解析一般几分钟内生效。

### 开启 Cloudflare 代理（站长申请时）

默认不开。站长在邮件里申请，并且下面几条都满足时，才打开这条记录的代理（橙色云朵）：

- **网站可靠**：已经正常运行、内容合规。开了代理后，网站流量经过 Cloudflare；网站出问题（钓鱼、侵权、恶意软件），Cloudflare 的投诉和处罚会落到 pcb.pub 这个账号上，严重时会波及所有子域名。
- **源站支持 HTTPS**：最适合站长自己的服务器（A 记录）。pcb.pub 的 **SSL/TLS → Overview** 加密模式用 **Full (strict)** 或 **Full**（默认的 Automatic 也可以），**不要用 Flexible**，否则强制 HTTPS 的网站会无限重定向。这个设置对所有开了代理的子域名同时生效，改之前想清楚。
- **托管平台一般不开**：GitHub Pages、Vercel、Netlify 等平台检测不到指向自己的解析，可能签发或续期不了证书，还会提示配置错误。确实需要的，先用“仅 DNS”开通，等平台签好证书后再开代理。
- **不是视频、大文件下载站**：Cloudflare 免费套餐的条款不允许主要用来分发视频或大文件。

开启后，在这条记录的 Comment 和台账备注里写上“代理”，方便以后排查。站长服务器看到的访客 IP 会变成 Cloudflare 的地址，真实 IP 在请求头 `CF-Connecting-IP` 里，可以在回信里提醒对方。

### 回信模板

通过：

```text
你好！yourname.pcb.pub 已开通（CNAME → yourname.github.io）。

有效期：2026-10-05 至 2031-10-05。到期前用本邮箱来信即可免费续期，每次 5 年。
解析通常几分钟内生效，之后请在托管平台开启 HTTPS。
更换服务器、修改或注销，也请用本邮箱来信。
使用规则：https://pcb.pub/rules.html

信鸽子寻址 · PCB.PUB
```

未通过：

```text
你好！很抱歉，yourname.pcb.pub 的申请这次没有通过。

原因：……
调整后欢迎重新申请。

信鸽子寻址 · PCB.PUB
```

## 四、台账

开通的每个子域名都记一笔。台账含申请人邮箱，**只存在自己电脑或私密文档里，不要放进这个公开仓库**。

| 子域名 | 类型 | 目标 | 申请邮箱 | 开通日 | 到期日 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| blog | CNAME | someone.github.io | someone@example.com | 2026-10-05 | 2031-10-05 | |

到期日 = 开通日 + 5 年。

## 五、日常维护

- **续期**：只处理原申请邮箱的来信。到期日从原到期日顺延 5 年，回信确认。建议到期前 30 天发一封提醒。
- **到期未续期**：删除记录，名称重新开放申请。
- **修改、注销、换 IP**：只处理原申请邮箱的来信，在 Cloudflare 里编辑或删除对应记录。
- **定期巡检**（每 1–3 个月）：逐个打开子域名。连续 30 天打不开的，邮件通知后删除记录。
- **悬空记录要立刻删**：CNAME 指向的平台项目被删掉（例如 GitHub Pages 仓库、Vercel 项目），或 A 记录的服务器停用了，别人可能接手这个地址并冒用子域名。发现后马上删除。
- **举报**：核实后删除违规的记录，必要时回信告知举报人。

## 六、config.js 设置

日常要改的都在 `assets/config.js` 里。在 GitHub 上打开文件 → 右上角铅笔图标编辑 → **Commit changes**，一两分钟后网站更新（看不到变化时按 Ctrl+F5 强制刷新）。

| 设置 | 说明 |
| --- | --- |
| `email` | 申请与举报邮箱。网页正文里也写着这个邮箱，换邮箱时请在所有文件里搜索 `tyzpkaw@163.com` 并替换 |
| `launch` | 建站时间（北京时间），用于“已稳定运行”计时和公历/农历“建站于” |
| `reserved` | 保留名称。查询时提示“不开放申请”，申请页会自动列出 |
| `pending` | 审核中的名称。查询时提示“正在审核中”，页面上不列出。这是公开文件，只写名称，不写申请人信息 |
| `statsScript` | 访问统计脚本地址，留空 `""` 即关闭 |
| `supabaseUrl`、`supabaseKey` | 实时在线人数，已填好，见第八节。清空则不显示 |
| `pigeons` | 进入页面时随机飞过的信鸽：`true` 开启，`false` 关闭 |

## 七、访问统计

使用 [Vercount](https://vercount.one/)，免注册、免费，兼容不蒜子的页面元素。部署到 `pcb.pub` 后自动开始计数，首页“站点状态”和页脚显示全站浏览量与访客数。统计服务暂时连不上时，统计块会自动隐藏。

- 不蒜子（`busuanzi.ibruce.info`）目前经常连不上，所以没有用它。以后想换回去，把 `statsScript` 改成 `https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js` 即可，不用改 HTML。
- 换统计服务后计数会从头开始。

## 八、实时在线人数

用 Supabase 的 Realtime 功能统计同时在线的访客，免费，不需要建表。

**已开启**：项目地址 `https://jovexnhdmggmznfprthc.supabase.co`，`config.js` 里已填好 Project URL 和 Publishable key。首页“站点状态”和页脚会显示“在线”人数，同一位访客开多个标签页只算 1 人。连不上 Supabase 时，30 秒后自动放弃，“在线”会隐藏，不影响页面其他功能。

以后要换项目或重新创建，按下面的步骤：

1. 在 [supabase.com](https://supabase.com/) 注册（可用 GitHub 登录）→ **New project**。名称随意，区域选离访客近的（如 Tokyo、Singapore），数据库密码自己保存好（网站用不到）。
2. 项目创建好后，复制两样东西：
   - **Project URL**：形如 `https://xxxx.supabase.co`（项目首页的 Connect，或 Project Settings → Data API）。
   - **Publishable key**：以 `sb_publishable_` 开头（Project Settings → API Keys）。旧项目也可以用 Legacy API Keys 里的 `anon` `public` key。
3. 填进 `config.js` 的 `supabaseUrl` 和 `supabaseKey`，提交。刷新首页，“当前在线”就会出现。连接用的 supabase-js 已放在 `assets/vendor/supabase.js`，不依赖外部 CDN。
4. **绝对不要填 `service_role` 或 secret key**，它们有完整的数据库权限，而 `config.js` 是公开的。
5. 一直不显示的话，到 Supabase 的 **Realtime → Settings**，确认允许公开频道（Allow public access）是开启的。
6. 免费项目长时间没有活动可能会被暂停。暂停期间“当前在线”自动隐藏，到 Supabase 后台恢复项目即可。

## 九、多语言

- 支持 12 种语言：简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Português（巴西）、Italiano、Русский、Tiếng Việt。
- 网站按浏览器语言自动显示，不在列表里的语言显示英文。访客可以在页头的下拉框或页脚手动切换，选择会被记住。
- 指定语言的链接：`https://pcb.pub/?lang=ko`。语言代码：`zh-CN` `zh-TW` `en` `ja` `ko` `fr` `de` `es` `pt` `it` `ru` `vi`。
- 简体中文直接写在 HTML 里；其他语言放在 `assets/i18n/语言代码.js`，只在需要时加载，不影响中文访客的打开速度。
- HTML 里带 `data-i18n="键名"` 的元素，在每个语言文件里都有同名条目；`data-i18n-html` 表示译文里可以带 `<code>`、`<a>` 等标签，`data-i18n-attr` 用来翻译 `aria-label` 等属性。
- 修改 HTML 里的中文时，在 11 个语言文件里搜索同一个键名，一起改掉，否则切换语言后还是旧内容。
- 邮件模板（`tpl.l1`–`tpl.l6`）在所有语言里行的顺序一致，方便你对照审核。邮件主题里的“申请入住”“举报”在任何语言下都保留，邮箱分类规则不受影响。
- 新增语言：复制 `assets/i18n/en.js`，改成新的语言代码再翻译；然后把代码加进 `assets/lang.js` 的 `SUPPORTED`，并在四个页面的页头下拉框和页脚语言列表里各加一项。

## 十、小技巧

- 申请页支持预填名称：`https://pcb.pub/apply.html?name=blog`。
- 想临时关闭信鸽、统计或在线人数，改 `config.js` 即可，不用动页面。
- 觉得页面左右留白太多或太少：改 `assets/style.css` 开头 `.container` 里的 `--gutter`（左右留白）和 `1040px`（正文最大宽度）。
- 页头和页脚的“提供方：27.GS.CN”链接到 `https://27.gs.cn/`。要修改，在四个页面里搜索 `27.gs.cn`。
