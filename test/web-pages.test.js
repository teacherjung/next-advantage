// 為什麼：守護雙網頁（研究總覽頁與 OMO PBL 創業頁）的 HTML/CSS 結構與靜態資源接線、頂層啟動與雙頁初始化、試算公式確切數值、六維度診斷一致性、剪貼簿回退、證據分級標示與驗收路由。
// 守到哪裡（擋不住什麼）：擋不住真實瀏覽器排版像素細節與視覺美感（視覺畫面已依 E10 由擁有者過目定案）。
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  MOAT_PRESETS,
  MATRIX_CASES,
  AGE_PLANS,
  INFO_DOCS,
  PBL_MODULES,
  calculateMoatScore,
  calculateUnitEconomics,
  openCaseModal,
  openMoatReportModal,
  openEconDetailModal
} = require('../web/app.js');

const ROOT = path.join(__dirname, '..');

function extractCssBlock(css, selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`${esc}\\s*\\{([^}]*)\\}`, 'm'));
  return m ? m[1] : '';
}

function extractAssetRefs(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
  const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*\bhref="([^"]+)"/g)].map((m) => m[1]);
  return { scripts, styles };
}

function createFakeDom() {
  const elementsById = new Map();
  const allElements = [];
  const docListeners = {};

  function makeClassList(initial = []) {
    const set = new Set(initial.filter(Boolean));
    return {
      add: (...cls) => cls.forEach((c) => set.add(c)),
      remove: (...cls) => cls.forEach((c) => set.delete(c)),
      contains: (c) => set.has(c),
      toggle: (c, force) => {
        const shouldAdd = force === undefined ? !set.has(c) : Boolean(force);
        if (shouldAdd) set.add(c);
        else set.delete(c);
        return shouldAdd;
      }
    };
  }

  function makeEl(tag, attrs = {}, classes = []) {
    const listeners = {};
    const children = [];
    const el = {
      tagName: tag.toUpperCase(),
      id: attrs.id || '',
      value: attrs.value !== undefined ? String(attrs.value) : '',
      textContent: attrs.textContent || '',
      _innerHTML: '',
      style: {},
      parentNode: null,
      children,
      classList: makeClassList(classes),
      getAttribute: (name) => (name in attrs ? String(attrs[name]) : null),
      setAttribute: (name, val) => {
        attrs[name] = String(val);
        if (name === 'id') {
          el.id = String(val);
          elementsById.set(el.id, el);
        }
      },
      addEventListener: (ev, fn) => {
        listeners[ev] = listeners[ev] || [];
        listeners[ev].push(fn);
      },
      dispatchEvent: async (ev, payload = {}) => {
        const list = listeners[ev] || [];
        for (const fn of list) {
          await fn({ target: el, preventDefault() {}, ...payload });
        }
      },
      click: async () => {
        await el.dispatchEvent('click');
      },
      focus: () => {
        doc.activeElement = el;
      },
      select: () => {
        el._selected = true;
      },
      scrollIntoView: () => {
        el._scrolled = true;
      },
      appendChild: (child) => {
        child.parentNode = el;
        children.push(child);
        return child;
      },
      remove: () => {
        if (el.parentNode) {
          const idx = el.parentNode.children.indexOf(el);
          if (idx >= 0) el.parentNode.children.splice(idx, 1);
          el.parentNode = null;
        }
      },
      querySelector: (sel) => el.querySelectorAll(sel)[0] || null,
      querySelectorAll: (sel) => {
        const results = [];
        const visit = (node) => {
          for (const ch of node.children || []) {
            if (matchesSelector(ch, sel)) results.push(ch);
            visit(ch);
          }
        };
        visit(el);
        return results;
      }
    };

    Object.defineProperty(el, 'innerHTML', {
      get() {
        return el._innerHTML;
      },
      set(val) {
        el._innerHTML = String(val);
        children.length = 0;
        parseSimpleNodes(String(val), el);
      }
    });

    if (el.id) elementsById.set(el.id, el);
    allElements.push(el);
    return el;
  }

  function matchesSelector(node, sel) {
    if (sel === 'input, select') {
      return node.tagName === 'INPUT' || node.tagName === 'SELECT';
    }
    if (sel === 'input[type="range"]') {
      return node.tagName === 'INPUT' && node.getAttribute('type') === 'range';
    }
    if (sel.startsWith('#')) return node.id === sel.slice(1);
    if (sel.startsWith('.')) return node.classList.contains(sel.slice(1));
    const attrMatch = sel.match(/^\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]$/);
    if (attrMatch) {
      const val = node.getAttribute(attrMatch[1]);
      if (val === null) return false;
      return attrMatch[2] === undefined ? true : val === attrMatch[2];
    }
    if (sel === 'input, select, textarea, button[data-close], .x-close') {
      return node.getAttribute('data-close') !== null || node.classList.contains('x-close');
    }
    return false;
  }

  function parseSimpleNodes(html, parent) {
    const tagRegex = /<(button|div|input)([^>]*)>([\s\S]*?)<\/\1>|<(input)([^>]*)\/?>/g;
    let m;
    while ((m = tagRegex.exec(html)) !== null) {
      const tag = m[1] || m[4];
      const attrStr = m[2] || m[5] || '';
      const inner = m[3] || '';
      const attrs = {};
      const classes = [];
      const attrRe = /([a-zA-Z0-9_-]+)(?:="([^"]*)")?/g;
      let am;
      while ((am = attrRe.exec(attrStr)) !== null) {
        const k = am[1];
        const v = am[2] !== undefined ? am[2] : '';
        if (k === 'class') {
          v.split(/\s+/).filter(Boolean).forEach((c) => classes.push(c));
        } else {
          attrs[k] = v;
        }
      }
      attrs.textContent = inner.replace(/<[^>]+>/g, '').trim();
      const child = makeEl(tag, attrs, classes);
      parent.appendChild(child);
      if (inner && /<(button|div|input)/.test(inner)) {
        parseSimpleNodes(inner, child);
      }
    }
  }

  const doc = {
    activeElement: null,
    body: makeEl('body'),
    addEventListener: (ev, fn) => {
      docListeners[ev] = docListeners[ev] || [];
      docListeners[ev].push(fn);
    },
    removeEventListener: () => {},
    getElementById: (id) => elementsById.get(id) || null,
    createElement: (tag) => makeEl(tag),
    querySelector: (sel) => doc.querySelectorAll(sel)[0] || null,
    querySelectorAll: (sel) => allElements.filter((el) => matchesSelector(el, sel)),
    _listeners: docListeners,
    _makeEl: makeEl
  };

  return doc;
}

test('雙網頁 HTML、script/stylesheet 實際接線、理財專案樣式規則、證據分級標示與專案設定驗收路由皆符合規範', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'web', 'index.html'), 'utf8');
  const ventureHtml = fs.readFileSync(path.join(ROOT, 'web', 'venture.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(ROOT, 'web', 'styles.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(ROOT, 'web', 'app.js'), 'utf8');
  const phase2Doc = fs.readFileSync(path.join(ROOT, 'docs', 'phase-2-pbl-omo-research.md'), 'utf8');
  const settings = JSON.parse(fs.readFileSync(path.join(ROOT, 'settings.json'), 'utf8'));

  for (const [pageName, html] of [['web/index.html', indexHtml], ['web/venture.html', ventureHtml]]) {
    const refs = extractAssetRefs(html);
    assert.deepEqual(
      refs.scripts,
      ['app.js'],
      `${pageName} 必須載入且僅載入存在的 app.js：請檢查 ${pageName} 的 <script src="app.js">，修妥後重跑 node --test test/web-pages.test.js`
    );
    assert.deepEqual(
      refs.styles,
      ['styles.css'],
      `${pageName} 必須載入存在的 styles.css：請檢查 ${pageName} 的 <link rel="stylesheet" href="styles.css">，修妥後重跑 node --test test/web-pages.test.js`
    );
    for (const relAsset of [...refs.scripts, ...refs.styles]) {
      assert.ok(
        fs.existsSync(path.join(ROOT, 'web', relAsset)),
        `${pageName} 引用的靜態資源 web/${relAsset} 不存在：請檢查檔案路徑，修妥後重跑 node --test test/web-pages.test.js`
      );
    }
  }

  assert.ok(
    stylesCss.includes('--bg: #fbf2dc') && stylesCss.includes('.modal-bg') && stylesCss.includes('.workspace-tabs') && stylesCss.includes('.forest-scene-summary'),
    '樣式表缺少理財專案暖米色底色、跳窗或分頁樣式：請檢查 web/styles.css，修妥後重跑 node --test test/web-pages.test.js'
  );

  const hiddenBlock = extractCssBlock(stylesCss, '.hidden');
  assert.match(
    hiddenBlock,
    /display\s*:\s*none\s*!important/,
    '.hidden 必須維持 display: none !important 以免隱藏分頁失效：請檢查 web/styles.css 的 .hidden，修妥後重跑 node --test test/web-pages.test.js'
  );

  const modalBgBlock = extractCssBlock(stylesCss, '.modal-bg');
  const modalBlock = extractCssBlock(stylesCss, '.modal');
  assert.ok(
    modalBgBlock.includes('display: grid') && !/visibility\s*:\s*hidden/.test(modalBgBlock) && !/display\s*:\s*none/.test(modalBgBlock) && !/visibility\s*:\s*hidden/.test(modalBlock) && !/display\s*:\s*none/.test(modalBlock),
    '跳窗樣式 .modal-bg 或 .modal 不可含 visibility: hidden 或 display: none：請檢查 web/styles.css，修妥後重跑 node --test test/web-pages.test.js'
  );

  assert.equal(
    [...indexHtml.matchAll(/href="venture\.html"/g)].length,
    4,
    '研究網頁應包含全部 4 處指向 venture.html 的跨頁入口連結：請檢查 web/index.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.equal(
    [...ventureHtml.matchAll(/href="index\.html"/g)].length,
    3,
    '創業網頁應包含全部 3 處指向 index.html 的跨頁入口連結：請檢查 web/venture.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  for (const reqId of [
    'matrix-detail',
    'moat-calc-form',
    'moat-physical',
    'moat-trust',
    'moat-switching',
    'moat-network',
    'moat-aiLeverage',
    'moat-rentFreedom',
    'calc-anti-ai',
    'calc-moat-score',
    'calc-quadrant',
    'calc-verdict',
    'modal-root',
    'toast-root'
  ]) {
    assert.ok(
      indexHtml.includes(`id="${reqId}"`),
      `研究網頁缺少必要 DOM ID #${reqId}：請檢查 web/index.html，修妥後重跑 node --test test/web-pages.test.js`
    );
  }
  for (const reqId of [
    'lens-parent',
    'lens-founder',
    'unit-econ-form',
    'sim-students',
    'sim-classes',
    'sim-fee',
    'sim-venue',
    'sim-ai',
    'out-total-students',
    'out-revenue',
    'out-profit',
    'out-margin',
    'out-hours',
    'out-saved-hours',
    'modal-root',
    'toast-root'
  ]) {
    assert.ok(
      ventureHtml.includes(`id="${reqId}"`),
      `創業網頁缺少必要 DOM ID #${reqId}：請檢查 web/venture.html，修妥後重跑 node --test test/web-pages.test.js`
    );
  }
  assert.ok(
    indexHtml.includes('data-moat-preset="swSystem"'),
    '研究網頁缺少垂直軟體系統預設鈕：請檢查 web/index.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    ventureHtml.includes('場地佔比 13.2%｜損益兩平：8 人') &&
      ventureHtml.includes('17.6%') &&
      ventureHtml.includes('【待驗證假設】作品集轉換成本') &&
      ventureHtml.includes('課程完成率 &gt;90%、學期續費率 &gt;75%、轉介紹獲客佔比 &gt;50%') &&
      !ventureHtml.includes('完課率不到 15%'),
    '創業網頁缺少正確初始場地佔比與損平人數（13.2% / 8 人）、6 人班 17.6% 說明、比較表待驗證假設標示，或仍殘留未附來源之完課率百分比：請檢查 web/venture.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    phase2Doc.includes('四大不可替代能力組合') &&
      phase2Doc.includes('【待驗證假設') &&
      phase2Doc.includes('13.2%') &&
      phase2Doc.includes('17.6%') &&
      phase2Doc.includes('抽樣橫斷面問卷調查') &&
      phase2Doc.includes('待 MVP 驗證完成率 >90%、續費率 >75% 與轉介紹 >50%') &&
      indexHtml.includes('僅觸及全球約 1/4 學生') &&
      indexHtml.includes('補充而非取代師生面對面互動') &&
      !indexHtml.includes('90% 只會用 AI') &&
      MATRIX_CASES['sw-exec'].aiImpact.includes('95 名開發者單一任務實驗') &&
      MATRIX_CASES['sw-exec'].aiImpact.includes('【合理推論】') &&
      MATRIX_CASES['school-elite'].aiImpact.includes('僅觸及全球約 1/4 學生，並建議數位科技應補充而非取代師生面對面互動') &&
      INFO_DOCS['evidence-sw'].body.includes('預測 2024 年') &&
      INFO_DOCS['evidence-school'].body.includes('僅觸及（reached）全球約四分之一（約 25%）的學生') &&
      INFO_DOCS['evidence-school'].body.includes('並非教學有效參與率') &&
      INFO_DOCS['evidence-school'].body.includes('補充、而非取代師生面對面的人際互動') &&
      !INFO_DOCS['evidence-school'].body.includes('真正有效參與') &&
      INFO_DOCS['evidence-fnb'].body.includes('【已知事實】') &&
      INFO_DOCS['evidence-fnb'].body.includes('【合理推論】') &&
      INFO_DOCS['evidence-pbl'].body.includes('抽樣橫斷面問卷調查') &&
      INFO_DOCS['evidence-pbl'].body.includes('並非直接測量課外 6〜8 人小班') &&
      INFO_DOCS['destination-venue'].body.includes('13.2%') &&
      INFO_DOCS['destination-venue'].body.includes('17.6%'),
    '研究報告或實證跳窗缺少待驗證假設標示、GitClear 2024 預測、UNESCO 平台觸及率與政策建議區分、Lucas/OECD 研究限制或場地佔比成立條件：請檢查 docs/phase-2-pbl-omo-research.md、web/index.html 與 web/app.js，修妥後重跑 node --test test/web-pages.test.js'
  );

  const combinedContent = [indexHtml, ventureHtml, appJs, phase2Doc].join('\n');
  for (const forbiddenPhrase of ['25%~35%', '25%〜35%', '抽成 30%', '初階職缺大幅縮減', '完課率不到 15%', '90% 只會用 AI']) {
    assert.ok(
      !combinedContent.includes(forbiddenPhrase),
      `雙網頁、app.js 或第二階段研究報告不可殘留未附一手來源之敘述「${forbiddenPhrase}」：請檢查 web/ 與 docs/phase-2-pbl-omo-research.md，修妥後重跑 node --test test/web-pages.test.js`
    );
  }

  const matchAcceptanceTier = (filePath) => {
    for (const fam of settings.acceptance.families || []) {
      if (new RegExp(fam.pattern).test(filePath)) return fam.tier;
    }
    return null;
  };
  assert.equal(
    matchAcceptanceTier('web/index.html'),
    '畫面驗收',
    'web/ 路徑必須在 settings.json 路由至「畫面驗收」：請檢查 settings.json 的 acceptance.families，修妥後重跑 node tools/build-settings.js 與 node --test test/web-pages.test.js'
  );
  assert.equal(
    matchAcceptanceTier('docs/phase-2-pbl-omo-research.md'),
    '文件檢視',
    'docs/ 路徑必須在 settings.json 路由至「文件檢視」：請檢查 settings.json 的 acceptance.families，修妥後重跑 node tools/build-settings.js 與 node --test test/web-pages.test.js'
  );
  assert.ok(
    !JSON.stringify(settings.acceptance).includes('套件倉庫沒有畫面'),
    'settings.json 驗收分級表仍殘留套件倉庫沒有畫面字樣：請檢查 settings.json 並重跑 node tools/build-settings.js 與 node --test test/web-pages.test.js'
  );
});

test('五組四象限案例與雙軸護城河計分器公式及單點財務試算之確切數值與損益兩平不變性', () => {
  assert.ok(
    AGE_PLANS['6-9'] && AGE_PLANS['10-13'] && AGE_PLANS['14-18'] && PBL_MODULES['mod-a'] && PBL_MODULES['mod-b'] && PBL_MODULES['mod-c'],
    '分齡計畫或專題模組資料缺漏：請檢查 web/app.js 的 AGE_PLANS 與 PBL_MODULES，修妥後重跑 node --test test/web-pages.test.js'
  );

  const expectedCases = {
    'sw-exec': { presetKey: 'onlineCourse', antiAi: 18, moat: 34, quadPrefix: '象限一' },
    'fnb-single': { presetKey: 'drink', antiAi: 70, moat: 19, quadPrefix: '象限二' },
    'sw-system': { presetKey: 'swSystem', antiAi: 44, moat: 79, quadPrefix: '象限三' },
    'school-elite': { presetKey: 'privateSchool', antiAi: 90, moat: 73, quadPrefix: '象限四' },
    'omo-pbl': { presetKey: 'omoPbl', antiAi: 88, moat: 84, quadPrefix: '象限四' }
  };

  for (const [id, exp] of Object.entries(expectedCases)) {
    const item = MATRIX_CASES[id];
    assert.ok(item, `缺少案例 ${id}：請檢查 web/app.js 的 MATRIX_CASES，修妥後重跑 node --test test/web-pages.test.js`);
    assert.equal(item.presetKey, exp.presetKey, `案例 ${id} 的 presetKey 錯誤：請檢查 web/app.js，修妥後重跑 node --test test/web-pages.test.js`);
    const calc = calculateMoatScore(MOAT_PRESETS[item.presetKey]);
    assert.equal(item.antiAiScore, exp.antiAi, `案例 ${id} 的抗 AI 分數不符：請檢查 web/app.js，修妥後重跑 node --test test/web-pages.test.js`);
    assert.equal(item.moatScore, exp.moat, `案例 ${id} 的護城河分數不符：請檢查 web/app.js，修妥後重跑 node --test test/web-pages.test.js`);
    assert.equal(calc.antiAi, exp.antiAi, `preset ${item.presetKey} 計算之抗 AI 分數不符：請檢查 web/app.js，修妥後重跑 node --test test/web-pages.test.js`);
    assert.equal(calc.moat, exp.moat, `preset ${item.presetKey} 計算之護城河分數不符：請檢查 web/app.js，修妥後重跑 node --test test/web-pages.test.js`);
    assert.ok(calc.quadrant.startsWith(exp.quadPrefix), `preset ${item.presetKey} 象限應為 ${exp.quadPrefix}：請檢查 web/app.js，修妥後重跑 node --test test/web-pages.test.js`);
  }

  // R5-1 半分邊界回歸驗證：(physical=8, trust=6, switching=6, network=6, aiLeverage=5, rentFreedom=7) 數學真值護城河為 59.5 分，四捨五入必須為 60 分並進入象限四，不可因 IEEE-754 浮點誤差變成 59 分掉入象限二
  const halfPointBoundary = calculateMoatScore({
    physical: 8,
    trust: 6,
    switching: 6,
    network: 6,
    aiLeverage: 5,
    rentFreedom: 7
  });
  assert.deepEqual(
    halfPointBoundary,
    {
      antiAi: 76,
      moat: 60,
      quadrant: '象限四：實體×信任複利區（雙重保護）',
      verdict: '具備極佳的抗 AI 保護與長期留存護城河！透過 AI 降低後台文書工時、實體場域建立高轉換成本與社群口碑，能形成長期複利。'
    },
    '滑桿組合 (8, 6, 6, 6, 5, 7) 的數學真值 59.5 分四捨五入後必須為 60 分並歸入象限四：請檢查 web/app.js 的 calculateMoatScore，修妥後重跑 node --test test/web-pages.test.js'
  );

  const defaultEcon = calculateUnitEconomics({ studentsPerClass: 8, classesCount: 4, monthlyFee: 6800, venueMode: 'partner', aiLevel: 'high' });
  assert.deepEqual(
    defaultEcon,
    {
      totalStudents: 32,
      monthlyRevenue: 217600,
      venueCost: 28800,
      venueCostPct: 13.2,
      fixedCost: 48300,
      totalCost: 62700,
      netProfit: 154900,
      marginPct: 71,
      totalWeeklyHours: 18.5,
      savedWeeklyHours: 19.9,
      breakEvenStudents: 8
    },
    '預設 4 班×8 人合作場地高 AI 槓桿之財務試算數值不符：請檢查 web/app.js 的 calculateUnitEconomics，修妥後重跑 node --test test/web-pages.test.js'
  );

  const altEcon = calculateUnitEconomics({ studentsPerClass: 6, classesCount: 2, monthlyFee: 5000, venueMode: 'studio2f', aiLevel: 'medium' });
  assert.deepEqual(
    altEcon,
    {
      totalStudents: 12,
      monthlyRevenue: 60000,
      venueCost: 32000,
      venueCostPct: 53.3,
      fixedCost: 35500,
      totalCost: 40900,
      netProfit: 19100,
      marginPct: 32,
      totalWeeklyHours: 11.2,
      savedWeeklyHours: 6.2,
      breakEvenStudents: 8
    },
    '2 班×6 人二樓基地中度 AI 槓桿之財務試算數值不符：請檢查 web/app.js 的 calculateUnitEconomics，修妥後重跑 node --test test/web-pages.test.js'
  );

  const sixPersonPartner = calculateUnitEconomics({ studentsPerClass: 6, classesCount: 1, monthlyFee: 6800, venueMode: 'partner', aiLevel: 'high' });
  assert.equal(
    sixPersonPartner.venueCostPct,
    17.6,
    '1 班 6 人月費 6,800 合作場地之場地費佔營收比應為 17.6%：請檢查 web/app.js 的 calculateUnitEconomics，修妥後重跑 node --test test/web-pages.test.js'
  );

  const oneClass4 = calculateUnitEconomics({ studentsPerClass: 4, classesCount: 1, monthlyFee: 3600, venueMode: 'partner', aiLevel: 'low' });
  const oneClass8 = calculateUnitEconomics({ studentsPerClass: 8, classesCount: 1, monthlyFee: 3600, venueMode: 'partner', aiLevel: 'low' });
  assert.equal(oneClass4.venueCostPct, 50, '1 班 4 人月費 3,600 合作場地之場地費佔營收比應為 50%：請檢查 web/app.js');
  assert.equal(
    oneClass4.breakEvenStudents,
    4,
    '1 班月費 3,600 合作場地之損益兩平人數應為 4 人：請檢查 web/app.js 的 calculateUnitEconomics，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.equal(
    oneClass8.breakEvenStudents,
    oneClass4.breakEvenStudents,
    '同一開班數與場地月費下，損益兩平門檻不可隨目前每班人數漂移：請檢查 web/app.js 的 calculateUnitEconomics，修妥後重跑 node --test test/web-pages.test.js'
  );
  const atBreakEvenMinusOne = oneClass4.breakEvenStudents - 1;
  const profitBefore = atBreakEvenMinusOne * (3600 - 450) - oneClass4.fixedCost;
  const profitAt = oneClass4.breakEvenStudents * (3600 - 450) - oneClass4.fixedCost;
  assert.ok(
    profitBefore < 0 && profitAt >= 0,
    '損益兩平門檻前一人應為虧損、達門檻應非負：請檢查 web/app.js 的 calculateUnitEconomics，修妥後重跑 node --test test/web-pages.test.js'
  );

  // R6-1 與 r7 B1 半分邊界回歸驗證：營業利益率 56.5% -> 57%、57.5% -> 58%、負利益率 -86.5% -> -86%，以及中度與低度 AI 備課工時
  const halfMargin1 = calculateUnitEconomics({ studentsPerClass: 7, classesCount: 4, monthlyFee: 5000, venueMode: 'partner', aiLevel: 'high' });
  const halfMargin2 = calculateUnitEconomics({ studentsPerClass: 9, classesCount: 6, monthlyFee: 4000, venueMode: 'studio2f', aiLevel: 'high' });
  const halfMargin3 = calculateUnitEconomics({ studentsPerClass: 10, classesCount: 3, monthlyFee: 8000, venueMode: 'street1f', aiLevel: 'high' });
  const halfHours = calculateUnitEconomics({ studentsPerClass: 4, classesCount: 1, monthlyFee: 6800, venueMode: 'partner', aiLevel: 'medium' });
  const negHalfAndLowAi = calculateUnitEconomics({ studentsPerClass: 4, classesCount: 1, monthlyFee: 5000, venueMode: 'studio2f', aiLevel: 'low' });
  assert.equal(halfMargin1.marginPct, 57, '7 人×4 班×5,000 合作場地之營業利益率真值 56.5% 四捨五入應為 57%：請檢查 web/app.js 的 calculateUnitEconomics');
  assert.equal(halfMargin2.marginPct, 58, '9 人×6 班×4,000 二樓基地之營業利益率真值 57.5% 四捨五入應為 58%：請檢查 web/app.js 的 calculateUnitEconomics');
  assert.equal(halfMargin3.marginPct, 58, '10 人×3 班×8,000 一樓店面之營業利益率真值 57.5% 四捨五入應為 58%：請檢查 web/app.js 的 calculateUnitEconomics');
  assert.equal(halfHours.totalWeeklyHours, 5.2, '4 人×1 班中度 AI 之每週總工時（授課 2.5＋備課 2.65 四捨五入 2.7）應為 5.2 小時：請檢查 web/app.js 的 calculateUnitEconomics');
  assert.equal(halfHours.savedWeeklyHours, 2.6, '4 人×1 班中度 AI 之每週節省工時（5.3 - 2.7）應為 2.6 小時：請檢查 web/app.js 的 calculateUnitEconomics');
  assert.equal(negHalfAndLowAi.marginPct, -86, '4 人×1 班×5,000 二樓基地之負利益率真值 -86.5% 四捨五入應為 -86%：請檢查 web/app.js 的 roundRatioInt 與 calculateUnitEconomics');
  assert.equal(negHalfAndLowAi.totalWeeklyHours, 6.5, '4 人×1 班低度 AI 之每週總工時（授課 2.5＋備課 3.975 四捨五入 4.0）應為 6.5 小時：請檢查 web/app.js 的 calculateUnitEconomics');
  assert.equal(negHalfAndLowAi.savedWeeklyHours, 1.3, '4 人×1 班低度 AI 之每週節省工時（5.3 - 4.0）應為 1.3 小時：請檢查 web/app.js 的 calculateUnitEconomics');
});

test('載入 web/app.js 自動觸發頂層 bootWebApp 與 DOMContentLoaded 雙頁初始化、隱藏分頁套用案例展開、六維弱點診斷與剪貼簿回退', async () => {
  const fakeDoc = createFakeDom();
  const prevDoc = global.document;
  const prevNav = global.navigator;
  global.document = fakeDoc;

  try {
    fakeDoc._makeEl('div', { id: 'modal-root' });
    const toastRoot = fakeDoc._makeEl('div', { id: 'toast-root' });

    // 研究頁 DOM 結構
    const tabAll = fakeDoc._makeEl('button', { 'data-workspace-filter': 'all' }, ['workspace-tab', 'is-active']);
    const tabMatrix = fakeDoc._makeEl('button', { 'data-workspace-filter': 'matrix' }, ['workspace-tab']);
    const tabCalc = fakeDoc._makeEl('button', { 'data-workspace-filter': 'calculator' }, ['workspace-tab']);

    const secMatrix = fakeDoc._makeEl('section', { id: 'matrix-section', 'data-ws-section': 'matrix' });
    const secCalc = fakeDoc._makeEl('section', { id: 'calculator-section', 'data-ws-section': 'calculator' });
    fakeDoc._makeEl('div', { id: 'matrix-detail' });

    const moatForm = fakeDoc._makeEl('form', { id: 'moat-calc-form' });
    for (const k of ['onlineCourse', 'drink', 'swSystem', 'privateSchool', 'omoPbl']) {
      fakeDoc._makeEl('button', { 'data-moat-preset': k, textContent: k }, ['btn-ghost']);
    }
    for (const k of ['physical', 'trust', 'switching', 'network', 'aiLeverage', 'rentFreedom']) {
      const inp = fakeDoc._makeEl('input', { id: `moat-${k}`, type: 'range', value: '8' });
      moatForm.appendChild(inp);
      fakeDoc._makeEl('span', { id: `moat-${k}-val` });
    }
    const antiAiOut = fakeDoc._makeEl('div', { id: 'calc-anti-ai' });
    const moatOut = fakeDoc._makeEl('div', { id: 'calc-moat-score' });
    const quadOut = fakeDoc._makeEl('h3', { id: 'calc-quadrant' });
    fakeDoc._makeEl('div', { id: 'calc-verdict' });

    // 創業頁 DOM 結構
    const simForm = fakeDoc._makeEl('form', { id: 'unit-econ-form' });
    const simStudents = fakeDoc._makeEl('input', { id: 'sim-students', type: 'range', value: '8' });
    const simClasses = fakeDoc._makeEl('input', { id: 'sim-classes', type: 'range', value: '4' });
    const simFee = fakeDoc._makeEl('input', { id: 'sim-fee', type: 'range', value: '6800' });
    const simVenue = fakeDoc._makeEl('select', { id: 'sim-venue', value: 'partner' });
    const simAi = fakeDoc._makeEl('select', { id: 'sim-ai', value: 'high' });
    [simStudents, simClasses, simFee, simVenue, simAi].forEach((el) => simForm.appendChild(el));
    fakeDoc._makeEl('span', { id: 'sim-students-val' });
    fakeDoc._makeEl('span', { id: 'sim-classes-val' });
    fakeDoc._makeEl('span', { id: 'sim-fee-val' });
    const outTotalStudents = fakeDoc._makeEl('div', { id: 'out-total-students' });
    const outRevenue = fakeDoc._makeEl('div', { id: 'out-revenue' });
    const outProfit = fakeDoc._makeEl('div', { id: 'out-profit' });
    const outMargin = fakeDoc._makeEl('div', { id: 'out-margin' });
    const outHours = fakeDoc._makeEl('div', { id: 'out-hours' });
    const outSavedHours = fakeDoc._makeEl('div', { id: 'out-saved-hours' });

    // 重新載入 web/app.js，驗證頂層自動呼叫 bootWebApp() 並於 DOMContentLoaded 同時初始化雙頁
    const appPath = require.resolve('../web/app.js');
    delete require.cache[appPath];
    require('../web/app.js');

    assert.ok(
      Array.isArray(fakeDoc._listeners.DOMContentLoaded) && fakeDoc._listeners.DOMContentLoaded.length === 1,
      '載入 web/app.js 時必須在頂層自動呼叫 bootWebApp() 註冊 DOMContentLoaded 事件：請檢查 web/app.js，修妥後重跑 node --test test/web-pages.test.js'
    );

    for (const fn of fakeDoc._listeners.DOMContentLoaded) {
      fn();
    }

    assert.equal(
      antiAiOut.textContent,
      '80 分',
      'DOMContentLoaded 執行後研究頁計分器應完成初始化（預設滑桿 8 分對應 80 分）：請檢查 web/app.js 的 bootWebApp 與 initResearchPage，修妥後重跑 node --test test/web-pages.test.js'
    );
    assert.equal(
      outTotalStudents.textContent,
      '32 人',
      'DOMContentLoaded 執行後創業頁試算器應完成初始化（預設 32 人）：請檢查 web/app.js 的 bootWebApp 與 initVenturePage，修妥後重跑 node --test test/web-pages.test.js'
    );
    assert.equal(
      outMargin.textContent,
      '營業利益率 71%（場地佔比 13.2%｜損益兩平：8 人）',
      'DOMContentLoaded 執行後創業頁 #out-margin 應顯示預設利益率、場地佔比與損平人數：請檢查 web/app.js 的 initVenturePage，修妥後重跑 node --test test/web-pages.test.js'
    );

    simStudents.value = '6';
    await simStudents.dispatchEvent('input');
    assert.equal(
      outMargin.textContent,
      '營業利益率 64%（場地佔比 17.6%｜損益兩平：8 人）',
      '調整每班人數為 6 人時，創業頁 #out-margin 應動態更新場地佔比為 17.6% 且損平維持 8 人：請檢查 web/app.js 的 initVenturePage，修妥後重跑 node --test test/web-pages.test.js'
    );

    // R6-1 與 r7 B1 創業頁 DOM 與損益跳窗半分邊界及三階段完整對照驗證
    simStudents.value = '7';
    simClasses.value = '4';
    simFee.value = '5000';
    simVenue.value = 'partner';
    simAi.value = 'high';
    await simStudents.dispatchEvent('input');
    assert.equal(outRevenue.textContent, 'NT$ 140,000', '7 人×4 班×5,000 時主畫面 #out-revenue 應顯示 NT$ 140,000');
    assert.equal(outProfit.textContent, 'NT$ 79,100', '7 人×4 班×5,000 合作場地時主畫面 #out-profit 應顯示 NT$ 79,100');
    assert.equal(
      outMargin.textContent,
      '營業利益率 57%（場地佔比 20.6%｜損益兩平：11 人）',
      '7 人×4 班×5,000 合作場地時，主畫面 #out-margin 必須顯示營業利益率 57%：請檢查 web/app.js 的 calculateUnitEconomics 與 initVenturePage'
    );
    openEconDetailModal();
    const econModalHtml1 = fakeDoc.getElementById('modal-root').children[0].innerHTML;
    assert.ok(
      econModalHtml1.includes('含場地費 NT$ 28,800，佔當月營收 <strong>20.6%</strong>') &&
        econModalHtml1.includes('營業利益率 57%') &&
        econModalHtml1.includes('階段一（MVP 2 班／合作空間）：</strong>營收 NT$ 70,000｜場地佔比 20.6%｜營業利益 NT$ 45,800（利益率 65%，損平 4 人）') &&
        econModalHtml1.includes('階段二（穩定期 4 班／二樓基地）：</strong>營收 NT$ 140,000｜場地佔比 22.9%｜營業利益 NT$ 75,900（利益率 54%，損平 12 人）') &&
        econModalHtml1.includes('階段三（滿載期 6 班／二樓基地＋助教）：</strong>營收 NT$ 210,000｜場地佔比 15.2%｜營業利益 NT$ 123,600（利益率 59%，損平 15 人）'),
      '7 人×4 班×5,000 開啟損益明細跳窗時，主明細場地費、利益率與三階段（阶段一 65%、階段二 54%、階段三 59%）對照皆須完全一致：請檢查 web/app.js 的 openEconDetailModal'
    );

    simStudents.value = '4';
    simClasses.value = '1';
    simFee.value = '6800';
    simVenue.value = 'partner';
    simAi.value = 'medium';
    await simAi.dispatchEvent('change');
    assert.equal(outHours.textContent, '5.2 小時/週', '4 人×1 班中度 AI 時，主畫面 #out-hours 應顯示 5.2 小時/週：請檢查 web/app.js');
    assert.equal(
      outSavedHours.textContent,
      '情境假設：AI 每週省下 2.6 小時備課與週報工時',
      '4 人×1 班中度 AI 時，主畫面 #out-saved-hours 應顯示省下 2.6 小時：請檢查 web/app.js'
    );
    openEconDetailModal();
    const econModalHtml2 = fakeDoc.getElementById('modal-root').children[0].innerHTML;
    assert.ok(
      econModalHtml2.includes('每週總工時 5.2 小時') && econModalHtml2.includes('AI 每週省下 2.6 小時'),
      '4 人×1 班中度 AI 開啟損益明細跳窗時，應顯示每週總工時 5.2 小時與省下 2.6 小時：請檢查 web/app.js 的 openEconDetailModal'
    );

    await tabMatrix.click();
    assert.ok(
      !secMatrix.classList.contains('hidden') && secCalc.classList.contains('hidden'),
      '切換至雙軸四象限分頁時，計分器區塊應加上 .hidden：請檢查 web/app.js 的 setResearchWorkspaceFilter，修妥後重跑 node --test test/web-pages.test.js'
    );

    openCaseModal('sw-system');
    const applyBtn = fakeDoc.querySelector('[data-apply-preset="swSystem"]');
    assert.ok(
      applyBtn,
      '垂直領域軟體系統案例跳窗應渲染 data-apply-preset="swSystem" 按鈕：請檢查 web/app.js 的 openCaseModal，修妥後重跑 node --test test/web-pages.test.js'
    );
    await applyBtn.click();

    assert.ok(
      !secCalc.classList.contains('hidden') && tabCalc.classList.contains('is-active'),
      '從四象限分頁套用案例後，必須自動切開分頁使計分器可見（移除 .hidden）：請檢查 web/app.js 的 applyMoatPresetByKey，修妥後重跑 node --test test/web-pages.test.js'
    );
    assert.equal(antiAiOut.textContent, '44 分');
    assert.equal(moatOut.textContent, '79 分');
    assert.equal(quadOut.textContent, '象限三：系統與責任槓桿區');

    // R5-1 DOM 與診斷跳窗驗證：設定滑桿為 (8, 6, 6, 6, 5, 7) 時，計分器與跳窗報告皆顯示 60 分與象限四
    fakeDoc.getElementById('moat-physical').value = '8';
    fakeDoc.getElementById('moat-trust').value = '6';
    fakeDoc.getElementById('moat-switching').value = '6';
    fakeDoc.getElementById('moat-network').value = '6';
    fakeDoc.getElementById('moat-aiLeverage').value = '5';
    fakeDoc.getElementById('moat-rentFreedom').value = '7';
    await fakeDoc.getElementById('moat-trust').dispatchEvent('input');
    assert.equal(antiAiOut.textContent, '76 分');
    assert.equal(moatOut.textContent, '60 分');
    assert.equal(quadOut.textContent, '象限四：實體×信任複利區（雙重保護）');
    openMoatReportModal();
    const halfBoundaryModalHtml = fakeDoc.getElementById('modal-root').children[0].innerHTML;
    assert.ok(
      halfBoundaryModalHtml.includes('<span>商業護城河留利分數</span><span>60 分</span>') &&
        halfBoundaryModalHtml.includes('象限四：實體×信任複利區（雙重保護）（抗 AI 76 分／護城河 60 分）'),
      '滑桿 (8, 6, 6, 6, 5, 7) 開啟診斷跳窗時應顯示 60 分與象限四：請檢查 web/app.js 的 calculateMoatScore 與 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js'
    );

    // R2-1 與 B2 驗證：六大維度逐一單獨低分（1 分、其餘五維 10 分）時，皆須顯示對應弱點處方且不可宣稱「六大維度均衡強健」；六維皆高分時才顯示「六大維度均衡強健」
    const expectedWeakMessages = {
      physical: '實體場域與現場交付壁壘偏低',
      trust: '當面情感連結與信任擔保偏弱',
      switching: '客戶轉換成本偏低',
      network: '缺乏同儕或社群網路效應',
      aiLeverage: 'AI 後台槓桿不足',
      rentFreedom: '易受一樓店租或外送平台抽成綁架'
    };
    const allDimKeys = Object.keys(expectedWeakMessages);
    for (const lowKey of allDimKeys) {
      for (const k of allDimKeys) {
        fakeDoc.getElementById(`moat-${k}`).value = k === lowKey ? '1' : '10';
      }
      openMoatReportModal();
      const modalHtml = fakeDoc.getElementById('modal-root').children[0].innerHTML;
      assert.ok(
        modalHtml.includes(expectedWeakMessages[lowKey]) &&
          !modalHtml.includes('六大維度均衡強健') &&
          !modalHtml.includes('線下高信任留存'),
        `當維度 ${lowKey} 低分時，診斷報告必須包含「${expectedWeakMessages[lowKey]}」且不可宣稱六大維度均衡強健：請檢查 web/app.js 的 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js`
      );
    }
    for (const k of allDimKeys) {
      fakeDoc.getElementById(`moat-${k}`).value = '10';
    }
    openMoatReportModal();
    const balancedHtml = fakeDoc.getElementById('modal-root').children[0].innerHTML;
    assert.ok(
      balancedHtml.includes('六大維度均衡強健'),
      '當六大維度皆高於 5 分時，診斷報告應顯示六大維度均衡強健：請檢查 web/app.js 的 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js'
    );

    // 恢復 swSystem 預設以測試剪貼簿成功與失敗回退
    await applyBtn.click();

    const copiedTexts = [];
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          writeText: async (t) => {
            copiedTexts.push(t);
          }
        }
      }
    });

    openMoatReportModal();
    const copyBtn = fakeDoc.getElementById('btn-copy-moat-report');
    assert.ok(copyBtn, '診斷報告跳窗應包含 #btn-copy-moat-report 按鈕：請檢查 web/app.js 的 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js');
    await copyBtn.click();

    assert.equal(
      copiedTexts.length,
      1,
      '點擊複製診斷摘要時必須實際呼叫剪貼簿寫入介面：請檢查 web/app.js 的 copyTextToClipboard 與 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js'
    );
    assert.ok(
      copiedTexts[0].includes('象限三：系統與責任槓桿區（抗 AI 44 分／護城河 79 分）'),
      '寫入剪貼簿的摘要文字必須包含目前分數與象限：請檢查 web/app.js 的 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js'
    );
    assert.equal(
      fakeDoc.getElementById('modal-root').children.length,
      0,
      '剪貼簿寫入成功後應關閉診斷跳窗：請檢查 web/app.js 的 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js'
    );

    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          writeText: async () => {
            throw new Error('Clipboard denied');
          }
        }
      }
    });

    toastRoot.children.length = 0;
    openMoatReportModal();
    const copyBtnFail = fakeDoc.getElementById('btn-copy-moat-report');
    await copyBtnFail.click();

    const fallbackWrap = fakeDoc.getElementById('moat-copy-fallback-wrap');
    const fallbackInput = fakeDoc.getElementById('moat-copy-fallback');
    assert.ok(
      fakeDoc.getElementById('modal-root').children.length === 1 && fallbackWrap && !fallbackWrap.classList.contains('hidden') && fallbackInput.value.includes('抗 AI 44 分'),
      '剪貼簿寫入失敗時不可關閉跳窗，且必須顯示含摘要文字的手動複製欄位：請檢查 web/app.js 的 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js'
    );
    assert.ok(
      toastRoot.children.some((t) => t.textContent.includes('無法自動寫入剪貼簿')),
      '剪貼簿寫入失敗時不得謊報已複製，應提示手動複製：請檢查 web/app.js 的 openMoatReportModal，修妥後重跑 node --test test/web-pages.test.js'
    );
  } finally {
    global.document = prevDoc;
    Object.defineProperty(global, 'navigator', { configurable: true, value: prevNav });
  }
});
