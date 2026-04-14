/**
 * Simplified BaZi (Eight Characters) and Five Elements calculation logic.
 * Note: This is a simplified version for entertainment purposes.
 */

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ELEMENTS = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水'
};

export const ELEMENT_COLORS_HEX = {
  '木': ['#10B981', '#06B6D4'],
  '火': ['#EF4444', '#8B5CF6'],
  '土': ['#D97706', '#78350F'],
  '金': ['#FFFFFF', '#F59E0B'],
  '水': ['#000000', '#3B82F6']
};

export const ELEMENT_LUCKY_DATA: Record<string, any> = {
  '木': {
    color: '青色、绿色',
    colorHex: 'bg-green-500',
    item: '木质手串、绿植',
    direction: '东方',
    food: '酸味食物、绿叶菜',
    advice: '今日适合静心阅读或户外散步，吸收自然能量。',
    basis: '木对应你的日主，今日木气充盈，顺应自然可提升气场。',
    task: '在办公桌左侧摆放一盆绿植，或修剪一次指甲。',
    mood: '平和',
    moodAdvice: '像树木一样深呼吸，感受根植大地的稳重。',
    details: {
      love: {
        summary: '适合参加文艺活动，容易遇到温文尔雅的对象。',
        actions: ['佩戴木质饰品', '阅读一本治愈系书籍', '在阳台修剪绿植'],
        avoid: '避免在沟通中过于固执己见'
      },
      career: {
        summary: '事业心增强，适合开启新计划或进行创意策划。',
        actions: ['整理办公桌左侧', '制定一份周计划', '与同事进行创意头脑风暴'],
        avoid: '不宜在未准备充分时盲目扩张'
      },
      wealth: {
        summary: '财运尚可，适合小额理财，不宜进行大笔风险投资。',
        actions: ['记录一笔小额开支', '检查订阅服务账单', '关注绿色能源类资讯'],
        avoid: '警惕所谓的“内部消息”'
      },
      health: {
        summary: '注意肝胆健康，建议早睡早起，多喝绿茶疏肝理气。',
        actions: ['晚上11点前入睡', '饮用一杯清淡绿茶', '进行30分钟户外散步'],
        avoid: '避免过量饮酒 or 熬夜'
      }
    },
    lucky: {
      color: '青色、绿色',
      item: '木质手串',
      time: '05:00 - 07:00',
      quote: '像树木一样深呼吸，感受根植大地的稳重。'
    },
    luckyGuide: {
      colorDesc: '绿色代表生机与希望，今日穿着绿色系衣物能提升亲和力。',
      itemDesc: '木质饰品能助你稳固气场，绿植则能净化周围负能量。',
      directionDesc: '面向东方冥想 or 办公，能获得更多灵感与助力。',
      foodDesc: '多食青菜、奇异果等绿色食物，有助于疏肝理气。'
    }
  },
  '火': {
    color: '红色、紫色',
    colorHex: 'bg-red-500',
    item: '红玛瑙、发光饰品',
    direction: '南方',
    food: '苦味食物、红豆',
    advice: '能量充沛的一天，适合社交和展示自我才华。',
    basis: '火为你命局的喜用，今日火星闪耀，积极行动必有回响。',
    task: '给远方的朋友发一条热情的问候，或整理一次桌面灯光。',
    mood: '热烈',
    moodAdvice: '释放你的热情，像火焰一样照亮周围的人。',
    details: {
      love: {
        summary: '桃花运旺盛，魅力四射，适合主动出击。',
        actions: ['穿一件红色单品', '主动赞美心仪对象', '安排一次户外约会'],
        avoid: '避免因情绪激动而出口伤人'
      },
      career: {
        summary: '行动力极强，适合攻克难题或进行商务洽谈。',
        actions: ['主持一次部门会议', '完成拖延已久的任务', '主动申请新项目'],
        avoid: '不宜在疲劳状态下强行加班'
      },
      wealth: {
        summary: '财运红火，可能会有意外的奖金或投资收益。',
        actions: ['查看理财收益', '购买一张彩票试试手气', '投资个人形象提升'],
        avoid: '避免冲动消费奢侈品'
      },
      health: {
        summary: '注意心血管健康，避免过度兴奋，建议多吃红豆补血。',
        actions: ['进行15分钟冥想', '晚餐多食红豆粥', '监测心率变化'],
        avoid: '避免剧烈运动后立即冷水浴'
      }
    },
    lucky: {
      color: '红色、紫色',
      item: '红玛瑙',
      time: '11:00 - 13:00',
      quote: '释放你的热情，像火焰一样照亮周围的人。'
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
    colorHex: 'bg-amber-600',
    item: '陶瓷首饰、黄水晶',
    direction: '西南、东北',
    food: '甜味食物、谷物',
    advice: '脚踏实地，适合处理琐碎事务或进行理财规划。',
    basis: '土为你的根基，今日土气稳固，适合深耕细作，积累力量。',
    task: '赤脚在草地上走走，或亲手制作一件陶艺/手工。',
    mood: '稳重',
    moodAdvice: '感受大地的包容，万物生长皆有其时。',
    details: {
      love: {
        summary: '感情运平稳，适合通过长辈介绍结识稳重对象。',
        actions: ['与家人共进晚餐', '整理过往的情感日记', '给伴侣一个稳重的拥抱'],
        avoid: '避免因过于守旧而拒绝沟通'
      },
      career: {
        summary: '工作踏实，容易获得领导信任，适合处理财务。',
        actions: ['校对一份重要文档', '整理办公桌抽屉', '完成财务报表核算'],
        avoid: '不宜在未看清合同条款前签字'
      },
      wealth: {
        summary: '财运稳健，适合储蓄或购买稳健型理财产品。',
        actions: ['存入一笔梦想基金', '咨询稳健型理财建议', '购买高品质生活用品'],
        avoid: '避免参与高风险的投机活动'
      },
      health: {
        summary: '注意脾胃健康，饮食宜清淡定时，多吃粗粮。',
        actions: ['食用一碗南瓜粥', '餐后慢走20分钟', '按揉足三里穴位'],
        avoid: '避免暴饮暴食或过食生冷'
      }
    },
    lucky: {
      color: '黄色、棕色',
      item: '黄水晶',
      time: '13:00 - 15:00',
      quote: '感受大地的包容，万物生长皆有其时。'
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
    colorHex: 'bg-yellow-400',
    item: '金属手表、白水晶',
    direction: '西方',
    food: '辛味食物、白萝卜',
    advice: '思维敏锐，适合做决策或进行断舍离。',
    basis: '金气肃降，今日适合清理杂念，果断决策，提升效率。',
    task: '清理手机相册或办公桌抽屉，丢掉一件不再需要的物品。',
    mood: '冷静',
    moodAdvice: '如利剑出鞘，精准斩断不必要的纠结。',
    details: {
      love: {
        summary: '感情果断，适合告别错的人，迎接新开始。',
        actions: ['进行一次断舍离', '写一封给未来的信', '佩戴白水晶饰品'],
        avoid: '避免因言语过于犀利而伤人'
      },
      career: {
        summary: '决策力强，适合主持会议或谈判，效率极高。',
        actions: ['主持一次重要会议', '签署一份合作协议', '优化工作流程'],
        avoid: '不宜在情绪化时做出重大决定'
      },
      wealth: {
        summary: '偏财运佳，可能会有意外惊喜，但需警惕陷阱。',
        actions: ['关注贵金属走势', '清理闲置物品变现', '制定消费预算'],
        avoid: '避免在不明真相时跟风投资'
      },
      health: {
        summary: '注意呼吸系统健康，建议多呼吸新鲜空气。',
        actions: ['进行深呼吸练习', '饮用一杯雪梨汤', '去公园慢跑'],
        avoid: '避免长时间待在空气不流通处'
      }
    },
    lucky: {
      color: '白色、金色',
      item: '白水晶',
      time: '15:00 - 17:00',
      quote: '如利剑出鞘，精准斩断不必要的纠结。'
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
    colorHex: 'bg-blue-600',
    item: '珍珠、流动水景',
    direction: '北方',
    food: '咸味食物、黑豆',
    advice: '灵感如泉涌，适合艺术创作或深度思考。',
    basis: '水主智慧，今日灵感流动，顺应直觉可发现隐藏的机会。',
    task: '睡前记录一个梦境，或在窗边静坐听雨/听纯音乐。',
    mood: '灵动',
    moodAdvice: '如流水般顺势而为，不争而善胜。',
    details: {
      love: {
        summary: '感情细腻，适合展示才华，吸引志同道合者。',
        actions: ['分享一首喜欢的歌', '进行一次深度谈话', '佩戴珍珠饰品'],
        avoid: '避免因思虑过多而产生猜忌'
      },
      career: {
        summary: '智慧迸发，适合解决复杂逻辑或进行文案创作。',
        actions: ['撰写一份创意方案', '学习一项新技能', '进行行业跨界交流'],
        avoid: '不宜在目标不明确时盲目行动'
      },
      wealth: {
        summary: '财运流动，适合跨行交流，通过人脉获取新商机。',
        actions: ['参加一次行业沙龙', '整理电子钱包', '咨询税务建议'],
        avoid: '避免因贪小便宜而吃大亏'
      },
      health: {
        summary: '注意肾脏健康，建议多喝温水，避免熬夜伤神。',
        actions: ['睡前温水泡脚', '饮用一杯黑豆浆', '保证8小时充足睡眠'],
        avoid: '避免过度劳累或长期久坐'
      }
    },
    lucky: {
      color: '黑色、蓝色',
      item: '珍珠',
      time: '21:00 - 23:00',
      quote: '如流水般顺势而为，不争而善胜。'
    },
    luckyGuide: {
      colorDesc: '黑色代表深邃与智慧，蓝色则能让你保持冷静与理智。',
      itemDesc: '珍珠能提升你的柔美气质，流动水景则能带活你的财运。',
      directionDesc: '北方是你的智慧位，在此方位思考能让你事半功倍。',
      foodDesc: '黑豆、黑芝麻等黑色食物，是补肾益智的佳品。'
    }
  }
};

export function calculateWeeklyTrend(birthDate: string) {
  const scores = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const birthTime = new Date(birthDate).getTime();

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    
    // Deterministic but varying score based on birth date and current day
    const daySeed = currentDay.getTime() / (1000 * 60 * 60 * 24);
    const score = Math.floor(
      ((Math.sin(daySeed + birthTime) + 1) / 2) * 30 + 65
    );
    scores.push(score);
  }
  
  return scores;
}

export function calculateDetailedBaZi(birthDate: string, birthTime: string) {
  const bDate = new Date(birthDate);
  const year = bDate.getFullYear();
  const month = bDate.getMonth() + 1;
  const day = bDate.getDate();
  const hour = parseInt(birthTime.split(':')[0]);

  // Simplified BaZi logic for birth chart
  const yearStem = HEAVENLY_STEMS[(year - 4) % 10];
  const yearBranch = EARTHLY_BRANCHES[(year - 4) % 12];
  const monthStem = HEAVENLY_STEMS[(year * 12 + month + 3) % 10];
  const monthBranch = EARTHLY_BRANCHES[(month + 1) % 12];
  const dayBase = Math.floor(bDate.getTime() / (24 * 60 * 60 * 1000));
  const dayStem = HEAVENLY_STEMS[(dayBase + 49) % 10];
  const dayBranch = EARTHLY_BRANCHES[(dayBase + 1) % 12];
  const hourStem = HEAVENLY_STEMS[(dayBase * 12 + Math.floor((hour + 1) / 2) + 1) % 10];
  const hourBranch = EARTHLY_BRANCHES[Math.floor((hour + 1) / 2) % 12];

  const bazi = [
    { stem: yearStem, branch: yearBranch, label: '年柱', desc: '祖业根基', modern: '原生家庭影响', vernacular: '家庭氛围积极，塑造了你最初的安全感与价值观' },
    { stem: monthStem, branch: monthBranch, label: '月柱', desc: '父母兄弟', modern: '社会人格表现', vernacular: '在职场与社交中表现出的处事风格与人际模式' },
    { stem: dayStem, branch: dayBranch, label: '日柱', desc: '本人配偶', modern: '自我认知与亲密关系', vernacular: '你最真实的内在自我，以及在亲密关系中的行为模式' },
    { stem: hourStem, branch: hourBranch, label: '时柱', desc: '子孙晚年', modern: '潜意识与抱负', vernacular: '你的内在驱动力、潜意识追求以及对未来的愿景' }
  ];

  const elementsCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  bazi.forEach(item => {
    elementsCount[ELEMENTS[item.stem as keyof typeof ELEMENTS]]++;
    elementsCount[ELEMENTS[item.branch as keyof typeof ELEMENTS]]++;
  });

  const dayMasterElement = ELEMENTS[dayStem as keyof typeof ELEMENTS];
  
  // Daily Dynamic Calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const birthTimeMs = bDate.getTime();
  
  // Use both birth date and today's date as seed for daily uniqueness
  const dailySeed = todayTime + birthTimeMs;
  
  const getDailyScore = (offset: number, base: number = 60, range: number = 35) => {
    const val = Math.sin(dailySeed * 0.0000001 + offset) * 0.5 + 0.5;
    return Math.floor(val * range + base);
  };

  // Dynamic daily advice and actions based on element and day
  const luckyData = JSON.parse(JSON.stringify(ELEMENT_LUCKY_DATA[dayMasterElement]));
  
  // Inject daily variety into actions
  const dailyActionPools: Record<string, string[]> = {
    '木': ['修剪绿植', '整理书架', '晨间散步', '饮用花草茶', '练习书法', '户外冥想', '整理办公桌', '制定周计划'],
    '火': ['运动健身', '主动社交', '整理灯具', '穿亮色衣服', '烹饪美食', '分享创意', '主持会议', '商务洽谈'],
    '土': ['整理财务', '赤脚走路', '陶艺手工', '整理收纳', '品茶静坐', '深呼吸练习', '校对文档', '储蓄规划'],
    '金': ['断舍离', '制定计划', '清理电子设备', '佩戴金属饰品', '练习乐器', '逻辑思考', '签署协议', '优化流程'],
    '水': ['听纯音乐', '冥想静心', '记录梦境', '睡前泡脚', '艺术创作', '深度阅读', '撰写方案', '跨界交流']
  };

  const getRandomActions = (element: string, count: number, seedOffset: number) => {
    const pool = dailyActionPools[element] || dailyActionPools['木'];
    const result: string[] = [];
    const tempPool = [...pool];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.abs(Math.sin(dailySeed + seedOffset + i)) * tempPool.length);
      result.push(tempPool.splice(idx, 1)[0]);
    }
    return result;
  };

  // Update luckyData with daily randomized but deterministic actions
  Object.keys(luckyData.details).forEach((cat, idx) => {
    luckyData.details[cat].actions = getRandomActions(dayMasterElement, 3, idx * 100);
  });

  // Core Trait Summary
  const summaries: Record<string, string> = {
    '木': '你如森林般充满生机，仁慈而坚定，是天生的成长者。',
    '火': '你如烈火般热情奔放，直率而真诚，是人群中的发光体。',
    '土': '你如大地般厚德载物，稳重而可靠，是值得信赖的依靠。',
    '金': '你如利剑般锋芒显露，果断而正义，是天生的决策者。',
    '水': '你如流水般灵动智慧，深邃而包容，是极具洞察力的智者。'
  };

  return {
    bazi,
    elementsCount,
    dayMaster: dayStem,
    dayMasterElement,
    summary: summaries[dayMasterElement],
    lucky: luckyData,
    weeklyTrend: calculateWeeklyTrend(birthDate),
    scores: {
      overall: getDailyScore(100),
      thinking: getDailyScore(200),
      empathy: getDailyScore(300),
      action: getDailyScore(400),
      creativity: getDailyScore(500),
      stability: getDailyScore(600),
      love: getDailyScore(700),
      career: getDailyScore(800),
      wealth: getDailyScore(900),
      health: getDailyScore(1000)
    }
  };
}

export const PERSONALITY_DETAIL: Record<string, any> = {
  '木': {
    dimensions: [
      { label: '思维模式', content: '如林木向上，具备极强的成长思维。擅长从宏观角度规划，思维具有连贯性与逻辑性。' },
      { label: '处事风格', content: '仁慈而坚定，以柔克刚。在处理矛盾时倾向于寻求共赢，而非硬性对抗。' },
      { label: '社交特质', content: '温和且富有同情心，是团队中的“粘合剂”。容易获得他人的信任与依赖。' },
      { label: '情绪模式', content: '情绪相对平稳，但如遇阻碍会产生“郁结”感。需要通过户外活动来疏解压力。' },
      { label: '天赋优势', content: '极强的学习能力与生命力，能在逆境中迅速找到突破口并持续进化。' },
      { label: '潜在局限', content: '有时过于追求完美或理想化，容易在细节上纠结，建议用“5分钟行动法”打破僵局。' }
    ],
    scenes: [
      { label: '职业适配', content: '适合教育、创意策划、医疗或绿色产业。在需要持续成长与耐心的岗位上能发挥最大价值。' },
      { label: '亲密关系', content: '追求精神层面的共鸣，倾向于细水长流的陪伴。需要对方给予充分的成长空间。' },
      { label: '社交相处', content: '建议多参加文艺或自然相关的社交活动，在轻松的氛围中更容易展示个人魅力。' }
    ]
  },
  '火': {
    dimensions: [
      { label: '思维模式', content: '直觉敏锐，发散性极强。能迅速捕捉到事物的核心，思维跳跃且富有感染力。' },
      { label: '处事风格', content: '直率真诚，雷厉风行。不喜欢拖泥带水，追求效率与即时的反馈。' },
      { label: '社交特质', content: '天生的社交中心，热情奔放。能迅速点燃周围人的情绪，具备极强的领导魅力。' },
      { label: '情绪模式', content: '情绪爆发力强，来得快去得也快。需要学会通过冥想来稳定过热的能量。' },
      { label: '天赋优势', content: '卓越的表达能力与创造力，擅长在公众面前展示自我并获得认可。' },
      { label: '潜在局限', content: '容易因冲动而决策失误，或因耐心不足而半途而废。建议在重大决策前静候24小时。' }
    ],
    scenes: [
      { label: '职业适配', content: '适合演艺、市场营销、公关或创业。在充满挑战与变化的竞争环境中表现出色。' },
      { label: '亲密关系', content: '感情热烈且直接，需要对方给予积极的回应。喜欢充满惊喜与活力的相处模式。' },
      { label: '社交相处', content: '在社交中应注意倾听，避免因过于强势而忽略他人的感受，适当收敛锋芒。' }
    ]
  },
  '土': {
    dimensions: [
      { label: '思维模式', content: '务实稳重，注重逻辑与证据。思维严谨，擅长在已有的框架内进行深耕与优化。' },
      { label: '处事风格', content: '厚德载物，信守承诺。做事踏实可靠，是团队中不可或缺的定海神针。' },
      { label: '社交特质', content: '包容力极强，是值得信赖的倾听者。虽然不常处于中心，但却是人脉的核心。' },
      { label: '情绪模式', content: '情绪极度稳定，甚至显得有些迟钝。容易积压负面情绪，需要学会主动释放。' },
      { label: '天赋优势', content: '极强的执行力与耐力，擅长处理复杂且长期的任务，能守得云开见月明。' },
      { label: '潜在局限', content: '有时显得过于守旧或固执，抗拒改变。建议定期尝试一件从未做过的小事。' }
    ],
    scenes: [
      { label: '职业适配', content: '适合财务、人力资源、建筑或传统行业。在需要稳定性与责任感的岗位上表现优异。' },
      { label: '亲密关系', content: '追求安全感与稳定性，是极佳的伴侣。倾向于通过实际行动而非甜言蜜语表达爱。' },
      { label: '社交相处', content: '适合在小圈子中深度交流，通过长期的相处建立深厚的友谊，不宜频繁更换社交圈。' }
    ]
  },
  '金': {
    dimensions: [
      { label: '思维模式', content: '逻辑严密，具备极强的批判性思维。擅长去伪存真，思维如利剑般精准。' },
      { label: '处事风格', content: '果断干练，原则性极强。在处理问题时黑白分明，追求绝对的公正与效率。' },
      { label: '社交特质', content: '自带威严感，言简意赅。虽然初见可能觉得高冷，但深交后极其讲义气。' },
      { label: '情绪模式', content: '冷静理智，很少被情绪左右。但容易因追求完美而给自己和他人带来压力。' },
      { label: '天赋优势', content: '卓越的决策能力与组织能力，能在混乱中迅速建立秩序并制定标准。' },
      { label: '潜在局限', content: '有时过于刚硬，缺乏灵活性。建议学会“柔性沟通”，在坚持原则的同时兼顾人情。' }
    ],
    scenes: [
      { label: '职业适配', content: '适合法律、金融、管理或精密制造。在需要高度精准与决断力的领域能大放异彩。' },
      { label: '亲密关系', content: '对伴侣要求较高，追求高质量的相处。需要对方具备独立的思想与人格。' },
      { label: '社交相处', content: '建议在社交中多展现温柔的一面，通过共同的兴趣爱好打破冰冷的第一印象。' }
    ]
  },
  '水': {
    dimensions: [
      { label: '思维模式', content: '灵动深邃，具备极强的洞察力。思维如流水般无孔不入，擅长发现隐藏的逻辑。' },
      { label: '处事风格', content: '顺势而为，灵活多变。不拘泥于形式，总能找到阻力最小的路径达成目标。' },
      { label: '社交特质', content: '适应能力极强，善于交际。能迅速融入不同环境，并与各种性格的人和谐相处。' },
      { label: '情绪模式', content: '情感细腻，容易受环境影响。思虑过多时易陷入迷茫，需要信任自己的直觉。' },
      { label: '天赋优势', content: '卓越的创意能力与智慧，擅长跨界整合资源，在复杂局面中游刃有余。' },
      { label: '潜在局限', content: '有时因过于灵活而显得缺乏原则，或因想得太多而行动力不足。建议设定明确的短期目标。' }
    ],
    scenes: [
      { label: '职业适配', content: '适合艺术创作、心理咨询、媒体或咨询行业。在需要创意与深度思考的岗位上极具优势。' },
      { label: '亲密关系', content: '注重情感的流动与深度，渴望灵魂伴侣。需要对方能理解并包容自己的多变。' },
      { label: '社交相处', content: '适合参加各种沙龙或跨界交流，在思想的碰撞中能获得极大的满足感与灵感。' }
    ]
  }
};
