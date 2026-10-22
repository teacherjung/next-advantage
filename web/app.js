'use strict';

const ICONS = {
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
  rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  bookOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
};

const MOAT_PRESETS = {
  onlineCourse: { physical: 1, trust: 2, switching: 2, network: 2, aiLeverage: 5, rentFreedom: 7 },
  drink: { physical: 8, trust: 3, switching: 1, network: 1, aiLeverage: 3, rentFreedom: 2 },
  swSystem: { physical: 2, trust: 5, switching: 9, network: 7, aiLeverage: 9, rentFreedom: 9 },
  privateSchool: { physical: 9, trust: 9, switching: 9, network: 8, aiLeverage: 4, rentFreedom: 6 },
  omoPbl: { physical: 8, trust: 9, switching: 8, network: 8, aiLeverage: 9, rentFreedom: 8 }
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
    verdict = '具備極佳的抗 AI 保護與長期留存護城河！透過 AI 降低後台文書工時、實體場域建立高轉換成本與社群口碑，能形成長期複利。';
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

function buildCaseRecord(def) {
  const inputs = { ...MOAT_PRESETS[def.presetKey] };
  const scored = calculateMoatScore(inputs);
  return {
    ...def,
    inputs,
    antiAiScore: scored.antiAi,
    moatScore: scored.moat
  };
}

const MATRIX_CASES = {
  'sw-exec': buildCaseRecord({
    id: 'sw-exec',
    name: '初階軟體寫碼與制式報告',
    quadrant: '象限一：標準化數位商品區（易被 AI 取代 × 低商業護城河）',
    tagClass: 'neg',
    presetKey: 'onlineCourse',
    valueProvided: '將明確規格轉化為標準程式碼、網頁切版或摘要報告。',
    aiImpact: '【任務自動化＋職業結構萎縮】AI 輔助寫碼使標準實作速度快 55.8%（Peng et al., 2023），純按規格敲鍵盤的初階職缺大幅縮減。',
    moatAnalysis: '幾乎無護城河：語法與模板已成為人人可用的公共基礎設施，單純「做得出來」不再具備定價權。',
    risks: '供給暴增導致外包單價崩跌；缺乏架構審核力會導致短期翻動率上升與技術債累積（GitClear 2024 分析 2020-2023 資料並預測 2024 翻倍）。',
    actionLearn: '從「背語法」轉向「系統架構拆解、邊界測試設計、AI 產出驗收除錯」。',
    actionBuildOwn: '不賣單純工時；轉向垂直領域工作流整合與高轉換成本系統。'
  }),
  'fnb-single': buildCaseRecord({
    id: 'fnb-single',
    name: '獨立手搖飲店／一般餐飲單店',
    quadrant: '象限二：實體紅海內卷區（難被 AI 直接取代 × 低商業護城河）',
    tagClass: 'warn',
    presetKey: 'drink',
    valueProvided: '現場飲品調製、即時味覺滿足與街角便利交付。',
    aiImpact: '【專用硬體自動化＋平台抽成】AI 無法隔空送飲料進肚子，但自動封口、定量果糖機與自動搖茶機削平了現場手藝門檻。',
    moatAnalysis: '抗 AI 但無商業護城河：全台飲料店逼近 2.9 萬家、手搖飲逾 1.6 萬家（財政部與經濟部 2024-2025 統計），配方易模仿，利潤被房東漲租與外送平台（25%~35%）抽乾。',
    risks: '15~44 歲勞動人口減少帶來結構性缺工、原物料與租金上漲、極高汰換率。',
    actionLearn: '學習數據化店務管理、私域會員經營與現場體驗設計，而非只練可被機器取代的搖茶動作。',
    actionBuildOwn: '切忌盲目砸退休金開無差異化單店；應累積自有品牌社群、供應鏈議價權或關鍵店面控制權。'
  }),
  'sw-system': buildCaseRecord({
    id: 'sw-system',
    name: '垂直領域軟體系統與高責任架構',
    quadrant: '象限三：系統與責任槓桿區（部分動作易被 AI 取代 × 高商業護城河）',
    tagClass: 'info',
    presetKey: 'swSystem',
    valueProvided: '解決特定行業（醫療、理財、教育、校務）真實痛點，承擔資安合規與系統穩定責任。',
    aiImpact: '【工作內容重組】AI 大幅加速標準施工與測試樣板生成，讓熟練架構師與 1~2 人小團隊能交付過去需要多人團隊才能完成的系統。',
    moatAnalysis: '護城河來自「嵌入客戶日常流程的轉換成本」、「長期累積的專屬業務數據」與「出事時有人簽字負責的信任契約」。',
    risks: '若只做薄殼包裝（Wrapper）易被大廠模型升級吞噬；必須深耕真實業務流程與邊界驗證。',
    actionLearn: '跨領域痛點洞察力、嚴格驗收標準設計（Gates & Tests）、高可信度系統工程。',
    actionBuildOwn: '打造「AI 自動化施工 × 垂直領域專業知識」的高黏著度系統資產。'
  }),
  'school-elite': buildCaseRecord({
    id: 'school-elite',
    name: '具獨特辦學文化與社群的實體學校',
    quadrant: '象限四：實體×信任複利區（難被 AI 取代 × 高商業護城河）',
    tagClass: 'pos',
    presetKey: 'privateSchool',
    valueProvided: '五合一價值綑綁：①安全托育照顧 ②同儕互動社會化 ③法規文憑認證 ④品格習慣養成 ⑤知識傳授。',
    aiImpact: '【部分環節改變】AI 可取代第⑤項「單向知識講授與解題家教」，但疫情封校實證顯示線上平台無法取代實體同儕社交與情緒發展（UNESCO, 2023）。',
    moatAnalysis: '雙重護城河：供給端有土地、校舍與立案法規硬門檻；需求端有「辦學口碑 → 吸引重視教育的家庭 → 優質同儕網路效應」的正向飛輪。',
    risks: '少子化人口結構萎縮（缺乏口碑與特色的後段學校仍會退場）、重資產折舊高、一般人資本門檻過高。',
    actionLearn: '孩子在校應重點鍛鍊面對面協作、衝突處理、同理領導與真實專題抗挫力。',
    actionBuildOwn: '一般創業者難以直接買地蓋校，可拆解其最精華的「同儕社會化＋專題實作＋家長信任」做成輕資產 OMO 模式。'
  }),
  'omo-pbl': buildCaseRecord({
    id: 'omo-pbl',
    name: 'NextLab 線上 AI 槓桿 × 線下實體 PBL 平台',
    quadrant: '象限四（輕資產切入）：實體×信任複利區（難被 AI 取代 × 高商業護城河）',
    tagClass: 'pos',
    presetKey: 'omoPbl',
    valueProvided: '為 6~18 歲下一代鍛鍊「提問、查證、專題落地、同儕協作」四大能力；為家庭提供看得見的成長作品集與觀測報告。',
    aiImpact: '【待驗證假設｜結構性賦能】目標以線上 AI 專題副駕省下約 50%~70% 個別化提問鷹架、進度追蹤與家長週報之非教學工時（待 MVP 實測核對），讓線下導師 100% 專注於實體小班同儕碰撞與動手實作。',
    moatAnalysis: '避開一樓高店租（採用目的型週末空間合作），靠「跨學期專題作品集轉換成本 ＋ 在地同儕與家長口碑網路 ＋ 專有 AI 引導教案庫」建立護城河。',
    risks: '初期需建立第一批種子家長信任；必須嚴格守住「AI 引導思考而非代寫答案」的教學品質，並於 MVP 實測驗證 AI 省時比例。',
    actionLearn: '導師與創業者需結合「AI 系統設計力」與「面對面高溫度引導力」。',
    actionBuildOwn: '一般專業成年人無須千萬資本即可啟動的「AI 數位槓桿 × 高信任實體服務」最佳試驗場。'
  })
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

const INFO_DOCS = {
  'methodology': {
    title: '研究方法論與三級證據判準（Epistemic Rules）',
    body: `
      <p>為了避免落入「未來學雞湯」或「盲目焦慮」，本專案嚴格區分三種知識等級：</p>
      <ul>
        <li><span class="hl">【已知事實】</span>：具備公開學術實驗、同行評審論文或政府官方統計數據支持，並標註具體年份（例如 GitHub/MIT 2023 實驗、UNESCO 2023 報告、經濟部 2024-2025 統計）。</li>
        <li><span class="hl">【合理推論】</span>：根據供需法則、邊際成本結構與轉換成本理論推導出的商業邏輯（例如：當生成程式碼邊際成本趨近於零，價值必然往前端問題定義與後端簽字責任兩端轉移）。</li>
        <li><span class="hl">【待驗證假設】</span>：尚在小規模實驗或隨技術演進可能改變的命題（例如本專案 OMO 平台之 AI 後台省時 50%〜70% 情境參數），需設定明確的量測基準與推翻條件。</li>
      </ul>
      <div class="info-eg">
        <strong>核心黃金律：</strong>每一個研究結論都必須連回實際行動選擇——「這代表我們值得學什麼（Learn）、打造什麼（Build）、擁有什麼（Own）？」
      </div>
    `
  },
  'anti-ai-vs-moat': {
    title: '為什麼「不容易被 AI 取代」不等於「擁有商業護城河」？',
    body: `
      <p>許多人直覺認為：「只要找一個需要實體場地、親手服務的工作，就不用怕 AI 了。」這只答對了一半。</p>
      <ul>
        <li><span class="hl">抗 AI 取代性（X 軸）</span>：衡量的是「技術能不能跨越物理與人際邊界直接替代你」。例如剪頭髮、做手搖飲、實體陪伴，AI 確實無法隔空完成。</li>
        <li><span class="hl">商業護城河（Y 軸）</span>：衡量的是「當這件事好賺時，其他人類同行能不能輕易複製你？房東與平台會不會把你的超額利潤抽乾？」</li>
      </ul>
      <div class="info-eg">
        <strong>經典反例（象限二）：</strong>開一家獨立手搖飲店，AI 確實喝不了也送不了飲料（高抗 AI）；但因為設備標準化、配方易模仿，隔一條街馬上開出 5 家競品，加上外送平台抽成 30% 與房東漲租，最後陷入「不會被 AI 取代，卻被同業與房東淘汰」的紅海內卷。
      </div>
    `
  },
  'evidence-sw': {
    title: '實證拆解：軟體開發的生產力躍升與「程式碼翻動率」警訊',
    body: `
      <p>針對軟體開發受 AI 影響的程度，我們交叉比對了兩份關鍵研究資料：</p>
      <ul>
        <li><span class="hl">速度提升 55.8%（Peng et al., 2023/02）</span>：GitHub、MIT 與微軟研究院對 95 名開發者進行隨機對照實驗（實作 HTTP 伺服器），使用 Copilot 組平均僅花 71 分鐘，較對照組（161 分鐘）快 55.8%。</li>
        <li><span class="hl">短期翻動率（Code Churn）上升與 2024 翻倍預測（GitClear, 2024/01）</span>：GitClear 報告（<code>coding_on_copilot_data_shows_ais_downward_pressure_on_code_quality</code>）分析 2020〜2023 年超過 1.53 億行變更程式碼發現，寫入後兩週內即被修改或刪除的「短期翻動率」與複製貼上重複碼在 2022〜2023 年明顯上升，並據此預測 2024 年翻動率將較 2021 年 AI 普及前基準翻倍。</li>
      </ul>
      <div class="info-eg">
        <strong>對學習與職涯的啟示：</strong>「把程式碼敲出來」已經廉價化，但「定義清楚邊界條件、設計自動化測試閘門（Gates）、看穿 AI 潛在漏洞並簽字負責」的系統架構能力反而變得前所未有地昂貴。
      </div>
    `
  },
  'evidence-school': {
    title: '實證拆解：UNESCO 2023 全球教育報告與實體學校的五合一價值',
    body: `
      <p>如果 AI 能提供全世界最頂尖的個人化解題家教，實體學校會消失嗎？</p>
      <ul>
        <li><span class="hl">UNESCO《全球教育監測報告》（2023/07）</span>：回顧 COVID-19 封校期間，全球 91% 國家透過線上平台提供遠距教學，但僅約 25% 學生真正有效參與；缺乏實體同儕互動與教師當面引導，導致學習落差擴大與青少年心理健康惡化。</li>
        <li><span class="hl">五合一價值綑綁</span>：學校真正賣的不只是「⑤ 知識講授」，還綑綁了「① 安全托育照顧（解放雙薪家長生產力）」、「② 同儕互動與社會化」、「③ 法定文憑認證」與「④ 團體作息品格養成」。</li>
      </ul>
      <div class="info-eg">
        <strong>護城河真相：</strong>土地與校舍只是供給端資本門檻；真正讓名校在少子化下依然滿招的護城河，是「辦學文化口碑 → 吸引高投入家庭 → 形成優質同儕網路效應」的正向循環。
      </div>
    `
  },
  'evidence-fnb': {
    title: '實證拆解：台灣飲料店 1,300 億產值背後的 2.9 萬店紅海結構',
    body: `
      <p>根據台灣經濟部統計處與財政部財政資訊中心（2024〜2025 年最新統計）：</p>
      <ul>
        <li><span class="hl">市場規模龐大但極度擁擠</span>：全台飲料店年營業額突破 1,300 億元，但總店數逼近 2.9 萬家（其中手搖飲店超過 1.6 萬家），密度居全球之冠。</li>
        <li><span class="hl">三明治利潤擠壓</span>：① 前端受外送平台（25%〜35% 抽成）與街邊一樓店租綁架；② 中端因自動煮茶機、定量果糖機普及，手藝門檻消失；③ 後端面臨 15〜44 歲青壯年人口下滑帶來的結構性缺工。</li>
      </ul>
      <div class="info-eg">
        <strong>給創業者的警語：</strong>在實體產業中，真正能留住利潤的不是「辛苦搖茶的勞力」，而是「品牌私域社群（免被平台抽成）」、「供應鏈規模」或「目的型場地控制權（免搶一樓天價店面）」。
      </div>
    `
  },
  'evidence-pbl': {
    title: '實證拆解：OECD 社會情緒技能調查與 Lucas PBL 學校課程隨機對照實驗',
    body: `
      <p>我們將教育文獻的<strong>「已知事實（研究直接觀察到的結果）」</strong>與本專案的<strong>「合理推論／待驗證假設」</strong>嚴格區分：</p>
      <ul>
        <li><span class="hl">【已知事實】Lucas Education Research（2021）學校課程隨機對照實驗（RCT）</span>：① 高中 AP 美國政府與環境科學實驗（Saavedra et al., 2021，逾 3,600 名學生）顯示，採用專案式課程的學生在當年 AP 考試取得可換學分成績（3 分以上）的比例較傳統組高約 <strong>8 個百分點</strong>（次年續教班級約 <strong>10 個百分點</strong>）；② 小學三年級科學實驗（Krajcik et al., 2021，逾 2,300 名學生）顯示，PBL 組在州立科學總結性評量高出 <strong>8 個百分點</strong>。<em>研究限制：上述實驗測量的是正規學校班級在特定學科之當期測驗與及格率，並非直接測量課外 6〜8 人小班或跨數十年的普遍長期遷移。</em></li>
        <li><span class="hl">【已知事實】OECD《社會與情緒技能調查》（2021 / 2024）</span>：針對多國城市 10 歲與 15 歲學生進行抽樣橫斷面問卷調查（2019、2023 為兩輪調查，並非追蹤同一批兒童至成年職涯的縱貫實驗），顯示好奇心（Curiosity）、毅力／抗挫力（Persistence）與同理協作，與學生當期學業成績、生活滿意度及教育與職業抱負呈顯著正向關聯。</li>
      </ul>
      <div class="info-eg">
        <strong>【合理推論與待驗證假設】從文獻到本專案 OMO 小班模式的成立條件：</strong><br />
        基於上述文獻，我們<strong>合理推論</strong>在標準答案廉價化的時代，結合專題探究與同儕協作更具培養價值；至於本專案<strong>「課外 6〜8 人實體小班 ＋ 線上 AI 副駕」能否達成跨領域長期遷移、職涯優勢，以及省下 50%〜70% 後台備課與週報工時</strong>，皆屬<strong>【待驗證假設】</strong>，須滿足「嚴謹查證鷹架、導師反詰把關、跨期作品集追蹤」三項條件並於 MVP 實測驗證。
      </div>
    `
  },
  'socratic-ai': {
    title: '蘇格拉底式 AI 專題副駕：防代寫機制與後台省時假設驗證條件',
    body: `
      <p>家長最擔心孩子用 ChatGPT 直接複製貼上交作業，導致大腦外包、思考退化。NextLab 的線上 AI 副駕採用三層防代寫機制：</p>
      <ul>
        <li><span class="hl">1. 系統提示詞鎖定反詰法（Socratic Prompt Guard）</span>：當學員輸入「幫我寫出社區節電方案」，AI 副駕不會給方案，而是反問：「你觀察過社區走廊的燈是幾點亮嗎？你覺得最浪費電的三個角落是哪裡？」</li>
        <li><span class="hl">2. 刻意埋設「AI 破綻偵查題」</span>：每週提供一段含細微事實錯誤或邏輯跳躍的 AI 短文，要求學員用實體觀察或外部來源抓出破綻，才能解鎖下一關。</li>
        <li><span class="hl">3. 實體發表交叉驗收</span>：週末線下工作坊要求學員不看稿向隊友解釋自己的設計並動手組裝，任何只靠代寫的內容在現場協作中一秒現形。</li>
      </ul>
      <div class="info-eg">
        <strong>【待驗證假設】後台省時 50%〜70% 之量測基準與推翻條件：</strong><br />
        試算器以「傳統每班備課 3.5 小時 ＋ 每位學員週報 0.45 小時」為基準，模擬高（省 70%）、中（省 50%）、低（省 25%）三檔非教學工時節省（不直接扣減固定現金支出）。每份週報仍須導師錄製 1 分鐘語音並審核簽名；若 MVP 實測節省低於 40% 或家長滿意度下降，即下修單人開班數並提前配置兼職助教。
      </div>
    `
  },
  'destination-venue': {
    title: '目的型場地策略（Destination Service）：場地佔比 <15% 目標之成立條件',
    body: `
      <p>餐飲與零售店之所以辛苦，是因為依賴「過路客隨機衝動消費」，必須承租每坪單價最高的一樓街邊店面。</p>
      <ul>
        <li><span class="hl">高信任教育服務屬於「目的型到訪」</span>：家長與學員是因為信任導師與同儕社群而專程前來，不需要一樓落地窗招牌。</li>
        <li><span class="hl">階段一（0〜6 個月）週末時段合作租借【目標條件：場地費佔營收 &lt;15%】</span>：與獨立書店、文創園區、共同工作空間合作，只租週六日白天時段（平日零空置租金）。依試算模型每班每月場地費 NT$ 7,200（4 週 × NT$ 1,800）計算：<strong>當每班招滿 8 人、月費 NT$ 6,800 時，場地費佔營收約 13.2%（達成 &lt;15% 目標）</strong>；但若初期每班僅 6 人（月費 NT$ 6,800），場地佔比為 <strong>17.6%</strong>；若僅 4 人且月費降至 NT$ 3,600，場地佔比將達 <strong>50%</strong>。因此「場地費低於 15%」並非租用週末場地即自動成立，而是須同時達成單班人數與定價門檻的營運目標。</li>
        <li><span class="hl">階段二（6 個月後）二樓以上創客基地</span>：待穩定滿 4 班（32 人、月營收 NT$ 217,600）後，承租公園或捷運站旁二樓工作室（月租約 NT$ 32,000，佔比約 14.7%），即使房東漲租也能平移，掌握 100% 客戶名單控制權。</li>
      </ul>
    `
  }
};

const PBL_MODULES = {
  'mod-a': {
    id: 'mod-a',
    badge: '旗艦專題模組 A｜適合 10〜13 歲（8 週完整循環）',
    title: '《AI 破綻偵探社：社區真偽資訊查核指南》',
    coreSkills: 'AI 查證把關力 × 科學實證思維 × 跨世代同理溝通',
    schedule: [
      '【第 1〜2 週｜真實痛點採集】學員回家訪談阿公阿嬤或爸媽群組最常轉傳的 10 則生活／健康／科技傳言，在線上 AI 副駕引導下分類「可驗證事實」與「主觀推論」。',
      '【第 3〜4 週｜與 AI 攻防實驗】請 AI 分別扮演「正方推銷員」與「反方科學家」列出論據，小隊在週末工作坊動手做對照小實驗或查核政府／學術公開資料庫，抓出 AI 幻覺。',
      '【第 5〜6 週｜實體作品打造】將查核結果轉化為長輩看得懂的「大字版實體圖解轉盤／防詐防謠手冊」，並找 3 位真實長輩試讀測試。',
      '【第 7〜8 週｜公開 Demo Day 發表】邀請家長與社區里民參與發表會，小隊現場展示實驗數據並接受觀眾即席提問。'
    ],
    deliverable: '每位學員可獲得：1 本實體查核圖解手冊成品、AI 提問與查證歷程紀錄單、導師觀測能力雷達圖。'
  },
  'mod-b': {
    id: 'mod-b',
    badge: '旗艦專題模組 B｜適合 10〜15 歲（8 週完整循環）',
    title: '《家庭與校園日常痛點改造王》',
    coreSkills: '問題定義與拆解力 × 硬體/流程造物落地 × 失敗迭代抗挫力',
    schedule: [
      '【第 1〜2 週｜痛點觀察日記】不准先想「我要做什麼酷炫科技」，而是連續 7 天記錄家裡或教室裡「最常讓人忘記、找太久或浪費資源」的真實摩擦。',
      '【第 3〜4 週｜AI 輔助原型設計】利用線上 AI 副駕協助構思 3 種低成本解法（機構改造、流程視覺化或簡易微控制器感測提醒），週末小隊互評選出最可行方案。',
      '【第 5〜6 週｜真實場域壓力測試】把第一版原型帶回家或班上實際使用 14 天！紀錄「哪裡壞掉、為什麼家人懶得用」，回工作坊進行第二版修正。',
      '【第 7〜8 週｜Demo Day 前後數據對決】帶著「改造前 vs. 改造後」的真實統計數據與第二代實體原型上台發表。'
    ],
    deliverable: '每位學員可獲得：1 件可運作的實體改造原型、14 天真實用戶測試報告、跨學期個人專題作品集頁面。'
  },
  'mod-c': {
    id: 'mod-c',
    badge: '旗艦專題模組 C｜適合 12〜18 歲（8 週完整循環）',
    title: '《週末微型快閃創業與價值實驗》',
    coreSkills: '商業護城河思維 × AI 數位槓桿應用 × 團隊領導與抗拒挫力',
    schedule: [
      '【第 1〜2 週｜價值主張與競品拆解】小隊在 NT$ 1,500 啟動資金上限內，定義一個能為特定受眾解決問題的實體產品或現場服務，並用雙軸四象限模型評估差異化。',
      '【第 3〜4 週｜AI 槓桿極速試作】運用 AI 工具快速完成成本試算表、訪談問卷與攤位視覺設計，把省下的時間全部拿來打磨實體產品品質與現場服務動線。',
      '【第 5〜6 週｜街頭預熱與盲測修正】在工作坊進行模擬路人快閃盲測，經歷「沒人停下來看、被嫌太貴、隊友意見分歧」的真實摩擦並即時調整定價與話術。',
      '【第 7〜8 週｜真實市集快閃 ＋ 股東會覆盤】於週末文創或社區市集實際擺攤交易，最後一週召開「微型股東覆盤會」，結算真實損益並分析學到的護城河課題。'
    ],
    deliverable: '每位學員可獲得：真實市集營運損益表與覆盤報告、團隊角色領導力互評紀錄、青少年創業實戰作品集認證。'
  }
};

function hydrateIcons(root) {
  const scope = root || (typeof document !== 'undefined' ? document : null);
  if (!scope || !scope.querySelectorAll) return;
  scope.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.getAttribute('data-icon');
    const svg = ICONS[name];
    if (svg && el.getAttribute('data-icon-hydrated') !== name) {
      el.innerHTML = svg;
      el.setAttribute('data-icon-hydrated', name);
    }
  });
}

function showToast(msg, durationMs) {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, durationMs || 3200);
}

async function copyTextToClipboard(text) {
  if (!text) return false;
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
    }
  }
  if (typeof document !== 'undefined' && typeof document.execCommand === 'function' && document.body) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      if (typeof ta.select === 'function') ta.select();
      const ok = Boolean(document.execCommand('copy'));
      ta.remove();
      if (ok) return true;
    } catch (_) {
    }
  }
  return false;
}

function bindBackdropClose(bg, close) {
  let downOnBackdrop = false;
  bg.addEventListener('mousedown', (e) => {
    downOnBackdrop = e.target === bg;
  });
  bg.addEventListener('mouseup', (e) => {
    if (downOnBackdrop && e.target === bg) close();
    downOnBackdrop = false;
  });
}

function bindModalAccessibility(bg, close) {
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };
  document.addEventListener('keydown', onKeyDown);
  const firstBtn = bg.querySelector('input, select, textarea, button[data-close], .x-close');
  if (firstBtn && typeof firstBtn.focus === 'function') {
    firstBtn.focus();
  }
  return () => document.removeEventListener('keydown', onKeyDown);
}

function openModal(title, bodyHtml, actionsHtml) {
  if (typeof document === 'undefined') return null;
  const root = document.getElementById('modal-root');
  if (!root) return null;
  const triggerEl = document.activeElement;
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-head">
        <h2>${title}</h2>
        <button type="button" class="x-close" data-close aria-label="關閉視窗">×</button>
      </div>
      <div class="modal-body">
        <div class="info-body">${bodyHtml}</div>
        <div class="form-actions sticky-actions">
          ${actionsHtml || '<button type="button" class="btn" data-close>了解</button>'}
        </div>
      </div>
    </div>
  `;
  root.innerHTML = '';
  root.appendChild(bg);
  let cleanupA11y = () => {};
  const close = () => {
    cleanupA11y();
    bg.remove();
    if (triggerEl && typeof triggerEl.focus === 'function') triggerEl.focus();
  };
  cleanupA11y = bindModalAccessibility(bg, close);
  bindBackdropClose(bg, close);
  bg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  return { bg, close };
}

function openInfo(key) {
  const doc = INFO_DOCS[key];
  if (!doc) return;
  openModal(doc.title, doc.body);
}

function setResearchWorkspaceFilter(filterKey) {
  if (typeof document === 'undefined') return;
  const wsTabs = document.querySelectorAll('[data-workspace-filter]');
  wsTabs.forEach((t) => t.classList.toggle('is-active', t.getAttribute('data-workspace-filter') === filterKey));
  document.querySelectorAll('#nav a[data-nav-filter]').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('data-nav-filter') === filterKey);
  });
  document.querySelectorAll('[data-ws-section]').forEach((sec) => {
    const secKey = sec.getAttribute('data-ws-section');
    if (filterKey === 'all' || secKey === filterKey) {
      sec.classList.remove('hidden');
    } else {
      sec.classList.add('hidden');
    }
  });
}

function applyMoatPresetByKey(presetKey, labelOverride) {
  if (typeof document === 'undefined') return false;
  const p = MOAT_PRESETS[presetKey];
  if (!p) return false;
  const calcSec = document.getElementById('calculator-section');
  if (calcSec && calcSec.classList.contains('hidden')) {
    setResearchWorkspaceFilter('calculator');
  }
  document.querySelectorAll('[data-moat-preset]').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-moat-preset') === presetKey);
  });
  Object.entries(p).forEach(([k, v]) => {
    const el = document.getElementById(`moat-${k}`);
    if (el) el.value = String(v);
    const valSpan = document.getElementById(`moat-${k}-val`);
    if (valSpan) valSpan.textContent = `${v} / 10`;
  });
  const res = calculateMoatScore(p);
  const antiAiEl = document.getElementById('calc-anti-ai');
  const moatEl = document.getElementById('calc-moat-score');
  const quadEl = document.getElementById('calc-quadrant');
  const verdictEl = document.getElementById('calc-verdict');
  if (antiAiEl) antiAiEl.textContent = `${res.antiAi} 分`;
  if (moatEl) moatEl.textContent = `${res.moat} 分`;
  if (quadEl) quadEl.textContent = res.quadrant;
  if (verdictEl) verdictEl.textContent = res.verdict;
  if (calcSec && typeof calcSec.scrollIntoView === 'function') {
    calcSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (labelOverride) {
    showToast(`已套用「${labelOverride}」參數至雙軸護城河計分器`);
  }
  return true;
}

function openCaseModal(caseId) {
  const item = MATRIX_CASES[caseId] || MATRIX_CASES['omo-pbl'];
  const body = `
    <p><span class="tag ${item.tagClass}">${item.quadrant}</span></p>
    <p><strong>顧客真正付費的底層價值：</strong>${item.valueProvided}</p>
    <div class="score-bars">
      <div>
        <div class="score-label"><span>抗 AI 直接取代性</span><span>${item.antiAiScore} / 100</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${item.antiAiScore}%"></div></div>
      </div>
      <div>
        <div class="score-label"><span>商業護城河與留利力</span><span>${item.moatScore} / 100</span></div>
        <div class="progress-track"><div class="progress-fill accent" style="width:${item.moatScore}%"></div></div>
      </div>
    </div>
    <ul>
      <li><span class="hl">AI 與自動化衝擊環節：</span>${item.aiImpact}</li>
      <li><span class="hl">護城河真偽拆解：</span>${item.moatAnalysis}</li>
      <li><span class="hl">主要經營與職涯風險：</span>${item.risks}</li>
    </ul>
    <div class="info-eg">
      <div><strong>🌱 值得學什麼（Learn）：</strong>${item.actionLearn}</div>
      <div style="margin-top:6px;"><strong>🏗️ 值得打造與擁有什麼（Build & Own）：</strong>${item.actionBuildOwn}</div>
    </div>
  `;
  const actions = `
    <button type="button" class="btn-ghost" data-apply-preset="${item.presetKey}">套用此案例至護城河計分器</button>
    <button type="button" class="btn" data-close>了解</button>
  `;
  const modalInstance = openModal(`案例深度拆解｜${item.name}`, body, actions);
  if (modalInstance) {
    const presetBtn = modalInstance.bg.querySelector('[data-apply-preset]');
    if (presetBtn) {
      presetBtn.addEventListener('click', () => {
        const key = presetBtn.getAttribute('data-apply-preset');
        modalInstance.close();
        applyMoatPresetByKey(key, item.name);
      });
    }
  }
}

function openMoatReportModal() {
  const inputs = {};
  ['physical', 'trust', 'switching', 'network', 'aiLeverage', 'rentFreedom'].forEach((k) => {
    const el = document.getElementById(`moat-${k}`);
    inputs[k] = el ? Number(el.value) : 5;
  });
  const res = calculateMoatScore(inputs);
  const weakPoints = [];
  if (inputs.physical <= 5) weakPoints.push('實體場域與現場交付壁壘偏低（純數位交付易遭 AI 快速複製，建議結合線下工作坊、硬體實作或在地專屬場域）');
  if (inputs.trust <= 5) weakPoints.push('當面情感連結與信任擔保偏弱（建議強化真人導師雙向引導、家長定期觀課或安全照護承諾）');
  if (inputs.switching <= 5) weakPoints.push('客戶轉換成本偏低（建議加入跨期作品集、會員數位資產或長期服務契約）');
  if (inputs.network <= 5) weakPoints.push('缺乏同儕或社群網路效應（建議導入小班同儕共學或私域轉介紹機制）');
  if (inputs.aiLeverage <= 5) weakPoints.push('AI 後台槓桿不足（建議將標準備課、紀錄與報表草稿交給 AI 輔助生成）');
  if (inputs.rentFreedom <= 5) weakPoints.push('易受一樓店租或外送平台抽成綁架（建議轉向目的型預約制空間或二樓基地）');
  if (weakPoints.length === 0) weakPoints.push('六大維度均衡強健，具備典型的「AI 後台省時 × 線下高信任留存」雙重複利特徵！');

  const summaryText = `診斷結果：${res.quadrant}（抗 AI ${res.antiAi} 分／護城河 ${res.moat} 分）｜${res.verdict}`;

  const body = `
    <p><span class="tag pos">${res.quadrant}</span></p>
    <div class="score-bars">
      <div>
        <div class="score-label"><span>抗 AI 直接取代分數</span><span>${res.antiAi} 分</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${res.antiAi}%"></div></div>
      </div>
      <div>
        <div class="score-label"><span>商業護城河留利分數</span><span>${res.moat} 分</span></div>
        <div class="progress-track"><div class="progress-fill accent" style="width:${res.moat}%"></div></div>
      </div>
    </div>
    <p><strong>綜合診斷結論：</strong>${res.verdict}</p>
    <div class="info-eg">
      <strong>🛠️ 下一步結構優化處方：</strong>
      <ul>
        ${weakPoints.map((w) => `<li>${w}</li>`).join('')}
      </ul>
    </div>
    <div id="moat-copy-fallback-wrap" class="sim-control hidden" style="margin-top:12px;">
      <label for="moat-copy-fallback"><span>手動複製診斷摘要</span><span>請按 Cmd/Ctrl+C</span></label>
      <input type="text" id="moat-copy-fallback" class="form-input" readonly value="${summaryText}" />
    </div>
  `;
  const actions = `
    <button type="button" class="btn-ghost" id="btn-copy-moat-report">複製診斷摘要</button>
    <button type="button" class="btn" data-close>完成檢視</button>
  `;
  const modalInstance = openModal('📋 事業與職涯「雙軸護城河」完整診斷報告', body, actions);
  if (modalInstance) {
    const copyBtn = modalInstance.bg.querySelector('#btn-copy-moat-report');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const ok = await copyTextToClipboard(summaryText);
        if (ok) {
          showToast(`已複製診斷結果：${res.quadrant}（抗 AI ${res.antiAi} 分／護城河 ${res.moat} 分）`);
          modalInstance.close();
        } else {
          const wrap = modalInstance.bg.querySelector('#moat-copy-fallback-wrap');
          const inp = modalInstance.bg.querySelector('#moat-copy-fallback');
          if (wrap) wrap.classList.remove('hidden');
          if (inp && typeof inp.select === 'function') inp.select();
          showToast('無法自動寫入剪貼簿，請直接複製視窗下方摘要文字');
        }
      });
    }
  }
}

function openModuleModal(modId) {
  const mod = PBL_MODULES[modId] || PBL_MODULES['mod-a'];
  const body = `
    <p><span class="tag pos">${mod.badge}</span></p>
    <p><span class="hl">核心鍛鍊能力：</span>${mod.coreSkills}</p>
    <p><strong>8 週線上 AI 副駕 × 線下實體工作坊進度拆解：</strong></p>
    <ul>
      ${mod.schedule.map((s) => `<li>${s}</li>`).join('')}
    </ul>
    <div class="info-eg">
      <strong>🏆 學員期末具體產出（Portfolio Deliverable）：</strong><br />
      ${mod.deliverable}
    </div>
  `;
  const actions = `
    <button type="button" class="btn-ghost" data-open-trial="${mod.title}">預約此模組體驗課</button>
    <button type="button" class="btn" data-close>了解</button>
  `;
  const modalInstance = openModal(mod.title, body, actions);
  if (modalInstance) {
    const trialBtn = modalInstance.bg.querySelector('[data-open-trial]');
    if (trialBtn) {
      trialBtn.addEventListener('click', () => {
        const title = trialBtn.getAttribute('data-open-trial');
        modalInstance.close();
        openTrialFormModal(title);
      });
    }
  }
}

function openEconDetailModal() {
  const studentsPerClassEl = document.getElementById('sim-students');
  const classesCountEl = document.getElementById('sim-classes');
  const monthlyFeeEl = document.getElementById('sim-fee');
  const venueModeEl = document.getElementById('sim-venue');
  const aiLevelEl = document.getElementById('sim-ai');

  const currentParams = {
    studentsPerClass: studentsPerClassEl ? Number(studentsPerClassEl.value) : 8,
    classesCount: classesCountEl ? Number(classesCountEl.value) : 4,
    monthlyFee: monthlyFeeEl ? Number(monthlyFeeEl.value) : 6800,
    venueMode: venueModeEl ? venueModeEl.value : 'partner',
    aiLevel: aiLevelEl ? aiLevelEl.value : 'high'
  };
  const cur = calculateUnitEconomics(currentParams);
  const s1 = calculateUnitEconomics({ ...currentParams, classesCount: 2, venueMode: 'partner' });
  const s2 = calculateUnitEconomics({ ...currentParams, classesCount: 4, venueMode: 'studio2f' });
  const s3 = calculateUnitEconomics({ ...currentParams, classesCount: 6, venueMode: 'studio2f' });

  const body = `
    <p>以下為您目前設定參數（每班 <strong>${currentParams.studentsPerClass} 人</strong>、共 <strong>${currentParams.classesCount} 班</strong>、月費 <strong>NT$ ${currentParams.monthlyFee.toLocaleString()}</strong>）的單月損益與工時情境拆解：</p>
    <ul>
      <li><span class="hl">單月總營業額：</span>NT$ ${cur.monthlyRevenue.toLocaleString()}（共 ${cur.totalStudents} 位學員，零外送或流量平台抽成）</li>
      <li><span class="hl">固定成本小計：</span>NT$ ${cur.fixedCost.toLocaleString()}（含場地費 NT$ ${cur.venueCost.toLocaleString()}，佔當月營收 <strong>${cur.venueCostPct}%</strong>；軟體基建 NT$ 3,500；超過 3 班之兼職助教費）</li>
      <li><span class="hl">學員變動成本：</span>NT$ ${(cur.totalCost - cur.fixedCost).toLocaleString()}（每位學員教材與 AI 權杖費 NT$ 450）</li>
      <li><span class="hl">單月預估營業利益（Net Profit）：</span><strong>NT$ ${cur.netProfit.toLocaleString()}</strong>（營業利益率 ${cur.marginPct}%，固定成本除以每人邊際貢獻之損益兩平點：${cur.breakEvenStudents} 人）</li>
      <li><span class="hl">導師工時假設情境：</span>每週總工時 ${cur.totalWeeklyHours} 小時（【待驗證假設】依所選情境係數，AI 每週省下 ${cur.savedWeeklyHours} 小時非教學備課與週報時間，待 MVP 實測核對）</li>
    </ul>
    <div class="info-eg">
      <strong>📈 三階段擴張壓力測試對照（情境推估）：</strong>
      <ul>
        <li><strong>階段一（MVP 2 班／合作空間）：</strong>營收 NT$ ${s1.monthlyRevenue.toLocaleString()}｜場地佔比 ${s1.venueCostPct}%｜營業利益 NT$ ${s1.netProfit.toLocaleString()}（利益率 ${s1.marginPct}%，損平 ${s1.breakEvenStudents} 人）</li>
        <li><strong>階段二（穩定期 4 班／二樓基地）：</strong>營收 NT$ ${s2.monthlyRevenue.toLocaleString()}｜場地佔比 ${s2.venueCostPct}%｜營業利益 NT$ ${s2.netProfit.toLocaleString()}（利益率 ${s2.marginPct}%，損平 ${s2.breakEvenStudents} 人）</li>
        <li><strong>階段三（滿載期 6 班／二樓基地＋助教）：</strong>營收 NT$ ${s3.monthlyRevenue.toLocaleString()}｜場地佔比 ${s3.venueCostPct}%｜營業利益 NT$ ${s3.netProfit.toLocaleString()}（利益率 ${s3.marginPct}%，損平 ${s3.breakEvenStudents} 人）</li>
      </ul>
    </div>
  `;
  openModal('📊 單點營運財務損益明細與三階段壓力測試', body);
}

function openTrialFormModal(prefillTopic) {
  const body = `
    <p>這是一份互動模擬表單（展示 NextLab OMO 平台如何收集種子家庭與合作夥伴名單，無外部伺服器傳輸）：</p>
    <div class="sim-control">
      <label for="trial-role">您的身分視角</label>
      <select id="trial-role" class="form-input">
        <option value="家長：想為 6~18 歲孩子預約週末體驗與 Demo Day">👨‍👩‍👧 家長：想為 6~18 歲孩子預約週末體驗與 Demo Day</option>
        <option value="創業者／導師：想交流 OMO PBL 商業模式與 AI 副駕系統">🚀 創業者／導師：想交流 OMO PBL 商業模式與 AI 副駕系統</option>
        <option value="空間主理人：想提供週末合作場地">🏠 空間主理人：想提供週末合作場地</option>
      </select>
    </div>
    <div class="sim-control">
      <label for="trial-topic">感興趣的主題或專題模組</label>
      <input type="text" id="trial-topic" class="form-input" value="${prefillTopic || '《AI 破綻偵探社》＋ 週末實體創客工作坊'}" />
    </div>
    <div class="sim-control">
      <label for="trial-note">想優先解決的問題或備註</label>
      <input type="text" id="trial-note" class="form-input" placeholder="例如：孩子目前 11 歲，想培養主動提問與查證習慣" />
    </div>
  `;
  const actions = `
    <button type="button" class="btn-ghost" data-close>取消</button>
    <button type="button" class="btn" id="btn-submit-trial">送出模擬登記</button>
  `;
  const modalInstance = openModal('✨ 預約 NextLab 實體工作坊體驗／索取創業藍圖', body, actions);
  if (modalInstance) {
    const submitBtn = modalInstance.bg.querySelector('#btn-submit-trial');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const roleEl = modalInstance.bg.querySelector('#trial-role');
        const topicEl = modalInstance.bg.querySelector('#trial-topic');
        const roleText = roleEl ? roleEl.value.split('：')[0] : '訪客';
        const topicText = topicEl ? topicEl.value : '';
        modalInstance.close();
        showToast(`已完成模擬登記（${roleText}｜${topicText}）！`);
      });
    }
  }
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

  const venueCostPct = monthlyRevenue > 0 ? +(venueCost / monthlyRevenue * 100).toFixed(1) : 0;
  const variableCostPerStudent = 450;
  const fixedSoftwareCost = 3500;
  const materialAndAiCost = totalStudents * variableCostPerStudent + fixedSoftwareCost;
  const mentorAssistantCost = classesCount > 3 ? (classesCount - 2) * 8000 : 0;
  const fixedCost = venueCost + fixedSoftwareCost + mentorAssistantCost;
  const totalCost = fixedCost + totalStudents * variableCostPerStudent;
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
  const contributionPerStudent = Math.max(monthlyFee - variableCostPerStudent, 1);
  const breakEvenStudents = Math.ceil(fixedCost / contributionPerStudent);

  return {
    totalStudents,
    monthlyRevenue,
    venueCost,
    venueCostPct,
    fixedCost,
    totalCost,
    netProfit,
    marginPct,
    totalWeeklyHours,
    savedWeeklyHours,
    breakEvenStudents
  };
}

function bindGlobalInteractions() {
  hydrateIcons(document);

  document.addEventListener('click', (e) => {
    const infoBtn = e.target.closest('[data-info-key]');
    if (infoBtn) {
      e.preventDefault();
      openInfo(infoBtn.getAttribute('data-info-key'));
      return;
    }
    const caseModalBtn = e.target.closest('[data-open-case-modal]');
    if (caseModalBtn) {
      e.preventDefault();
      openCaseModal(caseModalBtn.getAttribute('data-open-case-modal'));
      return;
    }
    const modModalBtn = e.target.closest('[data-open-module]');
    if (modModalBtn) {
      e.preventDefault();
      openModuleModal(modModalBtn.getAttribute('data-open-module'));
      return;
    }
    const moatReportBtn = e.target.closest('[data-open-moat-report]');
    if (moatReportBtn) {
      e.preventDefault();
      openMoatReportModal();
      return;
    }
    const econModalBtn = e.target.closest('[data-open-econ-modal]');
    if (econModalBtn) {
      e.preventDefault();
      openEconDetailModal();
      return;
    }
    const trialModalBtn = e.target.closest('[data-open-trial-modal]');
    if (trialModalBtn) {
      e.preventDefault();
      openTrialFormModal(trialModalBtn.getAttribute('data-open-trial-modal') || '');
    }
  });
}

function initResearchPage() {
  const wsTabs = document.querySelectorAll('[data-workspace-filter]');
  if (wsTabs.length) {
    wsTabs.forEach((t) => {
      t.addEventListener('click', () => setResearchWorkspaceFilter(t.getAttribute('data-workspace-filter')));
    });
    document.querySelectorAll('[data-nav-filter]').forEach((navLink) => {
      navLink.addEventListener('click', (e) => {
        const fk = navLink.getAttribute('data-nav-filter');
        if (fk) {
          e.preventDefault();
          setResearchWorkspaceFilter(fk);
          if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      });
    });
  }

  const detailPanel = document.getElementById('matrix-detail');
  if (detailPanel) {
    const renderCase = (caseId) => {
      const item = MATRIX_CASES[caseId] || MATRIX_CASES['omo-pbl'];
      document.querySelectorAll('.case-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-case') === item.id);
      });
      detailPanel.innerHTML = `
        <div>
          <div class="card-head" style="margin-bottom:8px;">
            <span class="tag ${item.tagClass}">${item.quadrant}</span>
            <button type="button" class="btn-ghost btn-sm" data-open-case-modal="${item.id}">🔍 深度拆解跳窗</button>
          </div>
          <h3 class="card-title" style="font-size:19px; margin-bottom:6px;">${item.name}</h3>
          <p style="color:var(--text-dim); font-size:13.5px; margin:0 0 10px;"><strong>底層價值：</strong>${item.valueProvided}</p>
          <div class="score-bars">
            <div class="score-item">
              <div class="score-label"><span>抗 AI 直接取代性</span><span>${item.antiAiScore} / 100</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${item.antiAiScore}%"></div></div>
            </div>
            <div class="score-item">
              <div class="score-label"><span>商業護城河與留利力</span><span>${item.moatScore} / 100</span></div>
              <div class="progress-track"><div class="progress-fill accent" style="width:${item.moatScore}%"></div></div>
            </div>
          </div>
          <div class="detail-item-list">
            <div class="detail-item-box"><strong>🤖 AI 與自動化改變的環節：</strong>${item.aiImpact}</div>
            <div class="detail-item-box"><strong>🏰 護城河真偽拆解：</strong>${item.moatAnalysis}</div>
            <div class="detail-item-box"><strong>⚠️ 主要經營與職涯風險：</strong>${item.risks}</div>
          </div>
        </div>
        <div class="dact pos" style="margin-top:16px;">
          <div>
            <div class="dact-title">🌱 值得學（Learn）：${item.actionLearn}</div>
            <div class="dact-reason">🏗️ 值得打造與擁有（Build & Own）：${item.actionBuildOwn}</div>
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
        const active = btn.getAttribute('data-age-tab') === ageKey;
        btn.classList.toggle('active', active);
        btn.classList.toggle('is-active', active);
      });
      ageContainer.innerHTML = `
        <div class="dact warn" style="margin-bottom:14px;">
          <div>
            <div class="dact-title">${plan.title}</div>
            <div class="dact-reason">${plan.focus}</div>
          </div>
        </div>
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
        const key = btn.getAttribute('data-moat-preset');
        if (applyMoatPresetByKey(key)) {
          showToast(`已載入預設參數：${btn.textContent.trim()}`);
        }
      });
    });

    updateMoatUI();
  }
}

function initVenturePage() {
  const modeBtns = document.querySelectorAll('[data-lens-mode]');
  if (modeBtns.length) {
    const applyLens = (mode) => {
      modeBtns.forEach((b) => {
        const active = b.getAttribute('data-lens-mode') === mode;
        b.classList.toggle('active', active);
        b.classList.toggle('is-active', active);
      });
      const parentSec = document.getElementById('lens-parent');
      const founderSec = document.getElementById('lens-founder');
      if (!parentSec || !founderSec) return;
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
    };
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => applyLens(btn.getAttribute('data-lens-mode')));
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
      document.getElementById('out-margin').textContent = `營業利益率 ${res.marginPct}%（場地佔比 ${res.venueCostPct}%｜損益兩平：${res.breakEvenStudents} 人）`;
      document.getElementById('out-hours').textContent = `${res.totalWeeklyHours} 小時/週`;
      document.getElementById('out-saved-hours').textContent = `情境假設：AI 每週省下 ${res.savedWeeklyHours} 小時備課與週報工時`;
    };

    simForm.querySelectorAll('input, select').forEach((el) => {
      el.addEventListener('input', updateSim);
      el.addEventListener('change', updateSim);
    });
    updateSim();
  }
}

function bootWebApp(doc) {
  const targetDoc = doc || (typeof document !== 'undefined' ? document : null);
  if (!targetDoc || typeof targetDoc.addEventListener !== 'function') return;
  targetDoc.addEventListener('DOMContentLoaded', () => {
    bindGlobalInteractions();
    initResearchPage();
    initVenturePage();
  });
}

bootWebApp();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MOAT_PRESETS,
    MATRIX_CASES,
    AGE_PLANS,
    INFO_DOCS,
    PBL_MODULES,
    calculateMoatScore,
    calculateUnitEconomics,
    copyTextToClipboard,
    setResearchWorkspaceFilter,
    applyMoatPresetByKey,
    openCaseModal,
    openMoatReportModal,
    openModuleModal,
    openEconDetailModal,
    openTrialFormModal,
    bindGlobalInteractions,
    initResearchPage,
    initVenturePage,
    bootWebApp
  };
}
