'use strict';

const MATRIX_CASES = {
  'sw-exec': {
    id: 'sw-exec',
    name: '初階軟體寫碼與制式報告',
    quadrant: '象限一：標準化數位商品區（易被 AI 取代 × 低商業護城河）',
    antiAiScore: 20,
    moatScore: 18,
    valueProvided: '將明確規格轉化為標準程式碼、網頁切版或摘要報告。',
    aiImpact: '【任務自動化＋職業結構萎縮】AI 輔助寫碼使標準實作速度快 55.8%（Peng et al., 2023），純按規格敲鍵盤的初階職缺大幅縮減。',
    moatAnalysis: '幾乎無護城河：語法與模板已成為人人可用的公共基礎設施，單純「做得出來」不再具備定價權。',
    risks: '供給暴增導致外包單價崩跌；缺乏架構審核力會產生高翻動率與技術債（GitClear, 2024）。',
    actionLearn: '從「背語法」轉向「系統架構拆解、邊界測試設計、AI 產出驗收除錯」。',
    actionBuildOwn: '不賣單純工時；轉向垂直領域工作流整合與高轉換成本系統。'
  },
  'fnb-single': {
    id: 'fnb-single',
    name: '獨立手搖飲店／一般餐飲單店',
    quadrant: '象限二：實體紅海內卷區（難被 AI 直接取代 × 低商業護城河）',
    antiAiScore: 78,
    moatScore: 22,
    valueProvided: '現場飲品調製、即時味覺滿足與街角便利交付。',
    aiImpact: '【專用硬體自動化＋平台抽成】AI 無法隔空送飲料進肚子，但自動封口、定量果糖機與自動搖茶機削平了現場手藝門檻。',
    moatAnalysis: '抗 AI 但無商業護城河：全台飲料店逼近 2.9 萬家、手搖飲逾 1.6 萬家（財政部與經濟部 2024-2025 統計），配方易模仿，利潤被房東漲租與外送平台（25%~35%）抽乾。',
    risks: '15~44 歲勞動人口減少帶來結構性缺工、原物料與租金上漲、極高汰換率。',
    actionLearn: '學習數據化店務管理、私域會員經營與現場體驗設計，而非只練可被機器取代的搖茶動作。',
    actionBuildOwn: '切忌盲目砸退休金開無差異化單店；應累積自有品牌社群、供應鏈議價權或關鍵店面控制權。'
  },
  'sw-system': {
    id: 'sw-system',
    name: '垂直領域軟體系統與高責任架構',
    quadrant: '象限三：系統與責任槓桿區（部分動作易被 AI 取代 × 高商業護城河）',
    antiAiScore: 58,
    moatScore: 84,
    valueProvided: '解決特定行業（醫療、理財、教育、校務）真實痛點，承擔資安合規與系統穩定責任。',
    aiImpact: '【工作內容重組】AI 幫架構師省下 70% 基礎施工時間，讓 1~2 人小團隊能交付過去需要 10 人團隊才能完成的系統。',
    moatAnalysis: '護城河來自「嵌入客戶日常流程的轉換成本」、「長期累積的專屬業務數據」與「出事時有人簽字負責的信任契約」。',
    risks: '若只做薄殼包裝（Wrapper）易被大廠模型升級吞噬；必須深耕真實業務流程與邊界驗證。',
    actionLearn: '跨領域痛點洞察力、嚴格驗收標準設計（Gates & Tests）、高可信度系統工程。',
    actionBuildOwn: '打造「AI 自動化施工 × 垂直領域專業知識」的高黏著度系統資產。'
  },
  'school-elite': {
    id: 'school-elite',
    name: '具獨特辦學文化與社群的實體學校',
    quadrant: '象限四：實體×信任複利區（難被 AI 取代 × 高商業護城河）',
    antiAiScore: 90,
    moatScore: 85,
    valueProvided: '五合一價值綑綁：①安全托育照顧 ②同儕互動社會化 ③法規文憑認證 ④品格習慣養成 ⑤知識傳授。',
    aiImpact: '【部分環節改變】AI 可取代第⑤項「單向知識講授與解題家教」，但疫情封校實證顯示線上平台無法取代實體同儕社交與情緒發展（UNESCO, 2023）。',
    moatAnalysis: '雙重護城河：供給端有土地、校舍與立案法規硬門檻；需求端有「辦學口碑 → 吸引重視教育的家庭 → 優質同儕網路效應」的正向飛輪。',
    risks: '少子化人口結構萎縮（缺乏口碑與特色的後段學校仍會退場）、重資產折舊高、一般人資本門檻過高。',
    actionLearn: '孩子在校應重點鍛鍊面對面協作、衝突處理、同理領導與真實專題抗挫力。',
    actionBuildOwn: '一般創業者難以直接買地蓋校，可拆解其最精華的「同儕社會化＋專題實作＋家長信任」做成輕資產 OMO 模式。'
  },
  'omo-pbl': {
    id: 'omo-pbl',
    name: 'NextLab 線上 AI 槓桿 × 線下實體 PBL 平台',
    quadrant: '象限四（輕資產切入）：實體×信任複利區（難被 AI 取代 × 高商業護城河）',
    antiAiScore: 88,
    moatScore: 82,
    valueProvided: '為 6~18 歲下一代鍛鍊「提問、查證、專題落地、同儕協作」四大能力；為家庭提供看得見的成長作品集與觀測報告。',
    aiImpact: '【結構性賦能】線上 AI 專題副駕包辦 70% 個別化提問鷹架、進度追蹤與家長週報生成；線下導師 100% 專注於實體小班同儕碰撞與動手實作。',
    moatAnalysis: '避開一樓高店租（採用目的型週末空間合作），靠「跨學期專題作品集轉換成本 ＋ 在地同儕與家長口碑網路 ＋ 專有 AI 引導教案庫」建立護城河。',
    risks: '初期需建立第一批種子家長信任；必須嚴格守住「AI 引導思考而非代寫答案」的教學品質。',
    actionLearn: '導師與創業者需結合「AI 系統設計力」與「面對面高溫度引導力」。',
    actionBuildOwn: '一般專業成年人無須千萬資本即可啟動的「AI 數位槓桿 × 高信任實體服務」最佳試驗場。'
  }
};

const AGE_PLANS = {
  '6-9': {
    title: '6〜9 歲｜探索與實體感知期（低螢幕、高感官、立規矩）',
    focus: '不急著學寫程式語法或依賴 AI 聊天；重點建立真實世界感官經驗、閱讀理解基石、好奇提問與小團體合作規範。',
    pillars: [
      '【提問力】每天散步或共讀後，鼓勵孩子問出「為什麼會這樣？如果換成…會怎樣？」',
      '【查證基石】分清楚「我親眼看到的（事實）」與「我猜的（推論）」',
      '【動手韌性】完成需要動手操作與收拾的任務（積木結構、簡易料理、種植觀察紀錄）',
      '【實體社交】在 4~6 人小隊遊戲中練習輪流、傾聽、輸了不翻桌並說出感受'
    ]
  },
  '10-13': {
    title: '10〜13 歲｜專題建造與查證啟蒙期（駕馭 AI 副駕、小隊做真東西）',
    focus: '導入結構化 PBL 專題與受引導的 AI 協作：學會把問題拆成 4~8 週計畫，找出 AI 的破綻，並與同儕分工做出作品上台發表。',
    pillars: [
      '【提問力】練習為同一個主題設計 3 個不同深度的問題，比較 AI 回答的差異',
      '【AI 查證力】「抓出 AI 破綻挑戰」：對 AI 生成的資訊進行至少兩處獨立來源交叉核對',
      '【專題落地】經歷「設計 → 原型測試失敗 → 修正 → 公開 Demo Day 發表」完整循環',
      '【實體社交】在 6~8 人小班專題中擔任不同角色（組長、紀錄、測試、發表），練習協調分歧'
    ]
  },
  '14-18': {
    title: '14〜18 歲｜真實世界價值創造期（跨領域整合、建立個人信用資產）',
    focus: '走出教室標準題，運用 AI 數位槓桿放大個人產出，解決校園、社區或微型商業的真實痛點，累積可被外界驗證的作品集（Portfolio）。',
    pillars: [
      '【問題定義】訪談真實使用者（長輩、店家、社團），找出他們真正願意花時間或金錢解決的痛點',
      '【系統把關】使用 AI 快速打造軟體或內容原型，並親自設計測試案例與安全邊界',
      '【抗挫交付】對真實受眾交付成果並根據回饋迭代，而非交完作業拿完分數就結束',
      '【同理領導】組織跨專長同儕團隊，練習專案管理、資源談判與公開演說影響力'
    ]
  }
};

function calculateMoatScore(inputs) {
  const physical = Number(inputs.physical || 0);
  const trust = Number(inputs.trust || 0);
  const switching = Number(inputs.switching || 0);
  const network = Number(inputs.network || 0);
  const aiLeverage = Number(inputs.aiLeverage || 0);
  const rentFreedom = Number(inputs.rentFreedom || 0);

  const antiAi = Math.round((Math.max(physical, trust) * 0.6 + (physical + trust) * 0.2) * 10);
  const moat = Math.round(((switching * 0.25 + network * 0.25 + aiLeverage * 0.2 + rentFreedom * 0.15 + trust * 0.15)) * 10);

  let quadrant = '';
  let verdict = '';
  if (antiAi >= 60 && moat >= 60) {
    quadrant = '象限四：實體×信任複利區（雙重保護）';
    verdict = '具備極佳的抗 AI 保護與長期留存護城河！透過 AI 降低後台成本、實體場域建立高轉換成本與社群口碑，能形成長期複利。';
  } else if (antiAi >= 60 && moat < 60) {
    quadrant = '象限二：實體紅海內卷區（抗 AI 但缺護城河）';
    verdict = '警訊：雖然 AI 取代不了你的現場交付，但同業模仿門檻過低或利潤易被店租／平台抽乾。建議加入「長期會員作品集／契約」與「目的型場地策略」來拉高護城河。';
  } else if (antiAi < 60 && moat >= 60) {
    quadrant = '象限三：系統與責任槓桿區';
    verdict = '雖然生產環節高度數位化，但你握有高轉換成本、專有數據或深厚信任關係，可善用 AI 大幅放大單人產出槓桿。';
  } else {
    quadrant = '象限一：標準化數位商品區（高取代風險）';
    verdict = '高風險：純執行門檻正被 AI 快速削平，且缺乏客戶轉換成本。建議往前端「真實痛點定義」或結合線下高信任服務轉型。';
  }

  return { antiAi, moat, quadrant, verdict };
}

function calculateUnitEconomics(params) {
  const studentsPerClass = Number(params.studentsPerClass || 8);
  const classesCount = Number(params.classesCount || 4);
  const monthlyFee = Number(params.monthlyFee || 6800);
  const venueMode = params.venueMode || 'partner';
  const aiLevel = params.aiLevel || 'high';

  const totalStudents = studentsPerClass * classesCount;
  const monthlyRevenue = totalStudents * monthlyFee;

  let venueCost = 0;
  if (venueMode === 'partner') {
    venueCost = classesCount * 4 * 1800;
  } else if (venueMode === 'studio2f') {
    venueCost = 32000;
  } else {
    venueCost = 85000;
  }

  const materialAndAiCost = totalStudents * 450 + 3500;
  const mentorAssistantCost = classesCount > 3 ? (classesCount - 2) * 8000 : 0;
  const totalCost = venueCost + materialAndAiCost + mentorAssistantCost;
  const netProfit = monthlyRevenue - totalCost;
  const marginPct = monthlyRevenue > 0 ? Math.round((netProfit / monthlyRevenue) * 100) : 0;

  const workshopHoursPerWeek = classesCount * 2.5;
  const traditionalPrepAndReportHours = classesCount * 3.5 + totalStudents * 0.45;
  let aiReductionFactor = 0.7;
  if (aiLevel === 'low') aiReductionFactor = 0.25;
  else if (aiLevel === 'medium') aiReductionFactor = 0.5;

  const actualPrepAndReportHours = +(traditionalPrepAndReportHours * (1 - aiReductionFactor)).toFixed(1);
  const totalWeeklyHours = +(workshopHoursPerWeek + actualPrepAndReportHours).toFixed(1);
  const savedWeeklyHours = +(traditionalPrepAndReportHours - actualPrepAndReportHours).toFixed(1);
  const breakEvenStudents = Math.ceil(totalCost / Math.max(monthlyFee - 450, 1));

  return {
    totalStudents,
    monthlyRevenue,
    venueCost,
    totalCost,
    netProfit,
    marginPct,
    totalWeeklyHours,
    savedWeeklyHours,
    breakEvenStudents
  };
}

function initResearchPage() {
  const detailPanel = document.getElementById('matrix-detail');
  if (detailPanel) {
    const renderCase = (caseId) => {
      const item = MATRIX_CASES[caseId] || MATRIX_CASES['omo-pbl'];
      document.querySelectorAll('.case-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-case') === item.id);
      });
      detailPanel.innerHTML = `
        <span class="ep-badge ep-infer">${item.quadrant}</span>
        <h3 style="font-size:1.35rem; margin:0.6rem 0 0.4rem;">${item.name}</h3>
        <p style="color:var(--ink-secondary); font-size:0.94rem;"><strong>底層價值：</strong>${item.valueProvided}</p>
        <div class="score-bars">
          <div class="score-item">
            <div class="score-label"><span>抗 AI 直接取代性</span><span>${item.antiAiScore} / 100</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${item.antiAiScore}%"></div></div>
          </div>
          <div class="score-item">
            <div class="score-label"><span>商業護城河與留利能力</span><span>${item.moatScore} / 100</span></div>
            <div class="progress-track"><div class="progress-fill accent" style="width:${item.moatScore}%"></div></div>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.65rem; font-size:0.92rem; margin-top:0.8rem;">
          <div><strong>🤖 AI 與自動化改變的環節：</strong>${item.aiImpact}</div>
          <div><strong>🏰 護城河真偽拆解：</strong>${item.moatAnalysis}</div>
          <div><strong>⚠️ 主要風險：</strong>${item.risks}</div>
          <div style="background:var(--primary-light); padding:0.85rem; border-radius:10px; margin-top:0.3rem;">
            <div><strong>🌱 值得學什麼（Learn）：</strong>${item.actionLearn}</div>
            <div style="margin-top:0.35rem;"><strong>🏗️ 值得打造與擁有什麼（Build & Own）：</strong>${item.actionBuildOwn}</div>
          </div>
        </div>
      `;
    };

    document.querySelectorAll('.case-btn').forEach((btn) => {
      btn.addEventListener('click', () => renderCase(btn.getAttribute('data-case')));
    });
    renderCase('omo-pbl');
  }

  const ageContainer = document.getElementById('age-plan-content');
  if (ageContainer) {
    const renderAge = (ageKey) => {
      const plan = AGE_PLANS[ageKey] || AGE_PLANS['10-13'];
      document.querySelectorAll('[data-age-tab]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-age-tab') === ageKey);
      });
      ageContainer.innerHTML = `
        <h4 style="font-size:1.18rem; margin-bottom:0.4rem; color:var(--primary);">${plan.title}</h4>
        <p style="color:var(--ink-secondary); margin-bottom:0.9rem; font-size:0.95rem;">${plan.focus}</p>
        <ul class="check-list">
          ${plan.pillars.map((p) => `<li class="check-item"><span>✅</span><span>${p}</span></li>`).join('')}
        </ul>
      `;
    };
    document.querySelectorAll('[data-age-tab]').forEach((btn) => {
      btn.addEventListener('click', () => renderAge(btn.getAttribute('data-age-tab')));
    });
    renderAge('10-13');
  }

  const moatForm = document.getElementById('moat-calc-form');
  if (moatForm) {
    const presets = {
      drink: { physical: 8, trust: 3, switching: 1, network: 1, aiLeverage: 3, rentFreedom: 2 },
      onlineCourse: { physical: 1, trust: 4, switching: 2, network: 3, aiLeverage: 8, rentFreedom: 9 },
      privateSchool: { physical: 9, trust: 9, switching: 9, network: 8, aiLeverage: 4, rentFreedom: 6 },
      omoPbl: { physical: 8, trust: 9, switching: 8, network: 8, aiLeverage: 9, rentFreedom: 8 }
    };

    const updateMoatUI = () => {
      const inputs = {};
      ['physical', 'trust', 'switching', 'network', 'aiLeverage', 'rentFreedom'].forEach((k) => {
        const el = document.getElementById(`moat-${k}`);
        inputs[k] = el ? Number(el.value) : 5;
        const valSpan = document.getElementById(`moat-${k}-val`);
        if (valSpan) valSpan.textContent = `${inputs[k]} / 10`;
      });
      const res = calculateMoatScore(inputs);
      document.getElementById('calc-anti-ai').textContent = `${res.antiAi} 分`;
      document.getElementById('calc-moat-score').textContent = `${res.moat} 分`;
      document.getElementById('calc-quadrant').textContent = res.quadrant;
      document.getElementById('calc-verdict').textContent = res.verdict;
    };

    moatForm.querySelectorAll('input[type="range"]').forEach((inp) => {
      inp.addEventListener('input', updateMoatUI);
    });

    document.querySelectorAll('[data-moat-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-moat-preset]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const p = presets[btn.getAttribute('data-moat-preset')];
        if (!p) return;
        Object.entries(p).forEach(([k, v]) => {
          const el = document.getElementById(`moat-${k}`);
          if (el) el.value = String(v);
        });
        updateMoatUI();
      });
    });

    updateMoatUI();
  }
}

function initVenturePage() {
  const modeBtns = document.querySelectorAll('[data-lens-mode]');
  if (modeBtns.length) {
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-lens-mode');
        modeBtns.forEach((b) => b.classList.toggle('active', b === btn));
        const parentSec = document.getElementById('lens-parent');
        const founderSec = document.getElementById('lens-founder');
        if (mode === 'parent') {
          parentSec.classList.remove('hidden');
          founderSec.classList.add('hidden');
        } else if (mode === 'founder') {
          parentSec.classList.add('hidden');
          founderSec.classList.remove('hidden');
        } else {
          parentSec.classList.remove('hidden');
          founderSec.classList.remove('hidden');
        }
      });
    });
  }

  const simForm = document.getElementById('unit-econ-form');
  if (simForm) {
    const updateSim = () => {
      const studentsPerClass = Number(document.getElementById('sim-students').value);
      const classesCount = Number(document.getElementById('sim-classes').value);
      const monthlyFee = Number(document.getElementById('sim-fee').value);
      const venueMode = document.getElementById('sim-venue').value;
      const aiLevel = document.getElementById('sim-ai').value;

      document.getElementById('sim-students-val').textContent = `${studentsPerClass} 人/班`;
      document.getElementById('sim-classes-val').textContent = `${classesCount} 班`;
      document.getElementById('sim-fee-val').textContent = `NT$ ${monthlyFee.toLocaleString()}`;

      const res = calculateUnitEconomics({
        studentsPerClass,
        classesCount,
        monthlyFee,
        venueMode,
        aiLevel
      });

      document.getElementById('out-total-students').textContent = `${res.totalStudents} 人`;
      document.getElementById('out-revenue').textContent = `NT$ ${res.monthlyRevenue.toLocaleString()}`;
      document.getElementById('out-profit').textContent = `NT$ ${res.netProfit.toLocaleString()}`;
      document.getElementById('out-margin').textContent = `營業利益率 ${res.marginPct}%（損益兩平：${res.breakEvenStudents} 人）`;
      document.getElementById('out-hours').textContent = `${res.totalWeeklyHours} 小時/週`;
      document.getElementById('out-saved-hours').textContent = `AI 每週幫你省下 ${res.savedWeeklyHours} 小時備課與週報工時`;
    };

    simForm.querySelectorAll('input, select').forEach((el) => {
      el.addEventListener('input', updateSim);
      el.addEventListener('change', updateSim);
    });
    updateSim();
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initResearchPage();
    initVenturePage();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MATRIX_CASES,
    AGE_PLANS,
    calculateMoatScore,
    calculateUnitEconomics
  };
}
