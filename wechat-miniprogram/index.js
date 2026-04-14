const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const ELEMENT_LUCKY_DATA = {
  '木': {
    color: '青色、绿色',
    item: '木质手串、绿植',
    direction: '东方',
    food: '酸味食物、绿叶菜',
    advice: '今日适合静心阅读或户外散步，吸收自然能量。',
    basis: '木对应你的日主，今日木气充盈，顺应自然可提升气场。',
    task: '在办公桌左侧摆放一盆绿植，或修剪一次指甲。',
    mood: '平和',
    moodAdvice: '像树木一样深呼吸，感受根植大地的稳重。',
    details: {
      love: '• 单身者：适合参加文艺活动，容易遇到温文尔雅的对象。\n• 有伴者：适合进行深度沟通，化解过往的小误会。',
      career: '• 职场人：事业心增强，适合开启新计划或进行创意策划。\n• 学生党：思维活跃，适合攻克逻辑性强的学科。',
      wealth: '• 财运尚可，适合小额理财，不宜进行大笔风险投资。',
      health: '• 注意肝胆健康，建议早睡早起，多喝绿茶疏肝理气。'
    },
    luckyGuide: {
      colorDesc: '绿色代表生机与希望，今日穿着绿色系衣物能提升亲和力。',
      itemDesc: '木质饰品能助你稳固气场，绿植则能净化周围负能量。',
      directionDesc: '面向东方冥想或办公，能获得更多灵感与助力。',
      foodDesc: '多食青菜、奇异果等绿色食物，有助于疏肝理气。'
    }
  },
  '火': {
    color: '红色、紫色',
    item: '红玛瑙、发光饰品',
    direction: '南方',
    food: '苦味食物、红豆',
    advice: '能量充沛的一天，适合社交和展示自我才华。',
    basis: '火为你命局的喜用，今日火星闪耀，积极行动必有回响。',
    task: '给远方的朋友发一条热情的问候，或整理一次桌面灯光。',
    mood: '热烈',
    moodAdvice: '释放你的热情，像火焰一样照亮周围的人。',
    details: {
      love: '• 单身者：桃花运旺盛，魅力四射，适合主动出击。\n• 有伴者：感情升温，适合安排一场浪漫的烛光晚餐。',
      career: '• 职场人：行动力极强，适合攻克难题或进行商务洽谈。\n• 学生党：精力充沛，适合进行体育锻炼或参加社团活动。',
      wealth: '• 财运红火，可能会有意外的奖金或投资收益，宜见好就收。',
      health: '• 注意心血管健康，避免过度兴奋，建议多吃红豆补血。'
    },
    luckyGuide: {
      colorDesc: '红色能激发你的热情与斗志，紫色则能提升你的高贵气质。',
      itemDesc: '红玛瑙能增强自信，发光饰品则能让你在人群中脱颖而出。',
      directionDesc: '南方是你的福星位，今日在此方位活动更易获得成功。',
      foodDesc: '红豆、西红柿等红色食物，能为你补充充足的火能量。'
    }
  },
  '土': {
    color: '黄色、棕色',
    item: '陶瓷首饰、黄水晶',
    direction: '西南、东北',
    food: '甜味食物、谷物',
    advice: '脚踏实地，适合处理琐碎事务或进行理财规划。',
    basis: '土为你的根基，今日土气稳固，适合深耕细作，积累力量。',
    task: '赤脚在草地上走走，或亲手制作一件陶艺/手工。',
    mood: '稳重',
    moodAdvice: '感受大地的包容，万物生长皆有其时。',
    details: {
      love: '• 单身者：感情运平稳，适合通过长辈介绍结识稳重对象。\n• 有伴者：适合讨论未来规划，给对方足够的安全感。',
      career: '• 职场人：工作踏实，容易获得领导信任，适合处理财务。\n• 学生党：记忆力佳，适合背诵基础知识或整理错题集。',
      wealth: '• 财运稳健，适合储蓄或购买稳健型理财产品，不宜投机。',
      health: '• 注意脾胃健康，饮食宜清淡定时，多吃粗粮。',
    },
    luckyGuide: {
      colorDesc: '黄色代表财富与稳定，棕色则能让你显得更加成熟稳重。',
      itemDesc: '陶瓷饰品能增强你的亲和力，黄水晶则是招财利器。',
      directionDesc: '西南或东北方向能为你带来宁静与思考的空间。',
      foodDesc: '谷物、南瓜等黄色食物，能有效调理你的脾胃功能。'
    }
  },
  '金': {
    color: '白色、金色',
    item: '金属手表、白水晶',
    direction: '西方',
    food: '辛味食物、白萝卜',
    advice: '思维敏锐，适合做决策或进行断舍离。',
    basis: '金气肃降，今日适合清理杂念，果断决策，提升效率。',
    task: '清理手机相册或办公桌抽屉，丢掉一件不再需要的物品。',
    mood: '冷静',
    moodAdvice: '如利剑出鞘，精准斩断不必要的纠结。',
    details: {
      love: '• 单身者：感情果断，适合告别错的人，迎接新开始。\n• 有伴者：适合开诚布公地解决遗留问题，不留隐患。',
      career: '• 职场人：决策力强，适合主持会议或谈判，效率极高。\n• 学生党：逻辑严密，适合练习数学或理科综合题。',
      wealth: '• 偏财运佳，可能会有意外惊喜，但需警惕消费陷阱。',
      health: '• 注意呼吸系统健康，建议多呼吸新鲜空气，多喝白水。'
    },
    luckyGuide: {
      colorDesc: '白色代表纯洁与力量，金色则能彰显你的尊贵地位。',
      itemDesc: '金属手表能提升你的专业感，白水晶则能净化你的思绪。',
      directionDesc: '西方能为你带来决断的力量，适合在此方位进行重要决策。',
      foodDesc: '白萝卜、梨等白色食物，有助于润肺化痰，提升金能量。'
    }
  },
  '水': {
    color: '黑色、蓝色',
    item: '珍珠、流动水景',
    direction: '北方',
    food: '咸味食物、黑豆',
    advice: '灵感如泉涌，适合艺术创作或深度思考。',
    basis: '水主智慧，今日灵感流动，顺应直觉可发现隐藏的机会。',
    task: '睡前记录一个梦境，或在窗边静坐听雨/听纯音乐。',
    mood: '灵动',
    moodAdvice: '如流水般顺势而为，不争而善胜。',
    details: {
      love: '• 单身者：感情细腻，适合展示才华，吸引志同道合者。\n• 有伴者：适合进行浪漫约会，增加生活的情调与温柔。',
      career: '• 职场人：智慧迸发，适合解决复杂逻辑或进行文案创作。\n• 学生党：理解力强，适合阅读文学作品或学习语言。',
      wealth: '• 财运流动，适合跨行交流，通过人脉获取新商机。',
      health: '• 注意肾脏健康，建议多喝温水，避免熬夜伤神。'
    },
    luckyGuide: {
      colorDesc: '黑色代表深邃与智慧，蓝色则能让你保持冷静与理智。',
      itemDesc: '珍珠能提升你的柔美气质，流动水景则能带活你的财运。',
      directionDesc: '北方是你的智慧位，在此方位思考能让你事半功倍。',
      foodDesc: '黑豆、黑芝麻等黑色食物，是补肾益智的佳品。'
    }
  }
};

const PERSONALITY_DETAIL = {
  '木': '你像森林中的大树，拥有顽强的生命力和不断向上的动力。你仁慈、宽厚，乐于助人，但也可能因为过于固执而显得不够圆滑。在治愈空间里，你需要学会像风一样流动，接受变化。',
  '火': '你像冬日里的暖阳，热情奔放，充满活力。你直率、真诚，总能给周围的人带来温暖。但火也容易灼伤他人，你需要学会控制自己的情绪，在治愈空间里寻找内心的宁静。',
  '土': '你像广阔的大地，稳重、踏实，给人极强的安全感。你包容、厚道，是朋友们最信赖的依靠。但土也容易变得沉重，你需要学会在治愈空间里释放压力，让自己变得轻盈。',
  '金': '你像打磨过的利剑，果断、锐利，充满正义感。你讲原则、重义气，做事效率极高。但金也容易显得冷冰冰，你需要在治愈空间里找回内心的柔软，感受生命的温度。',
  '水': '你像深邃的大海，智慧、灵动，拥有极强的洞察力。你温柔、包容，总能顺势而为。但水也容易变得忧郁，你需要在治愈空间里寻找阳光，让自己的内心世界变得明亮。'
};

Page({
  data: {
    name: '',
    gender: 'female',
    birthDate: '',
    birthTime: '12:00',
    isTrueSolarTime: false,
    loading: false,
    result: null,
    activeTab: 'overview',
    activeSubTab: 'love',
    mainTab: 'report',
    posts: [
      { id: '1', author: '小木', content: '今天木气很旺，感觉整个人都充满了生机！', time: '10分钟前', likes: 12, type: 'healing' },
      { id: '2', author: '阿火', content: '分享我的今日命盘，事业运满分！', time: '30分钟前', likes: 25, type: 'chart' },
      { id: '3', author: '土土', content: '脚踏实地的感觉真好，今天处理了很多琐事。', time: '1小时前', likes: 8, type: 'fortune' },
    ],
    newPostContent: '',
    checkInDates: [],
    checkInStreak: 0,
    qaList: [],
    question: '',
    isAsking: false
  },

  onLoad() {
    const checkInDates = wx.getStorageSync('checkInDates') || [];
    const checkInStreak = wx.getStorageSync('checkInStreak') || 0;
    const qaList = wx.getStorageSync('qaList') || [];
    const posts = wx.getStorageSync('posts') || this.data.posts;
    this.setData({ checkInDates, checkInStreak, qaList, posts });
  },

  switchMainTab(e) {
    this.setData({ mainTab: e.currentTarget.dataset.tab });
  },

  onPostInput(e) { this.setData({ newPostContent: e.detail.value }); },
  
  handlePost() {
    if (!this.data.newPostContent.trim()) return;
    const newPost = {
      id: Date.now().toString(),
      author: '我',
      content: this.data.newPostContent,
      time: '刚刚',
      likes: 0,
      type: 'healing'
    };
    const posts = [newPost, ...this.data.posts];
    this.setData({ posts, newPostContent: '' });
    wx.setStorageSync('posts', posts);
    wx.showToast({ title: '发布成功' });
  },

  handleLike(e) {
    const id = e.currentTarget.dataset.id;
    const posts = this.data.posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    this.setData({ posts });
    wx.setStorageSync('posts', posts);
  },

  handleCheckIn() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.data.checkInDates.includes(today)) {
      const newDates = [...this.data.checkInDates, today];
      
      // Calculate streak
      let streak = 1;
      let checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);
      while (newDates.includes(checkDate.toISOString().split('T')[0])) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      this.setData({ checkInDates: newDates, checkInStreak: streak });
      wx.setStorageSync('checkInDates', newDates);
      wx.setStorageSync('checkInStreak', streak);
      wx.showToast({ title: '打卡成功', icon: 'success' });
    }
  },

  onQuestionInput(e) { this.setData({ question: e.detail.value }); },

  handleAsk() {
    if (!this.data.question.trim() || this.data.isAsking) return;
    const userQuestion = this.data.question;
    const newQA = { id: Date.now().toString(), question: userQuestion, answer: '', loading: true };
    const qaList = [newQA, ...this.data.qaList];
    
    this.setData({ qaList, question: '', isAsking: true });

    // Simulate AI response since we can't easily call Gemini directly in MiniProgram without a proxy
    setTimeout(() => {
      const updatedList = this.data.qaList.map(item => {
        if (item.id === newQA.id) {
          return { 
            ...item, 
            answer: `关于“${userQuestion}”，从星盘来看，这反映了你内在能量的流动。建议保持平和心态，顺应自然节律。`, 
            loading: false 
          };
        }
        return item;
      });
      this.setData({ qaList: updatedList, isAsking: false });
      wx.setStorageSync('qaList', updatedList);
    }, 2000);
  },

  onNameInput(e) { this.setData({ name: e.detail.value }); },
  setGender(e) { this.setData({ gender: e.currentTarget.dataset.gender }); },
  onDateChange(e) { this.setData({ birthDate: e.detail.value }); },
  onTimeChange(e) { this.setData({ birthTime: e.detail.value }); },
  toggleSolarTime() { this.setData({ isTrueSolarTime: !this.data.isTrueSolarTime }); },
  switchTab(e) { this.setData({ activeTab: e.currentTarget.dataset.tab }); },
  switchSubTab(e) { this.setData({ activeSubTab: e.currentTarget.dataset.sub }); },

  onSubmit() {
    if (!this.data.name || !this.data.birthDate) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    setTimeout(() => {
      const result = this.calculateDetailedBaZi(this.data.birthDate, this.data.birthTime);
      this.setData({ result, loading: false });
    }, 1800);
  },

  onReset() { this.setData({ result: null, activeTab: 'overview' }); },

  calculateDetailedBaZi(birthDate, birthTime) {
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = parseInt(birthTime.split(':')[0]);

    const yearStem = HEAVENLY_STEMS[(year - 4) % 10];
    const yearBranch = EARTHLY_BRANCHES[(year - 4) % 12];
    const monthStem = HEAVENLY_STEMS[(year * 12 + month + 3) % 10];
    const monthBranch = EARTHLY_BRANCHES[(month + 1) % 12];
    const dayBase = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
    const dayStem = HEAVENLY_STEMS[(dayBase + 49) % 10];
    const dayBranch = EARTHLY_BRANCHES[(dayBase + 1) % 12];
    const hourStem = HEAVENLY_STEMS[(dayBase * 12 + Math.floor((hour + 1) / 2) + 1) % 10];
    const hourBranch = EARTHLY_BRANCHES[Math.floor((hour + 1) / 2) % 12];

    const bazi = [
      { stem: yearStem, branch: yearBranch, label: '年柱', desc: '祖业根基', vernacular: '家庭氛围积极，能给你带来助力' },
      { stem: monthStem, branch: monthBranch, label: '月柱', desc: '父母兄弟', vernacular: '人际关系和谐，职场多遇贵人' },
      { stem: dayStem, branch: dayBranch, label: '日柱', desc: '本人配偶', vernacular: '内心世界丰富，追求精神共鸣' },
      { stem: hourStem, branch: hourBranch, label: '时柱', desc: '子孙晚年', vernacular: '晚年生活安逸，子女孝顺有成' }
    ];

    const dayMasterElement = ELEMENTS[dayStem];
    const seed = date.getTime();
    const getScore = (offset) => Math.floor(((seed + offset) % 40) + 60);

    const summaries = {
      '木': '你如森林般充满生机，仁慈而坚定，是天生的成长者。',
      '火': '你如烈火般热情奔放，直率而真诚，是人群中的发光体。',
      '土': '你如大地般厚德载物，稳重而可靠，是值得信赖的依靠。',
      '金': '你如利剑般锋芒显露，果断而正义，是天生的决策者。',
      '水': '你如流水般灵动智慧，深邃而包容，是极具洞察力的智者。'
    };

    return {
      bazi,
      dayMaster: dayStem,
      dayMasterElement,
      summary: summaries[dayMasterElement],
      personality: PERSONALITY_DETAIL[dayMasterElement],
      lucky: ELEMENT_LUCKY_DATA[dayMasterElement],
      scores: {
        overall: getScore(100),
        love: getScore(200),
        career: getScore(300),
        wealth: getScore(400),
        health: getScore(500)
      }
    };
  }
});
