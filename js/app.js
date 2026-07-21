
"use strict";
/* ============================================================
   MODULE: UI — sheets, toasts, confirm dialog
   ============================================================ */
const UI = (() => {
  const scrim = document.getElementById("scrim");
  let openSheetEl = null;

  const openSheet = (id) => {
    closeSheet();
    openSheetEl = document.getElementById(id);
    scrim.classList.add("open");
    openSheetEl.classList.add("open");
  };
  const closeSheet = () => {
    if (openSheetEl) openSheetEl.classList.remove("open");
    scrim.classList.remove("open");
    openSheetEl = null;
  };
  scrim.addEventListener("click", closeSheet);

  const toast = (msg) => {
    const wrap = document.getElementById("toasts");
    const el = document.createElement("div");
    el.className = "toast"; el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 300); }, 2200);
  };

  /* Promise-based confirm sheet — used before destructive actions. */
  const confirm = ({ title, body, yes }) => new Promise((resolve) => {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmBody").textContent = body;
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");
    yesBtn.textContent = yes;
    const done = (v) => { cleanup(); closeSheet(); resolve(v); };
    const onYes = () => done(true), onNo = () => done(false);
    const cleanup = () => { yesBtn.removeEventListener("click", onYes); noBtn.removeEventListener("click", onNo); };
    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);
    openSheet("sheetConfirm");
  });

  return { openSheet, closeSheet, toast, confirm };
})();

/* ============================================================
   MODULE: BACKUP — export / import / reset
   ============================================================ */
const Backup = (() => {
  const exportJSON = () => {
    const data = JSON.stringify(Store.get(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = URL.createObjectURL(blob);
    a.download = `maliya-backup-${stamp}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    UI.toast(I18N.t("toast.exported"));
  };

  const importFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      let data = null;
      try { data = JSON.parse(reader.result); } catch (_) {}
      if (!Store.validateImport(data)) { UI.toast(I18N.t("toast.importBad")); return; }
      const ok = await UI.confirm({
        title: I18N.t("confirm.import.t"),
        body: I18N.t("confirm.import.b"),
        yes: I18N.t("confirm.import.y")
      });
      if (!ok) return;
      Store.replaceAll(data);
      App.applySettings();
      UI.toast(I18N.t("toast.imported"));
    };
    reader.readAsText(file);
  };

  return { exportJSON, importFromFile };
})();

/* ============================================================
   MODULE: VIEWS — dashboard rendering
   ============================================================ */
const Views = (() => {
  const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));

  const renderHome = () => {
    const state = Store.get();
    const t = I18N.t;
    const totals = Calc.totals(state);
    const bal = Calc.netBalance(state);
    const health = Calc.healthScore(state);
    const trip = Calc.daysToTrip(state);
    const ending = Calc.endingSoon(state);
    const root = document.getElementById("view-home");
    root.innerHTML = "";

    /* Hero */
    root.appendChild(el(`
      <div class="hero">
        <div class="label">${t("hero.netBalance")}</div>
        <div class="amount num">${FMT.num(bal)}<span class="cur">${Store.settings.currency === "SAR" ? (I18N.lang === "ar" ? "ر.س" : "SAR") : esc(Store.settings.currency)}</span></div>
        <div class="meta">
          <span>${t("hero.salary")} <b class="num">${FMT.num(totals.salary)}</b></span>
          <span>${t("hero.monthlyOut")} <b class="num">${FMT.num(totals.outflow)}</b></span>
        </div>
      </div>`));

    /* Surplus / deficit + remaining */
    const isDef = totals.remaining < 0;
    root.appendChild(el(`
      <div class="stat-grid">
        <div class="stat">
          <div class="k">${t("stat.remaining")}</div>
          <div class="v num ${isDef ? "danger" : "ok"}">${FMT.money(totals.remaining)}</div>
          <div class="s">${t("stat.afterAll")}</div>
        </div>
        <div class="stat">
          <div class="k">${isDef ? t("stat.deficit") : t("stat.surplus")}</div>
          <div class="v num ${isDef ? "danger" : "ok"}">${FMT.money(isDef ? totals.deficit : totals.surplus)}</div>
          <div class="s num">${t("common.month")}</div>
        </div>
      </div>`));

    /* This month — income vs expenses (from recorded transactions) */
    const ms = Calc.monthStats(state);
    root.appendChild(el(`
      <div class="stat-grid">
        <div class="stat">
          <div class="k">${t("dash.income")}</div>
          <div class="v num ok">${FMT.money(ms.income)}</div>
          <div class="s num">${t("dash.since", { d: FMT.date(ms.start) })}</div>
        </div>
        <div class="stat">
          <div class="k">${t("dash.expense")}</div>
          <div class="v num${ms.expense > 0 ? " danger" : ""}">${FMT.money(ms.expense)}</div>
          <div class="s num">${ms.pendingExpense > 0 ? t("dash.pending") + " " + FMT.money(ms.pendingExpense) : "\u00A0"}</div>
        </div>
      </div>`));

    /* Commitments summary */
    root.appendChild(el(`
      <div class="card">
        <div class="card-title">${t("dash.commitments")}
          <span class="chip ${isDef ? "danger" : "ok"} num">${FMT.num(totals.outflow)} ${t("common.month")}</span>
        </div>
        <div class="row" style="margin-bottom:10px">
          <span style="font-size:13.5px;font-weight:700;color:var(--text-2)">${t("stat.fixed")}</span>
          <span class="num" style="font-weight:800">${FMT.money(totals.fixed)}</span>
        </div>
        <div class="row" style="margin-bottom:10px">
          <span style="font-size:13.5px;font-weight:700;color:var(--text-2)">${t("stat.temp")}</span>
          <span class="num" style="font-weight:800">${FMT.money(totals.temporary)}</span>
        </div>
        <div class="row">
          <span style="font-size:13.5px;font-weight:700;color:var(--text-2)">${t("stat.child")}</span>
          <span class="num" style="font-weight:800">${FMT.money(totals.child)}</span>
        </div>
      </div>`));

    /* Advisor headline (Phase 7) */
    {
      const top = Advisor.topInsights(2);
      if (top.length) {
        const advCard = el(`
          <div class="card" id="dashAdvisor" role="button" tabindex="0" style="cursor:pointer">
            <div class="card-title">${t("adv.title")}
              <span class="chip accent num">${FMT.num(Advisor.count(), 0)}</span></div>
            ${top.map(i => `
              <div class="list-row">
                <div class="list-ico">${i.icon}</div>
                <div class="list-main"><div class="t">${i.title}</div></div>
                <div class="list-end">${i.chip}</div>
              </div>`).join("")}
          </div>`);
        advCard.addEventListener("click", () => { Commit.openSection("advisor"); App.go("plan"); });
        root.appendChild(advCard);
      }
    }

    /* This month's plan (Phase 6) */
    {
      const pm = Calc.plannerMonth(state, 0);
      const alerts = (pm.net < 0 ? 1 : 0) + Calc.dueList(state, 0).filter(u => u.overdue).length;
      const planCard = el(`
        <div class="card" id="dashPlan" role="button" tabindex="0" style="cursor:pointer">
          <div class="card-title">${t("pl.dashTitle", { m: FMT.monthName(pm.m) })}
            <span class="chip ${pm.net >= 0 ? "ok" : "danger"} num">${pm.net >= 0 ? t("pl.surplus") : t("pl.deficit")}: ${FMT.money(Math.abs(pm.net), 0)}</span></div>
          <div class="cm-sub" style="justify-content:flex-start">
            <span class="num">${t("pl.plannedIn")}: ${FMT.num(pm.income, 0)}</span>
            <span class="num">${t("pl.plannedOut")}: ${FMT.num(pm.outflow, 0)}</span>
            ${alerts ? `<span class="chip danger num">${t("pl.alerts")}: ${FMT.num(alerts, 0)}</span>` : ""}
          </div>
        </div>`);
      planCard.addEventListener("click", () => { Commit.openSection("planner"); App.go("plan"); });
      root.appendChild(planCard);
    }

    /* Upcoming & overdue commitment payments (next 14 days) */
    const due = Calc.dueList(state, 14);
    if (due.length) {
      const upCard = el(`
        <div class="card">
          <div class="card-title">${t("cm.upcoming")}
            <button class="chip accent" id="dashManage">${t("cm.manage")}</button></div>
          ${due.map(u => `
            <button class="list-row row-btn" data-cm="${u.c.id}">
              <div class="list-ico">${u.overdue ? "⏰" : "📅"}</div>
              <div class="list-main"><div class="t">${esc(u.c.name)}</div>
                <div class="s num">${FMT.date(u.next)}</div></div>
              <div class="list-end"><div class="v num">${FMT.money(u.c.amount)}</div>
                ${u.overdue ? `<span class="chip danger">${t("cm.overdue")}</span>`
                            : `<span class="s num">${t("cm.inDays", { n: FMT.num(Math.max(0, u.days), 0) })}</span>`}</div>
            </button>`).join("")}
        </div>`);
      upCard.querySelector("#dashManage").addEventListener("click", () => App.go("plan"));
      upCard.querySelectorAll("[data-cm]").forEach(b =>
        b.addEventListener("click", () => { App.go("plan"); Commit.openDetail(b.dataset.cm); }));
      root.appendChild(upCard);
    }

    /* Ending soon */
    if (ending.length) {
      const rows = ending.map(c => {
        const soonTag = c.daysLeft < 0
          ? `<span class="chip ok">${t("dash.ended")}</span>`
          : `<span class="s num">${t("dash.endsIn")} ${FMT.num(c.daysLeft, 0)} ${t("common.days")}</span>`;
        return `
        <div class="list-row">
          <div class="list-ico">${c.type === "child" ? "🧒" : "📦"}</div>
          <div class="list-main">
            <div class="t">${esc(c.name)}</div>
            <div class="s num">${FMT.date(c.endDate)}</div>
          </div>
          <div class="list-end">
            <div class="v num" style="color:var(--ok)">+${FMT.num(c.amount)}</div>
            ${soonTag}
          </div>
        </div>`;
      }).join("");
      root.appendChild(el(`
        <div class="card">
          <div class="card-title">${t("dash.endingSoon")}
            <span class="chip ok">${t("dash.frees")}</span>
          </div>${rows}
        </div>`));
    }

    /* Japan trip countdown + budget + readiness (Phase 5) */
    if (trip && trip.days >= 0) {
      const ts = Calc.tripStats(trip.trip);
      const payPct = ts.target > 0 ? Math.max(0, Math.min(100, (ts.paid / ts.target) * 100)) : 0;
      const tripCard = el(`
        <div class="card" id="dashTrip" role="button" tabindex="0" style="cursor:pointer">
          <div class="card-title">${t("dash.trip")}
            <span class="chip accent num">${t("trip.readiness")}: ${FMT.num(ts.readiness, 0)}٪</span></div>
          <div class="row" style="margin-bottom:12px">
            <div>
              <div style="font-size:30px;font-weight:850;letter-spacing:-.02em" class="num">${FMT.num(trip.days, 0)}</div>
              <div style="font-size:12.5px;font-weight:700;color:var(--text-2)">${t("dash.tripDays")}</div>
            </div>
            <div class="list-end">
              <div class="s" style="font-weight:750;color:var(--text-2)">${t("dash.tripDates")}</div>
              <div class="s num" style="margin-top:3px;color:var(--text-3);font-weight:700">${FMT.num(trip.trip.travelers.length, 0)} ${t("dash.travelers")}</div>
            </div>
          </div>
          <div class="progress"><span style="width:${payPct.toFixed(1)}%"></span></div>
          <p class="hint num" style="margin-top:10px">${t("trip.paidOfTarget", { p: FMT.money(ts.paid, 0), t: FMT.money(ts.target, 0) })}</p>
        </div>`);
      tripCard.addEventListener("click", () => {
        Travel.openTrip(trip.trip.id);
        Commit.openSection("travel");
        App.go("plan");
      });
      root.appendChild(tripCard);
    }

    /* Recent transactions */
    const recent = (state.transactions || []).slice()
      .sort((a, b) => b.date === a.date
        ? (b.createdAt || "").localeCompare(a.createdAt || "")
        : b.date.localeCompare(a.date))
      .slice(0, 5);
    if (recent.length) {
      const card = el(`
        <div class="card">
          <div class="card-title">${t("dash.recent")}
            <button class="chip accent" id="dashViewAll">${t("dash.viewAll")}</button>
          </div>${recent.map(x => Money.rowHTML(x)).join("")}
        </div>`);
      card.querySelector("#dashViewAll").addEventListener("click", () => Money.goTx());
      card.querySelectorAll("[data-tx]").forEach(b =>
        b.addEventListener("click", () => Money.openTxDetail(b.dataset.tx)));
      root.appendChild(card);
    }

    /* Health score */
    const R = 40, CIRC = 2 * Math.PI * R;
    const off = CIRC * (1 - health.score / 100);
    root.appendChild(el(`
      <div class="card">
        <div class="card-title">${t("dash.health")}</div>
        <div class="score-wrap">
          <div class="ring">
            <svg width="92" height="92" viewBox="0 0 92 92">
              <circle class="track" cx="46" cy="46" r="${R}" fill="none" stroke-width="9"/>
              <circle class="bar" cx="46" cy="46" r="${R}" fill="none" stroke-width="9"
                stroke-dasharray="${CIRC.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
            </svg>
            <div class="val num">${FMT.num(health.score, 0)}</div>
          </div>
          <div class="score-notes">
            <div class="headline">${t("health." + health.band)}</div>
            <div class="body">${insightText(totals, ending)}</div>
          </div>
        </div>
      </div>`));
  };

  /* Rule-based quick insight (expanded into the full Advisor in Phase 7). */
  const insightText = (totals, ending) => {
    const t = I18N.t;
    if (totals.remaining < 0) {
      const soonFreed = ending.filter(c => c.daysLeft !== null && c.daysLeft <= 75)
        .reduce((a, c) => a + Calc.safe(c.amount), 0);
      return t("insight.deficit", { amt: FMT.money(totals.deficit, 0), freed: FMT.money(soonFreed, 0) });
    }
    return t("insight.surplus", { amt: FMT.money(totals.surplus, 0) });
  };

  return { renderHome, el, esc };
})();

/* ============================================================
   MODULE: MONEY — accounts, transactions, categories (Phase 2)
   ============================================================ */
const Money = (() => {
  const { el, esc } = Views;
  const $ = (id) => document.getElementById(id);
  const S = () => Store.get();
  const t = (k, v) => I18N.t(k, v);
  const r2 = (n) => Math.round(Calc.safe(n) * 100) / 100;

  let tab = "accounts", catType = "expense";
  let editingTxId = null, editingAccId = null, editingCatId = null, editingTrId = null;
  let txKind = "expense", pickedIcon = "📌";
  const filters = { q: "", kind: "all", status: "all", accountId: "all", categoryId: "all" };

  const ACC_TYPES = ["bank", "savings", "cash", "card", "wallet"];
  const accIcon = (ty) => ({ bank:"🏦", savings:"💰", cash:"💵", card:"💳", wallet:"📲" }[ty] || "🏦");
  const ICONS = ["🏦","💰","💵","💳","📱","🌐","🧸","🧒","🏠","🛒","🍽️","☕","🛍️","🚗","🚕","🚆","🩺","💊","🎓","🎡","👨‍👩‍👧‍👦","🔁","✈️","🗼","🎢","🎁","📚","⚽","🚨","🧾","💼","📌"];

  const accById = (id) => S().accounts.find(a => a.id === id);
  const catById = (id) => S().categories.find(c => c.id === id);
  const activeAccounts = () => S().accounts.filter(a => !a.archived);
  const catsOf = (type, parentId = null) =>
    S().categories.filter(c => !c.archived && c.type === type && (c.parentId || null) === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

  const isoLocal = (d) => {
    const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0, 10);
  };
  const parseAmount = (raw) => {
    const str = String(raw).trim()
      .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[،,]/g, "");
    const n = Number(str);
    return str !== "" && isFinite(n) ? n : null;
  };
  const sortTx = (arr) => arr.sort((a, b) => b.date === a.date
    ? (b.createdAt || "").localeCompare(a.createdAt || "")
    : b.date.localeCompare(a.date));

  /* Balance effect of a transaction. sign +1 applies, -1 reverses.
     Pending income/expenses have no effect; transfers always move money. */
  const applyEffect = (tx, sign) => {
    const amt = Calc.safe(tx.amount) * sign;
    if (tx.kind === "transfer") {
      const f = accById(tx.accountId), to = accById(tx.toAccountId);
      if (f) f.balance = r2(f.balance - amt);
      if (to) to.balance = r2(to.balance + amt);
    } else if (tx.status === "paid") {
      const a = accById(tx.accountId);
      if (a) a.balance = r2(a.balance + (tx.kind === "income" ? amt : -amt));
    }
  };

  const refresh = () => {
    if (document.getElementById("view-money").classList.contains("active")) render();
    else Views.renderHome();
  };

  /* seg helpers for sheet forms */
  const segBind = (id) => document.querySelectorAll("#" + id + " button").forEach(b =>
    b.addEventListener("click", () => {
      document.querySelectorAll("#" + id + " button").forEach(o => o.classList.remove("active"));
      b.classList.add("active");
    }));
  const segVal = (id, fb) =>
    document.querySelector("#" + id + " button.active")?.dataset.val || fb;

  /* ================= SHARED ROW ================= */
  const txIcon = (x) => x.kind === "transfer" ? "↔️"
    : (catById(x.categoryId)?.icon || (x.kind === "income" ? "➕" : "📌"));
  const rowHTML = (x) => {
    let meta, amt, cls;
    if (x.kind === "transfer") {
      meta = t("tr.meta", { from: esc(accById(x.accountId)?.name || "—"),
                            to: esc(accById(x.toAccountId)?.name || "—") });
      amt = FMT.num(x.amount); cls = "tr";
    } else {
      const cat = catById(x.categoryId);
      meta = `${cat ? esc(cat.name) : t("tx.uncat")} · ${esc(accById(x.accountId)?.name || "—")}`;
      amt = (x.kind === "income" ? "+" : "-") + FMT.num(x.amount);
      cls = x.kind === "income" ? "in" : "out";
    }
    const sub = (x.kind !== "transfer" && x.status === "pending")
      ? `<span class="chip warn">${t("tx.pending")}</span>`
      : `<span class="s num">${FMT.date(x.date)}</span>`;
    return `
      <button class="list-row row-btn" data-tx="${x.id}">
        <div class="list-ico">${txIcon(x)}</div>
        <div class="list-main"><div class="t">${esc(x.name)}</div><div class="s">${meta}</div></div>
        <div class="list-end"><div class="v num tx-amt ${cls}">${amt}</div>${sub}</div>
      </button>`;
  };

  /* ================= RENDER: ROOT ================= */
  const render = () => {
    const root = $("view-money");
    root.innerHTML = `
      <div class="seg" id="segMoney" style="margin-bottom:16px">
        <button data-tab="accounts" class="${tab === "accounts" ? "active" : ""}">${t("money.tab.accounts")}</button>
        <button data-tab="tx" class="${tab === "tx" ? "active" : ""}">${t("money.tab.tx")}</button>
        <button data-tab="cats" class="${tab === "cats" ? "active" : ""}">${t("money.tab.cats")}</button>
      </div>
      <div id="moneyPanel"></div>`;
    root.querySelectorAll("#segMoney button").forEach(b =>
      b.addEventListener("click", () => { tab = b.dataset.tab; render(); }));
    if (tab === "accounts") renderAccounts();
    else if (tab === "tx") renderTx();
    else renderCats();
  };

  /* ================= ACCOUNTS ================= */
  const renderAccounts = () => {
    const p = $("moneyPanel");
    const act = activeAccounts(), arch = S().accounts.filter(a => a.archived);
    const row = (a) => `
      <button class="list-row row-btn" data-acc="${a.id}">
        <div class="list-ico">${accIcon(a.type)}</div>
        <div class="list-main"><div class="t">${esc(a.name)}</div>
          <div class="s">${t("acc.type." + a.type)}${a.bank ? " · " + esc(a.bank) : ""}${a.includeInNet ? "" : " · " + t("acc.excluded")}</div></div>
        <div class="list-end"><div class="v num">${FMT.money(a.balance)}</div></div>
      </button>`;
    p.innerHTML = `
      <div class="card"><div class="card-title">${t("acc.total")}</div>
        <div class="num" style="font-size:28px;font-weight:850">${FMT.money(Calc.netBalance(S()))}</div></div>
      <div class="card">${act.map(row).join("") || `<p class="hint">${t("acc.none")}</p>`}</div>
      ${arch.length ? `<div class="card"><div class="card-title">${t("acc.archived")}</div>${arch.map(row).join("")}</div>` : ""}
      <button class="add-dashed" id="accAdd">＋ ${t("acc.add")}</button>`;
    p.querySelectorAll("[data-acc]").forEach(b =>
      b.addEventListener("click", () => openAccDetail(b.dataset.acc)));
    $("accAdd").addEventListener("click", () => openAccForm(null));
  };

  const openAccDetail = (id) => {
    const a = accById(id); if (!a) return;
    const hist = sortTx(S().transactions.filter(x => x.accountId === id || x.toAccountId === id))
      .slice(0, 15).map(rowHTML).join("");
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${esc(a.name)}</h2>
      <div class="detail-grid">
        <div class="cell"><div class="k">${t("acc.balance")}</div><div class="v num">${FMT.money(a.balance)}</div></div>
        <div class="cell"><div class="k">${t("acc.type")}</div><div class="v">${t("acc.type." + a.type)}</div></div>
      </div>
      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn subtle" id="adEdit">${t("common.edit")}</button>
        <button class="btn subtle" id="adTransfer">${t("acc.transfer")}</button>
      </div>
      <div class="btn-row" style="margin-bottom:16px">
        <button class="btn subtle" id="adArch">${a.archived ? t("common.unarchive") : t("common.archive")}</button>
        <button class="btn danger-soft" id="adDel">${t("common.delete")}</button>
      </div>
      ${hist ? `<div class="card-title">${t("acc.history")}</div>${hist}` : ""}`;
    $("adEdit").addEventListener("click", () => openAccForm(id));
    $("adTransfer").addEventListener("click", () => openTransferForm(null, id));
    $("adArch").addEventListener("click", () => {
      a.archived = !a.archived;
      if (a.archived && Store.settings.defaultAccountId === id) {
        const first = activeAccounts()[0];
        if (first) Store.settings.defaultAccountId = first.id;
      }
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    $("adDel").addEventListener("click", async () => {
      if (S().accounts.length <= 1) { UI.toast(t("acc.cantDeleteLast")); return; }
      const used = S().transactions.some(x => x.accountId === id || x.toAccountId === id);
      if (used) { UI.toast(t("acc.cantDelete")); return; }
      const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("confirm.del.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      S().accounts = S().accounts.filter(v => v.id !== id);
      if (Store.settings.defaultAccountId === id)
        Store.settings.defaultAccountId = S().accounts[0]?.id || null;
      Store.save(); refresh(); UI.toast(t("toast.saved"));
    });
    sheet.querySelectorAll("[data-tx]").forEach(b =>
      b.addEventListener("click", () => openTxDetail(b.dataset.tx)));
    UI.openSheet("sheetDyn");
  };

  const openAccForm = (id) => {
    editingAccId = id;
    const a = id ? accById(id) : { name:"", type:"bank", balance:0,
      bank:"", includeInNet:true, notes:"" };
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t(id ? "acc.form.edit" : "acc.form.add")}</h2>
      <div class="field" id="fAccName"><label>${t("acc.name")}</label>
        <input id="accName" value="${esc(a.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field"><label>${t("acc.type")}</label>
        <select id="accType">${ACC_TYPES.map(ty =>
          `<option value="${ty}" ${a.type === ty ? "selected" : ""}>${t("acc.type." + ty)}</option>`).join("")}</select></div>
      <div class="field" id="fAccBal"><label>${t("acc.balance")}</label>
        <input id="accBal" inputmode="decimal" value="${a.balance}"><div class="err">${t("bal.err")}</div></div>
      <div class="field"><label>${t("acc.bank")}</label><input id="accBank" value="${esc(a.bank || "")}"></div>
      <div class="set-row" style="border:none;padding-top:0"><div class="t">${t("acc.includeNet")}</div>
        <label class="switch"><input type="checkbox" id="accNet" ${a.includeInNet ? "checked" : ""}><span></span></label></div>
      <div class="field"><label>${t("common.notes")}</label><input id="accNotes" value="${esc(a.notes || "")}"></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="accSave">${t("common.save")}</button></div>`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("accSave").addEventListener("click", () => {
      const name = $("accName").value.trim();
      const bal = parseAmount($("accBal").value);
      let ok = true;
      $("fAccName").classList.toggle("invalid", !name); if (!name) ok = false;
      $("fAccBal").classList.toggle("invalid", bal === null); if (bal === null) ok = false;
      if (!ok) return;
      const data = { name, type: $("accType").value, balance: r2(bal),
        bank: $("accBank").value.trim(), includeInNet: $("accNet").checked,
        notes: $("accNotes").value.trim() };
      if (editingAccId) Object.assign(accById(editingAccId), data);
      else S().accounts.push({ id: Store.uid("acc"), currency: Store.settings.currency,
        archived: false, ...data });
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  /* ================= TRANSACTIONS ================= */
  const filteredTx = () => sortTx(S().transactions.filter(x => {
    if (filters.kind !== "all" && x.kind !== filters.kind) return false;
    if (filters.status !== "all") {
      if (x.kind === "transfer") return false;
      if (x.status !== filters.status) return false;
    }
    if (filters.accountId !== "all" &&
        x.accountId !== filters.accountId && x.toAccountId !== filters.accountId) return false;
    if (filters.categoryId !== "all" && x.categoryId !== filters.categoryId) return false;
    const q = filters.q.trim().toLowerCase();
    if (q && !((x.name + " " + (x.notes || "")).toLowerCase().includes(q)
        || String(x.amount).includes(q))) return false;
    return true;
  }));

  const renderTx = () => {
    const p = $("moneyPanel");
    const opt = (v, label, cur) => `<option value="${v}" ${cur === v ? "selected" : ""}>${label}</option>`;
    const allCats = [...catsOf("expense"), ...catsOf("income")];
    p.innerHTML = `
      <div class="field" style="margin-bottom:8px">
        <input id="txSearch" placeholder="${t("flt.search")}" value="${esc(filters.q)}" autocomplete="off"></div>
      <div class="filters">
        <select id="fltKind">
          ${opt("all", t("flt.kind") + ": " + t("common.all"), filters.kind)}
          ${opt("expense", t("tx.kind.expense"), filters.kind)}
          ${opt("income", t("tx.kind.income"), filters.kind)}
          ${opt("transfer", t("tr.name"), filters.kind)}
        </select>
        <select id="fltStatus">
          ${opt("all", t("flt.status") + ": " + t("common.all"), filters.status)}
          ${opt("paid", t("tx.paid"), filters.status)}
          ${opt("pending", t("tx.pending"), filters.status)}
        </select>
        <select id="fltAcc">
          ${opt("all", t("tx.account") + ": " + t("common.all"), filters.accountId)}
          ${S().accounts.map(a => opt(a.id, esc(a.name), filters.accountId)).join("")}
        </select>
        <select id="fltCat">
          ${opt("all", t("tx.category") + ": " + t("common.all"), filters.categoryId)}
          ${allCats.map(c => opt(c.id, c.icon + " " + esc(c.name), filters.categoryId)).join("")}
        </select>
      </div>
      <div id="txList"></div>`;
    $("txSearch").addEventListener("input", e => { filters.q = e.target.value; renderTxList(); });
    [["fltKind","kind"],["fltStatus","status"],["fltAcc","accountId"],["fltCat","categoryId"]]
      .forEach(([id, key]) => $(id).addEventListener("change", e => {
        filters[key] = e.target.value; renderTxList();
      }));
    renderTxList();
  };

  const renderTxList = () => {
    const list = $("txList"); if (!list) return;
    const items = filteredTx();
    if (!items.length) {
      const none = S().transactions.length === 0;
      list.innerHTML = `
        <div class="empty" style="padding:40px 20px">
          <div class="art">${none ? "🧾" : "🔍"}</div>
          <h3>${t(none ? "tx.empty.t" : "tx.filtered.t")}</h3>
          <p>${t(none ? "tx.empty.p" : "tx.filtered.p")}</p>
          ${none ? "" : `<button class="chip accent" id="fltClear">${t("flt.clear")}</button>`}
        </div>`;
      const c = $("fltClear");
      if (c) c.addEventListener("click", () => {
        Object.assign(filters, { q:"", kind:"all", status:"all", accountId:"all", categoryId:"all" });
        renderTx();
      });
      return;
    }
    let html = "", lastDate = null;
    for (const x of items) {
      if (x.date !== lastDate) {
        if (lastDate !== null) html += `</div>`;
        html += `<div class="g-date num">${FMT.date(x.date)}</div><div class="card" style="padding-top:6px;padding-bottom:6px">`;
        lastDate = x.date;
      }
      html += rowHTML(x);
    }
    html += `</div>`;
    list.innerHTML = html;
    list.querySelectorAll("[data-tx]").forEach(b =>
      b.addEventListener("click", () => openTxDetail(b.dataset.tx)));
  };

  const openTxDetail = (id) => {
    const x = S().transactions.find(v => v.id === id); if (!x) return;
    const isTr = x.kind === "transfer";
    const cat = catById(x.categoryId);
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${txIcon(x)} ${esc(x.name)}</h2>
      <div class="detail-grid">
        <div class="cell"><div class="k">${t("tx.amount")}</div><div class="v num">${FMT.money(x.amount)}</div></div>
        <div class="cell"><div class="k">${t("tx.date")}</div><div class="v num">${FMT.date(x.date)}</div></div>
        ${isTr
          ? `<div class="cell"><div class="k">${t("tr.from")}</div><div class="v">${esc(accById(x.accountId)?.name || "—")}</div></div>
             <div class="cell"><div class="k">${t("tr.to")}</div><div class="v">${esc(accById(x.toAccountId)?.name || "—")}</div></div>`
          : `<div class="cell"><div class="k">${t("tx.category")}</div><div class="v">${cat ? cat.icon + " " + esc(cat.name) : t("tx.uncat")}</div></div>
             <div class="cell"><div class="k">${t("tx.status")}</div><div class="v">${t(x.status === "paid" ? "tx.paid" : "tx.pending")}</div></div>`}
      </div>
      ${x.notes ? `<p class="hint" style="margin:-6px 0 14px">${esc(x.notes)}</p>` : ""}
      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn subtle" id="txEdit">${t("common.edit")}</button>
        <button class="btn subtle" id="txDup">${t("common.duplicate")}</button>
      </div>
      ${isTr ? "" : `<button class="btn subtle" id="txToggle" style="margin-bottom:10px">${t(x.status === "paid" ? "tx.markPending" : "tx.markPaid")}</button>`}
      <button class="btn danger-soft" id="txDel">${t("common.delete")}</button>`;
    $("txEdit").addEventListener("click", () =>
      isTr ? openTransferForm(id) : openTxForm(id));
    $("txDup").addEventListener("click", () => {
      const copy = { ...x, id: Store.uid("tx"), createdAt: new Date().toISOString() };
      S().transactions.push(copy);
      applyEffect(copy, 1);
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("tx.dupDone"));
    });
    const tg = $("txToggle");
    if (tg) tg.addEventListener("click", () => {
      applyEffect(x, -1);
      x.status = x.status === "paid" ? "pending" : "paid";
      applyEffect(x, 1);
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    $("txDel").addEventListener("click", async () => {
      const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("confirm.del.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      applyEffect(x, -1);
      S().transactions = S().transactions.filter(v => v.id !== id);
      Store.save(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const catOptions = (type, selected) => {
    let html = `<option value="">${t("tx.uncat")}</option>`;
    for (const pcat of catsOf(type)) {
      html += `<option value="${pcat.id}" ${selected === pcat.id ? "selected" : ""}>${pcat.icon} ${esc(pcat.name)}</option>`;
      for (const c of catsOf(type, pcat.id))
        html += `<option value="${c.id}" ${selected === c.id ? "selected" : ""}>&nbsp;&nbsp;— ${c.icon} ${esc(c.name)}</option>`;
    }
    return html;
  };

  const openTxForm = (id, kind) => {
    editingTxId = id;
    const x = id ? S().transactions.find(v => v.id === id) : null;
    txKind = x ? x.kind : (kind || "expense");
    const v = x || { name:"", amount:"", date: isoLocal(new Date()),
      accountId: Store.settings.defaultAccountId, categoryId:"", fixedVar:"variable",
      essential:false, status:"paid", recurring:"none", notes:"" };
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div>
      <h2 id="txFormTitle">${t(id ? "tx.edit" : (txKind === "income" ? "tx.new.income" : "tx.new.expense"))}</h2>
      ${id ? "" : `<div class="seg" id="txKindSeg" style="margin-bottom:16px">
        <button data-val="expense" class="${txKind === "expense" ? "active" : ""}">${t("tx.kind.expense")}</button>
        <button data-val="income" class="${txKind === "income" ? "active" : ""}">${t("tx.kind.income")}</button>
      </div>`}
      <div class="field" id="fTxName"><label>${t("tx.name")}</label>
        <input id="txName" value="${esc(v.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field" id="fTxAmount"><label>${t("tx.amount")}</label>
        <input id="txAmount" inputmode="decimal" value="${v.amount}" placeholder="0.00"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field" id="fTxDate"><label>${t("tx.date")}</label>
        <input type="date" id="txDate" value="${v.date}"><div class="err">${t("common.err.date")}</div></div>
      <div class="field"><label>${t("tx.account")}</label>
        <select id="txAcc">${activeAccounts().map(a =>
          `<option value="${a.id}" ${v.accountId === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
      <div class="field"><label>${t("tx.category")}</label>
        <select id="txCat">${catOptions(txKind, v.categoryId)}</select></div>
      <div class="field"><label>${t("tx.status")}</label>
        <div class="seg" id="txStatSeg">
          <button data-val="paid" class="${v.status === "paid" ? "active" : ""}">${t("tx.paid")}</button>
          <button data-val="pending" class="${v.status === "pending" ? "active" : ""}">${t("tx.pending")}</button>
        </div></div>
      <div class="field"><label>${t("tx.fixed")} / ${t("tx.variable")}</label>
        <div class="seg" id="txFixSeg">
          <button data-val="fixed" class="${v.fixedVar === "fixed" ? "active" : ""}">${t("tx.fixed")}</button>
          <button data-val="variable" class="${v.fixedVar === "variable" ? "active" : ""}">${t("tx.variable")}</button>
        </div></div>
      <div class="set-row" style="border:none;padding-top:0"><div class="t">${t("tx.essential")}</div>
        <label class="switch"><input type="checkbox" id="txEss" ${v.essential ? "checked" : ""}><span></span></label></div>
      <div class="field"><label>${t("tx.recurring")}</label>
        <select id="txRec">${["none","weekly","monthly","yearly"].map(r =>
          `<option value="${r}" ${v.recurring === r ? "selected" : ""}>${t("tx.rec." + r)}</option>`).join("")}</select></div>
      <div class="field"><label>${t("common.notes")}</label><input id="txNotes" value="${esc(v.notes || "")}"></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="txSave">${t("common.save")}</button></div>`;
    if (!id) {
      document.querySelectorAll("#txKindSeg button").forEach(b =>
        b.addEventListener("click", () => {
          txKind = b.dataset.val;
          document.querySelectorAll("#txKindSeg button").forEach(o =>
            o.classList.toggle("active", o === b));
          $("txFormTitle").textContent = t(txKind === "income" ? "tx.new.income" : "tx.new.expense");
          $("txCat").innerHTML = catOptions(txKind, "");
        }));
    }
    segBind("txStatSeg"); segBind("txFixSeg");
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("txSave").addEventListener("click", saveTx);
    UI.openSheet("sheetDyn");
  };

  const saveTx = () => {
    const name = $("txName").value.trim();
    const amount = parseAmount($("txAmount").value);
    const date = $("txDate").value;
    let ok = true;
    $("fTxName").classList.toggle("invalid", !name); if (!name) ok = false;
    const badAmt = amount === null || amount <= 0;
    $("fTxAmount").classList.toggle("invalid", badAmt); if (badAmt) ok = false;
    const badDate = !date || isNaN(new Date(date + "T00:00:00"));
    $("fTxDate").classList.toggle("invalid", badDate); if (badDate) ok = false;
    if (!ok) return;
    const data = { kind: txKind, name, amount: r2(amount), date,
      accountId: $("txAcc").value, toAccountId: null,
      categoryId: $("txCat").value || null,
      fixedVar: segVal("txFixSeg", "variable"),
      essential: $("txEss").checked,
      status: segVal("txStatSeg", "paid"),
      recurring: $("txRec").value, notes: $("txNotes").value.trim() };
    if (editingTxId) {
      const old = S().transactions.find(v => v.id === editingTxId);
      applyEffect(old, -1);
      Object.assign(old, data);
      applyEffect(old, 1);
    } else {
      const tx = { id: Store.uid("tx"), createdAt: new Date().toISOString(), ...data };
      S().transactions.push(tx);
      applyEffect(tx, 1);
    }
    Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
  };

  const openTransferForm = (id, fromId) => {
    editingTrId = id;
    const accs = activeAccounts();
    if (!id && accs.length < 2) { UI.toast(t("tr.needTwo")); return; }
    const x = id ? S().transactions.find(v => v.id === id) : null;
    const v = x || { name: t("tr.name"), amount:"", date: isoLocal(new Date()),
      accountId: fromId || accs[0].id,
      toAccountId: (accs.find(a => a.id !== (fromId || accs[0].id)) || accs[0]).id, notes:"" };
    const sel = (idAttr, cur) => `<select id="${idAttr}">${S().accounts.filter(a => !a.archived || a.id === cur)
      .map(a => `<option value="${a.id}" ${cur === a.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select>`;
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("tr.title")}</h2>
      <div class="field"><label>${t("tr.from")}</label>${sel("trFrom", v.accountId)}</div>
      <div class="field" id="fTrTo"><label>${t("tr.to")}</label>${sel("trTo", v.toAccountId)}
        <div class="err">${t("tr.err.same")}</div></div>
      <div class="field" id="fTrAmt"><label>${t("tx.amount")}</label>
        <input id="trAmt" inputmode="decimal" value="${v.amount}" placeholder="0.00"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field" id="fTrDate"><label>${t("tx.date")}</label>
        <input type="date" id="trDate" value="${v.date}"><div class="err">${t("common.err.date")}</div></div>
      <div class="field"><label>${t("common.notes")}</label><input id="trNotes" value="${esc(v.notes || "")}"></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="trSave">${t("common.save")}</button></div>`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("trSave").addEventListener("click", () => {
      const from = $("trFrom").value, to = $("trTo").value;
      const amount = parseAmount($("trAmt").value);
      const date = $("trDate").value;
      let ok = true;
      $("fTrTo").classList.toggle("invalid", from === to); if (from === to) ok = false;
      const badAmt = amount === null || amount <= 0;
      $("fTrAmt").classList.toggle("invalid", badAmt); if (badAmt) ok = false;
      const badDate = !date || isNaN(new Date(date + "T00:00:00"));
      $("fTrDate").classList.toggle("invalid", badDate); if (badDate) ok = false;
      if (!ok) return;
      const data = { kind:"transfer", name: t("tr.name"), amount: r2(amount), date,
        accountId: from, toAccountId: to, categoryId: null,
        fixedVar: null, essential: false, status:"paid", recurring:"none",
        notes: $("trNotes").value.trim() };
      if (editingTrId) {
        const old = S().transactions.find(v2 => v2.id === editingTrId);
        applyEffect(old, -1);
        Object.assign(old, data);
        applyEffect(old, 1);
      } else {
        const tx = { id: Store.uid("tx"), createdAt: new Date().toISOString(), ...data };
        S().transactions.push(tx);
        applyEffect(tx, 1);
      }
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  /* ================= CATEGORIES ================= */
  const renderCats = () => {
    const p = $("moneyPanel");
    const rows = [];
    for (const c of catsOf(catType)) {
      rows.push(catRow(c, false));
      for (const ch of catsOf(catType, c.id)) rows.push(catRow(ch, true));
    }
    p.innerHTML = `
      <div class="seg" id="catTypeSeg" style="margin-bottom:16px">
        <button data-val="expense" class="${catType === "expense" ? "active" : ""}">${t("cat.expense")}</button>
        <button data-val="income" class="${catType === "income" ? "active" : ""}">${t("cat.income")}</button>
      </div>
      <div class="card">${rows.join("")}</div>
      <button class="add-dashed" id="catAdd">＋ ${t("cat.add")}</button>`;
    p.querySelectorAll("#catTypeSeg button").forEach(b =>
      b.addEventListener("click", () => { catType = b.dataset.val; renderCats(); }));
    $("catAdd").addEventListener("click", () => openCatForm(null));
    p.querySelectorAll("[data-catopen]").forEach(b =>
      b.addEventListener("click", () => openCatForm(b.dataset.catopen)));
    p.querySelectorAll("[data-catup]").forEach(b =>
      b.addEventListener("click", e => { e.stopPropagation(); moveCat(b.dataset.catup, -1); }));
    p.querySelectorAll("[data-catdn]").forEach(b =>
      b.addEventListener("click", e => { e.stopPropagation(); moveCat(b.dataset.catdn, 1); }));
  };

  const catRow = (c, child) => {
    const subs = S().categories.filter(v => v.parentId === c.id && !v.archived).length;
    return `
      <div class="list-row ${child ? "cat-child" : ""}">
        <button class="list-main row-btn" data-catopen="${c.id}" style="display:flex;align-items:center;gap:12px">
          <span class="list-ico">${c.icon}</span>
          <span><span class="t" style="display:block">${esc(c.name)}</span>
          ${subs ? `<span class="s num">${subs} ${t("cat.subs")}</span>` : ""}</span>
        </button>
        <button class="arrow-btn" data-catup="${c.id}" aria-label="up">▲</button>
        <button class="arrow-btn" data-catdn="${c.id}" aria-label="down">▼</button>
      </div>`;
  };

  const moveCat = (id, dir) => {
    const c = catById(id); if (!c) return;
    const sibs = catsOf(c.type, c.parentId || null);
    const i = sibs.findIndex(v => v.id === id), j = i + dir;
    if (j < 0 || j >= sibs.length) return;
    const tmp = sibs[i].order; sibs[i].order = sibs[j].order; sibs[j].order = tmp;
    Store.save(); renderCats();
  };

  const openCatForm = (id) => {
    editingCatId = id;
    const c = id ? catById(id) : { name:"", icon:"📌", type: catType, parentId: null };
    pickedIcon = c.icon;
    const hasChildren = id ? S().categories.some(v => v.parentId === id) : false;
    const parents = catsOf(c.type).filter(v => v.id !== id);
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t(id ? "cat.form.edit" : "cat.form.add")}</h2>
      <div class="field" id="fCatName"><label>${t("tx.name")}</label>
        <input id="catName" value="${esc(c.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field"><label>${t("cat.icon")}</label>
        <div class="icon-grid" id="catIcons">${ICONS.map(ic =>
          `<button data-ic="${ic}" class="${ic === pickedIcon ? "active" : ""}">${ic}</button>`).join("")}</div></div>
      <div class="field"><label>${t("flt.kind")}</label>
        <div class="seg" id="catKindSeg">
          <button data-val="expense" class="${c.type === "expense" ? "active" : ""}">${t("cat.expense")}</button>
          <button data-val="income" class="${c.type === "income" ? "active" : ""}">${t("cat.income")}</button>
        </div></div>
      ${hasChildren ? "" : `<div class="field"><label>${t("cat.parent")}</label>
        <select id="catParent">
          <option value="">${t("cat.parent.none")}</option>
          ${parents.map(pv => `<option value="${pv.id}" ${c.parentId === pv.id ? "selected" : ""}>${pv.icon} ${esc(pv.name)}</option>`).join("")}
        </select></div>`}
      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="catSave">${t("common.save")}</button></div>
      ${id ? `<div class="btn-row">
        <button class="btn subtle" id="catArch">${c.archived ? t("common.unarchive") : t("common.archive")}</button>
        <button class="btn danger-soft" id="catDel">${t("common.delete")}</button></div>` : ""}`;
    document.querySelectorAll("#catIcons button").forEach(b =>
      b.addEventListener("click", () => {
        pickedIcon = b.dataset.ic;
        document.querySelectorAll("#catIcons button").forEach(o =>
          o.classList.toggle("active", o === b));
      }));
    segBind("catKindSeg");
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("catSave").addEventListener("click", () => {
      const name = $("catName").value.trim();
      $("fCatName").classList.toggle("invalid", !name);
      if (!name) return;
      const type = segVal("catKindSeg", c.type);
      const parentSel = $("catParent");
      const parentId = parentSel ? (parentSel.value || null) : (id ? catById(id).parentId : null);
      if (id) {
        const cat = catById(id);
        const typeChanged = cat.type !== type;
        Object.assign(cat, { name, icon: pickedIcon, type, parentId });
        if (typeChanged) S().categories.forEach(v => { if (v.parentId === id) v.type = type; });
        if (typeChanged && parentId) cat.parentId = null; /* parent list belonged to old type */
      } else {
        const sibs = catsOf(type, parentId);
        S().categories.push({ id: Store.uid("cat"), name, icon: pickedIcon, type, parentId,
          order: (sibs.length ? Math.max(...sibs.map(v => v.order || 0)) : 0) + 1, archived: false });
      }
      catType = type;
      Store.save(); UI.closeSheet(); renderCats(); UI.toast(t("toast.saved"));
    });
    const archBtn = $("catArch");
    if (archBtn) archBtn.addEventListener("click", () => {
      const cat = catById(id); cat.archived = !cat.archived;
      Store.save(); UI.closeSheet(); renderCats(); UI.toast(t("toast.saved"));
    });
    const delBtn = $("catDel");
    if (delBtn) delBtn.addEventListener("click", async () => {
      if (S().categories.some(v => v.parentId === id)) { UI.toast(t("cat.hasChildren")); return; }
      const used = S().transactions.some(x => x.categoryId === id);
      const ok = await UI.confirm(used
        ? { title: t("cat.inUse.t"), body: t("cat.inUse.b"), yes: t("confirm.del.y") }
        : { title: t("confirm.del.t"), body: t("confirm.del.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      S().categories = S().categories.filter(v => v.id !== id);
      Store.save(); renderCats(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const goTx = () => { tab = "tx"; App.go("money"); };

  return { render, rowHTML, goTx, openTxDetail, openTxForm, openTransferForm,
           applyEffect, parseAmount, isoLocal, catOptions };
})();

/* ============================================================
   MODULE: COMMIT — commitments, loans, installments (Phase 3)
   ============================================================ */
const Commit = (() => {
  const { el, esc } = Views;
  const $ = (id) => document.getElementById(id);
  const S = () => Store.get();
  const t = (k, v) => I18N.t(k, v);
  const r2 = (n) => Math.round(Calc.safe(n) * 100) / 100;

  let tab = "all", editingId = null, section = "cm";
  const topSeg = () => `
      <div class="seg" id="planSeg" style="margin-bottom:16px">
        <button data-sec="cm" class="${section === "cm" ? "active" : ""}">${t("plan.sec.cm")}</button>
        <button data-sec="family" class="${section === "family" ? "active" : ""}">${t("plan.sec.family")}</button>
        <button data-sec="travel" class="${section === "travel" ? "active" : ""}">${t("plan.sec.travel")}</button>
        <button data-sec="planner" class="${section === "planner" ? "active" : ""}">${t("plan.sec.planner")}</button>
        <button data-sec="advisor" class="${section === "advisor" ? "active" : ""}">${t("plan.sec.advisor")}</button>
      </div>`;
  const bindTop = (root) => root.querySelectorAll("#planSeg button").forEach(b =>
    b.addEventListener("click", () => { section = b.dataset.sec; render(); }));
  const flt = { q: "", status: "active", sort: "due" };

  const kindIcon = (c) => ({ bill:"🧾", loan:"🏦", installment:"📦" }[c.kind] || "🧾");
  const catId = (c) => (c.category && S().categories.some(v => v.id === c.category)) ? c.category : null;
  const inTab = (c) => tab === "all" ? true
    : tab === "bills" ? c.kind === "bill"
    : (c.kind === "loan" || c.kind === "installment");
  const byId = (id) => S().commitments.find(c => c.id === id);
  const activeAccounts = () => S().accounts.filter(a => !a.archived);

  const refresh = () => {
    if (document.getElementById("view-plan").classList.contains("active")) render();
    else Views.renderHome();
  };

  /* ================= ACCOUNTING ================= */
  /* One payment == exactly one expense transaction, linked both ways. */
  const recordPayment = (c, { amount, date, accountId, early = false }) => {
    const d = Calc.parseISO(date);
    const period = early ? "settlement" : Calc.periodKey(d, c.frequency || "monthly");
    if (!early && (c.payments || []).some(p => p.period === period)) return "dup";
    const tx = { id: Store.uid("tx"), createdAt: new Date().toISOString(),
      kind: "expense", name: c.name, amount: r2(amount), date,
      accountId, toAccountId: null, categoryId: catId(c),
      fixedVar: "fixed", essential: true, status: "paid",
      recurring: "none", notes: "", commitmentId: c.id };
    S().transactions.push(tx);
    Money.applyEffect(tx, 1);
    c.payments.push({ id: Store.uid("pay"), period, date, amount: r2(amount), txId: tx.id, early });
    if (early) {
      c.settledEarly = { date, amount: r2(amount), txId: tx.id };
      c.status = "completed";
    } else {
      const st = Calc.commitmentStats(c);
      if (st.remainingPayments === 0) c.status = "completed";
    }
    Store.save();
    return c.status === "completed" ? "done" : "ok";
  };

  const removePayment = (c, payId) => {
    const i = (c.payments || []).findIndex(p => p.id === payId);
    if (i < 0) return;
    const pay = c.payments[i];
    const ti = S().transactions.findIndex(x => x.id === pay.txId);
    if (ti >= 0) {
      Money.applyEffect(S().transactions[ti], -1);
      S().transactions.splice(ti, 1);
    }
    c.payments.splice(i, 1);
    if (pay.early) c.settledEarly = null;
    if (c.status === "completed") c.status = "active";
    Store.save();
  };

  const editPayment = (c, payId, { amount, date }) => {
    const pay = (c.payments || []).find(p => p.id === payId);
    if (!pay) return;
    const tx = S().transactions.find(x => x.id === pay.txId);
    if (tx) {
      Money.applyEffect(tx, -1);
      tx.amount = r2(amount); tx.date = date;
      Money.applyEffect(tx, 1);
    }
    pay.amount = r2(amount); pay.date = date;
    if (!pay.early) pay.period = Calc.periodKey(Calc.parseISO(date), c.frequency || "monthly");
    if (pay.early && c.settledEarly) Object.assign(c.settledEarly, { amount: r2(amount), date });
    Store.save();
  };

  /* ================= RENDER ================= */
  const statusChip = (c, st) => {
    if (c.status === "paused") return `<span class="chip warn">${t("cm.pausedChip")}</span>`;
    if (c.status === "archived") return `<span class="chip">${t("cm.archivedChip")}</span>`;
    if (c.status === "completed") return `<span class="chip ok">${t("cm.completed")}</span>`;
    if (st.paidThisPeriod) return `<span class="chip ok">${t("cm.paid")}</span>`;
    if (st.overdue) return `<span class="chip danger">${t("cm.overdue")}</span>`;
    if (!st.next) return `<span class="chip ok">${t("cm.endedChip")}</span>`;
    return `<span class="chip accent num">${FMT.date(st.next)}</span>`;
  };

  const cardHTML = (c) => {
    const st = Calc.commitmentStats(c);
    const canPay = c.status === "active" && !st.paidThisPeriod && st.next;
    const sub = [];
    if (st.totalPayments)
      sub.push(`<span class="num">${FMT.num(st.totalPayments - (st.remainingPayments ?? 0), 0)}/${FMT.num(st.totalPayments, 0)}</span>`);
    if (st.remainingBalance !== null && st.remainingBalance > 0)
      sub.push(`<span class="num">${t("cm.remainBal")}: ${FMT.money(st.remainingBalance, 0)}</span>`);
    if (st.daysToEnd !== null && st.daysToEnd >= 0 && c.status === "active")
      sub.push(`<span class="num">${t("cm.endsIn", { n: FMT.num(st.daysToEnd, 0) })}</span>`);
    return `
      <div class="card cm-card" data-cmopen="${c.id}" role="button" tabindex="0">
        <div class="cm-head">
          <div class="list-ico">${kindIcon(c)}</div>
          <div class="list-main">
            <div class="t">${esc(c.name)}${c.provider ? ` <span class="s">· ${esc(c.provider)}</span>` : ""}</div>
            <div class="s num">${FMT.money(c.amount)} · ${t("cm.freq." + (c.frequency || "monthly"))}</div>
          </div>
          <div class="list-end">${statusChip(c, st)}</div>
        </div>
        <div class="progress" style="margin-top:12px"><span style="width:${(st.progress * 100).toFixed(1)}%"></span></div>
        <div class="cm-foot">
          <div class="cm-sub" style="margin:0">${sub.join(" · ") || "&nbsp;"}</div>
          ${canPay ? `<button class="mini-btn solid" data-cmpay="${c.id}">${t("cm.payNow")}</button>`
            : (c.status === "active" && st.paidThisPeriod && !c.settledEarly
              ? `<button class="mini-btn muted" data-cmundo="${c.id}">${t("cm.undo")}</button>` : "")}
        </div>
      </div>`;
  };

  const filtered = () => {
    let list = S().commitments.filter(inTab);
    if (flt.status !== "all") list = list.filter(c => c.status === flt.status);
    const q = flt.q.trim().toLowerCase();
    if (q) list = list.filter(c =>
      (c.name + " " + (c.provider || "") + " " + (c.notes || "")).toLowerCase().includes(q));
    const sorters = {
      due: (a, b) => (a.dueDay || 0) - (b.dueDay || 0),
      amount: (a, b) => Calc.safe(b.amount) - Calc.safe(a.amount),
      end: (a, b) => String(a.endDate || "9999").localeCompare(String(b.endDate || "9999")),
      name: (a, b) => a.name.localeCompare(b.name)
    };
    return list.sort(sorters[flt.sort] || sorters.due);
  };

  const render = () => {
    const root = $("view-plan");
    if (section !== "cm") {
      root.innerHTML = topSeg();
      bindTop(root);
      const holder = document.createElement("div");
      root.appendChild(holder);
      (section === "family" ? Family : section === "travel" ? Travel
        : section === "planner" ? Planner : Advisor).renderInto(holder);
      return;
    }
    const list = filtered();
    const group = S().commitments.filter(c => inTab(c) && c.status === "active");
    const monthly = group.reduce((a, c) => a + Calc.safe(c.amount), 0);
    const paidCount = group.filter(c => Calc.commitmentStats(c).paidThisPeriod).length;
    const timeline = Calc.freedTimeline(S());
    const opt = (v, label, cur) => `<option value="${v}" ${cur === v ? "selected" : ""}>${label}</option>`;
    root.innerHTML = `${topSeg()}
      <div class="seg" id="cmTabs" style="margin-bottom:16px">
        <button data-tab="all" class="${tab === "all" ? "active" : ""}">${t("plan.tab.all")}</button>
        <button data-tab="bills" class="${tab === "bills" ? "active" : ""}">${t("plan.tab.bills")}</button>
        <button data-tab="loans" class="${tab === "loans" ? "active" : ""}">${t("plan.tab.loans")}</button>
      </div>
      <div class="card">
        <div class="card-title">${t("cm.summary")}
          <span class="chip accent num">${t("cm.paidOf", { p: FMT.num(paidCount, 0), t: FMT.num(group.length, 0) })}</span></div>
        <div class="num" style="font-size:26px;font-weight:850">${FMT.money(monthly)}</div>
      </div>
      <div class="field" style="margin-bottom:8px">
        <input id="cmSearch" placeholder="${t("flt.search")}" value="${esc(flt.q)}" autocomplete="off"></div>
      <div class="filters">
        <select id="cmStatus">
          ${opt("all", t("flt.status") + ": " + t("common.all"), flt.status)}
          ${["active","paused","completed","archived"].map(v => opt(v, t("cm.st." + v), flt.status)).join("")}
        </select>
        <select id="cmSort">
          ${["due","amount","end","name"].map(v => opt(v, t("cm.sort." + v), flt.sort)).join("")}
        </select>
      </div>
      <div id="cmList">${list.map(cardHTML).join("") || `
        <div class="empty" style="padding:36px 20px"><div class="art">🗂️</div>
          <h3>${t("cm.none.t")}</h3><p>${t("cm.none.p")}</p></div>`}</div>
      <button class="add-dashed" id="cmAdd">＋ ${t("cm.add")}</button>
      ${timeline.length ? `
      <div class="card">
        <div class="card-title">${t("cm.release")}</div>
        <p class="hint" style="margin:-8px 0 10px">${t("cm.release.s")}</p>
        ${timeline.map(x => `
          <div class="list-row">
            <div class="list-ico">📈</div>
            <div class="list-main"><div class="t">${esc(x.c.name)}</div>
              <div class="s">${FMT.monthName(x.end.getMonth())} ${FMT.num(x.end.getFullYear(), 0)}</div></div>
            <div class="list-end"><div class="v num" style="color:var(--ok)">+${FMT.num(x.c.amount)}</div>
              <div class="s num">${t("cm.cum")}: ${FMT.num(x.cum, 0)}</div></div>
          </div>`).join("")}
      </div>` : ""}`;
    bindTop(root);
    root.querySelectorAll("#cmTabs button").forEach(b =>
      b.addEventListener("click", () => { tab = b.dataset.tab; render(); }));
    $("cmSearch").addEventListener("input", e => { flt.q = e.target.value; renderListOnly(); });
    $("cmStatus").addEventListener("change", e => { flt.status = e.target.value; render(); });
    $("cmSort").addEventListener("change", e => { flt.sort = e.target.value; render(); });
    $("cmAdd").addEventListener("click", () => openForm(null));
    bindList(root);
  };

  const renderListOnly = () => {
    const holder = $("cmList"); if (!holder) return;
    const list = filtered();
    holder.innerHTML = list.map(cardHTML).join("") || `
      <div class="empty" style="padding:36px 20px"><div class="art">🔍</div>
        <h3>${t("cm.none.t")}</h3><p>${t("cm.none.p")}</p></div>`;
    bindList(holder);
  };

  const bindList = (scope) => {
    scope.querySelectorAll("[data-cmpay]").forEach(b =>
      b.addEventListener("click", e => { e.stopPropagation(); openPay(b.dataset.cmpay); }));
    scope.querySelectorAll("[data-cmundo]").forEach(b =>
      b.addEventListener("click", e => { e.stopPropagation(); undoCurrent(b.dataset.cmundo); }));
    scope.querySelectorAll("[data-cmopen]").forEach(card =>
      card.addEventListener("click", () => openDetail(card.dataset.cmopen)));
  };

  const undoCurrent = async (id) => {
    const c = byId(id); if (!c) return;
    const st = Calc.commitmentStats(c);
    /* Prefer the current period's payment; otherwise (e.g. auto-completed
       via a pay-ahead) undo the most recent regular payment. */
    const regular = (c.payments || []).filter(p => !p.early);
    const pay = regular.find(p => p.period === st.curKey)
      || regular.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    if (!pay) return;
    const ok = await UI.confirm({ title: t("cm.undo"), body: t("cm.delPay.b"), yes: t("common.confirm") });
    if (!ok) return;
    removePayment(c, pay.id);
    refresh(); UI.toast(t("cm.undone"));
  };

  /* ================= SHEETS ================= */
  const openPay = (id, early = false) => {
    const c = byId(id); if (!c) return;
    const st = Calc.commitmentStats(c);
    const preset = early ? (st.remainingBalance ?? c.amount) : c.amount;
    /* If the current period is already paid, prefill the next period's due
       date so paying ahead just works; duplicates are still blocked per
       the chosen date's period inside recordPayment. */
    const presetDate = (!early && st.paidThisPeriod && st.next)
      ? Money.isoLocal(st.next) : Money.isoLocal(new Date());
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${early ? t("cm.settle") : t("cm.payNow")} — ${esc(c.name)}</h2>
      ${early ? `<p class="hint" style="margin:-8px 0 14px">${t("cm.settle.hint")}</p>` : ""}
      <div class="field" id="fPayAmt"><label>${t("tx.amount")}</label>
        <input id="payAmt" inputmode="decimal" value="${preset}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field" id="fPayDate"><label>${t("cm.payDate")}</label>
        <input type="date" id="payDate" value="${presetDate}"><div class="err">${t("common.err.date")}</div></div>
      <div class="field"><label>${t("cm.account")}</label>
        <select id="payAcc">${activeAccounts().map(a =>
          `<option value="${a.id}" ${a.id === (c.accountId || Store.settings.defaultAccountId) ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="paySave">${early ? t("cm.settle") : t("common.save")}</button></div>`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("paySave").addEventListener("click", () => {
      const amount = Money.parseAmount($("payAmt").value);
      const date = $("payDate").value;
      let ok = true;
      const badAmt = amount === null || amount <= 0;
      $("fPayAmt").classList.toggle("invalid", badAmt); if (badAmt) ok = false;
      const badDate = !date || !Calc.parseISO(date);
      $("fPayDate").classList.toggle("invalid", badDate); if (badDate) ok = false;
      if (!ok) return;
      const res = recordPayment(c, { amount, date, accountId: $("payAcc").value, early });
      if (res === "dup") { UI.toast(t("cm.dupPay")); return; }
      UI.closeSheet(); refresh();
      UI.toast(res === "done" ? t("cm.done") : t("cm.paySaved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openDetail = (id) => {
    const c = byId(id); if (!c) return;
    const st = Calc.commitmentStats(c);
    const pays = (c.payments || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const cells = [];
    cells.push(`<div class="cell"><div class="k">${t("cm.monthly")}</div><div class="v num">${FMT.money(c.amount)}</div></div>`);
    if (st.remainingBalance !== null)
      cells.push(`<div class="cell"><div class="k">${t("cm.remainBal")}</div><div class="v num">${FMT.money(st.remainingBalance)}</div></div>`);
    if (st.remainingPayments !== null)
      cells.push(`<div class="cell"><div class="k">${t("cm.remainPay")}</div><div class="v num">${FMT.num(st.remainingPayments, 0)}${st.totalPayments ? " / " + FMT.num(st.totalPayments, 0) : ""}</div></div>`);
    if (st.next)
      cells.push(`<div class="cell"><div class="k">${t("cm.nextPay")}</div><div class="v num">${FMT.date(st.next)}</div></div>`);
    if (c.endDate)
      cells.push(`<div class="cell"><div class="k">${t("cm.endsOn")}</div><div class="v num">${FMT.date(c.endDate)}</div></div>`);
    if (c.status === "active")
      cells.push(`<div class="cell"><div class="k">${t("cm.freesAfter")}</div><div class="v num" style="color:var(--ok)">+${FMT.money(c.amount, 0)}</div></div>`);
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div>
      <h2>${kindIcon(c)} ${esc(c.name)} ${statusChip(c, st)}</h2>
      <div class="progress" style="margin:4px 0 14px"><span style="width:${(st.progress * 100).toFixed(1)}%"></span></div>
      <div class="detail-grid">${cells.join("")}</div>
      ${c.notes ? `<p class="hint" style="margin:-6px 0 14px">${esc(c.notes)}</p>` : ""}
      <div class="btn-row" style="margin-bottom:10px">
        ${c.status === "active" && st.remainingPayments !== 0
          ? `<button class="btn primary" id="cdPay">${t("cm.payNow")}</button>` : ""}
        ${!c.settledEarly && (c.payments || []).length &&
          (c.status === "completed" || (c.status === "active" && st.paidThisPeriod))
          ? `<button class="btn subtle" id="cdUndo">${t("cm.undo")}</button>` : ""}
        <button class="btn subtle" id="cdEdit">${t("common.edit")}</button>
      </div>
      <div class="btn-row" style="margin-bottom:10px">
        ${c.status === "active" ? `<button class="btn subtle" id="cdPause">${t("cm.pause")}</button>` : ""}
        ${c.status === "paused" ? `<button class="btn subtle" id="cdResume">${t("cm.resume")}</button>` : ""}
        ${c.status === "active" && st.remainingBalance ? `<button class="btn subtle" id="cdSettle">${t("cm.settle")}</button>` : ""}
        ${c.settledEarly ? `<button class="btn subtle" id="cdUnsettle">${t("cm.unsettle")}</button>` : ""}
      </div>
      <div class="btn-row" style="margin-bottom:16px">
        <button class="btn subtle" id="cdArch">${c.status === "archived" ? t("common.unarchive") : t("common.archive")}</button>
        <button class="btn danger-soft" id="cdDel">${t("common.delete")}</button>
      </div>
      <div class="card-title">${t("cm.history")}</div>
      ${pays.length ? pays.map(pv => `
        <button class="list-row row-btn" data-pay="${pv.id}">
          <div class="list-ico">${pv.early ? "⚡" : "✓"}</div>
          <div class="list-main"><div class="t">${pv.early ? t("cm.settle") : t("cm.payment")}</div>
            <div class="s num">${FMT.date(pv.date)} · ${esc(pv.period)}</div></div>
          <div class="list-end"><div class="v num">${FMT.money(pv.amount)}</div></div>
        </button>`).join("") : `<p class="hint">${t("cm.noHistory")}</p>`}`;
    const on = (bid, fn) => { const b = $(bid); if (b) b.addEventListener("click", fn); };
    on("cdPay", () => openPay(id));
    on("cdUndo", () => undoCurrent(id));
    on("cdEdit", () => openForm(id));
    on("cdPause", () => { c.status = "paused"; Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved")); });
    on("cdResume", () => { c.status = "active"; Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved")); });
    on("cdSettle", () => openPay(id, true));
    on("cdUnsettle", async () => {
      const pay = (c.payments || []).find(pv => pv.early);
      if (!pay) return;
      const ok = await UI.confirm({ title: t("cm.unsettle"), body: t("cm.delPay.b"), yes: t("common.confirm") });
      if (!ok) return;
      removePayment(c, pay.id); refresh(); UI.toast(t("cm.undone"));
    });
    on("cdArch", () => {
      c.status = c.status === "archived" ? "active" : "archived";
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    on("cdDel", async () => {
      const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("cm.del.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      S().commitments = S().commitments.filter(v => v.id !== id);
      Store.save(); refresh(); UI.toast(t("toast.saved"));
    });
    sheet.querySelectorAll("[data-pay]").forEach(b =>
      b.addEventListener("click", () => openPayEdit(id, b.dataset.pay)));
    UI.openSheet("sheetDyn");
  };

  const openPayEdit = (cmId, payId) => {
    const c = byId(cmId); if (!c) return;
    const pay = (c.payments || []).find(p => p.id === payId); if (!pay) return;
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("cm.editPay")} — ${esc(c.name)}</h2>
      <div class="field" id="fPeAmt"><label>${t("tx.amount")}</label>
        <input id="peAmt" inputmode="decimal" value="${pay.amount}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field" id="fPeDate"><label>${t("cm.payDate")}</label>
        <input type="date" id="peDate" value="${pay.date}"><div class="err">${t("common.err.date")}</div></div>
      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="peSave">${t("common.save")}</button></div>
      <button class="btn danger-soft" id="peDel">${t("common.delete")}</button>`;
    $("dynCancel").addEventListener("click", () => openDetail(cmId));
    $("peSave").addEventListener("click", () => {
      const amount = Money.parseAmount($("peAmt").value);
      const date = $("peDate").value;
      let ok = true;
      const badAmt = amount === null || amount <= 0;
      $("fPeAmt").classList.toggle("invalid", badAmt); if (badAmt) ok = false;
      const badDate = !date || !Calc.parseISO(date);
      $("fPeDate").classList.toggle("invalid", badDate); if (badDate) ok = false;
      if (!ok) return;
      editPayment(c, payId, { amount, date });
      refresh(); openDetail(cmId); UI.toast(t("toast.saved"));
    });
    $("peDel").addEventListener("click", async () => {
      const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("cm.delPay.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      removePayment(c, payId); refresh(); openDetail(cmId); UI.toast(t("cm.undone"));
    });
    UI.openSheet("sheetDyn");
  };

  const typeFor = (category, endDate) => {
    if (category === "cat_nursery" || category === "cat_children") return "child";
    return endDate ? "temporary" : "fixed";
  };

  const openForm = (id) => {
    editingId = id;
    const c = id ? byId(id) : { name:"", kind: tab === "loans" ? "installment" : "bill",
      provider:"", category:"", amount:"", originalAmount:"", installmentsTotal:"",
      dueDay:27, frequency:"monthly", startDate:"", endDate:"",
      accountId: Store.settings.defaultAccountId, priority:"normal", notes:"" };
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t(id ? "cm.form.edit" : "cm.form.add")}</h2>
      <div class="field"><label>${t("flt.kind")}</label>
        <div class="seg" id="cmKindSeg">
          ${["bill","loan","installment"].map(k =>
            `<button data-val="${k}" class="${c.kind === k ? "active" : ""}">${t("cm.kind." + k)}</button>`).join("")}
        </div></div>
      <div class="field" id="fCmName"><label>${t("tx.name")}</label>
        <input id="cmName" value="${esc(c.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field"><label>${t("cm.provider")}</label>
        <input id="cmProvider" value="${esc(c.provider || "")}" placeholder="تمارا، تابي، SNB…"></div>
      <div class="field"><label>${t("tx.category")}</label>
        <select id="cmCat">${Money.catOptions("expense", c.category)}</select></div>
      <div class="field" id="fCmAmt"><label>${t("cm.monthly")}</label>
        <input id="cmAmt" inputmode="decimal" value="${c.amount}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field"><label>${t("cm.original")}</label>
        <input id="cmOrig" inputmode="decimal" value="${c.originalAmount ?? ""}"></div>
      <div class="field"><label>${t("cm.count")}</label>
        <input id="cmCount" inputmode="numeric" value="${c.installmentsTotal ?? ""}"></div>
      <div class="field" id="fCmDay"><label>${t("cm.dueDay")}</label>
        <input id="cmDay" inputmode="numeric" value="${c.dueDay}"><div class="err">${t("cm.err.day")}</div></div>
      <div class="field"><label>${t("cm.freq")}</label>
        <select id="cmFreq">${["monthly","quarterly","yearly"].map(f =>
          `<option value="${f}" ${(c.frequency || "monthly") === f ? "selected" : ""}>${t("cm.freq." + f)}</option>`).join("")}</select></div>
      <div class="field"><label>${t("cm.start")}</label>
        <input type="date" id="cmStart" value="${c.startDate || ""}"></div>
      <div class="field" id="fCmEnd"><label>${t("cm.end")}</label>
        <input type="date" id="cmEnd" value="${c.endDate || ""}"><div class="err">${t("cm.err.endBeforeStart")}</div></div>
      <div class="field"><label>${t("cm.account")}</label>
        <select id="cmAcc">${activeAccounts().map(a =>
          `<option value="${a.id}" ${a.id === c.accountId ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
      <div class="field"><label>${t("cm.priority")}</label>
        <select id="cmPrio">${["high","normal","low"].map(pv =>
          `<option value="${pv}" ${c.priority === pv ? "selected" : ""}>${t("cm.pr." + pv)}</option>`).join("")}</select></div>
      <div class="field"><label>${t("common.notes")}</label><input id="cmNotes" value="${esc(c.notes || "")}"></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="cmSave">${t("common.save")}</button></div>`;
    document.querySelectorAll("#cmKindSeg button").forEach(b =>
      b.addEventListener("click", () => {
        document.querySelectorAll("#cmKindSeg button").forEach(o => o.classList.toggle("active", o === b));
      }));
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("cmSave").addEventListener("click", () => {
      const name = $("cmName").value.trim();
      const amount = Money.parseAmount($("cmAmt").value);
      const day = Math.round(Number($("cmDay").value));
      const startDate = $("cmStart").value || null;
      const endDate = $("cmEnd").value || null;
      let ok = true;
      $("fCmName").classList.toggle("invalid", !name); if (!name) ok = false;
      const badAmt = amount === null || amount <= 0;
      $("fCmAmt").classList.toggle("invalid", badAmt); if (badAmt) ok = false;
      const badDay = !isFinite(day) || day < 1 || day > 31;
      $("fCmDay").classList.toggle("invalid", badDay); if (badDay) ok = false;
      const badEnd = !!(startDate && endDate && endDate < startDate);
      $("fCmEnd").classList.toggle("invalid", badEnd); if (badEnd) ok = false;
      if (!ok) return;
      const orig = Money.parseAmount($("cmOrig").value);
      const cnt = Math.round(Number($("cmCount").value));
      const category = $("cmCat").value || null;
      const data = {
        name, kind: document.querySelector("#cmKindSeg button.active")?.dataset.val || "bill",
        provider: $("cmProvider").value.trim(), category,
        amount: r2(amount),
        originalAmount: orig !== null && orig > 0 ? r2(orig) : null,
        installmentsTotal: isFinite(cnt) && cnt > 0 ? cnt : null,
        dueDay: day, frequency: $("cmFreq").value,
        startDate, endDate, accountId: $("cmAcc").value,
        priority: $("cmPrio").value, notes: $("cmNotes").value.trim(),
        type: typeFor(category, endDate)
      };
      if (editingId) Object.assign(byId(editingId), data);
      else S().commitments.push({ id: Store.uid("cm"), status: "active",
        autoRecur: true, payments: [], settledEarly: null, childId: null, ...data });
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  return { render, openDetail, openPay, openSection: (sec) => { section = sec; } };
})();

/* ============================================================
   MODULE: FAMILY — household staff & children (Phase 4)
   ============================================================ */
const Family = (() => {
  const { esc } = Views;
  const $ = (id) => document.getElementById(id);
  const S = () => Store.get();
  const t = (k, v) => I18N.t(k, v);
  const r2 = (n) => Math.round(Calc.safe(n) * 100) / 100;

  const workers = () => ((S().household || {}).workers || []);
  const wkById = (id) => workers().find(w => w.id === id);
  const chById = (id) => S().children.find(c => c.id === id);
  const cmOf = (w) => S().commitments.find(c => c.id === w.commitmentId);
  const childItems = (id) => S().commitments.filter(c => c.childId === id && c.status === "active");
  const childMonthly = (id) => r2(childItems(id).reduce((a, c) => a + Calc.safe(c.amount), 0));
  const daysTo = (iso) => { const d = Calc.parseISO(iso);
    return d ? Math.round((d - Calc.today()) / 86400000) : null; };

  const refresh = () => {
    if (document.getElementById("view-plan").classList.contains("active")) Commit.render();
    else Views.renderHome();
  };

  /* ---------- render ---------- */
  const stChip = (w) => w.status === "active" ? `<span class="chip ok">${t("wk.st.active")}</span>`
    : w.status === "ended" ? `<span class="chip">${t("wk.st.ended")}</span>`
    : `<span class="chip warn">${t("wk.st.expected")}</span>`;

  const wkCard = (w) => {
    const net = Calc.staffNet(w);
    const cm = cmOf(w);
    const info = [];
    if (w.status === "expected") {
      if (w.expectedFrom && w.expectedTo)
        info.push(`${t("wk.window")}: <span class="num">${FMT.date(w.expectedFrom)} ← ${FMT.date(w.expectedTo)}</span>`);
      else if (w.expectedFrom) {
        const n = daysTo(w.expectedFrom);
        info.push(n !== null && n >= 0 ? t("wk.startsIn", { n: FMT.num(n, 0) })
          : `<span class="num">${FMT.date(w.expectedFrom)}</span>`);
      }
    }
    if (w.status === "active" && w.startDate) info.push(t("wk.started", { d: FMT.date(w.startDate) }));
    if (Calc.safe(w.discountPct) > 0) info.push(`${t("wk.discount")}: <span class="num">${FMT.num(w.discountPct, 0)}</span>`);
    if (w.notes) info.push(esc(w.notes));
    return `
      <div class="card cm-card">
        <div class="cm-head">
          <div class="list-ico">🧕</div>
          <div class="list-main">
            <div class="t">${esc(w.name)} <span class="s">· ${t("wk.role." + (["temp","permanent"].includes(w.role) ? w.role : "other"))}</span></div>
            <div class="s num">${t("wk.net")}: ${FMT.money(net)}</div>
          </div>
          <div class="list-end">${stChip(w)}</div>
        </div>
        ${info.length ? `<div class="cm-sub" style="justify-content:flex-start">${info.join(" · ")}</div>` : ""}
        <div class="cm-foot" style="justify-content:flex-end;flex-wrap:wrap">
          ${w.status === "expected" ? `<button class="mini-btn solid" data-wkact="${w.id}">${t("wk.activate")}</button>` : ""}
          ${w.status === "active" && cm ? `
            <button class="mini-btn solid" data-wkpay="${w.id}">${t("wk.paySalary")}</button>
            <button class="mini-btn muted" data-wkend="${w.id}">${t("wk.end")}</button>` : ""}
          <button class="mini-btn" data-wkedit="${w.id}">${t("common.edit")}</button>
          ${w.status !== "active" ? `<button class="mini-btn muted" data-wkdel="${w.id}">${t("common.delete")}</button>` : ""}
        </div>
      </div>`;
  };

  const scCard = () => {
    const sc = Calc.staffScenarios(S(), 6);
    const perm = workers().find(w => w.role === "permanent" && w.status !== "ended");
    if (!sc.hasPerm || !perm || perm.status === "active") return "";
    const lblA = FMT.date(perm.expectedFrom), lblB = FMT.date(perm.expectedTo || perm.expectedFrom);
    return `
      <div class="card">
        <div class="card-title">${t("sc.title")}</div>
        <p class="hint" style="margin:-8px 0 12px">${t("sc.s")}</p>
        <div class="num" id="scGrid" style="display:grid;grid-template-columns:1fr auto auto;gap:8px 18px;font-size:13px;align-items:center">
          <div></div>
          <div class="s" style="font-weight:800">${t("sc.a", { d: lblA })}</div>
          <div class="s" style="font-weight:800">${t("sc.b", { d: lblB })}</div>
          ${sc.rows.map(r => `
            <div>${FMT.monthName(r.m)} ${FMT.num(r.y, 0)}</div>
            <div>${FMT.num(r.a)}</div>
            <div>${FMT.num(r.b)}</div>`).join("")}
          <div style="font-weight:850">${t("sc.total")}</div>
          <div style="font-weight:850">${FMT.num(sc.totalA)}</div>
          <div style="font-weight:850">${FMT.num(sc.totalB)}</div>
        </div>
        <p class="hint" style="margin:12px 0 0">${t("sc.diff")}: <span class="num">${FMT.money(Math.abs(sc.totalB - sc.totalA))}</span></p>
      </div>`;
  };

  const chCard = (c) => {
    const items = childItems(c.id);
    return `
      <div class="card cm-card">
        <div class="cm-head">
          <div class="list-ico">${c.emoji || "🧒"}</div>
          <div class="list-main">
            <div class="t">${esc(c.name)}</div>
            <div class="s num">${t("ch.monthly")}: ${FMT.money(childMonthly(c.id))}</div>
          </div>
          <div class="list-end"><button class="mini-btn" data-chedit="${c.id}">${t("common.edit")}</button></div>
        </div>
        ${items.length ? items.map(x => {
          const st = Calc.commitmentStats(x);
          return `
          <button class="list-row row-btn" data-chitem="${x.id}">
            <div class="list-ico">📎</div>
            <div class="list-main"><div class="t">${esc(x.name)}</div>
              <div class="s num">${st.daysToEnd !== null && st.daysToEnd >= 0
                ? t("cm.endsIn", { n: FMT.num(st.daysToEnd, 0) })
                : t("cm.freq." + (x.frequency || "monthly"))}</div></div>
            <div class="list-end"><div class="v num">${FMT.money(x.amount)}</div></div>
          </button>`; }).join("")
        : `<p class="hint" style="margin:10px 0 0">${t("ch.noItems")}</p>`}
        <div class="cm-foot" style="justify-content:flex-end">
          <button class="mini-btn" data-chattach="${c.id}">${t("ch.attach")}</button>
        </div>
      </div>`;
  };

  const renderInto = (holder) => {
    const staffM = r2(workers().filter(w => w.status === "active")
      .reduce((a, w) => a + Calc.staffNet(w), 0));
    const kidsM = r2(S().children.reduce((a, c) => a + childMonthly(c.id), 0));
    holder.innerHTML = `
      <div class="card">
        <div class="card-title">${t("fam.title")}</div>
        <div class="detail-grid">
          <div class="cell"><div class="k">${t("fam.staffMonthly")}</div><div class="v num">${FMT.money(staffM)}</div></div>
          <div class="cell"><div class="k">${t("fam.kidsMonthly")}</div><div class="v num">${FMT.money(kidsM)}</div></div>
          <div class="cell"><div class="k">${t("fam.total")}</div><div class="v num">${FMT.money(r2(staffM + kidsM))}</div></div>
        </div>
      </div>
      <div class="card-title" style="margin:4px 2px 10px">${t("fam.staff")}</div>
      <div id="wkList">${workers().map(wkCard).join("")}</div>
      <button class="add-dashed" id="wkAdd">＋ ${t("wk.add")}</button>
      ${scCard()}
      <div class="card-title" style="margin:18px 2px 10px">${t("fam.children")}</div>
      <div id="chList">${S().children.map(chCard).join("")}</div>
      <button class="add-dashed" id="chAdd">＋ ${t("ch.add")}</button>`;
    holder.querySelector("#wkAdd").addEventListener("click", () => openWkForm(null));
    holder.querySelector("#chAdd").addEventListener("click", () => openChForm(null));
    const on = (sel, fn) => holder.querySelectorAll(sel).forEach(b =>
      b.addEventListener("click", (e) => { e.stopPropagation(); fn(b.dataset[Object.keys(b.dataset)[0]]); }));
    on("[data-wkact]", openActivate);
    on("[data-wkpay]", (id) => { const w = wkById(id); if (w && w.commitmentId) Commit.openPay(w.commitmentId); });
    on("[data-wkend]", endWorker);
    on("[data-wkedit]", (id) => openWkForm(id));
    on("[data-wkdel]", delWorker);
    on("[data-chedit]", (id) => openChForm(id));
    on("[data-chattach]", openAttach);
    on("[data-chitem]", (id) => Commit.openDetail(id));
  };

  /* ---------- worker actions ---------- */
  const syncCommitment = (w) => {
    const cm = cmOf(w);
    if (!cm) return;
    cm.amount = Calc.staffNet(w);
    cm.name = t("wk.cmName", { n: w.name });
  };

  const openWkForm = (id) => {
    const w = id ? wkById(id) : { name:"", role:"temp", salary:"", discountPct:0,
      expectedFrom:"", expectedTo:"", notes:"" };
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t(id ? "wk.form.edit" : "wk.form.add")}</h2>
      <div class="field" id="fWkName"><label>${t("tx.name")}</label>
        <input id="wkName" value="${esc(w.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field"><label>${t("wk.role")}</label>
        <select id="wkRole">${["temp","permanent","other"].map(rv =>
          `<option value="${rv}" ${w.role === rv ? "selected" : ""}>${t("wk.role." + rv)}</option>`).join("")}</select></div>
      <div class="field" id="fWkSalary"><label>${t("wk.salary")}</label>
        <input id="wkSalary" inputmode="decimal" value="${w.salary}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field"><label>${t("wk.discount")}</label>
        <input id="wkDisc" inputmode="numeric" value="${w.discountPct || ""}"></div>
      <div class="field"><label>${t("wk.window")}</label>
        <input type="date" id="wkFrom" value="${w.expectedFrom || ""}"></div>
      <div class="field"><label>&nbsp;</label>
        <input type="date" id="wkTo" value="${w.expectedTo || ""}"></div>
      <div class="field"><label>${t("common.notes")}</label><input id="wkNotes" value="${esc(w.notes || "")}"></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="wkSave">${t("common.save")}</button></div>`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("wkSave").addEventListener("click", () => {
      const name = $("wkName").value.trim();
      const salary = Money.parseAmount($("wkSalary").value);
      let ok = true;
      $("fWkName").classList.toggle("invalid", !name); if (!name) ok = false;
      const badSal = salary === null || salary <= 0;
      $("fWkSalary").classList.toggle("invalid", badSal); if (badSal) ok = false;
      if (!ok) return;
      const disc = Math.max(0, Math.min(100, Calc.safe(Number($("wkDisc").value))));
      const data = { name, role: $("wkRole").value, salary: r2(salary), discountPct: disc,
        expectedFrom: $("wkFrom").value || null, expectedTo: $("wkTo").value || null,
        notes: $("wkNotes").value.trim() };
      if (id) { Object.assign(wkById(id), data); syncCommitment(wkById(id)); }
      else S().household.workers.push({ id: Store.uid("wk"), status: "expected",
        startDate: null, endDate: null, commitmentId: null, ...data });
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openActivate = (id) => {
    const w = wkById(id); if (!w) return;
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("wk.activate")} — ${esc(w.name)}</h2>
      <p class="hint" style="margin:-8px 0 14px">${t("wk.activate.hint")}</p>
      <div class="field" id="fWkStart"><label>${t("wk.startDate")}</label>
        <input type="date" id="wkStart" value="${w.expectedFrom || Money.isoLocal(new Date())}">
        <div class="err">${t("common.err.date")}</div></div>
      <div class="field" id="fWkDay"><label>${t("wk.payDay")}</label>
        <input id="wkDay" inputmode="numeric" value="27"><div class="err">${t("cm.err.day")}</div></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="wkActSave">${t("wk.activate")}</button></div>`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("wkActSave").addEventListener("click", () => {
      const date = $("wkStart").value;
      const day = Math.round(Number($("wkDay").value));
      let ok = true;
      const badDate = !date || !Calc.parseISO(date);
      $("fWkStart").classList.toggle("invalid", badDate); if (badDate) ok = false;
      const badDay = !isFinite(day) || day < 1 || day > 31;
      $("fWkDay").classList.toggle("invalid", badDay); if (badDay) ok = false;
      if (!ok) return;
      const cmId = Store.uid("cm");
      S().commitments.push({ id: cmId, name: t("wk.cmName", { n: w.name }),
        kind: "bill", provider: "", category: "cat_staff", amount: Calc.staffNet(w),
        originalAmount: null, installmentsTotal: null, dueDay: day, frequency: "monthly",
        startDate: date, endDate: null, accountId: Store.settings.defaultAccountId,
        priority: "high", status: "active", autoRecur: true, notes: "",
        payments: [], settledEarly: null, type: "fixed", childId: null });
      w.commitmentId = cmId; w.status = "active"; w.startDate = date;
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const endWorker = async (id) => {
    const w = wkById(id); if (!w) return;
    const ok = await UI.confirm({ title: t("wk.end"), body: t("wk.end.b"), yes: t("common.confirm") });
    if (!ok) return;
    const cm = cmOf(w);
    const iso = Money.isoLocal(new Date());
    if (cm) { cm.status = "completed"; cm.endDate = iso; }
    w.status = "ended"; w.endDate = iso;
    Store.save(); refresh(); UI.toast(t("toast.saved"));
  };

  const delWorker = async (id) => {
    const w = wkById(id); if (!w) return;
    const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("wk.del.b"), yes: t("confirm.del.y") });
    if (!ok) return;
    if (w.commitmentId) S().commitments = S().commitments.filter(c => c.id !== w.commitmentId);
    S().household.workers = workers().filter(x => x.id !== id);
    Store.save(); refresh(); UI.toast(t("toast.saved"));
  };

  /* ---------- children ---------- */
  const openChForm = (id) => {
    const c = id ? chById(id) : { name:"", emoji:"🧒", notes:"" };
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t(id ? "ch.form.edit" : "ch.form.add")}</h2>
      <div class="field" id="fChName"><label>${t("tx.name")}</label>
        <input id="chName" value="${esc(c.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field"><label>${t("ch.emoji")}</label><input id="chEmoji" value="${esc(c.emoji || "")}"></div>
      <div class="field"><label>${t("common.notes")}</label><input id="chNotes" value="${esc(c.notes || "")}"></div>
      <div class="btn-row" style="margin-bottom:${id ? "10px" : "0"}">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="chSave">${t("common.save")}</button></div>
      ${id ? `<button class="btn danger-soft" id="chDel">${t("common.delete")}</button>` : ""}`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("chSave").addEventListener("click", () => {
      const name = $("chName").value.trim();
      $("fChName").classList.toggle("invalid", !name);
      if (!name) return;
      const data = { name, emoji: $("chEmoji").value.trim() || "🧒", notes: $("chNotes").value.trim() };
      if (id) Object.assign(chById(id), data);
      else S().children.push({ id: Store.uid("ch"), ...data });
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    if (id) $("chDel").addEventListener("click", async () => {
      const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("ch.del.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      S().commitments.forEach(cm => { if (cm.childId === id) cm.childId = null; });
      S().children = S().children.filter(x => x.id !== id);
      Store.save(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openAttach = (childId) => {
    const c = chById(childId); if (!c) return;
    const options = S().commitments.filter(cm => cm.status === "active" && !cm.childId);
    const items = childItems(childId);
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("ch.attach")} — ${esc(c.name)}</h2>
      ${options.length ? `
        <div class="field"><label>${t("ch.attach.pick")}</label>
          <select id="chPick">${options.map(o =>
            `<option value="${o.id}">${esc(o.name)} · ${FMT.money(o.amount)}</option>`).join("")}</select></div>
        <div class="btn-row" style="margin-bottom:14px">
          <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
          <button class="btn primary" id="chAttachSave">${t("common.save")}</button></div>`
      : `<p class="hint">${t("ch.noneToAttach")}</p>
         <div class="btn-row" style="margin-bottom:14px">
          <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button></div>`}
      ${items.length ? `<div class="card-title">${t("ch.items")}</div>
        ${items.map(x => `
          <div class="list-row">
            <div class="list-ico">📎</div>
            <div class="list-main"><div class="t">${esc(x.name)}</div>
              <div class="s num">${FMT.money(x.amount)}</div></div>
            <div class="list-end"><button class="mini-btn muted" data-detach="${x.id}">${t("ch.detach")}</button></div>
          </div>`).join("")}` : ""}`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    const saveBtn = $("chAttachSave");
    if (saveBtn) saveBtn.addEventListener("click", () => {
      const cm = S().commitments.find(x => x.id === $("chPick").value);
      if (cm) cm.childId = childId;
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    sheet.querySelectorAll("[data-detach]").forEach(b =>
      b.addEventListener("click", () => {
        const cm = S().commitments.find(x => x.id === b.dataset.detach);
        if (cm) cm.childId = null;
        Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
      }));
    UI.openSheet("sheetDyn");
  };

  return { renderInto };
})();

/* ============================================================
   MODULE: TRAVEL — trips, budgets, bookings (Phase 5)
   ============================================================ */
const Travel = (() => {
  const { esc } = Views;
  const $ = (id) => document.getElementById(id);
  const S = () => Store.get();
  const t = (k, v) => I18N.t(k, v);
  const r2 = (n) => Math.round(Calc.safe(n) * 100) / 100;

  let openId = null;
  const trips = () => S().trips;
  const byId = (id) => trips().find(x => x.id === id);
  const CATS = ["flights","hotel","visa","tickets","transport","food","shopping","other"];
  const catIco = { flights:"✈️", hotel:"🏨", visa:"🛂", tickets:"🎟️",
    transport:"🚌", food:"🍜", shopping:"🛍️", other:"📌" };

  const refresh = () => {
    if (document.getElementById("view-plan").classList.contains("active")) Commit.render();
    else Views.renderHome();
  };

  /* ================= ACCOUNTING ================= */
  /* Paying a trip item creates exactly one linked expense transaction. */
  const payItem = (tp, it, { amount, date, accountId }) => {
    const tx = { id: Store.uid("tx"), createdAt: new Date().toISOString(),
      kind: "expense", name: tp.name + " — " + it.name, amount: r2(amount), date,
      accountId, toAccountId: null, categoryId: "cat_travel",
      fixedVar: "variable", essential: false, status: "paid",
      recurring: "none", notes: "", commitmentId: null, tripItemId: it.id };
    S().transactions.push(tx);
    Money.applyEffect(tx, 1);
    it.paid = true; it.paidAmount = r2(amount); it.txId = tx.id;
    Store.save();
  };
  const unpayItem = (it) => {
    const ti = S().transactions.findIndex(x => x.id === it.txId);
    if (ti >= 0) { Money.applyEffect(S().transactions[ti], -1); S().transactions.splice(ti, 1); }
    it.paid = false; it.paidAmount = 0; it.txId = null;
    Store.save();
  };

  /* ================= LIST ================= */
  const tripCard = (tp) => {
    const ts = Calc.tripStats(tp);
    const payPct = ts.target > 0 ? Math.min(100, (ts.paid / ts.target) * 100) : 0;
    return `
      <div class="card cm-card" data-tripopen="${tp.id}" role="button" tabindex="0">
        <div class="cm-head">
          <div class="list-ico">🧳</div>
          <div class="list-main">
            <div class="t">${esc(tp.name)}</div>
            <div class="s">${esc(tp.destination)}${tp.startDate ? ` · <span class="num">${FMT.date(tp.startDate)}</span>` : ""}</div>
          </div>
          <div class="list-end">
            ${ts.daysTo !== null && ts.daysTo >= 0
              ? `<span class="chip accent num">${FMT.num(ts.daysTo, 0)} ${t("trip.daysTo")}</span>`
              : `<span class="chip">${t("trip.st." + (tp.status || "planning"))}</span>`}
          </div>
        </div>
        <div class="progress" style="margin-top:12px"><span style="width:${payPct.toFixed(1)}%"></span></div>
        <div class="cm-sub">
          <span class="num">${t("trip.paidOfTarget", { p: FMT.money(ts.paid, 0), t: FMT.money(ts.target, 0) })}</span>
          <span class="num">${t("trip.readiness")}: ${FMT.num(ts.readiness, 0)}٪</span>
        </div>
      </div>`;
  };

  /* ================= TRIP PAGE ================= */
  const itemRow = (it) => `
    <button class="list-row row-btn" data-item="${it.id}">
      <div class="list-ico">${catIco[it.category] || "📌"}</div>
      <div class="list-main">
        <div class="t">${esc(it.name)}</div>
        <div class="s">${t("trip.cat." + (CATS.includes(it.category) ? it.category : "other"))}${it.ref ? ` · ${esc(it.ref)}` : ""}</div>
      </div>
      <div class="list-end">
        <div class="v num">${FMT.money(it.paid ? it.paidAmount : it.planned)}</div>
        <div>${it.paid ? `<span class="chip ok">${t("trip.paidChip")}</span>`
          : (it.booked ? `<span class="chip accent">${t("trip.bookedChip")}</span>` : "")}</div>
      </div>
    </button>`;

  const tripPage = (tp) => {
    const ts = Calc.tripStats(tp);
    const suggest = ts.days > 0 ? r2(Math.max(0, ts.target - ts.planned) / ts.days) : 0;
    return `
      <button class="chip" id="tripBack" style="margin-bottom:14px">${t("trip.back")}</button>
      <div class="card">
        <div class="card-title">🧳 ${esc(tp.name)}
          <button class="chip accent" id="tripEdit">${t("common.edit")}</button></div>
        <div class="row" style="margin-bottom:10px">
          <div>
            <div style="font-size:30px;font-weight:850;letter-spacing:-.02em" class="num">${ts.daysTo !== null && ts.daysTo >= 0 ? FMT.num(ts.daysTo, 0) : "—"}</div>
            <div style="font-size:12.5px;font-weight:700;color:var(--text-2)">${t("trip.daysTo")}</div>
          </div>
          <div class="list-end">
            <div class="s" style="font-weight:750;color:var(--text-2)">${esc(tp.destination)}</div>
            <div class="s num" style="margin-top:3px;color:var(--text-3);font-weight:700">
              ${tp.startDate ? FMT.date(tp.startDate) : ""} ← ${tp.endDate ? FMT.date(tp.endDate) : ""}</div>
            <div class="s num" style="margin-top:3px;color:var(--text-3);font-weight:700">${t("trip.nights", { n: FMT.num(ts.nights, 0), d: FMT.num(ts.days, 0) })}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap" id="travChips">
          ${tp.travelers.map(x => `<span class="chip">${esc(x)}</span>`).join("")}
        </div>
      </div>
      <div class="card">
        <div class="card-title">${t("trip.budget")}</div>
        <div class="detail-grid">
          <div class="cell"><div class="k">${t("trip.target")}</div><div class="v num">${FMT.money(ts.target)}</div></div>
          <div class="cell"><div class="k">${t("trip.planned")}</div><div class="v num">${FMT.money(ts.planned)}</div></div>
          <div class="cell"><div class="k">${t("trip.paidT")}</div><div class="v num">${FMT.money(ts.paid)}</div></div>
          <div class="cell"><div class="k">${t("trip.remaining")}</div><div class="v num" style="color:${ts.remaining < 0 ? "var(--danger)" : "var(--ok)"}">${FMT.money(ts.remaining)}</div></div>
        </div>
        <div class="progress"><span style="width:${(ts.target > 0 ? Math.min(100, ts.paid / ts.target * 100) : 0).toFixed(1)}%"></span></div>
        ${ts.overPlan > 0 ? `<p class="hint" style="margin-top:10px;color:var(--danger)">${t("trip.overPlan", { amt: FMT.money(ts.overPlan) })}</p>` : ""}
      </div>
      <div class="card">
        <div class="card-title">${t("trip.readiness")}
          <span class="chip accent num">${FMT.num(ts.readiness, 0)}٪</span></div>
        <div class="progress"><span style="width:${ts.readiness}%"></span></div>
        <p class="hint num" style="margin-top:10px">${t("trip.readiness.s", {
          b: FMT.num(ts.booked, 0), i: FMT.num(ts.itemCount, 0),
          p: FMT.num(ts.paidCount, 0), c: FMT.num(ts.clDone, 0), ct: FMT.num(ts.clTotal, 0) })}</p>
      </div>
      <div class="card">
        <div class="card-title">${t("trip.daily")}</div>
        <p class="hint" style="margin:-8px 0 10px">${t("trip.daily.s")}</p>
        <div class="field" style="margin-bottom:8px">
          <input id="tripDaily" inputmode="decimal" value="${tp.dailyBudget ?? ""}" placeholder="${FMT.num(suggest)}"></div>
        <p class="hint num">${t("trip.daily.total", { d: FMT.num(ts.days, 0) })}: <b>${FMT.money(ts.dailyTotal)}</b>
          · ${t("trip.daily.hint", { amt: FMT.num(suggest) })}</p>
      </div>
      <div class="card-title" style="margin:4px 2px 10px">${t("trip.items")}</div>
      <div id="tripItems">${(tp.items || []).map(itemRow).join("")}</div>
      <button class="add-dashed" id="tripItemAdd">＋ ${t("trip.item.add")}</button>
      <div class="card">
        <div class="card-title">${t("trip.checklist")}</div>
        ${(tp.checklist || []).map(x => `
          <div class="list-row">
            <button class="list-ico" data-cl="${x.id}" style="background:none;font-size:20px">${x.done ? "✅" : "⬜"}</button>
            <div class="list-main"><div class="t" style="${x.done ? "text-decoration:line-through;color:var(--text-3)" : ""}">${esc(x.text)}</div></div>
            <div class="list-end"><button class="mini-btn muted" data-cldel="${x.id}">✕</button></div>
          </div>`).join("")}
        <div class="field" style="margin-top:10px"><input id="clNew" placeholder="${t("trip.cl.add")}"></div>
      </div>`;
  };

  const renderInto = (holder) => {
    const tp = openId ? byId(openId) : null;
    if (!tp) {
      openId = null;
      holder.innerHTML = `
        <div id="tripList">${trips().map(tripCard).join("") || `
          <div class="empty" style="padding:36px 20px"><div class="art">🧳</div>
            <h3>${t("trip.none.t")}</h3><p>${t("trip.none.p")}</p></div>`}</div>
        <button class="add-dashed" id="tripAdd">＋ ${t("trip.add")}</button>`;
      holder.querySelector("#tripAdd").addEventListener("click", () => openTripForm(null));
      holder.querySelectorAll("[data-tripopen]").forEach(c =>
        c.addEventListener("click", () => { openId = c.dataset.tripopen; refresh(); }));
      return;
    }
    holder.innerHTML = tripPage(tp);
    holder.querySelector("#tripBack").addEventListener("click", () => { openId = null; refresh(); });
    holder.querySelector("#tripEdit").addEventListener("click", () => openTripForm(tp.id));
    holder.querySelector("#tripItemAdd").addEventListener("click", () => openItemForm(tp.id, null));
    holder.querySelectorAll("[data-item]").forEach(b =>
      b.addEventListener("click", () => openItemDetail(tp.id, b.dataset.item)));
    holder.querySelectorAll("[data-cl]").forEach(b =>
      b.addEventListener("click", () => {
        const x = tp.checklist.find(v => v.id === b.dataset.cl);
        if (x) { x.done = !x.done; Store.save(); refresh(); }
      }));
    holder.querySelectorAll("[data-cldel]").forEach(b =>
      b.addEventListener("click", () => {
        tp.checklist = tp.checklist.filter(v => v.id !== b.dataset.cldel);
        Store.save(); refresh();
      }));
    const clNew = holder.querySelector("#clNew");
    clNew.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && clNew.value.trim()) {
        tp.checklist.push({ id: Store.uid("cl"), text: clNew.value.trim(), done: false });
        Store.save(); refresh();
      }
    });
    const daily = holder.querySelector("#tripDaily");
    daily.addEventListener("change", () => {
      const v = Money.parseAmount(daily.value);
      tp.dailyBudget = v !== null && v >= 0 ? r2(v) : null;
      Store.save(); refresh();
    });
  };

  /* ================= SHEETS ================= */
  const openTripForm = (id) => {
    const tp = id ? byId(id) : { name:"", destination:"", startDate:"", endDate:"",
      targetBudget:"", savedAmount:0, status:"planning", travelers:[], notes:"" };
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t(id ? "trip.form.edit" : "trip.form.add")}</h2>
      <div class="field" id="fTpName"><label>${t("tx.name")}</label>
        <input id="tpName" value="${esc(tp.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field"><label>${t("trip.dest")}</label><input id="tpDest" value="${esc(tp.destination)}"></div>
      <div class="field"><label>${t("trip.start")}</label><input type="date" id="tpStart" value="${tp.startDate || ""}"></div>
      <div class="field" id="fTpEnd"><label>${t("trip.end")}</label>
        <input type="date" id="tpEnd" value="${tp.endDate || ""}"><div class="err">${t("cm.err.endBeforeStart")}</div></div>
      <div class="field" id="fTpTarget"><label>${t("trip.target")}</label>
        <input id="tpTarget" inputmode="decimal" value="${tp.targetBudget}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field"><label>${t("trip.saved")}</label>
        <input id="tpSaved" inputmode="decimal" value="${tp.savedAmount || 0}"></div>
      <div class="field"><label>${t("trip.status")}</label>
        <select id="tpStatus">${["planning","booked","active","done"].map(v =>
          `<option value="${v}" ${tp.status === v ? "selected" : ""}>${t("trip.st." + v)}</option>`).join("")}</select></div>
      <div class="field"><label>${t("trip.travelers")}</label>
        <input id="tpTrav" value="${esc(tp.travelers.join("، "))}"></div>
      <div class="field"><label>${t("common.notes")}</label><input id="tpNotes" value="${esc(tp.notes || "")}"></div>
      <div class="btn-row" style="margin-bottom:${id ? "10px" : "0"}">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="tpSave">${t("common.save")}</button></div>
      ${id ? `<button class="btn danger-soft" id="tpDel">${t("common.delete")}</button>` : ""}`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("tpSave").addEventListener("click", () => {
      const name = $("tpName").value.trim();
      const target = Money.parseAmount($("tpTarget").value);
      const sD = $("tpStart").value || null, eD = $("tpEnd").value || null;
      let ok = true;
      $("fTpName").classList.toggle("invalid", !name); if (!name) ok = false;
      const badT = target === null || target < 0;
      $("fTpTarget").classList.toggle("invalid", badT); if (badT) ok = false;
      const badE = !!(sD && eD && eD < sD);
      $("fTpEnd").classList.toggle("invalid", badE); if (badE) ok = false;
      if (!ok) return;
      const saved = Money.parseAmount($("tpSaved").value);
      const data = { name, destination: $("tpDest").value.trim(), startDate: sD, endDate: eD,
        targetBudget: r2(target), savedAmount: saved !== null && saved >= 0 ? r2(saved) : 0,
        status: $("tpStatus").value, notes: $("tpNotes").value.trim(),
        travelers: $("tpTrav").value.split(/[,،]/).map(x => x.trim()).filter(Boolean) };
      if (id) Object.assign(byId(id), data);
      else { const nid = Store.uid("trip");
        S().trips.push({ id: nid, currency: Store.settings.currency,
          items: [], checklist: [], dailyBudget: null, ...data });
        openId = nid; }
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    if (id) $("tpDel").addEventListener("click", async () => {
      const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("trip.del.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      S().trips = trips().filter(x => x.id !== id);
      openId = null;
      Store.save(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openItemDetail = (tripId, itemId) => {
    const tp = byId(tripId); if (!tp) return;
    const it = tp.items.find(x => x.id === itemId); if (!it) return;
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div>
      <h2>${catIco[it.category] || "📌"} ${esc(it.name)}
        ${it.paid ? `<span class="chip ok">${t("trip.paidChip")}</span>`
          : (it.booked ? `<span class="chip accent">${t("trip.bookedChip")}</span>` : "")}</h2>
      <div class="detail-grid">
        <div class="cell"><div class="k">${t("trip.item.planned")}</div><div class="v num">${FMT.money(it.planned)}</div></div>
        ${it.paid ? `<div class="cell"><div class="k">${t("trip.paidT")}</div><div class="v num">${FMT.money(it.paidAmount)}</div></div>` : ""}
        ${it.dueDate ? `<div class="cell"><div class="k">${t("trip.item.due")}</div><div class="v num">${FMT.date(it.dueDate)}</div></div>` : ""}
      </div>
      ${it.notes ? `<p class="hint" style="margin:-6px 0 14px">${esc(it.notes)}</p>` : ""}
      <div class="btn-row" style="margin-bottom:10px">
        ${it.paid ? `<button class="btn subtle" id="tiUnpay">${t("trip.unpay")}</button>`
                  : `<button class="btn primary" id="tiPay">${t("trip.pay")}</button>`}
        <button class="btn subtle" id="tiEdit">${t("common.edit")}</button>
      </div>
      <button class="btn danger-soft" id="tiDel">${t("common.delete")}</button>`;
    const on = (bid, fn) => { const b = $(bid); if (b) b.addEventListener("click", fn); };
    on("tiPay", () => openPaySheet(tripId, itemId));
    on("tiUnpay", async () => {
      const ok = await UI.confirm({ title: t("trip.unpay"), body: t("trip.unpay.b"), yes: t("common.confirm") });
      if (!ok) return;
      unpayItem(it); refresh(); UI.toast(t("cm.undone"));
    });
    on("tiEdit", () => openItemForm(tripId, itemId));
    on("tiDel", async () => {
      const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("trip.item.del.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      tp.items = tp.items.filter(x => x.id !== itemId);
      Store.save(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openPaySheet = (tripId, itemId) => {
    const tp = byId(tripId); if (!tp) return;
    const it = tp.items.find(x => x.id === itemId); if (!it) return;
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("trip.pay")} — ${esc(it.name)}</h2>
      <div class="field" id="fTiAmt"><label>${t("tx.amount")}</label>
        <input id="tiAmt" inputmode="decimal" value="${it.planned}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field" id="fTiDate"><label>${t("cm.payDate")}</label>
        <input type="date" id="tiDate" value="${Money.isoLocal(new Date())}"><div class="err">${t("common.err.date")}</div></div>
      <div class="field"><label>${t("cm.account")}</label>
        <select id="tiAcc">${S().accounts.filter(a => !a.archived).map(a =>
          `<option value="${a.id}" ${a.id === Store.settings.defaultAccountId ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="tiPaySave">${t("common.save")}</button></div>`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("tiPaySave").addEventListener("click", () => {
      const amount = Money.parseAmount($("tiAmt").value);
      const date = $("tiDate").value;
      let ok = true;
      const badA = amount === null || amount <= 0;
      $("fTiAmt").classList.toggle("invalid", badA); if (badA) ok = false;
      const badD = !date || !Calc.parseISO(date);
      $("fTiDate").classList.toggle("invalid", badD); if (badD) ok = false;
      if (!ok) return;
      payItem(tp, it, { amount, date, accountId: $("tiAcc").value });
      UI.closeSheet(); refresh(); UI.toast(t("cm.paySaved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openItemForm = (tripId, itemId) => {
    const tp = byId(tripId); if (!tp) return;
    const it = itemId ? tp.items.find(x => x.id === itemId)
      : { name:"", category:"other", planned:"", dueDate:"", ref:"", booked:false, notes:"" };
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t(itemId ? "trip.item.form.edit" : "trip.item.form.add")}</h2>
      <div class="field" id="fTiName"><label>${t("tx.name")}</label>
        <input id="tiName" value="${esc(it.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field"><label>${t("tx.category")}</label>
        <select id="tiCat">${CATS.map(c =>
          `<option value="${c}" ${it.category === c ? "selected" : ""}>${catIco[c]} ${t("trip.cat." + c)}</option>`).join("")}</select></div>
      <div class="field" id="fTiPlanned"><label>${t("trip.item.planned")}</label>
        <input id="tiPlanned" inputmode="decimal" value="${it.planned}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field"><label>${t("trip.item.booked")}</label>
        <div class="seg" id="tiBookSeg">
          <button data-val="no" class="${!it.booked ? "active" : ""}">${t("trip.item.notBooked")}</button>
          <button data-val="yes" class="${it.booked ? "active" : ""}">${t("trip.item.booked")}</button>
        </div></div>
      <div class="field"><label>${t("trip.item.due")}</label>
        <input type="date" id="tiDue" value="${it.dueDate || ""}"></div>
      <div class="field"><label>${t("trip.item.ref")}</label><input id="tiRef" value="${esc(it.ref || "")}"></div>
      <div class="field"><label>${t("common.notes")}</label><input id="tiNotes" value="${esc(it.notes || "")}"></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="tiSave">${t("common.save")}</button></div>`;
    document.querySelectorAll("#tiBookSeg button").forEach(b =>
      b.addEventListener("click", () => {
        document.querySelectorAll("#tiBookSeg button").forEach(o => o.classList.toggle("active", o === b));
      }));
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("tiSave").addEventListener("click", () => {
      const name = $("tiName").value.trim();
      const planned = Money.parseAmount($("tiPlanned").value);
      let ok = true;
      $("fTiName").classList.toggle("invalid", !name); if (!name) ok = false;
      const badP = planned === null || planned < 0;
      $("fTiPlanned").classList.toggle("invalid", badP); if (badP) ok = false;
      if (!ok) return;
      const data = { name, category: $("tiCat").value, planned: r2(planned),
        booked: document.querySelector("#tiBookSeg button.active")?.dataset.val === "yes",
        dueDate: $("tiDue").value || null, ref: $("tiRef").value.trim(),
        notes: $("tiNotes").value.trim() };
      if (itemId) Object.assign(it, data);
      else tp.items.push({ id: Store.uid("ti"), paid: false, paidAmount: 0, txId: null, ...data });
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  return { renderInto, openTrip: (id) => { openId = id; } };
})();

/* ============================================================
   MODULE: PLANNER — monthly plan & 12-month forecast (Phase 6)
   ============================================================ */
const Planner = (() => {
  const { esc } = Views;
  const $ = (id) => document.getElementById(id);
  const S = () => Store.get();
  const t = (k, v) => I18N.t(k, v);
  const r2 = (n) => Math.round(Calc.safe(n) * 100) / 100;

  let offset = 0, scen = "expected";
  const kindIco = { salary:"💼", commitment:"🧾", staff:"🧕", trip:"🧳", extra:"📝" };

  const refresh = () => {
    if (document.getElementById("view-plan").classList.contains("active")) Commit.render();
    else Views.renderHome();
  };

  /* ---- manual planned items: the only stored plan rows ---- */
  const exById = (id) => S().planner.extras.find(x => x.id === id);
  const recordExtra = (ex, { amount, date, accountId }) => {
    const tx = { id: Store.uid("tx"), createdAt: new Date().toISOString(),
      kind: ex.kind === "income" ? "income" : "expense",
      name: ex.name, amount: r2(amount), date, accountId, toAccountId: null,
      categoryId: null, fixedVar: "variable", essential: false, status: "paid",
      recurring: "none", notes: "", commitmentId: null, tripItemId: null, plannerId: ex.id };
    S().transactions.push(tx);
    Money.applyEffect(tx, 1);
    ex.done = true; ex.txId = tx.id;
    Store.save();
  };
  const undoExtra = (ex) => {
    const ti = S().transactions.findIndex(x => x.id === ex.txId);
    if (ti >= 0) { Money.applyEffect(S().transactions[ti], -1); S().transactions.splice(ti, 1); }
    ex.done = false; ex.txId = null;
    Store.save();
  };

  /* ---- alerts for the shown month ---- */
  const monthAlerts = (pm) => {
    const st = S();
    const out = [];
    if (pm.net < 0) out.push(t("pl.al.deficit", { amt: FMT.money(Math.abs(pm.net), 0) }));
    if (offset === 0) {
      const overdue = Calc.dueList(st, 0).filter(u => u.overdue).length;
      if (overdue) out.push(t("pl.al.overdue", { n: FMT.num(overdue, 0) }));
    }
    const tripDue = pm.rows.filter(r => r.kind === "trip").length;
    if (tripDue) out.push(t("pl.al.trip", { n: FMT.num(tripDue, 0) }));
    for (const c of st.commitments) {
      if (c.status !== "active" || !c.endDate) continue;
      const e = Calc.parseISO(c.endDate);
      if (e && e.getFullYear() === pm.y && e.getMonth() === pm.m)
        out.push(t("pl.al.frees", { name: esc(c.name), amt: FMT.money(c.amount, 0) }));
    }
    return out;
  };

  /* ---- rendering ---- */
  const rowHTML = (r) => {
    const clickable = r.kind === "commitment" || (r.kind === "staff" && !r.expected) ||
      r.kind === "trip" || r.kind === "extra";
    const name = r.kind === "salary" ? t("pl.salary") : r.name;
    return `
      <${clickable ? "button" : "div"} class="list-row ${clickable ? "row-btn" : ""}"
        ${clickable ? `data-plrow="${r.kind}:${r.refId}${r.tripId ? ":" + r.tripId : ""}"` : ""}>
        <div class="list-ico">${kindIco[r.kind] || "•"}</div>
        <div class="list-main">
          <div class="t">${esc(name)}
            ${r.expected ? `<span class="chip warn" style="margin-inline-start:6px">${t("pl.expectedChip")}</span>` : ""}</div>
          <div class="s num">${t("pl.day")} ${FMT.num(r.day, 0)}</div>
        </div>
        <div class="list-end">
          <div class="v num" style="color:${r.dir === "in" ? "var(--ok)" : "inherit"}">
            ${r.dir === "in" ? "+" : "−"}${FMT.num(r.amount)}</div>
          ${r.paid ? `<span class="chip ok">${t("cm.paid")}</span>` : ""}
        </div>
      </${clickable ? "button" : "div"}>`;
  };

  const renderInto = (holder) => {
    const st = S();
    const pm = Calc.plannerMonth(st, offset);
    const fc = Calc.forecast(st, 12, scen);
    const alerts = monthAlerts(pm);
    const wf = st.planner.whatif;
    const pctOut = pm.outflow > 0 ? Math.min(100, pm.actualExpense / pm.outflow * 100) : 0;
    const pctIn = pm.income > 0 ? Math.min(100, pm.actualIncome / pm.income * 100) : 0;
    holder.innerHTML = `
      <div class="card">
        <div class="row">
          <button class="chip" id="plPrev">‹</button>
          <div style="font-weight:850;font-size:16px" class="num">${FMT.monthName(pm.m)} ${FMT.num(pm.y, 0)}</div>
          <button class="chip" id="plNext">›</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">${t("pl.month")}
          <span class="chip ${pm.net >= 0 ? "ok" : "danger"} num">${pm.net >= 0 ? t("pl.surplus") : t("pl.deficit")}: ${FMT.money(Math.abs(pm.net), 0)}</span></div>
        <div class="detail-grid">
          <div class="cell"><div class="k">${t("pl.plannedIn")}</div><div class="v num">${FMT.money(pm.income)}</div></div>
          <div class="cell"><div class="k">${t("pl.plannedOut")}</div><div class="v num">${FMT.money(pm.outflow)}</div></div>
          <div class="cell"><div class="k">${t("pl.net")}</div><div class="v num" style="color:${pm.net >= 0 ? "var(--ok)" : "var(--danger)"}">${FMT.money(pm.net)}</div></div>
        </div>
        <div class="card-title" style="margin-top:2px">${t("pl.actual")}</div>
        <div class="cm-sub" style="justify-content:flex-start;margin:0 0 6px">
          <span class="num">${t("pl.actualIn")}: ${FMT.num(pm.actualIncome)}</span></div>
        <div class="progress"><span style="width:${pctIn.toFixed(1)}%"></span></div>
        <div class="cm-sub" style="justify-content:flex-start;margin:8px 0 6px">
          <span class="num">${t("pl.actualOut")}: ${FMT.num(pm.actualExpense)}</span></div>
        <div class="progress"><span style="width:${pctOut.toFixed(1)}%"></span></div>
      </div>
      ${alerts.length ? `
      <div class="card">
        <div class="card-title">${t("pl.alerts.t")}</div>
        ${alerts.map(a => `
          <div class="list-row">
            <div class="list-ico">⚠️</div>
            <div class="list-main"><div class="t num">${a}</div></div>
          </div>`).join("")}
      </div>` : ""}
      <div class="card">
        <div class="card-title">${t("pl.timeline")}</div>
        <p class="hint num" style="margin:-8px 0 10px">${t("pl.timeline.s", { d: FMT.num(st.settings.salaryDay, 0) })}</p>
        <div id="plRows">${pm.rows.map(rowHTML).join("")}</div>
        <button class="add-dashed" id="plExtraAdd" style="margin-top:10px">＋ ${t("pl.extra.add")}</button>
      </div>
      <div class="card">
        <div class="card-title">${t("pl.forecast")}
          <button class="chip accent" id="plWhatIf">${t("pl.whatif")}</button></div>
        <p class="hint" style="margin:-8px 0 10px">${t("pl.forecast.s")}</p>
        <div class="seg" id="plScen" style="margin-bottom:12px">
          ${["best","expected","worst"].map(v =>
            `<button data-val="${v}" class="${scen === v ? "active" : ""}">${t("pl.sc." + v)}</button>`).join("")}
        </div>
        <div class="num" id="fcGrid" style="display:grid;grid-template-columns:1fr auto auto auto auto;gap:7px 12px;font-size:12.5px;align-items:center">
          <div></div>
          <div class="s" style="font-weight:800">${t("pl.col.in")}</div>
          <div class="s" style="font-weight:800">${t("pl.col.out")}</div>
          <div class="s" style="font-weight:800">${t("pl.col.net")}</div>
          <div class="s" style="font-weight:800">${t("pl.col.cum")}</div>
          ${fc.rows.map(r => `
            <div>${FMT.monthName(r.m)} ${FMT.num(r.y % 100, 0)}</div>
            <div>${FMT.num(r.income, 0)}</div>
            <div>${FMT.num(r.out, 0)}</div>
            <div style="color:${r.net >= 0 ? "var(--ok)" : "var(--danger)"}">${FMT.num(r.net, 0)}</div>
            <div style="font-weight:800;color:${r.cum >= 0 ? "inherit" : "var(--danger)"}">${FMT.num(r.cum, 0)}</div>`).join("")}
        </div>
        <p class="hint" style="margin-top:12px">${t("pl.sc.hint")}</p>
      </div>`;
    holder.querySelector("#plPrev").addEventListener("click", () => { offset--; refresh(); });
    holder.querySelector("#plNext").addEventListener("click", () => { offset++; refresh(); });
    holder.querySelector("#plExtraAdd").addEventListener("click", () => openExtraForm(null, pm.ym));
    holder.querySelector("#plWhatIf").addEventListener("click", openWhatIf);
    holder.querySelectorAll("#plScen button").forEach(b =>
      b.addEventListener("click", () => { scen = b.dataset.val; refresh(); }));
    holder.querySelectorAll("[data-plrow]").forEach(b =>
      b.addEventListener("click", () => {
        const [kind, refId, tripId] = b.dataset.plrow.split(":");
        if (kind === "commitment" || kind === "staff") Commit.openDetail(refId);
        else if (kind === "trip") { Travel.openTrip(tripId); Commit.openSection("travel"); refresh(); }
        else if (kind === "extra") openExtraDetail(refId);
      }));
  };

  /* ---- extra sheets ---- */
  const openExtraForm = (id, ym) => {
    const ex = id ? exById(id) : { name:"", kind:"expense", amount:"", day:1 };
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t(id ? "pl.extra.form.edit" : "pl.extra.form.add")}</h2>
      <p class="hint" style="margin:-8px 0 14px">${t("pl.extra.hint")}</p>
      <div class="field"><label>${t("flt.kind")}</label>
        <div class="seg" id="exKindSeg">
          <button data-val="expense" class="${ex.kind !== "income" ? "active" : ""}">${t("tx.expense")}</button>
          <button data-val="income" class="${ex.kind === "income" ? "active" : ""}">${t("tx.income")}</button>
        </div></div>
      <div class="field" id="fExName"><label>${t("tx.name")}</label>
        <input id="exName" value="${esc(ex.name)}"><div class="err">${t("common.err.required")}</div></div>
      <div class="field" id="fExAmt"><label>${t("tx.amount")}</label>
        <input id="exAmt" inputmode="decimal" value="${ex.amount}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field" id="fExDay"><label>${t("pl.day")}</label>
        <input id="exDay" inputmode="numeric" value="${ex.day}"><div class="err">${t("cm.err.day")}</div></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="exSave">${t("common.save")}</button></div>`;
    document.querySelectorAll("#exKindSeg button").forEach(b =>
      b.addEventListener("click", () => {
        document.querySelectorAll("#exKindSeg button").forEach(o => o.classList.toggle("active", o === b));
      }));
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("exSave").addEventListener("click", () => {
      const name = $("exName").value.trim();
      const amount = Money.parseAmount($("exAmt").value);
      const day = Math.round(Number($("exDay").value));
      let ok = true;
      $("fExName").classList.toggle("invalid", !name); if (!name) ok = false;
      const badA = amount === null || amount <= 0;
      $("fExAmt").classList.toggle("invalid", badA); if (badA) ok = false;
      const badD = !isFinite(day) || day < 1 || day > 31;
      $("fExDay").classList.toggle("invalid", badD); if (badD) ok = false;
      if (!ok) return;
      const data = { name, amount: r2(amount), day,
        kind: document.querySelector("#exKindSeg button.active")?.dataset.val || "expense" };
      if (id) Object.assign(exById(id), data);
      else S().planner.extras.push({ id: Store.uid("ex"), ym, done: false, txId: null, ...data });
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openExtraDetail = (id) => {
    const ex = exById(id); if (!ex) return;
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div>
      <h2>📝 ${esc(ex.name)} ${ex.done ? `<span class="chip ok">${t("cm.paid")}</span>` : ""}</h2>
      <div class="detail-grid">
        <div class="cell"><div class="k">${t("tx.amount")}</div><div class="v num">${FMT.money(ex.amount)}</div></div>
        <div class="cell"><div class="k">${t("pl.day")}</div><div class="v num">${FMT.num(ex.day, 0)}</div></div>
      </div>
      <div class="btn-row" style="margin-bottom:10px">
        ${ex.done ? `<button class="btn subtle" id="exUndo">${t("pl.extra.undo")}</button>`
                  : `<button class="btn primary" id="exRecord">${t("pl.extra.record")}</button>`}
        ${!ex.done ? `<button class="btn subtle" id="exEdit">${t("common.edit")}</button>` : ""}
      </div>
      <button class="btn danger-soft" id="exDel">${t("common.delete")}</button>`;
    const on = (bid, fn) => { const b = $(bid); if (b) b.addEventListener("click", fn); };
    on("exRecord", () => openExtraPay(id));
    on("exUndo", async () => {
      const ok = await UI.confirm({ title: t("pl.extra.undo"), body: t("pl.extra.undo.b"), yes: t("common.confirm") });
      if (!ok) return;
      undoExtra(ex); refresh(); UI.toast(t("cm.undone"));
    });
    on("exEdit", () => openExtraForm(id, ex.ym));
    on("exDel", async () => {
      const ok = await UI.confirm({ title: t("confirm.del.t"), body: t("pl.extra.del.b"), yes: t("confirm.del.y") });
      if (!ok) return;
      S().planner.extras = S().planner.extras.filter(x => x.id !== id);
      Store.save(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openExtraPay = (id) => {
    const ex = exById(id); if (!ex) return;
    if (ex.done) { UI.toast(t("cm.dupPay")); return; }
    const sheet = $("sheetDyn");
    const defDate = Money.isoLocal(new Date());
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("pl.extra.record")} — ${esc(ex.name)}</h2>
      <div class="field" id="fExpAmt"><label>${t("tx.amount")}</label>
        <input id="expAmt" inputmode="decimal" value="${ex.amount}"><div class="err">${t("common.err.amount")}</div></div>
      <div class="field" id="fExpDate"><label>${t("cm.payDate")}</label>
        <input type="date" id="expDate" value="${defDate}"><div class="err">${t("common.err.date")}</div></div>
      <div class="field"><label>${t("cm.account")}</label>
        <select id="expAcc">${S().accounts.filter(a => !a.archived).map(a =>
          `<option value="${a.id}" ${a.id === Store.settings.defaultAccountId ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="expSave">${t("common.save")}</button></div>`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("expSave").addEventListener("click", () => {
      const amount = Money.parseAmount($("expAmt").value);
      const date = $("expDate").value;
      let ok = true;
      const badA = amount === null || amount <= 0;
      $("fExpAmt").classList.toggle("invalid", badA); if (badA) ok = false;
      const badD = !date || !Calc.parseISO(date);
      $("fExpDate").classList.toggle("invalid", badD); if (badD) ok = false;
      if (!ok) return;
      if (ex.done) { UI.toast(t("cm.dupPay")); return; }
      recordExtra(ex, { amount, date, accountId: $("expAcc").value });
      UI.closeSheet(); refresh(); UI.toast(t("cm.paySaved"));
    });
    UI.openSheet("sheetDyn");
  };

  const openWhatIf = () => {
    const wf = S().planner.whatif;
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("pl.whatif")}</h2>
      <div class="field"><label>${t("pl.wf.flex")}</label>
        <input id="wfFlex" inputmode="decimal" value="${wf.spendingFlex || 0}"></div>
      <div class="field"><label>${t("pl.wf.salary")}</label>
        <input id="wfSalary" inputmode="numeric" value="${wf.salaryDelta || 0}"></div>
      <div class="field"><label>${t("pl.wf.staff")}</label>
        <div class="seg" id="wfStaffSeg">
          <button data-val="a" class="${wf.staffScenario !== "b" ? "active" : ""}">${t("pl.wf.a")}</button>
          <button data-val="b" class="${wf.staffScenario === "b" ? "active" : ""}">${t("pl.wf.b")}</button>
        </div></div>
      <div class="btn-row">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="wfSave">${t("common.save")}</button></div>`;
    document.querySelectorAll("#wfStaffSeg button").forEach(b =>
      b.addEventListener("click", () => {
        document.querySelectorAll("#wfStaffSeg button").forEach(o => o.classList.toggle("active", o === b));
      }));
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("wfSave").addEventListener("click", () => {
      const flex = Money.parseAmount($("wfFlex").value);
      const sd = Number($("wfSalary").value);
      S().planner.whatif = {
        spendingFlex: flex !== null && flex >= 0 ? r2(flex) : 0,
        salaryDelta: isFinite(sd) ? r2(sd) : 0,
        staffScenario: document.querySelector("#wfStaffSeg button.active")?.dataset.val || "a"
      };
      Store.save(); UI.closeSheet(); refresh(); UI.toast(t("toast.saved"));
    });
    UI.openSheet("sheetDyn");
  };

  return { renderInto };
})();

/* ============================================================
   MODULE: ADVISOR — derived insights, analyses, Q&A (Phase 7)
   All content is computed from stored data + Calc forecasts on
   every render. Nothing is written except user dismissals, and
   no answer ever mutates financial data.
   ============================================================ */
const Advisor = (() => {
  const { esc } = Views;
  const $ = (id) => document.getElementById(id);
  const S = () => Store.get();
  const t = (k, v) => I18N.t(k, v);
  const r2 = (n) => Math.round(Calc.safe(n) * 100) / 100;
  const M = (m) => FMT.monthName(m);
  const money0 = (n) => FMT.money(n, 0);
  const pct = (x) => FMT.num(Math.round(x * 100), 0);

  const srcChip = (src) => `<span class="chip ${src === "actual" ? "ok"
    : src === "forecast" ? "warn" : src === "planned" ? "accent" : ""}">${t("adv.src." + src)}</span>`;

  /* ---------------- insights (derived, stable ids) ---------------- */
  const buildInsights = () => {
    const st = S();
    const out = [];
    const push = (id, priority, icon, source, title, body, nav) =>
      out.push({ id, priority, icon, source, title, body, nav });

    const overdue = Calc.dueList(st, 0).filter(u => u.overdue);
    if (overdue.length)
      push("overdue", 1, "⏰", "actual",
        t("adv.i.overdue.t", { n: FMT.num(overdue.length, 0),
          amt: money0(overdue.reduce((a, u) => a + Calc.safe(u.c.amount), 0)) }),
        t("adv.i.overdue.b"), "cm");

    const fc = Calc.forecast(st, 12, "expected");
    if (fc.rows.length) {
      let min = fc.rows[0];
      fc.rows.forEach(r => { if (r.cum < min.cum) min = r; });
      if (min.cum < 0) {
        const tripHit = st.trips.some(tp => (tp.items || []).some(it => {
          if (it.paid) return false;
          const dd = it.dueDate ? Calc.parseISO(it.dueDate)
            : (tp.startDate ? Calc.parseISO(tp.startDate) : null);
          return dd && dd.getFullYear() === min.y && dd.getMonth() === min.m;
        }));
        push("fc-negative", 1, "📉", "forecast",
          t("adv.i.negative.t", { m: M(min.m), amt: FMT.money(min.cum) }),
          t("adv.i.negative.b", { months: FMT.num(12, 0),
            reason: tripHit ? t("plan.sec.travel") : t("plan.sec.cm") }), "planner");
      } else if (min.cum < Calc.safe(st.settings.monthlySalary)) {
        push("fc-lowpoint", 2, "📉", "forecast",
          t("adv.i.lowpoint.t", { m: M(min.m), amt: FMT.money(min.cum) }),
          t("adv.i.lowpoint.b"), "planner");
      }
    }

    const pmn = Calc.plannerMonth(st, 0);
    if (pmn.net < 0)
      push("deficit", 2, "⚖️", "planned",
        t("adv.i.deficit.t", { amt: money0(Math.abs(pmn.net)) }),
        t("adv.i.deficit.b", { inc: money0(pmn.income), out: money0(pmn.outflow) }), "planner");

    const rel = Calc.freedTimeline(st);
    if (rel.length) {
      const first = rel[0], last = rel[rel.length - 1];
      push("release", 3, "📈", "forecast",
        t("adv.i.release.t", { amt: money0(first.c.amount), m: M(first.end.getMonth()) }),
        t("adv.i.release.b", { name: esc(first.c.name),
          lastM: M(last.end.getMonth()) + " " + FMT.num(last.end.getFullYear(), 0),
          cum: money0(last.cum) }), "cm");
    }

    const temp = (((S().household || {}).workers) || []).find(w => w.role === "temp" && w.status !== "ended");
    if (temp && Calc.safe(temp.discountPct) === 0 && Calc.safe(temp.salary) > 0)
      push("discount", 3, "🏷️", "scenario", t("adv.i.discount.t"),
        t("adv.i.discount.b", { sal: money0(temp.salary), save: money0(temp.salary * 0.2) }), "family");

    const sc = Calc.staffScenarios(st, 6);
    if (sc.hasPerm && Math.abs(sc.totalB - sc.totalA) > 0.005)
      push("staffdiff", 3, "🧕", "scenario",
        t("adv.i.staffdiff.t", { amt: money0(Math.abs(sc.totalB - sc.totalA)) }),
        t("adv.i.staffdiff.b", { a: money0(sc.totalA), b: money0(sc.totalB) }), "family");

    for (const tp of st.trips) {
      const unpaid = r2((tp.items || []).filter(i => !i.paid)
        .reduce((a, i) => a + Calc.safe(i.planned), 0));
      if (unpaid <= 0 || !tp.startDate) continue;
      const sD = Calc.parseISO(tp.startDate);
      if (!sD) continue;
      const idx = fc.rows.findIndex(r => r.y === sD.getFullYear() && r.m === sD.getMonth());
      if (idx > 0) {
        const before = fc.rows[idx - 1].cum;
        const okv = before >= unpaid;
        push("trip-" + tp.id, okv ? 3 : 2, "🧳", "forecast",
          t("adv.i.trip.t", { amt: money0(unpaid) }),
          t("adv.i.trip.b", { m: M(sD.getMonth()), cum: money0(before),
            verdict: t(okv ? "adv.i.trip.okv" : "adv.i.trip.short") }), "travel");
      }
    }

    const cands = st.commitments.filter(c => c.status === "active" && c.kind === "installment" && c.endDate);
    if (cands.length) {
      const cbest = cands.slice().sort((a, b) => String(a.endDate).localeCompare(String(b.endDate)))[0];
      const cst = Calc.commitmentStats(cbest);
      if (cst.remainingBalance)
        push("settle", 3, "✂️", "planned",
          t("adv.i.settle.t", { name: esc(cbest.name) }),
          t("adv.i.settle.b", { amt: money0(cst.remainingBalance),
            n: FMT.num(cst.remainingPayments ?? 0, 0),
            m: M(Calc.parseISO(cbest.endDate).getMonth()) }), "cm");
    }

    const sur = fc.rows.filter(r => r.net > 0);
    if (sur.length) {
      const best = sur.slice().sort((a, b) => b.net - a.net)[0];
      push("surplus", 3, "💰", "forecast",
        t("adv.i.surplus.t", { n: FMT.num(sur.length, 0) }),
        t("adv.i.surplus.b", { m: M(best.m), amt: money0(best.net) }), "planner");
    }

    return out.sort((a, b) => a.priority - b.priority);
  };

  const visible = () => buildInsights().filter(i => !S().advisor.dismissed.includes(i.id));
  const count = () => visible().length;
  const topInsights = (n) => visible().slice(0, n)
    .map(i => ({ icon: i.icon, title: i.title, chip: srcChip(i.source) }));

  const refresh = () => {
    if (document.getElementById("view-plan").classList.contains("active")) Commit.render();
    else Views.renderHome();
  };

  /* ---------------- natural-language Q&A ---------------- */
  const hasAny = (q, words) => words.some(wd => q.includes(wd));
  const answer = (qRaw) => {
    const st = S();
    const q = String(qRaw || "").toLowerCase();
    if (!q.trim()) return null;
    /* a specific commitment named in the question wins over generic intents */
    for (const c of st.commitments) {
      const tokens = String(c.name).split(/\s+/).filter(x => x.length > 2);
      if (tokens.length && tokens.some(tk => q.includes(tk.toLowerCase()))) {
        const cst = Calc.commitmentStats(c);
        return t("adv.a.cmOne", {
          name: esc(c.name), amt: money0(c.amount),
          rem: cst.remainingBalance !== null ? money0(cst.remainingBalance) : "—",
          end: c.endDate ? t("adv.a.cmOne.end", { m: M(Calc.parseISO(c.endDate).getMonth()) }) : "",
          paid: t(cst.paidThisPeriod ? "adv.a.cmOne.paid" : "adv.a.cmOne.unpaid") });
      }
    }
    const fc = Calc.forecast(st, 12, "expected");
    if (hasAny(q, ["رحلة", "اليابان", "سفر", "trip", "japan", "travel"]) && st.trips.length) {
      const tp = st.trips[0], ts = Calc.tripStats(tp);
      const unpaid = r2((tp.items || []).filter(i => !i.paid).reduce((a, i) => a + Calc.safe(i.planned), 0));
      return t("adv.a.trip", { name: esc(tp.name), days: FMT.num(Math.max(0, ts.daysTo ?? 0), 0),
        t: money0(ts.target), paid: money0(ts.paid), un: money0(unpaid), r: FMT.num(ts.readiness, 0) });
    }
    if (hasAny(q, ["عاملة", "عمالة", "خادمة", "استقدام", "staff", "worker", "maid"])) {
      const ws = (((st.household || {}).workers) || []).filter(w => w.status !== "ended");
      if (ws.length) {
        const sc = Calc.staffScenarios(st, 6);
        const rows = ws.map(wk => `${esc(wk.name)} ${money0(Calc.staffNet(wk))}`).join(" · ");
        return t("adv.a.staff", { rows, diff: money0(Math.abs(sc.totalB - sc.totalA)) });
      }
    }
    if (hasAny(q, ["يتحسن", "تحسن", "وفر", "توفير", "ادخار", "save", "improve", "better", "saving"])) {
      const rel = Calc.freedTimeline(st);
      if (rel.length) {
        const first = rel[0], last = rel[rel.length - 1];
        return t("adv.a.save", { m: M(first.end.getMonth()), amt: money0(first.c.amount),
          cum: money0(last.cum), n: FMT.num(fc.rows.filter(r => r.net > 0).length, 0) });
      }
    }
    if (hasAny(q, ["توقع", "عجز", "تدفق", "مستقبل", "forecast", "deficit", "cash", "flow"])) {
      const pmn = Calc.plannerMonth(st, 0);
      let min = fc.rows[0] || { cum: Calc.netBalance(st), m: Calc.today().getMonth() };
      fc.rows.forEach(r => { if (r.cum < min.cum) min = r; });
      return t("adv.a.forecast", { net: FMT.money(pmn.net), min: FMT.money(min.cum), m: M(min.m) });
    }
    if (hasAny(q, ["صحة", "نقاط", "score", "health"]))
      return t("adv.a.score", { score: FMT.num(Calc.healthScore(st).score, 0) });
    if (hasAny(q, ["راتب", "salary"])) {
      const pmn = Calc.plannerMonth(st, 0);
      const got = pmn.rows.some(r => r.kind === "salary" && r.paid);
      return t("adv.a.salary", { sal: money0(st.settings.monthlySalary),
        d: FMT.num(st.settings.salaryDay, 0), got: t(got ? "adv.a.salary.got" : "adv.a.salary.no") });
    }
    if (hasAny(q, ["التزام", "قسط", "أقساط", "قرض", "فواتير", "commitment", "installment", "loan", "bill"])) {
      const act = st.commitments.filter(c => c.status === "active");
      const tot = Calc.totals(st);
      const rel = Calc.freedTimeline(st);
      return t("adv.a.cm", { n: FMT.num(act.length, 0), amt: money0(tot.outflow),
        name: rel.length ? esc(rel[0].c.name) : "—",
        m: rel.length ? M(rel[0].end.getMonth()) : "—",
        freed: rel.length ? money0(rel[0].c.amount) : money0(0) });
    }
    if (hasAny(q, ["رصيد", "balance", "كم عندي", "حساب", "أملك"])) {
      return t("adv.a.balance", { bal: money0(Calc.netBalance(st)),
        n: FMT.num(st.accounts.filter(a => !a.archived).length, 0),
        out: money0(Calc.totals(st).outflow) });
    }
    return null;
  };

  /* ---------------- render ---------------- */
  const renderInto = (holder) => {
    const st = S();
    const hp = Calc.healthParts(st);
    const ins = visible();
    const hidden = buildInsights().length - ins.length;
    const groups = [1, 2, 3].map(pr => ({ pr, list: ins.filter(i => i.priority === pr) }));
    const sp = Calc.spendingByCategory(st, 0);
    const pmn = Calc.plannerMonth(st, 0);
    const fc = Calc.forecast(st, 12, "expected");
    let mn = fc.rows[0], mx = fc.rows[0];
    fc.rows.forEach(r => { if (r.cum < mn.cum) mn = r; if (r.cum > mx.cum) mx = r; });
    const tot = Calc.totals(st);
    const rel = Calc.freedTimeline(st);
    const staffPlanned = r2(pmn.rows.filter(r => r.kind === "staff").reduce((a, r) => a + r.amount, 0));
    const kids = r2(st.commitments.filter(c => c.childId && c.status === "active")
      .reduce((a, c) => a + Calc.safe(c.amount), 0));
    const catName = (id) => (st.categories.find(c => c.id === id) || {}).name || "غير مصنف";
    const insHTML = (i) => `
      <div class="card cm-card">
        <div class="cm-head">
          <div class="list-ico">${i.icon}</div>
          <div class="list-main">
            <div class="t">${i.title}</div>
            <div class="s" style="margin-top:4px">${i.body}</div>
          </div>
          <div class="list-end">${srcChip(i.source)}</div>
        </div>
        <div class="cm-foot" style="justify-content:flex-end">
          <button class="mini-btn" data-advgo="${i.nav}">${t("adv.go")}</button>
          <button class="mini-btn muted" data-advdis="${i.id}">${t("adv.dismiss")}</button>
        </div>
      </div>`;
    holder.innerHTML = `
      <div class="card">
        <div class="card-title">${t("adv.score.t")}
          <span class="chip accent num">${FMT.num(hp.score, 0)}/100</span></div>
        <div class="list-row"><div class="list-ico">⚖️</div><div class="list-main"><div class="t num">${
          t("adv.score.load", { out: money0(hp.outflow), sal: money0(hp.salary),
            pct: hp.loadRatio !== null ? pct(hp.loadRatio) : "—", pts: FMT.num(hp.loadPts, 0) })}</div></div></div>
        <div class="list-row"><div class="list-ico">🛟</div><div class="list-main"><div class="t num">${
          t("adv.score.buffer", { bal: money0(hp.balance),
            m: hp.bufferMonths !== null ? FMT.num(hp.bufferMonths, 1) : "—", pts: FMT.num(hp.bufferPts, 0) })}</div></div></div>
        <div class="list-row"><div class="list-ico">🎁</div><div class="list-main"><div class="t num">${
          hp.bonus ? t("adv.score.bonus", { pts: FMT.num(hp.bonus, 0) }) : t("adv.score.nobonus")}</div></div></div>
      </div>
      <div class="card">
        <div class="card-title">${t("adv.ask")}</div>
        <p class="hint" style="margin:-8px 0 10px">${t("adv.ask.hint")}</p>
        <div class="field" style="margin-bottom:8px">
          <input id="advQ" placeholder="${t("adv.ask.ph")}" autocomplete="off"></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          ${[1, 2, 3, 4].map(i => `<button class="chip" data-advex="${i}">${t("adv.ex." + i)}</button>`).join("")}
        </div>
        <button class="btn primary" id="advAsk" style="width:100%">${t("adv.ask.btn")}</button>
        <div id="advA" style="margin-top:12px"></div>
      </div>
      ${groups.map(g => g.list.length ? `
        <div class="card-title" style="margin:6px 2px 10px">${t("adv.p" + g.pr)}</div>
        ${g.list.map(insHTML).join("")}` : "").join("")}
      ${!ins.length ? `<div class="empty" style="padding:32px 20px"><div class="art">🌿</div><h3>${t("adv.noInsights")}</h3></div>` : ""}
      ${hidden > 0 ? `<button class="add-dashed" id="advShowHidden">${t("adv.showHidden", { n: FMT.num(hidden, 0) })}</button>` : ""}
      <div class="card">
        <div class="card-title">${t("adv.an.spend")} ${srcChip("actual")}</div>
        ${sp.total > 0 ? `
          <p class="hint num" style="margin:-6px 0 10px">${t("adv.an.spend.total", { m: M(pmn.m),
            amt: money0(sp.total), pct: pmn.outflow > 0 ? pct(sp.total / pmn.outflow) : "—",
            plan: money0(pmn.outflow) })}</p>
          ${sp.rows.slice(0, 3).map(r => `
            <div class="list-row">
              <div class="list-main"><div class="t">${esc(catName(r.categoryId))}</div></div>
              <div class="list-end"><div class="v num">${FMT.money(r.amount)}</div></div>
            </div>`).join("")}`
        : `<p class="hint">${t("adv.an.spend.none")}</p>`}
      </div>
      <div class="card">
        <div class="card-title">${t("adv.an.cash")} ${srcChip("forecast")}</div>
        <p class="hint num" style="margin:-6px 0 0">${t("adv.an.cash.b", {
          min: FMT.money(mn.cum), minM: M(mn.m), max: FMT.money(mx.cum), maxM: M(mx.m),
          n: FMT.num(fc.rows.filter(r => r.net > 0).length, 0) })}</p>
      </div>
      <div class="card">
        <div class="card-title">${t("adv.an.cm")} ${srcChip("planned")}</div>
        <p class="hint num" style="margin:-6px 0 0">${t("adv.an.cm.b", {
          n: FMT.num(st.commitments.filter(c => c.status === "active").length, 0),
          amt: money0(tot.outflow), pct: tot.salary > 0 ? pct(tot.outflow / tot.salary) : "—",
          freed: rel.length ? money0(rel[rel.length - 1].cum) : money0(0),
          m: rel.length ? M(rel[rel.length - 1].end.getMonth()) : "—" })}</p>
      </div>
      <div class="card">
        <div class="card-title">${t("adv.an.fam")} ${srcChip("planned")}</div>
        <p class="hint num" style="margin:-6px 0 0">${t("adv.an.fam.b", {
          staff: money0(staffPlanned), kids: money0(kids), tot: money0(r2(staffPlanned + kids)),
          pct: hp.salary > 0 ? pct((staffPlanned + kids) / hp.salary) : "—" })}</p>
      </div>
      ${st.trips.length ? (() => { const ts = Calc.tripStats(st.trips[0]);
        const un = r2((st.trips[0].items || []).filter(i => !i.paid).reduce((a, i) => a + Calc.safe(i.planned), 0));
        return `
      <div class="card">
        <div class="card-title">${t("adv.an.trip")} ${srcChip("planned")}</div>
        <p class="hint num" style="margin:-6px 0 0">${t("adv.an.trip.b", {
          t: money0(ts.target), p: money0(ts.planned), paid: money0(ts.paid),
          un: money0(un), r: FMT.num(ts.readiness, 0) })}</p>
      </div>`; })() : ""}`;
    const ask = () => {
      const a = answer($("advQ").value);
      $("advA").innerHTML = a ? `
        <div class="list-row"><div class="list-ico">🧠</div>
          <div class="list-main"><div class="t num">${a}</div></div></div>`
      : `
        <div class="list-row"><div class="list-ico">🤔</div>
          <div class="list-main"><div class="t">${t("adv.ask.fallback")}</div>
            <div class="s">${[1, 2, 3, 4].map(i => t("adv.ex." + i)).join(" · ")}</div></div></div>`;
    };
    holder.querySelector("#advAsk").addEventListener("click", ask);
    $("advQ").addEventListener("keydown", (e) => { if (e.key === "Enter") ask(); });
    holder.querySelectorAll("[data-advex]").forEach(b =>
      b.addEventListener("click", () => { $("advQ").value = t("adv.ex." + b.dataset.advex); ask(); }));
    holder.querySelectorAll("[data-advgo]").forEach(b =>
      b.addEventListener("click", () => { Commit.openSection(b.dataset.advgo); refresh(); }));
    holder.querySelectorAll("[data-advdis]").forEach(b =>
      b.addEventListener("click", () => {
        if (!S().advisor.dismissed.includes(b.dataset.advdis))
          S().advisor.dismissed.push(b.dataset.advdis);
        Store.save(); refresh();
      }));
    const sh = holder.querySelector("#advShowHidden");
    if (sh) sh.addEventListener("click", () => {
      S().advisor.dismissed = [];
      Store.save(); refresh();
    });
  };

  return { renderInto, topInsights, count, answer };
})();

/* ============================================================
   MODULE: CLOUD — Supabase auth + snapshot sync (Phase 8)
   Strategy (documented): one state document per user, optimistic
   concurrency on updated_at. Duplicates are impossible by design
   (whole-snapshot replace through the proven import pipeline);
   conflicts are ALWAYS surfaced, never silently overwritten.
   ============================================================ */
const Cloud = (() => {
  const SYNC_KEY = "maliya.sync.v1";
  const DEVICE_KEY = "maliya.device.v1";
  const PREMIG_KEY = "maliya.premigration.v1";
  const CONFLICT_KEY = "maliya.conflictbackup.v1";
  const TABLE = "maliya_state";
  const BK_TABLE = "maliya_backups";
  const t = (k, v) => I18N.t(k, v);
  const $ = (id) => document.getElementById(id);

  let client = null, session = null, status = "local", lastError = null;
  let syncing = false, applying = false, timer = null;

  const cfg = () => (window.MALIYA_CONFIG || {});
  const configured = () => {
    const u = String(cfg().SUPABASE_URL || ""), k = String(cfg().SUPABASE_PUBLISHABLE_KEY || "");
    return !!(u && k && !u.includes("YOUR-") && !k.includes("YOUR-"));
  };
  const online = () => (typeof navigator === "undefined" || navigator.onLine !== false);
  const meta = () => { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; } };
  const setMeta = (patch) => { try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(Object.assign(meta(), patch))); } catch (e) {} };
  const deviceId = () => {
    let d = null; try { d = localStorage.getItem(DEVICE_KEY); } catch (e) {}
    if (!d) { d = Store.uid("dev"); try { localStorage.setItem(DEVICE_KEY, d); } catch (e) {} }
    return d;
  };
  const setStatus = (st, err) => { status = st; lastError = err || null; mount(); };

  const authErr = (e) => {
    const m = String((e && (e.message || e.error_description)) || "");
    if (/invalid|credential/i.test(m)) return t("cl.err.invalid");
    if (/already|exists/i.test(m)) return t("cl.err.exists");
    if (/network|fetch|failed to/i.test(m)) return t("cl.err.net");
    return t("cl.err.generic") + (m ? " — " + m : "");
  };

  /* ---------- client ---------- */
  const makeClient = async () => {
    const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    return mod.createClient(cfg().SUPABASE_URL, cfg().SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: true, autoRefreshToken: true } });
  };
  const init = async () => {
    if (!configured()) { setStatus("local"); return; }
    try { if (!client) client = await makeClient(); }
    catch (e) { setStatus("error", authErr(e)); return; }
    try {
      const res = await client.auth.getSession();
      session = (res && res.data && res.data.session) || null;
      if (client.auth.onAuthStateChange)
        client.auth.onAuthStateChange((_ev, ss) => { session = ss; mount(); if (ss) syncNow(false); });
    } catch (e) { session = null; }
    try {
      window.addEventListener("online", () => { if (session) syncNow(false); else mount(); });
      window.addEventListener("offline", () => setStatus("offline"));
    } catch (e) {}
    if (!session) setStatus(online() ? "signedout" : "offline");
    else await syncNow(false);
  };

  /* ---------- auth ---------- */
  const doAuth = async (kind) => {
    const email = ($("clEmail").value || "").trim();
    const pass = $("clPass").value || "";
    const errBox = $("clAuthErr");
    errBox.textContent = "";
    if (!email || (kind !== "reset" && !pass)) { errBox.textContent = t("cl.err.empty"); return; }
    const btns = ["clSignIn", "clSignUp", "clReset"].map($).filter(Boolean);
    btns.forEach(b => { b.disabled = true; });
    try {
      if (kind === "in") {
        const { data, error } = await client.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        session = data.session || session;
        UI.closeSheet(); mount(); syncNow(false);
      } else if (kind === "up") {
        const { data, error } = await client.auth.signUp({ email, password: pass });
        if (error) throw error;
        if (data && data.session) { session = data.session; UI.closeSheet(); mount(); syncNow(false); }
        else UI.toast(t("cl.signedUp"));
      } else {
        const { error } = await client.auth.resetPasswordForEmail(email);
        if (error) throw error;
        UI.toast(t("cl.resetSent"));
      }
    } catch (e) { errBox.textContent = authErr(e); }
    btns.forEach(b => { b.disabled = false; });
  };
  const openAuth = () => {
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("cl.auth.t")}</h2>
      <p class="hint" style="margin:-8px 0 14px">${t("cl.auth.hint")}</p>
      <div class="field"><label>${t("cl.email")}</label>
        <input id="clEmail" type="email" autocomplete="email" inputmode="email"></div>
      <div class="field"><label>${t("cl.pass")}</label>
        <input id="clPass" type="password" autocomplete="current-password"></div>
      <div class="err" id="clAuthErr" style="display:block;margin-bottom:10px"></div>
      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>
        <button class="btn primary" id="clSignIn">${t("cl.signIn")}</button></div>
      <div class="btn-row">
        <button class="btn subtle" id="clSignUp">${t("cl.signUp")}</button>
        <button class="btn subtle" id="clReset">${t("cl.reset")}</button></div>`;
    $("dynCancel").addEventListener("click", UI.closeSheet);
    $("clSignIn").addEventListener("click", () => doAuth("in"));
    $("clSignUp").addEventListener("click", () => doAuth("up"));
    $("clReset").addEventListener("click", () => doAuth("reset"));
    UI.openSheet("sheetDyn");
  };
  const signOut = async () => {
    try { await client.auth.signOut(); } catch (e) {}
    session = null;
    setStatus("signedout");
  };

  /* ---------- sync core ---------- */
  const snapshotDoc = () => JSON.parse(JSON.stringify(Store.get()));
  const pullRow = async (uid) => {
    const { data, error } = await client.from(TABLE).select("data,updated_at,schema_version")
      .eq("user_id", uid).maybeSingle();
    if (error) throw error;
    return data || null;
  };
  const insertRow = async (uid, doc) => {
    const { error } = await client.from(TABLE).insert({ user_id: uid, data: doc,
      schema_version: doc.meta.schemaVersion, updated_at: doc.meta.updatedAt, device_id: deviceId() });
    if (error) throw error;
  };
  const casUpdate = async (uid, doc, base) => {
    const { data, error } = await client.from(TABLE)
      .update({ data: doc, schema_version: doc.meta.schemaVersion,
        updated_at: doc.meta.updatedAt, device_id: deviceId() })
      .eq("user_id", uid).eq("updated_at", base).select();
    if (error) throw error;
    return !!(data && data.length);
  };
  const markSynced = (base) =>
    setMeta({ dirty: false, lastSyncAt: new Date().toISOString(), baseUpdatedAt: base });
  const adoptCloud = (row) => {
    if (!Store.validateImport(row.data)) throw new Error("invalid cloud document");
    applying = true;
    try { Store.replaceAll(row.data); } finally { applying = false; }
    /* The next CAS must target the row we just adopted — use ITS stamp as
       base, not the local re-stamp, or every later edit reads as a conflict. */
    markSynced(row.updated_at);
    try { App.go("home"); } catch (e) {}
  };
  const countsOf = (doc) => [doc.accounts.length, doc.transactions.length, doc.commitments.length,
    doc.categories.length, (doc.trips || []).length,
    doc.accounts.reduce((a, x) => a + (Number(x.balance) || 0), 0)].join("|");

  const migrateFirst = async (uid, interactive) => {
    if (!interactive) { setStatus("pending"); return "pending"; }
    const okc = await UI.confirm({ title: t("cl.mig.t"), body: t("cl.mig.b"), yes: t("cl.mig.y") });
    if (!okc) { setStatus("pending"); return "pending"; }
    const doc = snapshotDoc();
    try { if (!localStorage.getItem(PREMIG_KEY)) localStorage.setItem(PREMIG_KEY, JSON.stringify(doc)); } catch (e) {}
    try { await insertRow(uid, doc); }
    catch (e) {
      /* row already exists (repeat/race) → treat as normal sync, never duplicate */
      const again = await pullRow(uid);
      if (again) return "exists";
      throw e;
    }
    const back = await pullRow(uid);
    if (!back || countsOf(back.data) !== countsOf(doc)) {
      try { await client.from(TABLE).delete().eq("user_id", uid); } catch (e) {}
      setStatus("error", t("cl.mig.fail"));
      return "failed";
    }
    markSynced(doc.meta.updatedAt);
    setMeta({ migrated: true });
    UI.toast(t("cl.mig.ok"));
    return "ok";
  };

  const conflictPrompt = () => new Promise((resolve) => {
    const sheet = $("sheetDyn");
    sheet.innerHTML = `
      <div class="grab"></div><h2>${t("cl.conf.t")}</h2>
      <p class="hint" style="margin:-8px 0 14px">${t("cl.conf.b")}</p>
      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn primary" id="clKeepCloud">${t("cl.conf.cloud")}</button></div>
      <div class="btn-row" style="margin-bottom:10px">
        <button class="btn subtle" id="clKeepLocal">${t("cl.conf.local")}</button></div>
      <button class="btn subtle" id="dynCancel">${t("common.cancel")}</button>`;
    const done = (v) => { UI.closeSheet(); resolve(v); };
    $("clKeepCloud").addEventListener("click", () => done("cloud"));
    $("clKeepLocal").addEventListener("click", () => done("local"));
    $("dynCancel").addEventListener("click", () => done(null));
    UI.openSheet("sheetDyn");
  });

  const syncNow = async (interactive = true) => {
    if (!configured()) { setStatus("local"); return "local"; }
    if (!client) { setStatus("error", t("cl.err.net")); return "error"; }
    if (!session) { setStatus("signedout"); return "signedout"; }
    if (!online()) { setStatus("offline"); return "offline"; }
    if (syncing) return "busy";
    syncing = true;
    setStatus("syncing");
    try {
      const uid = session.user.id;
      let cloud = await pullRow(uid);
      if (!cloud) {
        const r = await migrateFirst(uid, interactive);
        if (r === "pending" || r === "failed") { syncing = false; return r; }
        if (r === "exists") cloud = await pullRow(uid);
        else { setStatus("synced"); syncing = false; return "synced"; }
      }
      const m = meta();
      const doc = snapshotDoc();
      const dirty = !!m.dirty;
      const base = m.baseUpdatedAt || null;
      const cloudNewer = !base || (cloud.updated_at && String(cloud.updated_at) > String(base));
      if (!dirty) {
        if (cloudNewer && cloud.updated_at !== doc.meta.updatedAt) adoptCloud(cloud);
        else markSynced(cloud.updated_at);
        setStatus("synced");
      } else if (!cloudNewer) {
        const okp = await casUpdate(uid, doc, cloud.updated_at);
        if (okp) { markSynced(doc.meta.updatedAt); setStatus("synced"); }
        else { setStatus("conflict"); syncing = false; return interactive ? await resolveConflict(uid) : "conflict"; }
      } else {
        setStatus("conflict");
        syncing = false;
        return interactive ? await resolveConflict(uid) : "conflict";
      }
      syncing = false;
      return "synced";
    } catch (e) {
      syncing = false;
      setStatus("error", authErr(e));
      return "error";
    }
  };

  const resolveConflict = async (uid) => {
    const choice = await conflictPrompt();
    if (!choice) return "conflict";
    const cloud = await pullRow(uid);
    if (!cloud) return syncNow(true);
    if (choice === "cloud") {
      try { localStorage.setItem(CONFLICT_KEY, JSON.stringify(snapshotDoc())); } catch (e) {}
      adoptCloud(cloud);
      setStatus("synced");
      UI.toast(t("cl.applied.cloud"));
      return "synced";
    }
    const doc = snapshotDoc();
    const okp = await casUpdate(uid, doc, cloud.updated_at);
    if (okp) { markSynced(doc.meta.updatedAt); setStatus("synced"); UI.toast(t("cl.applied.local")); return "synced"; }
    return resolveConflict(uid);
  };

  const backupToCloud = async () => {
    if (!client || !session) return;
    try {
      const { error } = await client.from(BK_TABLE).insert({ user_id: session.user.id, data: snapshotDoc() });
      if (error) throw error;
      UI.toast(t("cl.backupCloud.ok"));
    } catch (e) { UI.toast(authErr(e)); }
  };

  /* Store.save() hook — mark dirty and debounce an automatic push. */
  const onLocalSave = () => {
    if (applying) return;
    setMeta({ dirty: true });
    if (!configured() || !session || !online()) return;
    clearTimeout(timer);
    timer = setTimeout(() => syncNow(false), 1500);
  };

  /* ---------- UI card in "More" ---------- */
  const statusChip = () => {
    const cls = status === "synced" ? "ok" : (status === "error" || status === "conflict") ? "danger"
      : status === "syncing" ? "accent" : status === "offline" ? "warn" : "";
    return `<span class="chip ${cls}">${t("cl.st." + status)}</span>`;
  };
  const mount = () => {
    const host = document.getElementById("cloudMount");
    if (!host) return;
    const m = meta();
    const last = m.lastSyncAt ? FMT.date(m.lastSyncAt) : t("cl.never");
    if (!configured()) {
      host.innerHTML = `
        <div class="card">
          <div class="card-title">${t("cl.title")} ${statusChip()}</div>
          <div class="list-row"><div class="list-ico">☁️</div>
            <div class="list-main"><div class="t">${t("cl.notCfg.t")}</div>
              <div class="s">${t("cl.notCfg.b")}</div></div></div>
        </div>`;
      return;
    }
    host.innerHTML = `
      <div class="card">
        <div class="card-title">${t("cl.title")} ${statusChip()}</div>
        ${session ? `<p class="hint num" style="margin:-6px 0 10px">${(session.user && session.user.email) || ""} · ${t("cl.lastSync", { t: last })}</p>` : ""}
        ${lastError ? `<p class="hint" style="color:var(--danger);margin:-4px 0 10px">${lastError}</p>` : ""}
        <div class="btn-row" style="margin-bottom:10px">
          ${session ? `
            <button class="btn primary" id="clSync">${status === "pending" ? t("cl.mig.pendingBtn") : t("cl.syncNow")}</button>
            <button class="btn subtle" id="clOut">${t("cl.signOut")}</button>`
          : `<button class="btn primary" id="clIn">${t("cl.signIn")}</button>`}
        </div>
        ${session ? `<button class="btn subtle" id="clBk" style="width:100%">${t("cl.backupCloud")}</button>` : ""}
      </div>`;
    const on = (id, fn) => { const b = $(id); if (b) b.addEventListener("click", fn); };
    on("clSync", () => syncNow(true));
    on("clOut", signOut);
    on("clIn", openAuth);
    on("clBk", backupToCloud);
  };

  return { init, mount, syncNow, onLocalSave, openAuth, signOut, backupToCloud,
    status: () => status, meta,
    _test: { setClient: (c) => { client = c; }, setSession: (ss) => { session = ss; },
             configuredOverride: null } };
})();

/* ============================================================
   MODULE: REPORTS — summaries, CSV, print (Phase 8)
   ============================================================ */
const Reports = (() => {
  const { esc } = Views;
  const t = (k, v) => I18N.t(k, v);
  const r2 = (n) => Math.round(Calc.safe(n) * 100) / 100;
  let offset = 0;

  const monthTx = (st, off) => {
    const t0 = Calc.today();
    const ref = new Date(t0.getFullYear(), t0.getMonth() + off, 1);
    const y = ref.getFullYear(), mth = ref.getMonth();
    const stDay = st.settings.monthStart || 1;
    const a = new Date(y, mth, stDay), b = new Date(y, mth + 1, stDay);
    return { y, m: mth, list: st.transactions.filter(x => {
      if (x.status !== "paid" || !x.date) return false;
      const dx = Calc.parseISO(x.date);
      return dx && dx >= a && dx < b;
    }) };
  };
  const sums = (list) => {
    let inc = 0, out = 0;
    for (const x of list) {
      if (x.kind === "income") inc += Calc.safe(x.amount);
      else if (x.kind === "expense") out += Calc.safe(x.amount);
    }
    return { inc: r2(inc), out: r2(out), net: r2(inc - out) };
  };

  const csvExport = (st, list, label) => {
    const accName = (id) => (st.accounts.find(a => a.id === id) || {}).name || "";
    const catName = (id) => (st.categories.find(c => c.id === id) || {}).name || "";
    const esc2 = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const head = ["id", "date", "kind", "name", "amount", "account", "category", "status"];
    const rows = list.map(x => [x.id, x.date, x.kind, x.name, x.amount,
      accName(x.accountId), catName(x.categoryId), x.status].map(esc2).join(","));
    const csv = "\ufeff" + head.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `maliya-${label}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    return rows.length;
  };

  const mount = () => {
    const host = document.getElementById("reportsMount");
    if (!host) return;
    const st = Store.get();
    const { y, m, list } = monthTx(st, offset);
    const s = sums(list);
    /* annual (calendar year of the shown month) */
    const yearList = st.transactions.filter(x => {
      if (x.status !== "paid" || !x.date) return false;
      const dx = Calc.parseISO(x.date);
      return dx && dx.getFullYear() === y;
    });
    const ys = sums(yearList);
    const cats = Calc.spendingByCategory(st, offset);
    const catName = (id) => (st.categories.find(c => c.id === id) || {}).name || "غير مصنف";
    const act = st.commitments.filter(c => c.status === "active");
    const cmPaid = r2(list.filter(x => x.commitmentId).reduce((a, x) => a + Calc.safe(x.amount), 0));
    const staffYear = r2(yearList.filter(x => x.categoryId === "cat_staff" && x.kind === "expense")
      .reduce((a, x) => a + Calc.safe(x.amount), 0));
    const kids = r2(st.commitments.filter(c => c.childId && c.status === "active")
      .reduce((a, c) => a + Calc.safe(c.amount), 0));
    host.innerHTML = `
      <div class="card" id="repCard">
        <div class="card-title">${t("rep.title")}</div>
        <div class="row" style="margin-bottom:10px">
          <button class="chip" id="repPrev">‹</button>
          <div style="font-weight:850" class="num">${FMT.monthName(m)} ${FMT.num(y, 0)}</div>
          <button class="chip" id="repNext">›</button>
        </div>
        <div class="card-title">${t("rep.month")}
          <span class="chip num">${t("rep.txCount", { n: FMT.num(list.length, 0) })}</span></div>
        ${list.length ? `
        <div class="detail-grid">
          <div class="cell"><div class="k">${t("rep.in")}</div><div class="v num">${FMT.money(s.inc)}</div></div>
          <div class="cell"><div class="k">${t("rep.out")}</div><div class="v num">${FMT.money(s.out)}</div></div>
          <div class="cell"><div class="k">${t("rep.net")}</div><div class="v num" style="color:${s.net >= 0 ? "var(--ok)" : "var(--danger)"}">${FMT.money(s.net)}</div></div>
        </div>
        ${cats.rows.length ? `<div class="card-title">${t("rep.cats")}</div>
          ${cats.rows.slice(0, 6).map(r => `
            <div class="list-row">
              <div class="list-main"><div class="t">${esc(catName(r.categoryId))}</div></div>
              <div class="list-end"><div class="v num">${FMT.money(r.amount)}</div></div>
            </div>`).join("")}` : ""}`
        : `<p class="hint">${t("rep.empty")}</p>`}
        <div class="card-title" style="margin-top:8px">${t("rep.year", { y: FMT.num(y, 0) })}
          <span class="chip num">${t("rep.txCount", { n: FMT.num(yearList.length, 0) })}</span></div>
        <div class="detail-grid">
          <div class="cell"><div class="k">${t("rep.in")}</div><div class="v num">${FMT.money(ys.inc)}</div></div>
          <div class="cell"><div class="k">${t("rep.out")}</div><div class="v num">${FMT.money(ys.out)}</div></div>
          <div class="cell"><div class="k">${t("rep.net")}</div><div class="v num">${FMT.money(ys.net)}</div></div>
        </div>
        <p class="hint num" style="margin:0 0 6px">${t("rep.cm")}: ${t("rep.cm.b", {
          n: FMT.num(act.length, 0), amt: FMT.money(Calc.totals(st).outflow, 0), paid: FMT.money(cmPaid, 0) })}</p>
        <p class="hint num" style="margin:0 0 6px">${t("rep.fam")}: ${t("rep.fam.b", {
          staff: FMT.money(staffYear, 0), kids: FMT.money(kids, 0) })}</p>
        ${st.trips.length ? (() => { const ts = Calc.tripStats(st.trips[0]); return `
        <p class="hint num" style="margin:0 0 10px">${t("rep.trip")}: ${t("rep.trip.b", {
          name: esc(st.trips[0].name), paid: FMT.money(ts.paid, 0), t: FMT.money(ts.target, 0),
          r: FMT.num(ts.readiness, 0) })}</p>`; })() : ""}
        <div class="btn-row">
          <button class="btn subtle" id="repCsv">${t("rep.csv")}</button>
          <button class="btn subtle" id="repPrint">${t("rep.print")}</button>
        </div>
        <p class="hint" style="margin-top:8px">${t("rep.print.hint")}</p>
      </div>`;
    const on = (id, fn) => { const b = document.getElementById(id); if (b) b.addEventListener("click", fn); };
    on("repPrev", () => { offset--; mount(); });
    on("repNext", () => { offset++; mount(); });
    on("repCsv", () => csvExport(st, list, `${y}-${String(m + 1).padStart(2, "0")}`));
    on("repPrint", () => { try { window.print(); } catch (e) {} });
  };

  return { mount, _test: { csvExport, monthTx, sums } };
})();

/* ============================================================
   MODULE: APP — navigation, settings bindings, boot
   ============================================================ */
const App = (() => {
  const $ = (id) => document.getElementById(id);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  /* ---- theme ---- */
  const effectiveTheme = () => {
    const pref = Store.settings.theme;
    return pref === "system" ? (mq.matches ? "dark" : "light") : pref;
  };
  const applyTheme = () => {
    document.documentElement.dataset.theme = effectiveTheme();
    document.documentElement.dataset.accent = Store.settings.accent;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = effectiveTheme() === "dark" ? "#0C0E12" : "#F4F5F7";
  };
  mq.addEventListener("change", () => { if (Store.settings.theme === "system") { applyTheme(); } });

  /* ---- navigation ---- */
  const go = (view) => {
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + view));
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    if (view === "home") Views.renderHome();
    else if (view === "money") Money.render();
    else if (view === "plan") Commit.render();
    try { window.scrollTo({ top: 0 }); } catch (_) {}
  };

  /* ---- settings bindings ---- */
  const syncSettingsUI = () => {
    const s = Store.settings;
    $("setLang").value = s.lang;
    $("setNumerals").value = s.numerals;
    $("setDateFmt").value = s.dateFmt;
    $("setCurrency").value = s.currency;
    $("setSalaryDay").value = s.salaryDay;
    $("setMonthStart").value = s.monthStart;
    document.querySelectorAll("#segTheme button").forEach(b =>
      b.classList.toggle("active", b.dataset.val === s.theme));
    document.querySelectorAll("#swatches .swatch").forEach(b =>
      b.classList.toggle("active", b.dataset.val === s.accent));
    $("versionLine").textContent = I18N.t("version", { v: Store.get().meta.appVersion });
    try { Cloud.mount(); Reports.mount(); } catch (e) { /* first paint */ }
  };

  const applySettings = () => {
    I18N.setLang(Store.settings.lang);
    applyTheme();
    syncSettingsUI();
    renderTopbarDate();
    Views.renderHome();
    if (document.getElementById("view-money").classList.contains("active")) Money.render();
    if (document.getElementById("view-plan").classList.contains("active")) Commit.render();
  };

  const renderTopbarDate = () => {
    const d = new Date();
    $("topbarDate").textContent = FMT.monthName(d.getMonth()) + " " + FMT.num(d.getFullYear(), 0);
  };

  const clampInt = (v, min, max, fallback) => {
    const n = Math.round(Number(v));
    if (!isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  };

  const bind = () => {
    /* nav */
    document.querySelectorAll(".nav-item").forEach(b =>
      b.addEventListener("click", () => go(b.dataset.view)));

    /* quick theme toggle in the top bar (persists the choice) */
    $("themeQuick").addEventListener("click", () => {
      Store.settings.theme = effectiveTheme() === "dark" ? "light" : "dark";
      Store.save(); applyTheme(); syncSettingsUI();
    });

    /* theme segment */
    document.querySelectorAll("#segTheme button").forEach(b =>
      b.addEventListener("click", () => {
        Store.settings.theme = b.dataset.val; Store.save();
        applyTheme(); syncSettingsUI();
      }));

    /* accent swatches */
    document.querySelectorAll("#swatches .swatch").forEach(b =>
      b.addEventListener("click", () => {
        Store.settings.accent = b.dataset.val; Store.save();
        applyTheme(); syncSettingsUI();
      }));

    /* language & formats */
    $("setLang").addEventListener("change", e => {
      Store.settings.lang = e.target.value; Store.save(); applySettings();
    });
    $("setNumerals").addEventListener("change", e => {
      Store.settings.numerals = e.target.value; Store.save(); applySettings();
    });
    $("setDateFmt").addEventListener("change", e => {
      Store.settings.dateFmt = e.target.value; Store.save(); Views.renderHome();
    });
    $("setCurrency").addEventListener("change", e => {
      Store.settings.currency = e.target.value; Store.save(); Views.renderHome();
      UI.toast(I18N.t("toast.saved"));
    });
    $("setSalaryDay").addEventListener("change", e => {
      Store.settings.salaryDay = clampInt(e.target.value, 1, 31, 27);
      e.target.value = Store.settings.salaryDay; Store.save();
      UI.toast(I18N.t("toast.saved"));
    });
    $("setMonthStart").addEventListener("change", e => {
      Store.settings.monthStart = clampInt(e.target.value, 1, 28, 1);
      e.target.value = Store.settings.monthStart; Store.save();
      UI.toast(I18N.t("toast.saved"));
    });

    /* backup */
    $("btnExport").addEventListener("click", Backup.exportJSON);
    $("btnImport").addEventListener("click", () => $("fileImport").click());
    $("fileImport").addEventListener("change", e => {
      const f = e.target.files && e.target.files[0];
      if (f) Backup.importFromFile(f);
      e.target.value = "";
    });
    $("btnReset").addEventListener("click", async () => {
      const ok = await UI.confirm({
        title: I18N.t("confirm.reset.t"),
        body: I18N.t("confirm.reset.b"),
        yes: I18N.t("confirm.reset.y")
      });
      if (!ok) return;
      Store.resetAll(); applySettings();
      UI.toast(I18N.t("toast.reset"));
    });

    /* quick add sheet */
    $("fabAdd").addEventListener("click", () => UI.openSheet("sheetQuick"));
    $("qaExpense").addEventListener("click", () => { UI.closeSheet(); Money.openTxForm(null, "expense"); });
    $("qaIncome").addEventListener("click", () => { UI.closeSheet(); Money.openTxForm(null, "income"); });
    $("qaTransfer").addEventListener("click", () => { UI.closeSheet(); Money.openTransferForm(null); });
    $("qaBackup").addEventListener("click", () => { UI.closeSheet(); Backup.exportJSON(); });
    $("qaBalance").addEventListener("click", () => {
      const sel = $("balAccount");
      sel.innerHTML = Store.get().accounts.filter(a => !a.archived)
        .map(a => `<option value="${a.id}">${a.name}</option>`).join("");
      const acc = Store.get().accounts.find(a => a.id === sel.value);
      $("balAmount").value = acc ? acc.balance : "";
      $("fieldBalAmount").classList.remove("invalid");
      UI.openSheet("sheetBalance");
    });
    $("balAccount").addEventListener("change", e => {
      const acc = Store.get().accounts.find(a => a.id === e.target.value);
      if (acc) $("balAmount").value = acc.balance;
    });
    $("balCancel").addEventListener("click", UI.closeSheet);
    $("balSave").addEventListener("click", () => {
      /* Accept "14,100.50" or Arabic-Indic digits; reject anything else. */
      const raw = String($("balAmount").value).trim()
        .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
        .replace(/[،,]/g, "");
      const n = Number(raw);
      if (raw === "" || !isFinite(n)) {
        $("fieldBalAmount").classList.add("invalid"); return;
      }
      const acc = Store.get().accounts.find(a => a.id === $("balAccount").value);
      if (!acc) { UI.closeSheet(); return; }
      acc.balance = Math.round(n * 100) / 100;
      Store.save();
      UI.closeSheet();
      Views.renderHome();
      UI.toast(I18N.t("toast.saved"));
    });
  };

  const boot = () => {
    /* Phase 8: cloud + PWA (both fail safe when unavailable) */
    setTimeout(() => {
      try { Cloud.init(); } catch (e) {}
      try {
        if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
          navigator.serviceWorker.register("./service-worker.js").then(reg => {
            reg.addEventListener("updatefound", () => {
              const nw = reg.installing;
              if (nw) nw.addEventListener("statechange", () => {
                if (nw.state === "installed" && navigator.serviceWorker.controller)
                  UI.toast(I18N.t("cl.updateReady"));
              });
            });
          }).catch(() => {});
      } catch (e) {}
    }, 0);
    Store.load();
    bind();
    applySettings();
    go("home");
  };

  return { boot, applySettings, go };
})();

document.addEventListener("DOMContentLoaded", App.boot);
