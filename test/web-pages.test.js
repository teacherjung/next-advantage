// 為什麼：雙網頁（研究網頁與 OMO PBL 創業嘗試網頁）與研究報告為本專案核心交付物，且須對齊理財專案的畫面風格、互動按鈕與跳窗結構，由自動化考題核對結構與試算邏輯。
// 守到哪裡（擋不住什麼）：擋不住瀏覽器實際渲染的視覺美感與版面微調（視覺畫面依 E10 由擁有者過目定案）。
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  MATRIX_CASES,
  AGE_PLANS,
  INFO_DOCS,
  PBL_MODULES,
  calculateMoatScore,
  calculateUnitEconomics
} = require('../web/app.js');

const ROOT = path.join(__dirname, '..');

test('研究總覽網頁與 OMO PBL 創業嘗試網頁皆對齊理財專案畫面風格、側欄、分頁、跳窗容器與核心互動區塊', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'web', 'index.html'), 'utf8');
  const ventureHtml = fs.readFileSync(path.join(ROOT, 'web', 'venture.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(ROOT, 'web', 'styles.css'), 'utf8');
  const phase2Doc = fs.readFileSync(path.join(ROOT, 'docs', 'phase-2-pbl-omo-research.md'), 'utf8');

  assert.ok(
    stylesCss.includes('--bg: #fbf2dc') && stylesCss.includes('.modal-bg') && stylesCss.includes('.workspace-tabs') && stylesCss.includes('.forest-scene-summary'),
    '樣式表缺少理財專案暖米色底色、跳窗或分頁樣式：請檢查 web/styles.css，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    indexHtml.includes('href="venture.html"') && indexHtml.includes('id="matrix-detail"') && indexHtml.includes('id="moat-calc-form"') && indexHtml.includes('id="modal-root"') && indexHtml.includes('data-info-key='),
    '研究網頁缺少創業頁連結、四象限面板、護城河計分器或跳窗觸發鈕：請檢查 web/index.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    ventureHtml.includes('href="index.html"') && ventureHtml.includes('id="lens-parent"') && ventureHtml.includes('id="lens-founder"') && ventureHtml.includes('id="unit-econ-form"') && ventureHtml.includes('id="modal-root"') && ventureHtml.includes('data-open-module='),
    '創業網頁缺少研究頁連結、雙視角區塊、單點財務試算表單或課綱跳窗觸發鈕：請檢查 web/venture.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    phase2Doc.includes('四大不可替代能力組合') && phase2Doc.includes('OMO'),
    '第二階段研究報告缺少核心章節：請檢查 docs/phase-2-pbl-omo-research.md，修妥後重跑 node --test test/web-pages.test.js'
  );
});

test('雙軸護城河計分器、OMO PBL 單點財務試算邏輯與跳窗資料庫皆完整可用', () => {
  assert.ok(
    MATRIX_CASES['omo-pbl'] && MATRIX_CASES['fnb-single'] && AGE_PLANS['10-13'] && INFO_DOCS['anti-ai-vs-moat'] && PBL_MODULES['mod-a'],
    '案例、分齡或跳窗資料庫缺少關鍵項目：請檢查 web/app.js 的 MATRIX_CASES、AGE_PLANS、INFO_DOCS 與 PBL_MODULES，修妥後重跑 node --test test/web-pages.test.js'
  );

  const highMoat = calculateMoatScore({ physical: 8, trust: 9, switching: 8, network: 8, aiLeverage: 9, rentFreedom: 8 });
  const redOcean = calculateMoatScore({ physical: 8, trust: 3, switching: 1, network: 1, aiLeverage: 3, rentFreedom: 2 });

  assert.ok(
    highMoat.antiAi >= 60 && highMoat.moat >= 60 && highMoat.quadrant.includes('象限四'),
    'OMO PBL 高分組合應判入象限四：請檢查 web/app.js 的 calculateMoatScore，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    redOcean.antiAi >= 60 && redOcean.moat < 60 && redOcean.quadrant.includes('象限二'),
    '獨立手搖飲單店組合應判入象限二（抗 AI 但低商業護城河）：請檢查 web/app.js 的 calculateMoatScore，修妥後重跑 node --test test/web-pages.test.js'
  );

  const highAiEcon = calculateUnitEconomics({ studentsPerClass: 8, classesCount: 4, monthlyFee: 6800, venueMode: 'partner', aiLevel: 'high' });
  const lowAiEcon = calculateUnitEconomics({ studentsPerClass: 8, classesCount: 4, monthlyFee: 6800, venueMode: 'street1f', aiLevel: 'low' });

  assert.equal(
    highAiEcon.totalStudents,
    32,
    '總學員數計算不符：請檢查 web/app.js 的 calculateUnitEconomics，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    highAiEcon.netProfit > lowAiEcon.netProfit && highAiEcon.savedWeeklyHours > lowAiEcon.savedWeeklyHours,
    '高 AI 槓桿與合作場地模式應較傳統一樓店面與低 AI 模式具更高營業利益與省下工時：請檢查 web/app.js 的 calculateUnitEconomics，修妥後重跑 node --test test/web-pages.test.js'
  );
});
