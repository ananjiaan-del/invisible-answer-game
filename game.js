const scene = document.querySelector("#scene");
const dialogue = document.querySelector("#dialogue");
const speaker = document.querySelector("#speaker");
const line = document.querySelector("#line");
const continueButton = document.querySelector("#continue");
const walkPrompt = document.querySelector("#walkPrompt");
const walkButton = document.querySelector("#walkButton");
const corridorExplore = document.querySelector("#corridorExplore");
const exploreLabel = document.querySelector("#exploreLabel");
const exploreAction = document.querySelector("#exploreAction");
const observation = document.querySelector("#observation");
const observationText = document.querySelector("#observationText");
const closeObservation = document.querySelector("#closeObservation");
const boardPuzzle = document.querySelector("#boardPuzzle");
const inspectPaper = document.querySelector("#inspectPaper");
const detailPanel = document.querySelector("#detailPanel");
const finishInspect = document.querySelector("#finishInspect");
const closeDetails = document.querySelector("#closeDetails");
const choices = document.querySelector("#choices");
const ending = document.querySelector("#ending");
const evidencePanel = document.querySelector("#evidencePanel");
const evidenceCard = document.querySelector("#evidenceCard");
const evidenceKicker = document.querySelector("#evidenceKicker");
const evidenceTitle = document.querySelector("#evidenceTitle");
const evidenceBody = document.querySelector("#evidenceBody");
const closeEvidence = document.querySelector("#closeEvidence");
const caseEnding = document.querySelector("#caseEnding");
const gameCover = document.querySelector("#gameCover");
const startGame = document.querySelector("#startGame");
const chapterNumber = document.querySelector("#chapterNumber");
const chapterTitle = document.querySelector("#chapterTitle");
const locationUnlock = document.querySelector("#locationUnlock");
const enterClubroom = document.querySelector("#enterClubroom");
const previousPage = document.querySelector("#previousPage");
const classroomInvestigation = document.querySelector("#classroomInvestigation");
const clueProgress = document.querySelector("#clueProgress");
const cluePanel = document.querySelector("#cluePanel");
const cluePhoto = document.querySelector("#cluePhoto");
const clueKicker = document.querySelector("#clueKicker");
const clueTitle = document.querySelector("#clueTitle");
const clueBody = document.querySelector("#clueBody");
const collectClue = document.querySelector("#collectClue");
const deductionPanel = document.querySelector("#deductionPanel");
const finishDeduction = document.querySelector("#finishDeduction");
const deductionFeedback = document.querySelector("#deductionFeedback");
const chapter3Ending = document.querySelector("#chapter3Ending");

const script = [
  { type: "narration", text: "禮拜三。我轉學來到這間學校的第一天。" },
  { type: "narration", text: "車子繞了很久的山路。久到我開始懷疑，地圖上的終點是不是放錯了地方。" },
  { type: "narration", text: "校長親自在辦公室接待我。窗外的山霧還沒散，整座校園安靜得像是比城市慢了半拍。", scene: "office" },
  { speaker: "校長", text: "歡迎你來。我們學校不大，等等我帶你走一圈，你很快就會熟悉了。" },
  { speaker: "校長", text: "雖然設備沒有市區學校那麼新，不過老師和同學都很好相處。你有任何問題，都可以來找我。" },
  { type: "narration", text: "介紹到一半，桌上的手機突然震了起來。", scene: "phoneClose" },
  { speaker: "校長", text: "喂？現在嗎？……好，我馬上過去。", scene: "phone" },
  { speaker: "校長", text: "不好意思，我臨時有點事情。你的班級在二樓最裡面，沿著這條走廊走就會看到。", scene: "whisper" },
  { speaker: "校長", text: "你先自己回班上，可以嗎？" },
  { type: "narration", text: "腳步聲越來越遠。轉學第一天，替我帶路的人只帶了一半，就把我留在陌生的走廊上。", scene: "emptyOffice", action: "walk" }
];

let index = 0;
let removed = 0;
let encounterEnding = false;
let chapter2Active = false;
let chapter3Active = false;
let flyerChoiceStage = "none";
let attributionPromptPending = false;
let attributionReflectionPending = false;
let lastAttributionReflection = "";
const playerAssessment = {
  personalBias: 0,
  environmentalEmpathy: 0,
  structuralUnderstanding: 0,
  responses: []
};

function recordAttribution(key, level, choice) {
  playerAssessment[key] += level;
  playerAssessment.responses.push({ question: "student_disappearance_attribution", choice, key, level });
  try {
    localStorage.setItem("invisibleAnswerAssessment", JSON.stringify(playerAssessment));
  } catch (_) {
    // The in-memory record still works when browser storage is unavailable.
  }
}

function clearAttributionRecord() {
  playerAssessment.personalBias = 0;
  playerAssessment.environmentalEmpathy = 0;
  playerAssessment.structuralUnderstanding = 0;
  playerAssessment.responses = playerAssessment.responses.filter(
    (response) => response.question !== "student_disappearance_attribution"
  );
  try {
    localStorage.setItem("invisibleAnswerAssessment", JSON.stringify(playerAssessment));
  } catch (_) {
    // Keep the current-session record when browser storage is unavailable.
  }
}

function renderLine() {
  const beat = script[index];
  if (beat.scene === "office") scene.className = "scene scene--office";
  if (beat.scene === "phone") scene.className = "scene scene--phone";
  if (beat.scene === "phoneClose") scene.className = "scene scene--phone-close";
  if (beat.scene === "whisper") scene.className = "scene scene--whisper";
  if (beat.scene === "emptyOffice") scene.className = "scene scene--empty-office";
  speaker.textContent = beat.speaker || "";
  speaker.classList.toggle("speaker--hidden", !beat.speaker);
  line.textContent = beat.text;
  line.classList.toggle("narration", beat.type === "narration");
  continueButton.textContent = beat.action === "walk" ? "看看周圍 ›" : "繼續 ›";
}

function advance() {
  const beat = script[index];
  if (beat.action === "walk") {
    dialogue.classList.add("hidden");
    scene.className = "scene scene--corridor";
    walkPrompt.classList.remove("hidden");
    return;
  }
  index = Math.min(index + 1, script.length - 1);
  renderLine();
}

continueButton.addEventListener("click", () => {
  if (chapter2Active || chapter3Active) return;
  if (attributionPromptPending) {
    attributionPromptPending = false;
    showAttributionChoices();
    return;
  }
  if (attributionReflectionPending) {
    attributionReflectionPending = false;
    showFlyerActionChoices();
    return;
  }
  if (encounterEnding) {
    dialogue.classList.add("hidden");
    ending.classList.remove("hidden");
    return;
  }
  advance();
});

walkButton.addEventListener("click", () => {
  walkPrompt.classList.add("hidden");
  scene.className = "scene scene--outside";
  corridorExplore.classList.remove("hidden");
});

const exploration = [
  {
    scene: "scene scene--outside",
    label: "剛走出校長室",
    action: "看看外面",
    text: "欄杆外是一座被山霧包圍的操場。濕漉漉的跑道繞過不大的校舍，這裡離城市，好像真的很遠。",
    next: "沿著走廊前進"
  },
  {
    scene: "scene scene--corridor",
    label: "離開窗邊",
    action: "沿著走廊繼續移動",
    text: "鞋底踩過微涼的磨石子地板。走廊很長，只有風從一扇扇窗戶間穿過。",
    next: "繼續往前"
  },
  {
    scene: "scene scene--corridor",
    revealScene: "scene scene--classroom",
    label: "走廊中段，一扇教室門半開著",
    action: "看看空教室",
    text: "教室裡只有幾張磨舊的課桌，後方疊著暫時用不到的椅子。空間很安靜，也比想像中更空。",
    next: "離開教室"
  },
  {
    scene: "scene scene--corridor",
    label: "走出教室，繼續往二樓最裡面走",
    action: "看看公布欄",
    text: "走廊盡頭的公布欄貼滿了社團海報。熱舞社、吉他社、籃球社，一張疊著一張。",
    next: "靠近公布欄"
  }
];
let exploreIndex = 0;

function renderExploration() {
  const step = exploration[exploreIndex];
  scene.className = step.scene;
  exploreLabel.textContent = step.label;
  exploreAction.querySelector("span").textContent = step.action;
  observation.classList.add("hidden");
  exploreAction.classList.remove("hidden");
}

exploreAction.addEventListener("click", () => {
  const step = exploration[exploreIndex];
  if (step.revealScene) scene.className = step.revealScene;
  observationText.textContent = step.text;
  closeObservation.textContent = step.next;
  exploreAction.classList.add("hidden");
  observation.classList.remove("hidden");
});

closeObservation.addEventListener("click", () => {
  if (exploreIndex === exploration.length - 1) {
    corridorExplore.classList.add("hidden");
    scene.className = "scene scene--board";
    boardPuzzle.classList.remove("hidden");
    return;
  }
  exploreIndex += 1;
  renderExploration();
});

document.querySelectorAll(".cover").forEach((cover) => {
  cover.addEventListener("click", () => {
    if (cover.classList.contains("removed")) return;
    cover.classList.add("removed");
    removed += 1;
    if (removed === 3) inspectPaper.classList.remove("hidden");
  });
});

inspectPaper.addEventListener("click", () => detailPanel.classList.remove("hidden"));
closeDetails.addEventListener("click", () => detailPanel.classList.add("hidden"));

finishInspect.addEventListener("click", () => {
  detailPanel.classList.add("hidden");
  boardPuzzle.classList.add("hidden");
  showAttributionNarration();
});

function showAttributionNarration() {
  flyerChoiceStage = "prompt";
  attributionPromptPending = true;
  choices.classList.add("hidden");
  dialogue.classList.remove("hidden");
  speaker.classList.add("speaker--hidden");
  line.classList.add("narration");
  line.textContent = "聽說這間學校好像偶爾會有學生消失……？";
  continueButton.textContent = "繼續 ›";
  continueButton.classList.remove("hidden");
}

function showAttributionChoices() {
  flyerChoiceStage = "attribution";
  choices.innerHTML = "";
  choices.classList.remove("choices--speech");
  choices.classList.add("choices--thought");
  dialogue.classList.add("hidden");
  continueButton.classList.add("hidden");
  const options = [
    ["A", "痾，大概又是些沉迷打 game、隨性逃學的人吧。", "personalBias", 2, "我搖了搖頭，把這些武斷的想法甩開。"],
    ["B", "可能在這裡過得不順利，或者家裡有難處吧。", "environmentalEmpathy", 1, "我搖了搖頭，把這些沒有答案的猜測暫時甩開。"],
    ["C", "學校或制度如果沒接住人，多的是讓人待不下去的原因吧。", "structuralUnderstanding", 2, "我搖了搖頭，把這些一下子想不清楚的問題先放到一旁。"]
  ];
  options.forEach(([choice, label, key, level, reflection]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${choice}．${label}`;
    button.addEventListener("click", () => {
      recordAttribution(key, level, choice);
      choices.classList.add("hidden");
      choices.classList.remove("choices--thought");
      dialogue.classList.remove("hidden");
      speaker.classList.add("speaker--hidden");
      line.classList.add("narration");
      line.textContent = reflection;
      lastAttributionReflection = reflection;
      continueButton.textContent = "繼續 ›";
      continueButton.classList.remove("hidden");
      attributionReflectionPending = true;
      flyerChoiceStage = "reflection";
    });
    choices.append(button);
  });
  choices.classList.remove("hidden");
}

function showFlyerActionChoices() {
  flyerChoiceStage = "action";
  dialogue.classList.add("hidden");
  choices.innerHTML = "";
  choices.classList.remove("choices--speech", "choices--thought");
  const options = [
    ["A", "撕下來看看背面", "指尖才碰到紙角——"],
    ["B", "這種東西……不要多管閒事", "才剛轉身，肩膀就撞上了什麼。"],
    ["C", "先拍照存證，回去再說", "手機才舉起來，鏡頭裡就多了一個人。"]
  ];
  options.forEach(([key, label, response]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${key}．${label}`;
    button.addEventListener("click", () => showEncounter(response));
    choices.append(button);
  });
  choices.classList.remove("hidden");
}

function showEncounter(response) {
  flyerChoiceStage = "none";
  encounterEnding = true;
  choices.classList.add("hidden");
  dialogue.classList.remove("hidden");
  speaker.classList.add("speaker--hidden");
  line.classList.add("narration");
  line.textContent = response;
  continueButton.textContent = "回頭 ›";
}

const chapter2 = [
  { speaker: "？？？", text: "你在看那張海報？", scene: "xiangwan" },
  { type: "narration", text: "他的語氣不像在打招呼，倒像是在確認我看見了多少。" },
  { speaker: "？？？", text: "很少有人會注意到它。大家經過這裡，不是在聊天，就是低頭滑手機。", choice: [
    ["這什麼社團？看起來怪怪的。", "是滿怪的。都被拆掉這麼久了，還留著一張海報。"],
    ["『上一個消失的人』是誰？", "你直接問這個？"],
    ["不好意思，我還在找教室。", "你是轉學生吧？", "xiangwan-front"]
  ]},
  { speaker: "？？？", text: "我看你制服很新，剛剛又一直在看教室門牌。", scene: "xiangwan-front" },
  { speaker: "？？？", text: "你的教室我知道在哪，我可以帶你去。不過在那之前——要不要先跟我去一個地方？" },
  { type: "narration", text: "他朝舊校舍的方向偏了偏頭。", unlock: true },
  { type: "narration", text: "社辦比我想像中還小。牆上貼滿剪報、便條紙和學生照片，正中央是一張手繪的校園地圖。", scene: "clubroom-entry" },
  { speaker: "向晚", text: "對了，我叫向晚。這裡是推理研究社——目前只有我一個人。", scene: "xiangwan-intro" },
  { speaker: "向晚", text: "隨便坐。椅子有點晃，小心一點。" },
  { type: "narration", text: "他從桌邊抽出一疊資料，推到我面前。", scene: "xiangwan-folder" },
  { type: "narration", text: "卷宗的封面已經磨得發白，側邊夾著七張案件標籤。" },
  { type: "narration", text: "我伸手接過那疊卷宗。", evidence: "folder" },
  { speaker: "我", text: "這些……都是發生過什麼事？" },
  { speaker: "向晚", text: "這間學校發生過一些很奇怪的事。單看每一件，好像都有很普通的解釋；放在一起，又怎麼看都不太對。", scene: "xiangwan-explain" },
  { speaker: "向晚", text: "有人忽然不再來學校，有人的資料對不上，還有一些事情，問誰都只得到一句『我也不太清楚』。", choice: [
    ["所以你覺得這些事情有關？", "我還不能確定。但它們之間確實有幾個重複出現的地方。"],
    ["也可能只是剛好吧？", "可能。所以我才把資料留下來，不想只靠猜。"],
    ["你一個人整理了這些？", "嗯。查了兩年，還是有很多地方接不起來。"]
  ]},
  { speaker: "向晚", text: "這是我整理的關係圖。照片、時間、座位和老師說過的話，我能找到的都放上去了。", scene: "caseboard" },
  { speaker: "向晚", text: "我查了兩年，只弄清楚其中一個人的去向。剩下的，我一個人查不完。" },
  { speaker: "向晚", text: "所以——你要不要加入？", choice: [
    ["聽起來滿有趣的。算我一份。", "好。希望你過幾天還會這麼覺得。"],
    ["我才剛轉來，也想先弄清楚這間學校。", "那就從你會接觸到的人開始。"],
    ["你到底查到了什麼？", "如果現在就全部告訴你，你大概不會相信。"]
  ]},
  { speaker: "向晚", text: "你先看看這個人吧。方哲宇。", scene: "xiangwan-folder" },
  { type: "narration", text: "向晚從最上面的卷宗抽出一張座位表，其中一個座位被紅筆圈了起來。", scene: "xiangwan-folder" },
  { type: "narration", text: "他把座位表推到我面前。", evidence: "seat" },
  { speaker: "向晚", text: "他是高二學生，每個禮拜都會有一天不來學校。隔天回來時，心情通常會比之前更差。", scene: "xiangwan-case-explain" },
  { speaker: "向晚", text: "座位表上還有一個空位。那是今天開始留給你的——你跟方哲宇，會在同一間教室。" },
  { speaker: "向晚", text: "目前我只知道這些。你怎麼想？", choice: [
    ["固定同一天？", "不知道。只知道他每個禮拜都會有一天不在。"],
    ["可能只是請假吧？", "我查過他的請假紀錄，沒找到原因。"],
    ["這跟那些離開學校的人有什麼關係？", "現在還不知道。所以才要查。"]
  ]},
  { speaker: "向晚", text: "他那天整天都不會出現。但隔天，他又會照常回來。" },
  { speaker: "向晚", text: "只是每次回來，心情都會變得更差。他平常就不太說話，那一天之後會更安靜，也不太理人。" },
  { speaker: "向晚", text: "老師應該有發現。但只要他隔天回來，好像就沒人繼續問了。" },
  { type: "narration", text: "我低頭看著座位表。方哲宇所在的班級，正是剛才校長要我去的那間教室。" },
  { speaker: "向晚", text: "所以你比我更容易接近他。先別急著問。看一看、聽一聽，也許班上有人知道些什麼。", scene: "xiangwan-look", action: "caseEnd" }
];

const chapter3 = [
  { type: "narration", text: "中午聽完向晚說的那些事後，整個下午，我都有些心不在焉。", scene: "ch3-afternoon" },
  { type: "narration", text: "老師在台上講了什麼，我幾乎一句都沒聽進去。視線總是不自覺地飄向教室最後一排——那個從早上開始就空著的座位。" },
  { type: "narration", text: "放學鐘聲響起，同學陸續收拾書包離開。我刻意放慢動作，直到整間教室只剩下我一個人。", scene: "ch3-classroom" },
  { type: "narration", text: "夕陽從窗戶斜斜照進來，把課桌椅的影子拉得很長。我站起身，走向方哲宇的座位。" },
  { type: "narration", text: "向晚說的事情，會不會在這間教室裡留下了什麼線索？", action: "investigate" },
  { type: "narration", text: "我正盯著教學日誌和那張公車時刻表，走廊上忽然傳來腳步聲。『喀噠……喀噠……』那聲音離我越來越近。", scene: "ch3-footsteps" },
  { type: "narration", text: "教室門被推開。陳老師抱著一疊聯絡簿站在門口，看見我待在方哲宇的座位旁，明顯愣了一下。", scene: "ch3-teacher" },
  { speaker: "陳老師", text: "你怎麼還沒回家？……你在哲宇的座位旁做什麼？", choice: [
    ["我發現他好像每個星期三都沒來。", "你也注意到了？哲宇這學期已經不是第一次這樣了。"],
    ["我只是看到他的東西還留在這裡。", "他的東西常常就這樣放著。隔天人回來，也什麼都不肯說。"],
    ["一時不知道該怎麼回答。", "算了，我不是要責怪你。只是這麼晚了，不要一個人留在教室。"]
  ], responseSpeaker: "陳老師" },
  { speaker: "陳老師", text: "他家明明就在學校附近，也不知道每個星期三到底在忙什麼。問過幾次，他都只說家裡有事。" },
  { speaker: "陳老師", text: "可是學校有規定。缺席節數到了，我還是只能照規定登記。輔導紀錄那邊，也不能一直空著。", choice: [
    ["好，我知道了。謝謝老師。", "嗯。你也早點回家。"],
    ["老師，你不好奇他為什麼缺課嗎？", "我當然問過。但一個班不只他一個學生，我也不可能每天只處理他的事。"],
    ["如果他不是故意不來呢？", "那就更應該把原因說清楚。不然老師也不知道能怎麼幫他。"]
  ], responseSpeaker: "陳老師" },
  { type: "narration", text: "陳老師抱著聯絡簿離開了。教室門在她身後輕輕闔上。", scene: "ch3-door-close" },
  { type: "narration", text: "腳步聲完全消失後，教室後門傳來兩下輕輕的敲門聲。向晚站在教室外，手裡拿著兩瓶飲料。", scene: "ch3-xiangwan" },
  { speaker: "向晚", text: "我本來想早點進來的。" },
  { type: "narration", text: "他走進教室，把其中一瓶飲料放到我桌上。", scene: "ch3-xiangwan-set-drink" },
  { speaker: "向晚", text: "我就知道你會留下來。", scene: "ch3-xiangwan-thoughtful", choice: [
    ["他不是不想來。他的時間根本對不上。", "有可能。但這還不能解釋他為什麼整天都不在。"],
    ["你是不是早就知道了，故意讓我自己找？", "我只知道他的座位上有線索。不知道你會找到哪一個。"],
    ["把教學日誌和公車時刻表遞給向晚。", "日誌和時刻表能互相對上。你找得比我預期的還完整。"]
  ], responseSpeaker: "向晚" },
  { speaker: "向晚", text: "老師剛剛說，他家就在學校附近。但這張時刻表的起點，是另一個方向的山區。" },
  { type: "narration", text: "如果戶籍地址沒有錯，那麼每個星期三早上，方哲宇就不是從自己家裡出發。" },
  { speaker: "向晚", text: "要不要待會一起去他家附近看看？我大概知道在哪裡。", scene: "ch3-xiangwan-thoughtful", action: "chapter3End" }
];

let chapter2Index = 0;
let choiceResponsePending = false;
let chapter3Index = 0;
let activeClue = null;
const collectedClues = new Set();
const selectedDeductions = new Set();

const clueData = {
  log: {
    kicker: "CLUE 01",
    title: "固定的星期三",
    image: "ch3-clue-log-v1.png",
    body: `<p>班級教學日誌裡，最近幾個星期三從第一節到最後一節，都重複記著同一個名字。</p><blockquote>方哲宇（全日未到）</blockquote><p>不是只缺第一節。每個星期三，他一整天都沒有出現在教室。前幾次被標成「曠課」，最近兩週的導師簽名旁卻多了一行小字：「已請假？」後面還留著問號。</p>`
  },
  desk: {
    kicker: "CLUE 02",
    title: "趕不上的時間",
    image: "ch3-clue-desk-v1.png",
    body: `<p>透明桌墊上留著很深的原子筆刻痕。同一組時間被重複寫過很多次。</p><blockquote>07:20－08:35<br>趕不上</blockquote><p>這組時間或許能解釋他早上為什麼趕不上，卻還不能解釋他為什麼一整天都沒到。</p>`
  },
  bus: {
    kicker: "CLUE 03",
    title: "雜物堆裡的公車表",
    image: "ch3-clue-bus-v1.png",
    body: `<p>這堆東西放在十四號座位旁，好像是方哲宇的。透明夾鏈袋裡有一張折舊的公車時刻表，「綠12」路線被畫過，其中一班又被紅筆圈起來。</p><blockquote>山區起站 07:20<br>市區醫院 07:50<br>山嶺高中 08:35</blockquote>`
  },
  notice: {
    kicker: "CLUE 04",
    title: "沒有完整簽名的請假單",
    image: "ch3-clue-unsigned-leave-form-v1.png",
    body: `<p>公告欄下方的班級資料夾裡，夾著幾張方哲宇的請假單，日期都是星期三。</p><p>請假原因只寫著「家中有事」，監護人簽名欄卻是空白的。這或許就是老師一直無法確認他是否真的請假的原因。</p>`
  }
};

function showEvidence(kind) {
  evidenceCard.classList.toggle("evidence-card--seat", kind === "seat");
  if (kind === "folder") {
    evidenceKicker.textContent = "推理研究社｜內部調查卷宗";
    evidenceTitle.textContent = "未結案件・第七件";
    evidenceBody.innerHTML = `
      <div class="file-meta"><span>建立時間：兩年前</span><span>狀態：調查中</span></div>
      <div class="case-file-list">
        <div><b>01</b><span>林子淇｜最後一班校車</span></div>
        <div><b>02</b><span>陳奕安｜沒有送出的午餐申請</span></div>
        <div><b>03</b><span>江雨晨｜斷線的線上作業</span></div>
        <div><b>04</b><span>吳佩珊｜被鎖起來的社團教室</span></div>
        <div><b>05</b><span>趙柏勛｜轉學紀錄上的空格</span></div>
        <div><b>06</b><span>許雅晴｜沒有人記得的座位</span></div>
        <div><b>07</b><span>方哲宇｜每週缺席的一天</span></div>
      </div>`;
    closeEvidence.textContent = "看完了";
  } else {
    evidenceKicker.textContent = "山嶺高中｜教室座位配置表";
    evidenceTitle.textContent = "二年甲班　座位表";
    const students = ["陳品妤","林皓宇","張書瑋","吳佳蓉","黃子恩","李承翰","周語彤","","楊心怡","劉冠廷","許庭瑜","蔡孟軒","鄭雨潔","方哲宇","郭柏辰"];
    evidenceBody.innerHTML = `
      <div class="class-meta"><span>班級：二年甲班</span><span>班導：林慧君老師</span></div>
      <div class="blackboard">黑板方向</div>
      <div class="seat-grid">${students.map((name,i)=>`<i class="${i===13?'marked ':''}${name?'':'empty'}"><em>${i+1}</em><span>${name}</span></i>`).join("")}</div>
      <div class="seat-note"><span>空白座位：轉學生</span><span>紅圈位置：方哲宇｜座號 14</span></div>`;
    closeEvidence.textContent = "收起座位表";
  }
  evidencePanel.classList.remove("hidden");
}

function renderChapter2() {
  const beat = chapter2[chapter2Index];
  if (beat.scene) scene.className = `scene scene--${beat.scene}`;
  speaker.textContent = beat.speaker || "";
  speaker.classList.toggle("speaker--hidden", !beat.speaker);
  line.textContent = beat.text;
  line.classList.toggle("narration", beat.type === "narration");
  dialogue.classList.remove("hidden");
  choices.classList.add("hidden");
  choices.classList.remove("choices--speech");
  continueButton.classList.toggle("hidden", Boolean(beat.choice));
  if (beat.choice) showChapter2Choices(beat.choice);
  if (beat.evidence) showEvidence(beat.evidence);
  if (beat.unlock) {
    dialogue.classList.add("hidden");
    locationUnlock.classList.remove("hidden");
  }
  if (beat.action === "caseEnd") continueButton.textContent = "接受案件 ›";
  else continueButton.textContent = "繼續 ›";
}

function renderChapter3() {
  const beat = chapter3[chapter3Index];
  if (beat.scene) scene.className = `scene scene--${beat.scene}`;
  speaker.textContent = beat.speaker || "";
  speaker.classList.toggle("speaker--hidden", !beat.speaker);
  line.textContent = beat.text;
  line.classList.toggle("narration", beat.type === "narration");
  dialogue.classList.remove("hidden");
  choices.classList.add("hidden");
  choices.classList.toggle("choices--speech", Boolean(beat.choice));
  continueButton.classList.toggle("hidden", Boolean(beat.choice));
  if (beat.choice) showChapter3Choices(beat.choice, beat.responseSpeaker || beat.speaker);
  if (beat.action === "investigate") continueButton.textContent = "開始調查 ›";
  else if (beat.action === "chapter3End") continueButton.textContent = "一起去看看 ›";
  else continueButton.textContent = "繼續 ›";
}

function showChapter3Choices(options, responseSpeaker) {
  choices.innerHTML = "";
  choices.classList.add("choices--speech");
  options.forEach(([label, response], i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${String.fromCharCode(65+i)}．${label}`;
    button.addEventListener("click", () => {
      choices.classList.add("hidden");
      dialogue.classList.remove("hidden");
      speaker.textContent = responseSpeaker;
      speaker.classList.remove("speaker--hidden");
      line.classList.remove("narration");
      line.textContent = response;
      continueButton.classList.remove("hidden");
      continueButton.textContent = "繼續 ›";
      choiceResponsePending = true;
    });
    choices.append(button);
  });
  dialogue.classList.add("hidden");
  choices.classList.remove("hidden");
}

function showChapter2Choices(options) {
  choices.innerHTML = "";
  choices.classList.remove("choices--speech");
  options.forEach(([label, response, responseScene], i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${String.fromCharCode(65+i)}．${label}`;
    button.addEventListener("click", () => {
      choices.classList.add("hidden");
      dialogue.classList.remove("hidden");
      if (responseScene) scene.className = `scene scene--${responseScene}`;
      speaker.textContent = chapter2Index <= 2 ? "？？？" : "向晚";
      speaker.classList.remove("speaker--hidden");
      line.classList.remove("narration");
      line.textContent = response;
      continueButton.classList.remove("hidden");
      continueButton.textContent = "繼續 ›";
      choiceResponsePending = true;
    });
    choices.append(button);
  });
  dialogue.classList.add("hidden");
  choices.classList.remove("hidden");
}

document.querySelector("#nextChapter").addEventListener("click", () => {
  ending.classList.add("hidden");
  setChapterHeader(2, "推理研究社");
  encounterEnding = false;
  chapter2Active = true;
  renderChapter2();
});

function setChapterHeader(number, title) {
  chapterNumber.textContent = `CHAPTER 0${number}`;
  chapterTitle.textContent = title;
}

function startChapterOne() {
  clearAttributionRecord();
  gameCover.classList.add("hidden");
  previousPage.classList.remove("hidden");
  setChapterHeader(1, "傳說的開端");
  scene.className = "scene scene--arrival";
  dialogue.classList.remove("hidden");
  renderLine();
}

function startChapterTwo() {
  gameCover.classList.add("hidden");
  previousPage.classList.remove("hidden");
  ending.classList.add("hidden");
  setChapterHeader(2, "推理研究社");
  encounterEnding = false;
  chapter2Active = true;
  chapter2Index = 0;
  choiceResponsePending = false;
  flyerChoiceStage = "none";
  attributionPromptPending = false;
  attributionReflectionPending = false;
  lastAttributionReflection = "";
  renderChapter2();
}

function startChapterThree() {
  gameCover.classList.add("hidden");
  caseEnding.classList.add("hidden");
  previousPage.classList.remove("hidden");
  setChapterHeader(3, "總是缺席的那一天");
  chapter2Active = false;
  chapter3Active = true;
  chapter3Index = 0;
  choiceResponsePending = false;
  collectedClues.clear();
  selectedDeductions.clear();
  document.querySelectorAll("[data-clue]").forEach((button) => button.classList.remove("found"));
  document.querySelectorAll("[data-deduction]").forEach((button) => button.classList.remove("selected"));
  clueProgress.textContent = "已發現 0／4";
  deductionFeedback.textContent = "選一個最能同時解釋三項線索的推論。";
  renderChapter3();
}

startGame.addEventListener("click", startChapterOne);
document.querySelectorAll("[data-start-chapter]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.startChapter === "3") startChapterThree();
    else if (button.dataset.startChapter === "2") startChapterTwo();
    else startChapterOne();
  });
});

document.querySelector("#continueCase").addEventListener("click", startChapterThree);

enterClubroom.addEventListener("click", () => {
  locationUnlock.classList.add("hidden");
  chapter2Index += 1;
  renderChapter2();
});

function resetGame() {
  index = 0;
  removed = 0;
  exploreIndex = 0;
  encounterEnding = false;
  chapter2Active = false;
  chapter3Active = false;
  chapter2Index = 0;
  chapter3Index = 0;
  choiceResponsePending = false;
  flyerChoiceStage = "none";
  attributionPromptPending = false;
  attributionReflectionPending = false;
  lastAttributionReflection = "";
  clearAttributionRecord();
  activeClue = null;
  collectedClues.clear();
  selectedDeductions.clear();

  [walkPrompt, corridorExplore, boardPuzzle, detailPanel, choices, ending, evidencePanel, locationUnlock, caseEnding, classroomInvestigation, cluePanel, deductionPanel, chapter3Ending]
    .forEach((panel) => panel.classList.add("hidden"));
  document.querySelectorAll(".cover").forEach((cover) => cover.classList.remove("removed"));
  inspectPaper.classList.add("hidden");
  document.querySelectorAll("[data-clue]").forEach((button) => button.classList.remove("found"));
  document.querySelectorAll("[data-deduction]").forEach((button) => button.classList.remove("selected"));
  clueProgress.textContent = "已發現 0／4";
  previousPage.classList.add("hidden");
  choices.classList.remove("choices--speech", "choices--thought");
  continueButton.classList.remove("hidden");
  dialogue.classList.remove("hidden");
  gameCover.classList.remove("hidden");
  setChapterHeader(1, "傳說的開端");
  scene.className = "scene scene--arrival";
  renderLine();
}

function showPreviousExplorationObservation() {
  const step = exploration[exploreIndex];
  scene.className = step.revealScene || step.scene;
  exploreLabel.textContent = step.label;
  observationText.textContent = step.text;
  closeObservation.textContent = step.next;
  exploreAction.classList.add("hidden");
  observation.classList.remove("hidden");
}

function goBack() {
  if (attributionPromptPending) {
    attributionPromptPending = false;
    flyerChoiceStage = "none";
    dialogue.classList.add("hidden");
    detailPanel.classList.remove("hidden");
    return;
  }
  if (flyerChoiceStage === "attribution" && !choices.classList.contains("hidden")) {
    choices.classList.add("hidden");
    choices.classList.remove("choices--thought");
    showAttributionNarration();
    return;
  }
  if (attributionReflectionPending) {
    attributionReflectionPending = false;
    clearAttributionRecord();
    showAttributionChoices();
    return;
  }
  if (flyerChoiceStage === "action" && !choices.classList.contains("hidden")) {
    choices.classList.add("hidden");
    dialogue.classList.remove("hidden");
    speaker.classList.add("speaker--hidden");
    line.classList.add("narration");
    line.textContent = lastAttributionReflection;
    continueButton.textContent = "繼續 ›";
    continueButton.classList.remove("hidden");
    attributionReflectionPending = true;
    flyerChoiceStage = "reflection";
    return;
  }
  if (!cluePanel.classList.contains("hidden")) {
    cluePanel.classList.add("hidden");
    classroomInvestigation.classList.remove("hidden");
    return;
  }
  if (!deductionPanel.classList.contains("hidden")) {
    deductionPanel.classList.add("hidden");
    classroomInvestigation.classList.remove("hidden");
    return;
  }
  if (!chapter3Ending.classList.contains("hidden")) {
    chapter3Ending.classList.add("hidden");
    renderChapter3();
    return;
  }
  if (!classroomInvestigation.classList.contains("hidden")) {
    classroomInvestigation.classList.add("hidden");
    dialogue.classList.remove("hidden");
    renderChapter3();
    return;
  }
  if (!evidencePanel.classList.contains("hidden")) {
    evidencePanel.classList.add("hidden");
    return;
  }
  if (!detailPanel.classList.contains("hidden")) {
    detailPanel.classList.add("hidden");
    return;
  }
  if (!locationUnlock.classList.contains("hidden")) {
    locationUnlock.classList.add("hidden");
    chapter2Index = Math.max(0, chapter2Index - 1);
    renderChapter2();
    return;
  }
  if (!caseEnding.classList.contains("hidden")) {
    caseEnding.classList.add("hidden");
    renderChapter2();
    return;
  }
  if (!ending.classList.contains("hidden")) {
    ending.classList.add("hidden");
    encounterEnding = false;
    dialogue.classList.add("hidden");
    choices.classList.remove("hidden");
    return;
  }

  if (chapter3Active) {
    if (choiceResponsePending) {
      choiceResponsePending = false;
      renderChapter3();
      return;
    }
    if (chapter3Index === 0) {
      resetGame();
      return;
    }
    chapter3Index -= 1;
    renderChapter3();
    return;
  }

  if (chapter2Active) {
    if (choiceResponsePending) {
      choiceResponsePending = false;
      renderChapter2();
      return;
    }
    if (chapter2Index === 0) {
      resetGame();
      return;
    }
    chapter2Index -= 1;
    renderChapter2();
    return;
  }

  if (encounterEnding) {
    encounterEnding = false;
    dialogue.classList.add("hidden");
    choices.classList.remove("hidden");
    return;
  }
  if (!choices.classList.contains("hidden")) {
    choices.classList.add("hidden");
    detailPanel.classList.remove("hidden");
    return;
  }
  if (!boardPuzzle.classList.contains("hidden")) {
    boardPuzzle.classList.add("hidden");
    corridorExplore.classList.remove("hidden");
    exploreIndex = exploration.length - 1;
    showPreviousExplorationObservation();
    return;
  }
  if (!corridorExplore.classList.contains("hidden")) {
    if (!observation.classList.contains("hidden")) {
      observation.classList.add("hidden");
      exploreAction.classList.remove("hidden");
    } else if (exploreIndex > 0) {
      exploreIndex -= 1;
      renderExploration();
    } else {
      corridorExplore.classList.add("hidden");
      walkPrompt.classList.remove("hidden");
      scene.className = "scene scene--corridor";
    }
    return;
  }
  if (!walkPrompt.classList.contains("hidden")) {
    walkPrompt.classList.add("hidden");
    index = script.length - 1;
    dialogue.classList.remove("hidden");
    renderLine();
    return;
  }
  if (index > 0) {
    index -= 1;
    renderLine();
  } else {
    resetGame();
  }
}

previousPage.addEventListener("click", goBack);
document.querySelector("#restart").addEventListener("click", resetGame);

document.querySelectorAll("[data-clue]").forEach((button) => {
  button.addEventListener("click", () => {
    activeClue = button.dataset.clue;
    const clue = clueData[activeClue];
    cluePhoto.style.backgroundImage = `url("${clue.image}")`;
    clueKicker.textContent = clue.kicker;
    clueTitle.textContent = clue.title;
    clueBody.innerHTML = clue.body;
    collectClue.textContent = "收下線索";
    classroomInvestigation.classList.add("hidden");
    cluePanel.classList.remove("hidden");
  });
});

const observationData = {
  blackboard: ["黑板", "放學後的黑板已經擦乾淨，只在角落留著今天的值日生姓名。"],
  seat: ["其他同學的座位", "課本、考卷和社團用品散落在桌面上。看起來只是普通的放學後教室。"],
  playerSeat: ["我的座位", "今天才剛開始使用的座位，抽屜裡還幾乎是空的。"]
};

document.querySelectorAll("[data-observe]").forEach((button) => {
  button.addEventListener("click", () => {
    const [title, body] = observationData[button.dataset.observe];
    activeClue = null;
    cluePhoto.style.backgroundImage = 'url("ch3-classroom-sunset-v1.png")';
    clueKicker.textContent = "OBSERVATION";
    clueTitle.textContent = title;
    clueBody.innerHTML = `<p>${body}</p>`;
    collectClue.textContent = "繼續逛逛";
    classroomInvestigation.classList.add("hidden");
    cluePanel.classList.remove("hidden");
  });
});

collectClue.addEventListener("click", () => {
  if (activeClue) collectedClues.add(activeClue);
  document.querySelector(`[data-clue="${activeClue}"]`)?.classList.add("found");
  clueProgress.textContent = `已發現 ${collectedClues.size}／4`;
  cluePanel.classList.add("hidden");
  if (collectedClues.size === 4) {
    deductionPanel.classList.remove("hidden");
  } else {
    classroomInvestigation.classList.remove("hidden");
  }
});

document.querySelectorAll("[data-deduction]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.deduction;
    selectedDeductions.clear();
    document.querySelectorAll("[data-deduction]").forEach((item) => item.classList.remove("selected"));
    selectedDeductions.add(key);
    button.classList.add("selected");
    deductionFeedback.textContent = "按下確認，看看這個推論能不能同時解釋所有線索。";
  });
});

finishDeduction.addEventListener("click", () => {
  if (selectedDeductions.size !== 1) {
    deductionFeedback.textContent = "請先選擇一個推論。";
    return;
  }
  if (!selectedDeductions.has("route")) {
    deductionFeedback.textContent = "這個說法無法同時解釋『整天未到』、時間刻痕與公車路線，再試一次。";
    return;
  }
  deductionFeedback.textContent = "這個推論能連起目前的線索，但我們還不知道他為什麼要去醫院。";
  deductionPanel.classList.add("hidden");
  classroomInvestigation.classList.add("hidden");
  chapter3Index += 1;
  renderChapter3();
});

closeEvidence.addEventListener("click", () => evidencePanel.classList.add("hidden"));

continueButton.addEventListener("click", () => {
  if (chapter2Active && chapter2Index < chapter2.length) {
    const beat = chapter2[chapter2Index];
    if (beat.action === "caseEnd" && !choiceResponsePending) {
      dialogue.classList.add("hidden");
      caseEnding.classList.remove("hidden");
      return;
    }
    choiceResponsePending = false;
    chapter2Index += 1;
    if (chapter2Index < chapter2.length) renderChapter2();
  }
  if (chapter3Active && chapter3Index < chapter3.length) {
    const beat = chapter3[chapter3Index];
    if (beat.action === "investigate" && !choiceResponsePending) {
      dialogue.classList.add("hidden");
      scene.className = "scene scene--ch3-classroom";
      classroomInvestigation.classList.remove("hidden");
      return;
    }
    if (beat.action === "chapter3End" && !choiceResponsePending) {
      dialogue.classList.add("hidden");
      chapter3Ending.classList.remove("hidden");
      return;
    }
    choiceResponsePending = false;
    chapter3Index += 1;
    if (chapter3Index < chapter3.length) renderChapter3();
  }
});

document.querySelector("#restartCase").addEventListener("click", resetGame);
document.querySelector("#restartChapter3").addEventListener("click", resetGame);
renderLine();
