/*
 * PCB.PUB 站点配置：日常要改的都在这里，改完提交到 GitHub 即可生效。
 */
window.PCB_CONFIG = {
  // 申请与举报邮箱（网页正文里也写着这个邮箱，换邮箱时请在所有文件里搜索替换）
  email: "tyzpkaw@163.com",

  // 建站时间（北京时间）。页脚的“建站于”日期和“已运行 N 天”都按它计算
  launch: "2026-10-05T00:00:00+08:00",

  // 保留名称：查询时提示“不开放申请”，申请页也会列出来
  reserved: [
    "www", "mail", "email", "smtp", "imap", "pop", "ftp", "admin", "root", "api", "app", "dev",
    "test", "status", "docs", "help", "support", "apply", "about", "static", "cdn", "ns1", "ns2"
  ],

  // 审核中的名称：收到申请、还没开通时写进来，查询会提示“正在审核中”。
  // 页面上不会列出这些名称，但 config.js 是公开文件，这里只写名称，不要写申请人信息
  pending: [],

  // 访问统计（Vercount，免注册，兼容不蒜子）。留空 "" 即关闭
  statsScript: "https://events.vercount.one/js",

  // 实时在线人数（Supabase Realtime，免费）。按 README 创建项目后填入 Project URL 和 Publishable key（或 anon key）；
  // 这两个值本来就是公开给网页用的。千万不要填 secret / service_role key。留空则不显示在线人数
  supabaseUrl: "https://jovexnhdmggmznfprthc.supabase.co",
  supabaseKey: "sb_publishable_axeH9ErVPmMrx2P178dOxw_aim2Am9y",

  // 进入页面时随机飞过的信鸽：true 开启，false 关闭
  pigeons: true
};
