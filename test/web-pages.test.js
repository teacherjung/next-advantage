// 為什麼：守護雙網頁（研究總覽頁與 OMO PBL 創業頁）的 HTML/CSS 結構錨點、試算公式確切數值、案例套用與分頁連動、剪貼簿複製回退及證據分級標示。
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
  setResearchWorkspaceFilter,
  openCaseModal,
  openMoatReportModal,
  initResearchPage,
  initVenturePage,
  bootWebApp
} = require('../web/app.js');

const ROOT = path.join(__dirname, '..');

function extractCssBlock(css, selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`${esc}\\s*\\{([^}]*)\\}`, 'm'));
  return m ? m[1] : '';
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

test('雙網頁 HTML、理財專案樣式規則、證據分級標示與專案設定驗收表皆符合規範', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'web', 'index.html'), 'utf8');
  const ventureHtml = fs.readFileSync(path.join(ROOT, 'web', 'venture.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(ROOT, 'web', 'styles.css'), 'utf8');
  const phase2Doc = fs.readFileSync(path.join(ROOT, 'docs', 'phase-2-pbl-omo-research.md'), 'utf8');
  const settings = JSON.parse(fs.readFileSync(path.join(ROOT, 'settings.json'), 'utf8'));

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

  assert.ok(
    indexHtml.includes('href="venture.html"') && indexHtml.includes('id="matrix-detail"') && indexHtml.includes('id="moat-calc-form"') && indexHtml.includes('id="modal-root"') && indexHtml.includes('data-moat-preset="swSystem"'),
    '研究網頁缺少創業頁連結、四象限面板、護城河計分器、跳窗容器或垂直軟體系統預設鈕：請檢查 web/index.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    ventureHtml.includes('href="index.html"') && ventureHtml.includes('id="lens-parent"') && ventureHtml.includes('id="lens-founder"') && ventureHtml.includes('id="unit-econ-form"') && ventureHtml.includes('損益兩平：8 人') && ventureHtml.includes('【待驗證假設】'),
    '創業網頁缺少研究頁連結、雙視角區塊、正確初始損平人數（8 人）或待驗證假設標示：請檢查 web/venture.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    phase2Doc.includes('四大不可替代能力組合') && phase2Doc.includes('【待驗證假設') && INFO_DOCS['evidence-sw'].body.includes('預測 2024 年'),
    '研究報告或軟體實證跳窗缺少待驗證假設標示或 GitClear 2024 預測說明：請檢查 docs/phase-2-pbl-omo-research.md 與 web/app.js，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    settings.acceptance.tiers.some((t) => t.id === '畫面驗收') && !JSON.stringify(settings.acceptance).includes('套件倉庫沒有畫面'),
    'settings.json 驗收分級表仍殘留套件倉庫沒有畫面字樣或缺少畫面驗收層級：請檢查 settings.json 並重跑 node tools/build-settings.js 與 node --test test/web-pages.test.js'
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

  const defaultEcon = calculateUnitEconomics({ studentsPerClass: 8, classesCount: 4, monthlyFee: 6800, venueMode: 'partner', aiLevel: 'high' });
  assert.deepEqual(
    defaultEcon,
    {
      totalStudents: 32,
      monthlyRevenue: 217600,
      venueCost: 28800,
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

  const oneClass4 = calculateUnitEconomics({ studentsPerClass: 4, classesCount: 1, monthlyFee: 3600, venueMode: 'partner', aiLevel: 'low' });
  const oneClass8 = calculateUnitEconomics({ studentsPerClass: 8, classesCount: 1, monthlyFee: 3600, venueMode: 'partner', aiLevel: 'low' });
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
});

test('DOM 啟動事件、四象限分頁套用案例自動展開計分器、以及診斷報告剪貼簿複製與失敗回退行為', async () => {
  const fakeDoc = createFakeDom();
  bootWebApp(fakeDoc);
  assert.ok(
    Array.isArray(fakeDoc._listeners.DOMContentLoaded) && fakeDoc._listeners.DOMContentLoaded.length === 1,
    'bootWebApp 必須註冊 DOMContentLoaded 啟動事件：請檢查 web/app.js 的 bootWebApp，修妥後重跑 node --test test/web-pages.test.js'
  );

  const prevDoc = global.document;
  const prevNav = global.navigator;
  global.document = fakeDoc;

  try {
    fakeDoc._makeEl('div', { id: 'modal-root' });
    const toastRoot = fakeDoc._makeEl('div', { id: 'toast-root' });

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

    initResearchPage();

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
    assert.equal(
      antiAiOut.textContent,
      '44 分',
      '套用垂直領域軟體系統案例後，抗 AI 分數應更新為 44 分：請檢查 web/app.js 的 applyMoatPresetByKey，修妥後重跑 node --test test/web-pages.test.js'
    );
    assert.equal(
      moatOut.textContent,
      '79 分',
      '套用垂直領域軟體系統案例後，商業護城河分數應更新為 79 分：請檢查 web/app.js 的 applyMoatPresetByKey，修妥後重跑 node --test test/web-pages.test.js'
    );
    assert.equal(
      quadOut.textContent,
      '象限三：系統與責任槓桿區',
      '套用垂直領域軟體系統案例後，象限標題應更新為象限三：請檢查 web/app.js 的 applyMoatPresetByKey，修妥後重跑 node --test test/web-pages.test.js'
    );

    await tabAll.click();

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
