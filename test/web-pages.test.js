// 為什麼：雙網頁（研究網頁與 OMO PBL 創業嘗試網頁）與研究報告為本專案核心交付物，須由自動化考題核對結構與試算邏輯，避免改壞互動公式或雙頁互連。
// 守到哪裡（擋不住什麼）：擋不住瀏覽器實際渲染的視覺美感與版面微調（視覺畫面依 E10 由擁有者過目定案）。
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  MATRIX_CASES,
  AGE_PLANS,
  calculateMoatScore,
  calculateUnitEconomics
} = require('../web/app.js');

const ROOT = path.join(__dirname, '..');

test('研究總覽網頁與 OMO PBL 創業嘗試網頁皆存在且具備雙向切換連結與核心互動區塊', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'web', 'index.html'), 'utf8');
  const ventureHtml = fs.readFileSync(path.join(ROOT, 'web', 'venture.html'), 'utf8');
  const phase2Doc = fs.readFileSync(path.join(ROOT, 'docs', 'phase-2-pbl-omo-research.md'), 'utf8');

  assert.ok(
    indexHtml.includes('href="venture.html"') && indexHtml.includes('id="matrix-detail"') && indexHtml.includes('id="moat-calc-form"'),
    '研究網頁缺少創業頁連結、四象限面板或護城河計分器：請檢查 web/index.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    ventureHtml.includes('href="index.html"') && ventureHtml.includes('id="lens-parent"') && ventureHtml.includes('id="lens-founder"') && ventureHtml.includes('id="unit-econ-form"'),
    '創業網頁缺少研究頁連結、雙視角區塊或單點財務試算表單：請檢查 web/venture.html，修妥後重跑 node --test test/web-pages.test.js'
  );
  assert.ok(
    phase2Doc.includes('四大不可替代能力組合') && phase2Doc.includes('OMO'),
    '第二階段研究報告缺少核心章節：請檢查 docs/phase-2-pbl-omo-research.md，修妥後重跑 node --test test/web-pages.test.js'
  );
});

test('雙軸護城河計分器與 OMO PBL 單點財務試算邏輯能正確區分四象限與計算 AI 工時槓桿', () => {
  assert.ok(
    MATRIX_CASES['omo-pbl'] && MATRIX_CASES['fnb-single'] && AGE_PLANS['10-13'],
    '案例資料表缺少關鍵項目：請檢查 web/app.js 的 MATRIX_CASES 與 AGE_PLANS，修妥後重跑 node --test test/web-pages.test.js'
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
