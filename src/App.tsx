/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { 
  Sparkles, Calendar, Clock, User, ChevronRight, 
  Info, Heart, Star, Moon, Briefcase, Wallet, Activity, 
  Palette, Gem, Compass, Utensils, Lightbulb, MessageSquare,
  Share2, CheckCircle2, Send, Plus, Image as ImageIcon, Download, 
  MessageCircle, HelpCircle, Trophy, Dices, Zap, Camera,
  Volume2, VolumeX, Mic, User2, Users2, Info as InfoIcon,
  ChevronLeft, History, LayoutGrid, ArrowLeft, RefreshCw,
  AlertCircle, Gift, TrendingUp, Trash2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { 
  calculateDetailedBaZi, ELEMENTS, 
  PERSONALITY_DETAIL, ELEMENT_COLORS_HEX
} from './utils/bazi';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';

type Tab = 'overview' | 'fortune' | 'lucky';
type MainTab = 'divination' | 'report' | 'community' | 'checkin' | 'profile' | 'featured';

interface Post {
  id: string;
  author: string;
  authorUid: string;
  content: string;
  time: string;
  likes: number;
  likedBy: string[];
  type: 'fortune' | 'healing' | 'chart' | 'divination_help';
  image?: string;
  divinationData?: any;
  mood?: string;
}

const MOODS = [
  { id: 'enlightened', label: '豁然开朗', emoji: '💛' },
  { id: 'low', label: '有些低落', emoji: '💧' },
  { id: 'night', label: '深夜感慨', emoji: '🌙' },
  { id: 'slow', label: '慢慢来', emoji: '🌱' }
];

interface Comment {
  id: string;
  author: string;
  authorUid: string;
  content: string;
  time: string;
  createdAt: any;
}

interface QA {
  id: string;
  question: string;
  answer?: string;
  loading?: boolean;
}

const GrowthPlant = ({ streak, checkedInToday }: { streak: number; checkedInToday: boolean }) => {
  const isWithered = !checkedInToday && streak > 0;
  
  // Stages: 1, 3, 7, 14, 21
  let stage = 0;
  if (streak >= 21) stage = 5;
  else if (streak >= 14) stage = 4;
  else if (streak >= 7) stage = 3;
  else if (streak >= 3) stage = 2;
  else if (streak >= 1) stage = 1;

  const plantColor = isWithered ? '#A09070' : '#457B52';
  const leafColor = isWithered ? '#8A7A5A' : '#6A994E';
  const flowerColor = isWithered ? '#D1B0B0' : '#B52F25';

  return (
    <div className="relative w-48 h-48 mx-auto mb-4 flex items-end justify-center">
      <div className="absolute bottom-4 w-24 h-6 bg-[#634832]/20 rounded-full blur-sm" />
      <div className="absolute bottom-4 w-16 h-3 bg-[#4B3022] rounded-full" />
      
      <AnimatePresence mode="wait">
        <motion.div
           key={stage + (isWithered ? '-withered' : '-healthy')}
           initial={{ opacity: 0, scale: 0.8, y: 10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.8, y: 5 }}
           transition={{ duration: 0.5 }}
           className="relative z-10"
        >
          {stage === 0 && (
             <div className="w-1 h-1 bg-[#4B3022] rounded-full mb-1" />
          )}

          {stage >= 1 && (
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-sm">
              <motion.path 
                d={stage >= 3 ? "M60 110 Q60 60 60 40" : "M60 110 Q60 90 60 85"} 
                stroke={plantColor} 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
              {stage === 1 && (
                <path d="M60 85 C55 80 50 82 48 88 M60 85 C65 80 70 82 72 88" stroke={leafColor} strokeWidth="3" strokeLinecap="round" />
              )}
              {stage >= 2 && (
                <>
                  <path d="M60 90 C50 80 40 85 35 95" stroke={leafColor} strokeWidth="3" strokeLinecap="round" />
                  <path d="M60 90 C70 80 80 85 85 95" stroke={leafColor} strokeWidth="3" strokeLinecap="round" />
                </>
              )}
              {stage >= 3 && (
                <>
                  <path d="M60 70 C45 60 35 65 30 75" stroke={leafColor} strokeWidth="3" strokeLinecap="round" />
                  <path d="M60 70 C75 60 85 65 90 75" stroke={leafColor} strokeWidth="3" strokeLinecap="round" />
                </>
              )}
              {stage === 4 && (
                <motion.circle 
                  cx="60" cy="40" r="6" 
                  fill={flowerColor} 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
              {stage === 5 && (
                <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <circle cx="60" cy="40" r="6" fill="#F0C05A" />
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <circle 
                      key={i}
                      cx={60 + 12 * Math.cos(angle * Math.PI / 180)} 
                      cy={40 + 12 * Math.sin(angle * Math.PI / 180)} 
                      r="8" 
                      fill={flowerColor} 
                    />
                  ))}
                </motion.g>
              )}
            </svg>
          )}
        </motion.div>
      </AnimatePresence>

      {!isWithered && stage >= 2 && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-guofeng-red/5 blur-2xl -z-10" 
        />
      )}
    </div>
  );
};

const DIVINATION_CATEGORIES = [
  { 
    id: 'general', 
    label: '通用求签', 
    options: ['运势', '抉择', '心愿', '迷茫'],
    subQuestion: (opt: string) => `关于${opt}，你目前最想了解的是？`
  },
  { 
    id: 'career', 
    label: '事业学业', 
    options: ['求职', '考研', '升职', '考试', '创业', '转行'],
    subQuestion: (opt: string) => opt === '考研' ? '你的目标院校或当前备考阶段是？' : `关于${opt}，你最担心的具体细节是？`
  },
  { 
    id: 'love', 
    label: '感情人际', 
    options: ['脱单', '复合', '婚姻', '人际矛盾', '异地恋'],
    subQuestion: (opt: string) => `关于${opt}，目前的处境或对方的态度是？`
  },
  { 
    id: 'wealth', 
    label: '财运签', 
    options: ['投资', '理财', '偏财', '债务', '生意'],
    subQuestion: (opt: string) => `关于${opt}，你目前的财务状况或投资计划是？`
  },
  { 
    id: 'health', 
    label: '健康签', 
    options: ['身体状况', '情绪压力', '出行安全', '家人健康'],
    subQuestion: (opt: string) => `关于${opt}，你目前感到不适或担忧的地方是？`
  },
  { 
    id: 'fortune', 
    label: '流年运势', 
    options: ['年度运势', '月度运势'],
    subQuestion: (opt: string) => `请确认你的生辰信息，我们将为你生成${opt}报告。`
  },
  { 
    id: 'auspicious', 
    label: '择吉服务', 
    options: ['搬家', '开业', '出行', '婚嫁', '动工'],
    subQuestion: (opt: string) => `关于${opt}，你希望在哪个时间段内寻找吉日？`
  }
];

const WISH_EXAMPLES = [
  "最近工作压力大，未来三个月会有转机吗？",
  "正在准备重要考试，能顺利通过吗？",
  "和另一半最近总吵架，我们的关系会好转吗？",
  "想换个城市生活，这个决定正确吗？"
];

const FEATURED_ARTICLES: Record<string, { title: string; excerpt: string; content: string; image: string }[]> = {
  love: [
    { 
      title: "今日情感疗愈：放下执念，遇见更好的自己", 
      excerpt: "在感情的迷雾中，我们往往容易迷失方向。今日卦象显示，适度的留白反而能让缘分更清晰...", 
      content: "在感情的迷雾中，我们往往容易迷失方向。今日卦象显示，适度的留白反而能让缘分更清晰。建议今日静坐冥想，关注内心真实的需求，而非外界的期待。放下那些让你感到疲惫的执念，你会发现，更好的自己就在不远处等着你。",
      image: "https://picsum.photos/seed/love1/800/400"
    },
    { 
      title: "脱单秘籍：如何提升自己的桃花气场？", 
      excerpt: "桃花运并非天生，而是可以通过心态和环境的调整来提升。从五行角度看，木气旺盛的人...", 
      content: "桃花运并非天生，而是可以通过心态和环境的调整来提升。从五行角度看，木气旺盛的人通常更具亲和力。建议在卧室东南角摆放绿色植物，或佩戴粉晶饰品。同时，保持积极乐观的心态，多参加社交活动，你的桃花气场自然会越来越强。",
      image: "https://picsum.photos/seed/love2/800/400"
    }
  ],
  career: [
    { 
      title: "职场进阶：如何把握本月的升迁机遇？", 
      excerpt: "本月事业星入驻命宫，正是大展宏图的好时机。但需注意细节，避免因小失大...", 
      content: "本月事业星入驻命宫，正是大展宏图的好时机。但需注意细节，避免因小失大。建议在处理重要文件时多加核对，并积极与上级沟通进展。展现你的专业能力和责任心，升迁的机遇就在你手中。",
      image: "https://picsum.photos/seed/career1/800/400"
    },
    { 
      title: "创业指南：当前市场环境下的避坑指南", 
      excerpt: "创业维艰，守成更难。在当前多变的市场环境下，稳健的财务策略是生存的关键...", 
      content: "创业维艰，守成更难。在当前多变的市场环境下，稳健的财务策略是生存的关键。建议缩减非必要开支，集中资源发展核心业务。同时，保持对市场动态的敏锐洞察，灵活调整经营策略，才能在竞争中立于不败之地。",
      image: "https://picsum.photos/seed/career2/800/400"
    }
  ],
  general: [
    { 
      title: "智慧人生：如何应对生活中的突发变故？", 
      excerpt: "人生不如意事十之八九。学会以平常心对待无常，是通往幸福的必经之路...", 
      content: "人生不如意事十之八九。学会以平常心对待无常，是通往幸福的必经之路。建议每日记录三件值得感恩的小事，培养积极的心态。面对变故，保持冷静，寻找解决问题的方法，而非沉溺于负面情绪中。",
      image: "https://picsum.photos/seed/wisdom1/800/400"
    }
  ]
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "出错了，请稍后再试。";
      try {
        if (this.state.error) {
          const info = JSON.parse(this.state.error.message);
          if (info.error.includes("permission-denied")) {
            errorMessage = "权限不足，请确保已登录或联系管理员。";
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-guofeng-bg p-6 text-center">
          <div className="guofeng-card p-8 max-w-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <InfoIcon className="text-guofeng-red w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold mb-2">抱歉，出现了一些问题</h2>
            <p className="text-gray-500 text-sm mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="guofeng-button px-8 py-2"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female',
    birthDate: '',
    birthTime: '12:00',
    isTrueSolarTime: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('fortune');
  const [activeSubTab, setActiveSubTab] = useState<string>('love');
  const [mainTab, setMainTab] = useState<MainTab>('report');
  const [showLandingForm, setShowLandingForm] = useState(false);

  // Community State
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('enlightened');
  const [expandedPostComments, setExpandedPostComments] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [newCommentContent, setNewCommentContent] = useState('');

  // Check-in State
  const [checkInDates, setCheckInDates] = useState<string[]>([]);
  const [checkInStreak, setCheckInStreak] = useState(0);

  // Q&A State
  const [qaList, setQaList] = useState<QA[]>([]);
  const [question, setQuestion] = useState('');

  // Divination State
  const [divinationQuestion, setDivinationQuestion] = useState('');
  const [divinationResult, setDivinationResult] = useState<any>(null);
  const [isDivining, setIsDivining] = useState(false);
  const [divinationType, setDivinationType] = useState<'stick' | 'iching'>('stick');
  const [divinationStep, setDivinationStep] = useState<'input' | 'calm' | 'shake' | 'result'>('input');
  const [ichingYao, setIchingYao] = useState<number[]>([]);
  const [ichingCoins, setIchingCoins] = useState<number[]>([0, 0, 0]);
  const [divinationCategory, setDivinationCategory] = useState<string | null>(null);
  const [divinationOption, setDivinationOption] = useState<string | null>(null);
  const [divinationSubAnswer, setDivinationSubAnswer] = useState('');
  const [divinationTarget, setDivinationTarget] = useState<'self' | 'other'>('self');
  const [divinationOtherName, setDivinationOtherName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [calmCountdown, setCalmCountdown] = useState(3);
  const [shakeCountdown, setShakeCountdown] = useState(0);
  const [wishExampleIndex, setWishExampleIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [communityView, setCommunityView] = useState<'main' | 'featured'>('main');
  const [selectedFeaturedCategory, setSelectedFeaturedCategory] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [generatingWallpaper, setGeneratingWallpaper] = useState(false);
  const wallpaperRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Leaderboard & Luck Score
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users'), orderBy('profile.luckScore', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const board = snapshot.docs.map(doc => ({
        name: doc.data().name || '神秘用户',
        score: doc.data().profile?.luckScore || 0,
        uid: doc.id
      }));
      setLeaderboard(board);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, [user]);

  // Update Luck Score on Divination
  const updateLuckScore = async () => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        'profile.luckScore': increment(Math.floor(Math.random() * 10) + 1),
        'profile.divinationCount': increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Sync User Data
  useEffect(() => {
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          gender: data.gender || prev.gender,
          birthDate: data.birthDate || prev.birthDate,
          birthTime: data.birthTime || prev.birthTime,
          isTrueSolarTime: data.isTrueSolarTime ?? prev.isTrueSolarTime
        }));
        setCheckInDates(data.checkInDates || []);
        setCheckInStreak(data.checkInStreak || 0);
        setUserProfile(data.profile || null);
        setIsSubscribed(data.isSubscribed || false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Posts
  useEffect(() => {
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().createdAt?.toDate().toLocaleString() || '刚刚'
      })) as Post[];
      setPosts(newPosts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
    return () => unsubscribe();
  }, []);

  // Sync QA
  useEffect(() => {
    if (!user) return;
    const qaQuery = query(collection(db, 'users', user.uid, 'qa'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qaQuery, (snapshot) => {
      const newQA = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QA[];
      setQaList(newQA);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/qa`);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Comments for expanded post
  useEffect(() => {
    if (!expandedPostComments) return;
    const commentsQuery = query(
      collection(db, 'posts', expandedPostComments, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().createdAt?.toDate().toLocaleString() || '刚刚'
      })) as Comment[];
      setCommentsMap(prev => ({ ...prev, [expandedPostComments]: newComments }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `posts/${expandedPostComments}/comments`);
    });
    return () => unsubscribe();
  }, [expandedPostComments]);

  // Wish Example Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setWishExampleIndex((prev) => (prev + 1) % WISH_EXAMPLES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Calm Countdown
  useEffect(() => {
    if (divinationStep === 'calm' && calmCountdown > 0) {
      const timer = setTimeout(() => {
        // Play subtle countdown sound (Small Bell)
        const tickAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        tickAudio.volume = 0.2;
        if (!isMuted) tickAudio.play().catch(e => console.log("Audio play failed:", e));
        setCalmCountdown(calmCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (divinationStep === 'calm' && calmCountdown === 0) {
      setDivinationStep('shake');
    }

    if (divinationStep === 'shake' && isDivining && shakeCountdown > 0) {
      const timer = setTimeout(() => setShakeCountdown(shakeCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (divinationStep === 'shake' && isDivining && shakeCountdown === 0) {
      // Logic moved to handleDivination completion
    }
  }, [divinationStep, calmCountdown, shakeCountdown, isDivining]);

  const handleVoiceInput = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      const simulatedText = "我希望身体健康，万事如意。";
      setDivinationQuestion(simulatedText);
      setIsListening(false);
    }, 2000);
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    setAuthError(null);
    try {
      await signInWithPopup(auth, provider);
      setIsGuest(false);
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError("登录窗口被浏览器拦截，请允许弹出窗口后重试。");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show a scary error
        setAuthError(null);
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore
      } else if (error.message?.includes('INTERNAL ASSERTION FAILED')) {
        setAuthError("登录组件初始化失败，请尝试刷新页面。");
      } else {
        setAuthError("登录失败，请稍后重试。");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestMode = () => {
    setIsGuest(true);
    setMainTab('divination');
    setShowLandingForm(false);
  };

  const handleCheckIn = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    if (!checkInDates.includes(today)) {
      const newDates = [...checkInDates, today];
      
      // Calculate streak
      let streak = 1;
      let checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);
      while (newDates.includes(checkDate.toISOString().split('T')[0])) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      try {
        const path = `users/${user.uid}`;
        await updateDoc(doc(db, 'users', user.uid), {
          checkInDates: arrayUnion(today),
          checkInStreak: streak
        });
        
        // Also save a check-in log for report generation
        const logRef = collection(db, 'users', user.uid, 'checkin_logs');
        await addDoc(logRef, {
          date: today,
          timestamp: serverTimestamp(),
          luckScore: result?.scores?.overall || 80 // Base luck score if available
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const generateReport = async (type: 'daily' | 'weekly' | 'monthly') => {
    if (!user) return;
    setIsGeneratingReport(true);
    setReportType(type);
    setShowReportModal(true);

    try {
      // Fetch recent history and check-ins
      const historyRef = collection(db, 'users', user.uid, 'divination_history');
      const historyQuery = query(historyRef, orderBy('timestamp', 'desc'), limit(10));
      const historySnap = await getDoc(doc(db, 'users', user.uid)); // Just to get basic info
      
      // In a real app we'd fetch the actual history docs, but for the prompt we'll use current state
      const recentHistory = qaList.slice(0, 3).map(qa => qa.question);
      
      const prompt = `你是一位精通心理学与东方命理的资深导师。
      请根据用户的近期使用情况生成一份${type === 'daily' ? '日报' : type === 'weekly' ? '周报' : '月报'}。
      
      用户信息：
      - 姓名：${formData.name}
      - 连续打卡：${checkInStreak}天
      - 近期关注：${recentHistory.join(', ') || '探索自我'}
      - 核心特质：${result?.summary || '追求和谐与平衡'}
      
      请生成JSON格式的报告：
      {
        "title": "报告标题 (如：${formData.name}的${type === 'daily' ? '今日' : type === 'weekly' ? '本周' : '本月'}灵性成长报告)",
        "summary": "一段温暖的总结，回顾这段时间的心理状态与能量波动",
        "highlights": ["亮点1", "亮点2", "亮点3"],
        "interpretation": "深度的命理与心理学解读，分析用户行为背后的潜在需求",
        "suggestions": ["建议1", "建议2", "建议3"],
        "energyLevel": 85,
        "luckyTip": "一个具体的开运小贴士"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      setReportData(JSON.parse(response.text));
    } catch (error) {
      console.error("Report Generation Error:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleLike = async (id: string) => {
    if (!user) return;
    const postRef = doc(db, 'posts', id);
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const isLiked = post.likedBy?.includes(user.uid);
    try {
      const path = `posts/${id}`;
      await updateDoc(postRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const handlePost = async () => {
    if (!user || !newPostContent.trim()) return;
    try {
      const path = 'posts';
      await addDoc(collection(db, 'posts'), {
        author: formData.name || user.displayName || '神秘用户',
        authorUid: user.uid,
        content: newPostContent,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        type: 'healing',
        mood: selectedMood
      });
      setNewPostContent('');
      setSelectedMood('enlightened');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("确定要删除这条动态吗？");
    if (!confirmDelete) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newCommentContent.trim()) return;
    try {
      const path = `posts/${postId}/comments`;
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        author: formData.name || user.displayName || '神秘用户',
        authorUid: user.uid,
        content: newCommentContent,
        createdAt: serverTimestamp()
      });
      setNewCommentContent('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `posts/${postId}/comments`);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("确定要删除这条评论吗？");
    if (!confirmDelete) return;

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}/comments/${commentId}`);
    }
  };

  const handleShare = async (post: Post) => {
    const shareData = {
      title: '窥探天机',
      text: `分享来自 ${post.author} 的治愈瞬间：${post.content}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('分享链接已复制到剪贴板');
      }
    } catch (error) {
      console.error("Share Error:", error);
    }
  };

  const handleShareDivination = async () => {
    if (!divinationResult) return;
    
    const isIChing = divinationType === 'iching';
    const shareTitle = isIChing ? '周易卜卦' : '灵签';
    
    const shareText = `
【窥探天机 - ${shareTitle}】
✨ ${isIChing ? divinationResult.title : `${divinationResult.lotNumber} · ${divinationResult.title}`} ✨
${isIChing ? '' : `五行：${divinationResult.element}\n`}
${isIChing ? '卦辞' : '签诗'}：
${isIChing ? divinationResult.poem : divinationResult.poem.split('，').join('\n')}

【白话解读】
${divinationResult.vernacular}

【针对性解读】
${divinationResult.targetedInterpretation}

【治愈建议】
${divinationResult.advice}

—— 愿你所求皆所愿，所行化坦途。
    `.trim();

    // Option 1: Share to Community
    if (user) {
      const confirmShare = window.confirm("是否将此灵签分享到互助社区，邀请大家一同解读？");
      if (confirmShare) {
        const path = 'posts';
        const postsRef = collection(db, 'posts');
        try {
          await addDoc(postsRef, {
            author: formData.name || '匿名用户',
            authorUid: user.uid,
            content: `我求得一签：【${divinationResult.title}】，愿望是「${divinationQuestion}」。求各位同修指点迷津。`,
            time: new Date().toLocaleString(),
            createdAt: serverTimestamp(),
            likes: 0,
            likedBy: [],
            type: 'divination_help',
            divinationData: divinationResult
          });
          alert("已成功分享到社区！");
          setMainTab('community');
          return;
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'posts');
        }
      }
    }

    const shareData = {
      title: `我的灵签：${divinationResult.title}`,
      text: shareText,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n查看详情：${shareData.url}`);
        alert('灵签内容已复制到剪贴板，快去分享给好友吧！');
      }
    } catch (error) {
      console.error("Share Divination Error:", error);
    }
  };

  const handleDownloadWallpaper = async () => {
    if (!wallpaperRef.current) return;
    setGeneratingWallpaper(true);
    try {
      const dataUrl = await toPng(wallpaperRef.current, { cacheBust: true, quality: 1.0 });
      const link = document.createElement('a');
      link.download = `窥探天机-${divinationResult.title}-${new Date().toLocaleDateString()}.png`;
      link.href = dataUrl;
      link.click();
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B52F25', '#C0A46B', '#F5F1E6']
      });

      // Automatically return to the result screen after a short delay to allow the user to see the success
      setTimeout(() => {
        setShowWallpaperModal(false);
      }, 1000);
    } catch (err) {
      console.error('Wallpaper Generation Failed:', err);
      alert('壁纸生成失败，请重试');
    } finally {
      setGeneratingWallpaper(false);
    }
  };

  const handleAsk = async () => {
    if (!user || !question.trim()) return;
    const qaRef = collection(db, 'users', user.uid, 'qa');
    const tempId = Date.now().toString();
    
    // Add question first
    try {
      const qaPath = `users/${user.uid}/qa`;
      const docRef = await addDoc(qaRef, {
        userUid: user.uid,
        question,
        createdAt: serverTimestamp(),
        loading: true
      });

      setQuestion('');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一位专业的命理治愈师。请回答用户的问题：${question}。请保持语气温柔、专业且富有启发性。`,
      });
      const answer = response.text || "抱歉，星象有些模糊，请稍后再试。";
      
      await updateDoc(docRef, {
        answer,
        loading: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/qa`);
    }
  };

  const startDivination = () => {
    if (!divinationQuestion.trim()) return;
    
    // Play ritual start sound (Temple Bell)
    const startAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2048/2048-preview.mp3');
    startAudio.volume = 0.4;
    if (!isMuted) startAudio.play().catch(e => console.log("Audio play failed:", e));

    setCalmCountdown(3);
    setIchingYao([]);
    setIchingCoins([0, 0, 0]);
    setDivinationStep('calm');
  };

  const handleQuickDivination = (type: 'stick' | 'iching') => {
    setDivinationType(type);
    setDivinationTarget('self');
    setDivinationCategory('general');
    setDivinationOption('运势');
    setDivinationQuestion('请指引我今日的综合运势与行动方向。');
    setDivinationSubAnswer('快速求指引');
    
    // Play ritual start sound (Temple Bell)
    const startAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2048/2048-preview.mp3');
    startAudio.volume = 0.4;
    if (!isMuted) startAudio.play().catch(e => console.log("Audio play failed:", e));

    if (type === 'stick') {
      setCalmCountdown(0);
      setIchingYao([]);
      setIchingCoins([0, 0, 0]);
      setDivinationStep('shake');
      
      // Start divination immediately after state updates
      setTimeout(() => {
        handleDivination();
      }, 100);
    } else {
      // For I Ching, generate 6 random Yao immediately
      const quickYao = Array.from({ length: 6 }, () => {
        const coins = [Math.random() > 0.5 ? 1 : 0, Math.random() > 0.5 ? 1 : 0, Math.random() > 0.5 ? 1 : 0];
        const tailsCount = coins.reduce((a, b) => a + b, 0);
        if (tailsCount === 2) return 7;
        if (tailsCount === 1) return 8;
        if (tailsCount === 3) return 9;
        return 6;
      });
      setIchingYao(quickYao);
      setDivinationStep('shake');
      setIsDivining(true);
      
      setTimeout(() => {
        handleDivination(quickYao);
      }, 1500); // Small delay to show the "shaking" state briefly for immersion
    }
  };

  const handleIChingShake = async () => {
    if (isDivining || ichingYao.length >= 6) return;
    
    setIsDivining(true);
    
    // Play coin sound
    const coinAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3');
    coinAudio.volume = 0.4;
    if (!isMuted) coinAudio.play().catch(e => console.log("Audio play failed:", e));

    // Shake animation duration
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Generate 3 coins (0 for Head/Character, 1 for Tail/Back)
    const newCoins = [
      Math.random() > 0.5 ? 1 : 0,
      Math.random() > 0.5 ? 1 : 0,
      Math.random() > 0.5 ? 1 : 0
    ];
    setIchingCoins(newCoins);

    // Calculate Yao
    // 2背1字 (2 tails, 1 head) = 少阳 (7)
    // 2字1背 (2 heads, 1 tail) = 少阴 (8)
    // 3背 (3 tails) = 老阳 (9)
    // 3字 (3 heads) = 老阴 (6)
    const tailsCount = newCoins.reduce((a, b) => a + b, 0);
    let yao = 0;
    if (tailsCount === 2) yao = 7; // 少阳
    else if (tailsCount === 1) yao = 8; // 少阴
    else if (tailsCount === 3) yao = 9; // 老阳
    else if (tailsCount === 0) yao = 6; // 老阴

    const newYaoList = [...ichingYao, yao];
    setIchingYao(newYaoList);
    setIsDivining(false);

    // If 6 Yao are collected, proceed to result
    if (newYaoList.length === 6) {
      handleDivination(newYaoList);
    }
  };

  const handleDivination = async (yaoList?: number[]) => {
    if (isDivining && !yaoList) return;
    
    // If it's the final I Ching result, we don't need the 3s countdown again
    const skipCountdown = !!yaoList;
    
    if (!yaoList) setIsDivining(true);
    setShakeCountdown(skipCountdown ? 0 : 3);
    setDivinationResult(null);

    // For sticks, play shaking sound (wooden sticks colliding)
    let shakeAudio: HTMLAudioElement | null = null;
    if (!skipCountdown) {
      // Using a more "wooden" shaking sound
      shakeAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      shakeAudio.loop = true;
      shakeAudio.volume = 0.6; // Slightly louder for immersion
      if (!isMuted) shakeAudio.play().catch(e => console.log("Audio play failed:", e));
    }

    const category = DIVINATION_CATEGORIES.find(c => c.id === divinationCategory);
    
    const fullQuestion = `
      类型：${divinationType === 'stick' ? category?.label : '周易卜卦'}
      事项：${divinationOption}
      身份：${divinationTarget === 'self' ? '自己' : `为他人代求 (${divinationOtherName})`}
      补充信息：${divinationSubAnswer}
      核心困惑：${divinationQuestion}
      ${divinationCategory === 'fortune' ? `生辰信息：${formData.birthDate} ${formData.birthTime}` : ''}
      ${yaoList ? `卦象爻位（自下而上）：${yaoList.join(', ')} (6=老阴, 7=少阳, 8=少阴, 9=老阳)` : ''}
    `;

    try {
      // Start AI generation in parallel
      const aiPromise = (async () => {
        let prompt = "";
        if (divinationType === 'iching') {
          prompt = `你是一位精通《周易》六爻预测的国学大师。
          用户进行了六爻卜卦，卦象爻位（自下而上）为：${yaoList?.join(', ')}。
          其中：6为老阴（动），7为少阳（静），8为少阴（静），9为老阳（动）。
          
          背景：${fullQuestion}
          用户画像：${JSON.stringify(userProfile || {})}
          
          请根据本卦、变卦、动爻、五行生克、六亲定位进行深度解卦。
          返回格式为JSON：
          {
            "lotNumber": "卦名 (如：乾为天 之 天风姤)",
            "title": "吉凶断语 (如：中吉, 忧中见喜, 等)",
            "poem": "卦辞或相关的易经哲理诗",
            "vernacular": "本卦与变卦的详细白话解读，说明当前状态与未来趋势",
            "targetedInterpretation": "针对用户具体困惑(${divinationQuestion})，结合世应关系与六亲生克的深度分析。请给出极其具体的建议。",
            "advice": "基于卦象的治愈性行动建议与时机把握",
            "element": "卦气所属五行"
          }`;
        } else if (divinationCategory === 'fortune') {
          prompt = `你是一位精通紫微斗数与占星术的命理大师。
          请根据用户信息生成一份${divinationOption}报告。
          背景：${fullQuestion}
          用户画像：${JSON.stringify(userProfile || {})}
          返回格式为JSON：
          {
            "lotNumber": "${divinationOption}报告",
            "title": "运势评级 (如：紫气东来, 岁运并临, 等)",
            "poem": "一段富有哲理的运势总览诗",
            "vernacular": "运势的详细白话解读，包含事业、感情、财运三个维度",
            "targetedInterpretation": "针对用户当前处境的深度建议",
            "advice": "本阶段的避坑指南与开运建议",
            "element": "本期幸运色/幸运数字"
          }`;
        } else if (divinationCategory === 'auspicious') {
          prompt = `你是一位精通中华万年历与择日学的民俗专家。
          请为用户提供${divinationOption}的择吉建议。
          背景：${fullQuestion}
          返回格式为JSON：
          {
            "lotNumber": "择吉建议",
            "title": "吉日预告",
            "poem": "择日总纲诗",
            "vernacular": "推荐的3个吉日及其宜忌说明",
            "targetedInterpretation": "为什么这些日子适合${divinationOption}",
            "advice": "当日的注意事项与仪式建议",
            "element": "吉神方位"
          }`;
        } else {
          prompt = `你是一位精通周易与禅宗的命理大师。用户正在进行"${category?.label}"仪式。
          求签背景：${fullQuestion}
          用户画像：${JSON.stringify(userProfile || {})}
          
          请为用户生成一个"灵签"结果。返回格式为JSON：
          {
            "lotNumber": "签号 (如：第十八签)",
            "title": "签诗等级 (如：上上大吉, 中平, 等)",
            "poem": "四句七言诗，富有古风韵味",
            "vernacular": "签诗的现代文白话翻译，通俗易懂",
            "targetedInterpretation": "结合用户具体愿望做的1v1定制化深度解读。如果是财运签，请务必包含风险提示；如果是健康签，请包含健康建议；如果是感情签，请增加情感疗愈内容。请针对用户的具体困惑(${divinationQuestion})给出极其具体的备考建议、心态调整方法 or 行动计划。",
            "advice": "给用户的治愈性行动建议",
            "element": "对应的五行属性 (金/木/水/火/土)"
          }`;
        }

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
      })();

      // Wait for 3 seconds if not skipping
      if (!skipCountdown) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const res = await aiPromise;
      
      if (shakeAudio) {
        shakeAudio.pause();
        shakeAudio.currentTime = 0;
      }
      
      // Play gentle success sound
      const successAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
      successAudio.volume = 0.5;
      if (!isMuted) successAudio.play().catch(e => console.log("Audio play failed:", e));

      setDivinationResult(res);
      setIsDivining(false);
      setDivinationStep('result');

      // Save to History and Update Profile
      if (user) {
        const historyPath = `users/${user.uid}/divination_history`;
        const historyRef = collection(db, 'users', user.uid, 'divination_history');
        try {
          await addDoc(historyRef, {
            type: divinationType,
            category: divinationCategory,
            option: divinationOption,
            question: divinationQuestion,
            result: res,
            ichingYao: divinationType === 'iching' ? yaoList : null,
            timestamp: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, historyPath);
        }

        const userPath = `users/${user.uid}`;
        const userRef = doc(db, 'users', user.uid);
        const categoryKey = divinationType === 'iching' ? 'profile.interests.iching' : `profile.interests.${divinationCategory}`;
        try {
          await updateDoc(userRef, {
            [categoryKey]: increment(1),
            'profile.lastDivination': serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, userPath);
        }
        await updateLuckScore();
      }
    } catch (error) {
      console.error("Divination Error:", error);
      setIsDivining(false);
      if (shakeAudio) shakeAudio.pause();
      setDivinationStep('input');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birthDate) return;
    
    setLoading(true);
    
    // Save to Firestore if logged in
    if (user) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          ...formData,
          uid: user.uid
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    }

    setTimeout(() => {
      const baziResult = calculateDetailedBaZi(formData.birthDate, formData.birthTime);
      setResult(baziResult);
      setLoading(false);
      setShowLandingForm(false);
    }, 1800);
  };

  const handleReset = () => {
    setResult(null);
    setActiveTab('fortune');
    setActiveSubTab('love');
  };

  return (
    <div className="min-h-screen bg-guofeng-bg font-sans text-guofeng-ink selection:bg-red-100 relative">
      {/* Background Patterns Layer 1: Textured Paper */}
      <div className="fixed inset-0 pointer-events-none guofeng-paper-texture opacity-40"></div>

      {/* Background Patterns Layer 2: Fret Pattern (Hui-wen) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] guofeng-fret-pattern animate-drift-slow"></div>

      {/* Background Patterns Layer 3: Cloud Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] guofeng-cloud-pattern animate-float-cloud" style={{ animationDuration: '40s' }}></div>
      
      {/* Background Patterns Layer 4: Ink Wash Effect */}
      <div className="fixed inset-0 pointer-events-none guofeng-ink-spots opacity-40 animate-ink-pulse"></div>

      {/* Auspicious Clouds Decor (Foregrounded decorative elements) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-10 -left-10 w-64 h-64 text-guofeng-red/10 animate-float-cloud" viewBox="0 0 100 100" style={{ animationDuration: '15s' }}>
          <path d="M10 50 Q 25 30 40 50 T 70 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <path d="M20 60 Q 35 40 50 60 T 80 60" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <circle cx="45" cy="40" r="1" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-1/4 -right-16 w-80 h-80 text-guofeng-gold/10 animate-float-cloud" viewBox="0 0 100 100" style={{ transform: 'rotate(180deg)', animationDelay: '-7s', animationDuration: '25s' }}>
          <path d="M10 50 Q 25 30 40 50 T 70 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.2" />
        </svg>
      </div>

      {/* Dynamic Ink Drifts */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-20">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-gradient-radial from-guofeng-cyan/20 to-transparent blur-3xl"
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-gradient-radial from-guofeng-gold/10 to-transparent blur-3xl"
        />
      </div>

      <AnimatePresence>
        {!user && !isGuest && isAuthReady && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-guofeng-ink/20 backdrop-blur-md px-6"
          >
            <div className="guofeng-card p-10 text-center max-w-sm w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-guofeng-red"></div>
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <Sparkles className="w-10 h-10 text-guofeng-red" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-4">欢迎来到窥探天机</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                登录以同步你的命理探测、打卡记录和社区动态，开启完整的探索之旅。
              </p>
              <div className="space-y-4">
                <button 
                  onClick={handleLogin}
                  className="w-full py-4 guofeng-button flex items-center justify-center space-x-3"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5 bg-white rounded-full p-0.5" />
                  <span>使用 Google 账号登录</span>
                </button>
                <button 
                  onClick={handleGuestMode}
                  className="w-full py-4 text-sm font-serif font-bold text-guofeng-ink/40 hover:text-guofeng-red transition-colors"
                >
                  先以游客身份体验
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
        {(!result && !isGuest) || showLandingForm ? (
          <div className="flex-1 px-6 pt-16 pb-32">
            <header className="text-center mb-12 relative">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-guofeng-gold/20 to-transparent -translate-y-1/2 -z-10"></div>
              {showLandingForm && (
                <button 
                  onClick={() => setShowLandingForm(false)}
                  className="absolute top-8 left-6 p-2 text-guofeng-ink/40 hover:text-guofeng-red transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block p-4 bg-white rounded-full shadow-xl shadow-red-900/5 mb-6 border border-[#F0E6D2] relative"
              >
                <div className="absolute inset-0 border border-guofeng-red/10 rounded-full scale-110"></div>
                <div className="w-12 h-12 bg-guofeng-red rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border border-white/20 rounded-full scale-125 animate-ping opacity-20"></div>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              <h1 className="text-4xl font-serif font-black text-guofeng-ink tracking-tight mb-2 flex items-center justify-center">
                <span className="opacity-20 mr-4 text-guofeng-red writing-mode-vertical text-sm font-black tracking-widest leading-none hidden sm:block border-r border-guofeng-red/10 pr-2">天机不可泄露</span>
                <span className="relative">
                  窥探天机
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-guofeng-red/10 rounded-full guofeng-ink-wash"></div>
                </span>
                <span className="opacity-20 ml-4 text-guofeng-red writing-mode-vertical text-sm font-black tracking-widest leading-none hidden sm:block border-l border-guofeng-red/10 pl-2">所求皆有所应</span>
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className="h-[1px] w-8 bg-guofeng-gold/30"></div>
                <p className="text-guofeng-red font-serif font-medium text-sm tracking-[0.2em]">
                  所求皆所愿 · 所行化坦途
                </p>
                <div className="h-[1px] w-8 bg-guofeng-gold/30"></div>
              </div>
            </header>

            <div className="flex mb-6 bg-white/50 backdrop-blur-sm rounded-2xl p-1 border border-[#F0E6D2] shadow-sm">
              <button 
                onClick={handleGuestMode} 
                className={`flex-1 py-3 rounded-xl text-xs font-serif font-bold transition-all ${isGuest || !user ? 'bg-guofeng-red text-white shadow-md' : 'text-guofeng-ink/40'}`}
              >
                游客登录
              </button>
              <button 
                onClick={handleLogin} 
                className={`flex-1 py-3 rounded-xl text-xs font-serif font-bold transition-all ${user && !isGuest ? 'bg-guofeng-red text-white shadow-md' : 'text-guofeng-ink/40'}`}
              >
                {isLoggingIn ? '正在登录...' : (user && !isGuest ? '已登录账号' : '登录账号')}
              </button>
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-2 text-guofeng-red text-[10px] font-serif"
              >
                <AlertCircle size={14} />
                <span>{authError}</span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="guofeng-card p-8 relative guofeng-border-hui shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-guofeng-gold/30 to-transparent"></div>
              <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
                <Moon size={48} className="text-guofeng-red" />
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-serif font-bold text-guofeng-red/60 uppercase tracking-[0.2em] ml-1">你的称呼</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-guofeng-gold/50" />
                    <input
                      type="text"
                      required
                      placeholder="如何称呼你"
                      className="w-full pl-12 pr-5 py-4 bg-[#FDFBF7] rounded-2xl focus:bg-white focus:ring-2 focus:ring-red-50 outline-none transition-all border border-[#EAE3D5] focus:border-guofeng-red/30 font-serif"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-serif font-bold text-guofeng-red/60 uppercase tracking-[0.2em] ml-1">性别选择</label>
                  <div className="flex p-1.5 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5]">
                    {['female', 'male'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g })}
                        className={`flex-1 py-3 rounded-xl text-sm font-serif font-bold transition-all ${
                          formData.gender === g
                            ? 'bg-guofeng-red text-white shadow-md'
                            : 'text-guofeng-ink/40'
                        }`}
                      >
                        {g === 'female' ? '坤·女生' : '乾·男生'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-xs font-serif font-bold text-guofeng-red/60 uppercase tracking-[0.2em] ml-1">出生日期</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-guofeng-gold/50 pointer-events-none" />
                      <input
                        type="date"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-[#FDFBF7] rounded-2xl focus:bg-white outline-none text-sm border border-[#EAE3D5] focus:border-guofeng-red/30 font-serif"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-serif font-bold text-guofeng-red/60 uppercase tracking-[0.2em] ml-1">出生时辰</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-guofeng-gold/50 pointer-events-none" />
                      <input
                        type="time"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-[#FDFBF7] rounded-2xl focus:bg-white outline-none text-sm border border-[#EAE3D5] focus:border-guofeng-red/30 font-serif"
                        value={formData.birthTime}
                        onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-guofeng-ink/50 font-serif">采用真太阳时校准</span>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, isTrueSolarTime: !formData.isTrueSolarTime})}
                    className={`w-10 h-5 rounded-full transition-colors relative ${formData.isTrueSolarTime ? 'bg-guofeng-red' : 'bg-[#EAE3D5]'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isTrueSolarTime ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 guofeng-button text-lg font-serif tracking-[0.4em] flex items-center justify-center disabled:opacity-50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>正在窥探天机...</span>
                    </div>
                  ) : (
                    <>开启探测</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col pb-24 h-screen overflow-hidden">
            {/* Result Header - Fixed at top, only for report column */}
            {mainTab === 'report' && (
              <div className="bg-white/90 backdrop-blur-md px-6 pt-12 pb-0 shadow-sm z-20 border-b border-[#EAE3D5] shrink-0">
                {/* Tabs */}
                <div className="flex justify-around">
                  {(['fortune', 'lucky', 'overview'] as Tab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-sm font-serif font-bold transition-all relative ${
                        activeTab === tab ? 'text-guofeng-red' : 'text-guofeng-ink/40'
                      }`}
                    >
                      {tab === 'fortune' ? '今日运势' : tab === 'lucky' ? '开运指南' : '性格解析'}
                      {activeTab === tab && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-guofeng-red rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar pb-32">
              <AnimatePresence mode="wait">
                {mainTab === 'report' && (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    {activeTab === 'overview' && (
                      <div className="space-y-8">
                        {!result ? (
                          <div className="guofeng-card p-12 text-center space-y-8">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                              <Sparkles className="w-10 h-10 text-guofeng-red" />
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-xl font-serif font-black text-guofeng-ink">开启你的命理探测</h3>
                              <p className="text-sm text-guofeng-ink/40 font-serif leading-relaxed">
                                探测报告需要您的生辰信息进行深度解析，完成后即可解锁专属的治愈指引。
                              </p>
                            </div>
                            <button 
                              onClick={() => setShowLandingForm(true)}
                              className="w-full py-4 guofeng-button text-sm font-serif font-bold"
                            >
                              填写信息开启探测
                            </button>
                          </div>
                        ) : (
                          <React.Fragment>
                            {/* Core Trait Summary */}
                            <div className="guofeng-card p-10 text-center relative overflow-hidden guofeng-border-hui shadow-2xl">
                              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-guofeng-red/30 to-transparent"></div>
                              <div className="absolute top-0 left-0 w-1 h-full bg-guofeng-red/5"></div>
                              <div className="absolute top-0 right-0 w-1 h-full bg-guofeng-red/5"></div>
                              <div className="absolute -top-10 -right-10 w-40 h-40 bg-guofeng-red/5 rounded-full blur-2xl"></div>
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="guofeng-stamp-complex absolute -top-8 -right-8 scale-75 opacity-40 rotate-12 z-20">命格</div>
                                <div className="text-[10px] font-serif font-bold text-guofeng-red uppercase tracking-[0.4em] mb-8 guofeng-brush-border">核心特质 · The Essence</div>
                                <div className="text-sm font-serif font-black leading-[2.2] text-guofeng-ink mb-10 border-l-4 border-guofeng-red/30 pl-8 pr-4 py-4 italic max-w-[300px] text-left bg-white/30 rounded-r-2xl">
                                  {result.summary}
                                </div>
                                <div className="guofeng-divider-ornate w-full opacity-60"></div>
                                <div className="flex items-center justify-center space-x-4 pt-4">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-serif font-bold text-guofeng-ink/30 uppercase tracking-[0.2em] mb-1">Soul Sync</span>
                                    <div className="h-[1px] w-8 bg-guofeng-gold/30"></div>
                                  </div>
                                  <div className="flex items-baseline space-x-2">
                                    <span className="text-6xl font-serif font-black text-guofeng-red guofeng-hollow-text">
                                      {result.scores.overall}
                                    </span>
                                    <span className="text-xs font-serif font-black text-guofeng-ink tracking-widest">%</span>
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-serif font-black text-guofeng-ink tracking-widest mb-1 underline decoration-guofeng-gold/30 underline-offset-4">契合度</span>
                                    <div className="h-[1px] w-8 bg-guofeng-gold/30"></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                        {/* Core Trait Radar Chart */}
                        <div className="guofeng-card p-8">
                          <div className="flex items-center mb-8 space-x-3">
                            <div className="p-2 bg-[#FDFBF7] rounded-lg border border-[#EAE3D5]">
                              <LayoutGrid className="w-4 h-4 text-guofeng-red" />
                            </div>
                            <span className="text-sm font-serif font-black text-guofeng-ink tracking-widest">核心特质画像</span>
                          </div>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="65%" margin={{ top: 10, right: 30, bottom: 10, left: 30 }} data={[
                                { subject: '思维力', A: result.scores.thinking, fullMark: 100 },
                                { subject: '共情力', A: result.scores.empathy, fullMark: 100 },
                                { subject: '行动力', A: result.scores.action, fullMark: 100 },
                                { subject: '创造力', A: result.scores.creativity, fullMark: 100 },
                                { subject: '情绪稳定性', A: result.scores.stability, fullMark: 100 },
                              ]}>
                                <PolarGrid stroke="#EAE3D5" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A3E2E', fontSize: 10, fontWeight: 700, fontFamily: 'serif' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                  name="Personality"
                                  dataKey="A"
                                  stroke="#C2410C"
                                  fill="#C2410C"
                                  fillOpacity={0.5}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-6 grid grid-cols-5 gap-2">
                            {[
                              { label: '思维', score: result.scores.thinking },
                              { label: '共情', score: result.scores.empathy },
                              { label: '行动', score: result.scores.action },
                              { label: '创造', score: result.scores.creativity },
                              { label: '稳定', score: result.scores.stability },
                            ].map((trait, i) => (
                              <div key={i} className="text-center">
                                <div className="text-[10px] font-serif font-bold text-guofeng-ink/40 mb-1">{trait.label}</div>
                                <div className="text-xs font-mono font-bold text-guofeng-red">{trait.score}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* BaZi Board with Vernacular */}
                        <div className="guofeng-card p-8 border-guofeng-gold/30">
                          <div className="flex items-center mb-8 space-x-3">
                            <div className="p-2 bg-[#FDFBF7] rounded-lg border border-guofeng-gold/20">
                              <Star className="w-4 h-4 text-guofeng-gold" />
                            </div>
                            <span className="text-sm font-serif font-black text-guofeng-ink tracking-widest">先天命盘 · 八字简牍</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {result.bazi.map((item: any, idx: number) => (
                              <div key={idx} className="guofeng-bamboo py-6 px-1 flex flex-col items-center border border-guofeng-gold/10 relative group">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-guofeng-red/20"></div>
                                <div className="text-[9px] text-guofeng-red font-serif font-black mb-4 writing-mode-vertical whitespace-nowrap opacity-60 tracking-widest leading-none">{item.label}</div>
                                <div className="flex flex-col items-center mb-4">
                                  <div className="text-2xl font-serif font-black text-guofeng-ink leading-tight">{item.stem}</div>
                                  <div className="text-2xl font-serif font-black text-guofeng-ink leading-tight">{item.branch}</div>
                                </div>
                                <div className="guofeng-stamp-sm scale-75 opacity-40 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[8px]">{item.desc}</div>
                              </div>
                            ))}
                          </div>
                          <div className="guofeng-divider-ornate">
                            <span className="px-4 text-[10px] font-serif text-guofeng-gold">灵犀一指 · Interpretation</span>
                          </div>
                          <div className="space-y-4">
                             {result.bazi.map((item: any, idx: number) => (
                               <div key={`desc-${idx}`} className="flex space-x-3 items-start">
                                 <div className="text-[10px] font-serif font-black text-guofeng-red mt-1 px-1.5 py-0.5 border border-guofeng-red/20 rounded-md shrink-0">{item.label.charAt(0)}</div>
                                 <p className="text-xs text-guofeng-ink/60 font-serif leading-relaxed italic">{item.vernacular}</p>
                               </div>
                             ))}
                          </div>
                        </div>

                        {/* Personality Detail */}
                        <div className="space-y-8">
                          <div className="guofeng-card p-8">
                            <div className="flex items-center mb-8 space-x-3">
                              <div className="p-2 bg-[#FDFBF7] rounded-lg border border-[#EAE3D5]">
                                <Heart className="w-4 h-4 text-guofeng-red" />
                              </div>
                              <span className="text-sm font-serif font-black text-guofeng-ink tracking-widest">深度性格解析</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                              {result && PERSONALITY_DETAIL[result.dayMasterElement as keyof typeof PERSONALITY_DETAIL].dimensions.map((dim: any, i: number) => (
                                <div key={i} className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-1 h-3 bg-guofeng-red rounded-full"></div>
                                    <span className="text-xs font-serif font-black text-guofeng-ink">{dim.label}</span>
                                  </div>
                                  <p className="text-xs text-guofeng-ink/60 leading-relaxed font-serif bg-[#FDFBF7] p-4 rounded-xl border border-[#EAE3D5]">
                                    {dim.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="guofeng-card p-8">
                            <div className="flex items-center mb-8 space-x-3">
                              <div className="p-2 bg-[#FDFBF7] rounded-lg border border-[#EAE3D5]">
                                <Compass className="w-4 h-4 text-guofeng-gold" />
                              </div>
                              <span className="text-sm font-serif font-black text-guofeng-ink tracking-widest">性格适配场景</span>
                            </div>
                            <div className="space-y-6">
                              {result && PERSONALITY_DETAIL[result.dayMasterElement as keyof typeof PERSONALITY_DETAIL].scenes.map((scene: any, i: number) => (
                                <div key={i} className="flex items-start space-x-4 p-5 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5]">
                                  <div className="shrink-0 mt-1">
                                    {scene.label === '职业适配' ? <Briefcase size={16} className="text-blue-500" /> :
                                     scene.label === '亲密关系' ? <Heart size={16} className="text-guofeng-red" /> :
                                     <Users2 size={16} className="text-orange-500" />}
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-serif font-bold text-guofeng-ink mb-1">{scene.label}</div>
                                    <p className="text-xs text-guofeng-ink/60 leading-relaxed font-serif">{scene.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                )}

                    {activeTab === 'fortune' && (
                      <div className="space-y-8">
                        {!result ? (
                          <div className="guofeng-card p-12 text-center space-y-8">
                            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto border border-yellow-100 shadow-sm">
                              <Calendar className="w-10 h-10 text-guofeng-gold" />
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-xl font-serif font-black text-guofeng-ink">解锁每日运势</h3>
                              <p className="text-sm text-guofeng-ink/40 font-serif leading-relaxed">
                                运势解析需要结合您的命盘信息，登录或填写信息后即可查看精准的每日能量波动。
                              </p>
                            </div>
                            <button 
                              onClick={() => setShowLandingForm(true)}
                              className="w-full py-4 guofeng-button text-sm font-serif font-bold"
                            >
                              填写信息解锁运势
                            </button>
                          </div>
                        ) : (
                          <React.Fragment>
                            {/* Today's Overview */}
                            <div className="guofeng-card p-8 text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-guofeng-red to-transparent"></div>
                          <div className="text-[10px] font-serif font-bold text-guofeng-red uppercase tracking-[0.3em] mb-4">今日运势总览 · Overview</div>
                          <div className="flex items-center justify-center space-x-4 mb-6">
                            <div className="text-6xl font-serif font-black text-guofeng-red">{result?.scores.overall || 0}</div>
                            <div className="text-left">
                              <div className="text-xs font-serif font-bold text-guofeng-ink/40">整体运势评分</div>
                              <div className="flex space-x-1 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={10} className={s <= Math.round((result?.scores.overall || 0) / 20) ? 'text-guofeng-gold fill-guofeng-gold' : 'text-guofeng-gold/20'} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm font-serif font-black text-guofeng-ink leading-relaxed px-4">
                            {result?.lucky.advice}
                          </p>
                        </div>

                        {/* Categorized Fortune Section */}
                        <div className="space-y-6">
                          <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
                            {[
                              { id: 'love', label: '爱情', icon: Heart, color: 'text-guofeng-red' },
                              { id: 'career', label: '事业', icon: Briefcase, color: 'text-blue-600' },
                              { id: 'wealth', label: '财富', icon: Wallet, color: 'text-orange-600' },
                              { id: 'health', label: '健康', icon: Activity, color: 'text-green-600' },
                            ].map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => setActiveSubTab(sub.id)}
                                className={`flex items-center px-6 py-3 rounded-full text-xs font-serif font-bold transition-all whitespace-nowrap border ${
                                  activeSubTab === sub.id 
                                    ? 'bg-guofeng-red text-white shadow-lg shadow-red-900/10 border-guofeng-red' 
                                    : 'bg-white text-guofeng-ink/40 border-[#EAE3D5]'
                                }`}
                              >
                                <sub.icon className={`w-3.5 h-3.5 mr-2 ${activeSubTab === sub.id ? 'text-white' : sub.color}`} />
                                {sub.label}
                              </button>
                            ))}
                          </div>

                          <motion.div 
                            key={activeSubTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="guofeng-card p-8"
                          >
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg border ${
                                  activeSubTab === 'love' ? 'bg-red-50 border-red-100' : 
                                  activeSubTab === 'career' ? 'bg-blue-50 border-blue-100' : 
                                  activeSubTab === 'wealth' ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'
                                }`}>
                                  {activeSubTab === 'love' ? <Heart size={16} className="text-guofeng-red" /> : 
                                   activeSubTab === 'career' ? <Briefcase size={16} className="text-blue-600" /> : 
                                   activeSubTab === 'wealth' ? <Wallet size={16} className="text-orange-600" /> : <Activity size={16} className="text-green-600" />}
                                </div>
                                <span className="text-sm font-serif font-black text-guofeng-ink">今日{activeSubTab === 'love' ? '爱情' : activeSubTab === 'career' ? '事业' : activeSubTab === 'wealth' ? '财富' : '健康'}运势</span>
                              </div>
                              <div className="text-2xl font-serif font-black text-guofeng-red">
                                {result && (activeSubTab === 'love' ? result.scores.love : 
                                 activeSubTab === 'career' ? result.scores.career : 
                                 activeSubTab === 'wealth' ? result.scores.wealth : result.scores.health)}
                              </div>
                            </div>

                            <p className="text-xs text-guofeng-ink/60 leading-relaxed font-serif mb-8 bg-[#FDFBF7] p-5 rounded-2xl border border-[#EAE3D5]">
                              {result?.lucky.details[activeSubTab].summary}
                            </p>

                            <div className="space-y-6">
                              <div>
                                <div className="text-[10px] font-serif font-bold text-guofeng-red uppercase tracking-widest mb-4 flex items-center">
                                  <Sparkles size={12} className="mr-2" />
                                  开运指南 · Actions
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  {result?.lucky.details[activeSubTab].actions.map((action: string, i: number) => (
                                    <div key={i} className="flex items-center space-x-3 p-4 bg-[#FDFBF7] rounded-xl border border-[#EAE3D5]">
                                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-guofeng-red border border-[#EAE3D5]">{i + 1}</div>
                                      <span className="text-xs font-serif font-bold text-guofeng-ink">{action}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                                <div className="flex items-center space-x-2 mb-2">
                                  <AlertCircle size={12} className="text-orange-600" />
                                  <span className="text-[10px] font-serif font-bold text-orange-600">温和避坑</span>
                                </div>
                                <p className="text-xs text-orange-800/70 font-serif">{result.lucky.details[activeSubTab].avoid}</p>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Lucky Egg Section */}
                        <div className="guofeng-card p-8">
                          <div className="flex items-center mb-8 space-x-3">
                            <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                              <Gift className="w-4 h-4 text-guofeng-gold" />
                            </div>
                            <span className="text-sm font-serif font-black text-guofeng-ink tracking-widest">今日幸运彩蛋</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: '幸运色', value: result.lucky.lucky.color, icon: Palette, color: 'text-guofeng-red' },
                              { label: '幸运物', value: result.lucky.lucky.item, icon: Gem, color: 'text-guofeng-gold' },
                              { label: '幸运时间', value: result.lucky.lucky.time, icon: Clock, color: 'text-blue-500' },
                              { label: '幸运方位', value: result.lucky.direction, icon: Compass, color: 'text-orange-500' },
                            ].map((egg, i) => (
                              <div key={i} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] text-center">
                                <egg.icon size={16} className={`mx-auto mb-2 ${egg.color}`} />
                                <div className="text-[10px] font-serif font-bold text-guofeng-ink/40 mb-1">{egg.label}</div>
                                <div className="text-xs font-serif font-black text-guofeng-ink">{egg.value}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-6 p-6 bg-guofeng-red/5 rounded-2xl border border-guofeng-red/10 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                              <Sparkles size={100} className="absolute -top-10 -left-10 text-guofeng-red" />
                            </div>
                            <p className="text-sm font-serif font-black text-guofeng-red italic leading-relaxed">
                              “ {result.lucky.lucky.quote} ”
                            </p>
                          </div>
                        </div>

                        {/* Future Trend Section */}
                        <div className="guofeng-card p-8">
                          <div className="flex items-center mb-8 space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-serif font-black text-guofeng-ink tracking-widest">运势趋势预告</span>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5]">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xs font-serif font-bold text-guofeng-ink border border-[#EAE3D5]">明</div>
                                <div>
                                  <div className="text-xs font-serif font-black text-guofeng-ink">明日运势预告</div>
                                  <div className="text-[10px] text-guofeng-ink/40 font-serif">
                                    {result.weeklyTrend[(new Date().getDay()) % 7] > result.scores.overall ? '能量攀升，宜进取' : '能量平稳，宜守成'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xl font-serif font-black text-guofeng-gold">
                                {result.weeklyTrend[(new Date().getDay()) % 7]}
                              </div>
                            </div>
                            <div className="p-5 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5]">
                              <div className="text-[10px] font-serif font-bold text-guofeng-ink/40 uppercase mb-4">本周运势趋势</div>
                              <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={result.weeklyTrend.map((val: number, i: number) => ({
                                    name: ['一', '二', '三', '四', '五', '六', '日'][i],
                                    score: val,
                                    isToday: i === (new Date().getDay() + 6) % 7
                                  }))}>
                                    <XAxis 
                                      dataKey="name" 
                                      axisLine={false} 
                                      tickLine={false} 
                                      tick={{ fontSize: 10, fill: '#4A4A4A', fontWeight: 700, fontFamily: 'serif' }}
                                    />
                                    <Tooltip 
                                      cursor={{ fill: 'transparent' }}
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                          return (
                                            <div className="bg-white p-2 border border-[#EAE3D5] rounded-lg shadow-sm">
                                              <p className="text-[10px] font-serif font-bold text-guofeng-ink">周{payload[0].payload.name} · {payload[0].value}分</p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={12}>
                                      {result.weeklyTrend.map((_: any, index: number) => {
                                        const todayIdx = (new Date().getDay() + 6) % 7;
                                        return (
                                          <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === todayIdx ? '#B91C1C' : '#D977064D'} 
                                          />
                                        );
                                      })}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                )}

                    {activeTab === 'lucky' && (
                      <div className="space-y-6">
                        {!result ? (
                          <div className="guofeng-card p-12 text-center space-y-8">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                              <Palette className="w-10 h-10 text-guofeng-red" />
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-xl font-serif font-black text-guofeng-ink">解锁今日开运指南</h3>
                              <p className="text-sm text-guofeng-ink/40 font-serif leading-relaxed">
                                开运指南需要根据您的五行喜忌进行定制，完成后即可查看专属的幸运色、饰品及饮食建议。
                              </p>
                            </div>
                            <button 
                              onClick={() => setShowLandingForm(true)}
                              className="w-full py-4 guofeng-button text-sm font-serif font-bold"
                            >
                              填写信息解锁开运
                            </button>
                          </div>
                        ) : (
                          <React.Fragment>
                            <div className="space-y-4">
                            {[
                              { label: '幸运颜色', value: result.lucky.color, icon: Palette, color: 'text-guofeng-red', bg: 'bg-red-50', desc: result.lucky.luckyGuide.colorDesc, usage: '日常穿搭/桌面布置可多用，提升气场', swatches: ELEMENT_COLORS_HEX[result.dayMasterElement as keyof typeof ELEMENT_COLORS_HEX] },
                            { label: '开运饰品', value: result.lucky.item, icon: Gem, color: 'text-guofeng-gold', bg: 'bg-yellow-50', desc: result.lucky.luckyGuide.itemDesc, usage: '随身佩戴或放置于包中，稳固能量' },
                            { label: '贵人方位', value: result.lucky.direction, icon: Compass, color: 'text-blue-500', bg: 'bg-blue-50', desc: result.lucky.luckyGuide.directionDesc, usage: '办公或冥想时面向此方位，获得助力' },
                            { label: '开运饮食', value: result.lucky.food, icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50', desc: result.lucky.luckyGuide.foodDesc, usage: '今日适量摄入，调理五行平衡' },
                          ].map((item, idx) => (
                            <div key={idx} className="guofeng-card p-8">
                              <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-5">
                                  <div className={`p-4 rounded-2xl ${item.bg} border border-[#EAE3D5]`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-serif font-bold text-guofeng-ink/40 uppercase tracking-widest">{item.label}</div>
                                    <div className="flex items-center mt-1">
                                      {item.swatches && Array.isArray(item.swatches) && (
                                        <div className="flex -space-x-1 mr-3">
                                          {item.swatches.map((s: string, i: number) => (
                                            <div 
                                              key={i}
                                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-guofeng-ink/5" 
                                              style={{ backgroundColor: s }}
                                            />
                                          ))}
                                        </div>
                                      )}
                                      <div className="text-xl font-serif font-black text-guofeng-ink">{item.value}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="p-5 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5]">
                                  <div className="text-[10px] font-serif font-bold text-guofeng-red uppercase mb-2">使用说明</div>
                                  <p className="text-xs text-guofeng-ink/60 leading-relaxed font-serif">{item.usage}</p>
                                </div>
                                <p className="text-xs text-guofeng-ink/40 leading-relaxed px-1 italic font-serif">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Lucky Task */}
                        <div className="guofeng-card p-8">
                          <div className="flex items-center mb-8 space-x-3">
                            <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                              <Sparkles className="w-4 h-4 text-guofeng-red" />
                            </div>
                            <span className="text-sm font-serif font-black text-guofeng-ink tracking-widest">今日开运小任务</span>
                          </div>
                          <div className="flex items-center space-x-5 p-6 bg-[#FDFBF7] rounded-3xl border border-[#EAE3D5]">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#EAE3D5]">
                              <div className="w-6 h-6 border-2 border-red-100 rounded-md" />
                            </div>
                            <p className="text-sm font-serif font-black text-guofeng-ink">{result.lucky.task}</p>
                          </div>
                          <p className="text-[10px] text-guofeng-ink/40 mt-6 text-center font-serif">命理依据：{result.lucky.basis}</p>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                )}
              </motion.div>
            )}

                {mainTab === 'divination' && (
                  <motion.div
                    key="divination"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6 pb-20"
                  >
                    {/* Personalized Recommendations */}
                    {userProfile?.interests && Object.keys(userProfile.interests).length > 0 && (
                      <div className="guofeng-card p-6 bg-gradient-to-br from-red-50/50 to-orange-50/50 border-red-100/50">
                        <div className="flex items-center space-x-2 mb-4">
                          <Star size={14} className="text-guofeng-gold" />
                          <span className="text-xs font-serif font-bold text-guofeng-ink">为您推荐</span>
                        </div>
                        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                          {Object.entries(userProfile.interests)
                            .sort(([, a]: any, [, b]: any) => b - a)
                            .slice(0, 2)
                            .map(([catId]: any) => {
                              const cat = DIVINATION_CATEGORIES.find(c => c.id === catId);
                              if (!cat) return null;
                              return (
                                <div 
                                  key={catId} 
                                  onClick={() => {
                                    setSelectedFeaturedCategory(catId);
                                    setMainTab('featured');
                                  }}
                                  className="flex-shrink-0 w-40 p-4 bg-white rounded-2xl border border-red-100 shadow-sm space-y-2 cursor-pointer hover:border-guofeng-red transition-all group"
                                >
                                  <div className="text-[10px] font-serif font-bold text-guofeng-red group-hover:scale-105 transition-transform origin-left">{cat.label}精选</div>
                                  <p className="text-[8px] text-guofeng-ink/40 font-serif leading-relaxed">
                                    {catId === 'love' ? '点击查看今日情感疗愈指南，助您良缘早结。' : 
                                     catId === 'career' ? '事业进阶干货：如何把握本月职场机遇？' : 
                                     '查看更多深度指引，开启智慧人生。'}
                                  </p>
                                  <button className="text-[8px] font-serif font-bold text-guofeng-gold flex items-center group-hover:translate-x-1 transition-transform">
                                    立即查看 <ChevronRight size={10} />
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Quick Divination Section */}
                    {user && (
                      <div className="guofeng-card p-6 bg-white border-guofeng-gold/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-guofeng-gold/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1">
                              <h3 className="text-sm font-serif font-black text-guofeng-ink">极速求指引</h3>
                              <p className="text-[10px] text-guofeng-ink/40 font-serif">根据您的生辰八字，一键开启今日指引</p>
                            </div>
                            <div className="p-2 bg-guofeng-gold/10 rounded-xl">
                              <Zap size={16} className="text-guofeng-gold" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleQuickDivination('stick')}
                              className="flex flex-col items-center justify-center p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] hover:border-guofeng-red transition-all group"
                            >
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <Sparkles size={18} className="text-guofeng-red" />
                              </div>
                              <span className="text-xs font-serif font-bold text-guofeng-ink">一键抽签</span>
                              <span className="text-[8px] text-guofeng-ink/30 mt-1 font-serif">传统灵签指引</span>
                            </button>
                            <button 
                              onClick={() => handleQuickDivination('iching')}
                              className="flex flex-col items-center justify-center p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] hover:border-guofeng-gold transition-all group"
                            >
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <Compass size={18} className="text-guofeng-gold" />
                              </div>
                              <span className="text-xs font-serif font-bold text-guofeng-ink">一键卜卦</span>
                              <span className="text-[8px] text-guofeng-ink/30 mt-1 font-serif">周易六爻预测</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="guofeng-card p-6 md:p-8 relative overflow-hidden">
                      {/* Header with Sound Toggle */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-guofeng-red rounded-full"></div>
                          <span className="text-[10px] font-serif font-bold text-guofeng-red uppercase tracking-[0.2em]">虔诚求签 · Divination</span>
                        </div>
                        <button 
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-2 text-guofeng-ink/30 hover:text-guofeng-red transition-colors"
                        >
                          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                      </div>

                      <AnimatePresence mode="wait">
                        {divinationStep === 'input' && (
                          <motion.div
                            key="input-step"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                          >
                            <div className="flex items-center justify-between mb-8">
                              {divinationCategory ? (
                                <button
                                  onClick={() => {
                                    setDivinationCategory(null);
                                    setDivinationOption(null);
                                    setDivinationSubAnswer('');
                                  }}
                                  className="flex items-center space-x-2 text-guofeng-ink/40 hover:text-guofeng-red transition-colors font-serif font-bold text-sm"
                                >
                                  <ArrowLeft size={16} />
                                  <span>重选维度</span>
                                </button>
                              ) : (
                                <div className="w-12" />
                              )}
                              <h2 className="text-2xl font-serif font-black">心诚则灵</h2>
                              <div className="w-12" />
                            </div>
                            <div className="text-center mb-8">
                              <p className="text-xs text-guofeng-ink/40 font-serif">闭目冥想，在心中默念你的困惑或愿望</p>
                            </div>

                            {/* Divination Type Selection */}
                            <div className="flex p-1 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5]">
                              <button
                                onClick={() => setDivinationType('stick')}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center space-x-2 ${
                                  divinationType === 'stick' 
                                    ? 'bg-white text-guofeng-red shadow-sm border border-[#EAE3D5]' 
                                    : 'text-guofeng-ink/40'
                                }`}
                              >
                                <Sparkles size={14} />
                                <span>传统灵签</span>
                              </button>
                              <button
                                onClick={() => setDivinationType('iching')}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center space-x-2 ${
                                  divinationType === 'iching' 
                                    ? 'bg-white text-guofeng-red shadow-sm border border-[#EAE3D5]' 
                                    : 'text-guofeng-ink/40'
                                }`}
                              >
                                <Compass size={14} />
                                <span>周易卜卦</span>
                              </button>
                            </div>

                            {/* Identity Selection */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-xs font-serif font-bold text-guofeng-ink/60">
                                  <User2 size={14} />
                                  <span>求签身份</span>
                                </div>
                                <div className="flex bg-[#FDFBF7] rounded-full p-1 border border-[#EAE3D5]">
                                  <button 
                                    onClick={() => setDivinationTarget('self')}
                                    className={`px-4 py-1 rounded-full text-[10px] font-serif font-bold transition-all ${divinationTarget === 'self' ? 'bg-guofeng-red text-white shadow-sm' : 'text-guofeng-ink/40'}`}
                                  >
                                    为自己
                                  </button>
                                  <button 
                                    onClick={() => setDivinationTarget('other')}
                                    className={`px-4 py-1 rounded-full text-[10px] font-serif font-bold transition-all ${divinationTarget === 'other' ? 'bg-guofeng-red text-white shadow-sm' : 'text-guofeng-ink/40'}`}
                                  >
                                    为好友
                                  </button>
                                </div>
                              </div>

                              {divinationTarget === 'other' && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="relative"
                                >
                                  <Users2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-guofeng-gold/50" />
                                  <input
                                    type="text"
                                    placeholder="输入好友名称..."
                                    className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] outline-none text-xs font-serif focus:border-guofeng-red/30"
                                    value={divinationOtherName}
                                    onChange={(e) => setDivinationOtherName(e.target.value)}
                                  />
                                </motion.div>
                              )}
                              <div className="flex p-1 bg-[#FDFBF7] rounded-xl border border-[#EAE3D5]">
                                {[
                                  { id: 'self', label: '为自己求', icon: User2 },
                                  { id: 'other', label: '为他人求', icon: Users2 },
                                ].map((t) => (
                                  <button
                                    key={t.id}
                                    onClick={() => setDivinationTarget(t.id as any)}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-serif font-bold flex items-center justify-center space-x-2 transition-all ${
                                      divinationTarget === t.id ? 'bg-guofeng-red text-white shadow-md' : 'text-guofeng-ink/40'
                                    }`}
                                  >
                                    <t.icon size={14} />
                                    <span>{t.label}</span>
                                  </button>
                                ))}
                              </div>
                              {divinationTarget === 'other' && (
                                <motion.input
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  type="text"
                                  placeholder="请输入对方的昵称或关系 (如：好友小王)"
                                  className="w-full px-4 py-3 bg-[#FDFBF7] rounded-xl text-xs outline-none border border-[#EAE3D5] focus:border-guofeng-red/30 font-serif"
                                  value={divinationOtherName}
                                  onChange={(e) => setDivinationOtherName(e.target.value)}
                                />
                              )}
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-6">
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2 text-xs font-serif font-bold text-guofeng-ink/60">
                                  <Compass size={14} className="text-guofeng-gold" />
                                  <span>选择求签维度</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {DIVINATION_CATEGORIES.map((cat) => (
                                    <button
                                      key={cat.id}
                                      onClick={() => {
                                        setDivinationCategory(cat.id);
                                        setDivinationOption(null);
                                        setDivinationSubAnswer('');
                                      }}
                                      className={`py-3 rounded-xl text-[10px] font-serif font-bold border transition-all ${
                                        divinationCategory === cat.id 
                                          ? 'bg-red-50 text-guofeng-red border-guofeng-red/30 shadow-sm' 
                                          : 'bg-white text-guofeng-ink/40 border-[#EAE3D5] hover:border-guofeng-red/20'
                                      }`}
                                    >
                                      {cat.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {divinationCategory && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="space-y-4"
                                >
                                  <div className="flex flex-wrap gap-2">
                                    {DIVINATION_CATEGORIES.find(c => c.id === divinationCategory)?.options.map(opt => (
                                      <button
                                        key={opt}
                                        onClick={() => setDivinationOption(opt)}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-serif font-bold border transition-all ${
                                          divinationOption === opt 
                                            ? 'bg-guofeng-red text-white border-guofeng-red' 
                                            : 'bg-[#FDFBF7] text-guofeng-ink/40 border-[#EAE3D5]'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>

                                  {divinationCategory === 'fortune' && divinationOption && (
                                    <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50 space-y-3">
                                      <p className="text-[10px] font-serif font-bold text-guofeng-gold">核对生辰信息 (影响报告精准度)</p>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <label className="text-[8px] text-guofeng-ink/40 font-serif">出生日期</label>
                                          <input 
                                            type="date" 
                                            className="w-full bg-white/50 border border-[#EAE3D5] rounded-lg p-1.5 text-[10px] outline-none focus:border-guofeng-gold"
                                            value={formData.birthDate}
                                            onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[8px] text-guofeng-ink/40 font-serif">出生时间</label>
                                          <input 
                                            type="time" 
                                            className="w-full bg-white/50 border border-[#EAE3D5] rounded-lg p-1.5 text-[10px] outline-none focus:border-guofeng-gold"
                                            value={formData.birthTime}
                                            onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {divinationOption && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="p-4 bg-red-50/30 rounded-2xl border border-red-100/50"
                                    >
                                      <p className="text-[10px] font-serif font-bold text-guofeng-red mb-3">
                                        {DIVINATION_CATEGORIES.find(c => c.id === divinationCategory)?.subQuestion(divinationOption)}
                                      </p>
                                      <input
                                        type="text"
                                        placeholder="补充更多细节，让指引更精准..."
                                        className="w-full bg-transparent border-b border-guofeng-red/20 py-1 text-xs outline-none focus:border-guofeng-red font-serif"
                                        value={divinationSubAnswer}
                                        onChange={(e) => setDivinationSubAnswer(e.target.value)}
                                      />
                                    </motion.div>
                                  )}
                                </motion.div>
                              )}
                            </div>

                            {/* Main Wish Input */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-xs font-serif font-bold text-guofeng-ink/60">
                                <div className="flex items-center space-x-2">
                                  <Heart size={14} />
                                  <span>你的愿望</span>
                                </div>
                                <span className={`text-[10px] font-mono transition-colors ${divinationQuestion.length >= 45 ? 'text-guofeng-red font-bold' : ''}`}>
                                  {divinationQuestion.length}/50
                                </span>
                              </div>
                              <div className="relative">
                                <textarea
                                  maxLength={50}
                                  placeholder={WISH_EXAMPLES[wishExampleIndex]}
                                  className={`w-full bg-[#FDFBF7] rounded-2xl p-5 text-sm outline-none border transition-all resize-none h-32 font-serif ${
                                    isListening ? 'border-guofeng-red ring-2 ring-red-50' : 'border-[#EAE3D5] focus:border-guofeng-red/30'
                                  }`}
                                  value={divinationQuestion}
                                  onChange={(e) => setDivinationQuestion(e.target.value)}
                                />
                                <div className="absolute right-4 bottom-4 flex space-x-2">
                                  <button 
                                    onClick={handleVoiceInput}
                                    disabled={isListening}
                                    className={`p-2 rounded-xl border transition-all ${
                                      isListening 
                                        ? 'bg-guofeng-red text-white border-guofeng-red animate-pulse' 
                                        : 'bg-white text-guofeng-ink/20 hover:text-guofeng-red border-[#EAE3D5]'
                                    }`}
                                  >
                                    <Mic size={16} />
                                  </button>
                                </div>
                                {isListening && (
                                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                                    <div className="flex items-center space-x-2 bg-guofeng-red text-white px-4 py-2 rounded-full shadow-lg">
                                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                      <span className="text-[10px] font-serif font-bold ml-2">正在倾听...</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button 
                                onClick={() => setDivinationQuestion(WISH_EXAMPLES[wishExampleIndex])}
                                className="flex items-center space-x-2 text-[10px] text-guofeng-ink/30 font-serif hover:text-guofeng-red transition-colors group"
                              >
                                <InfoIcon size={12} className="group-hover:rotate-12 transition-transform" />
                                <span>例：{WISH_EXAMPLES[wishExampleIndex]} (点击填入)</span>
                              </button>
                            </div>

                            {/* Notice */}
                            <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] flex items-start space-x-3">
                              <div className="p-1.5 bg-white rounded-lg border border-[#EAE3D5] mt-0.5">
                                <Lightbulb size={12} className="text-guofeng-gold" />
                              </div>
                              <p className="text-[10px] text-guofeng-ink/40 leading-relaxed font-serif">
                                签文仅作为心理指引与治愈参考，旨在帮助你理清思绪。最终的决策与行动掌握在你自己手中。
                              </p>
                            </div>

                            {/* Daily Fortune Subscription */}
                            <div className="p-4 bg-red-50/20 rounded-2xl border border-red-100/30 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                  <Calendar size={14} className="text-guofeng-red" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-serif font-bold text-guofeng-ink">每日运势提醒</p>
                                  <p className="text-[8px] text-guofeng-ink/40 font-serif">开启后每日推送专属开运指南</p>
                                </div>
                              </div>
                              <button 
                                onClick={async () => {
                                  if (!user) return;
                                  const path = `users/${user.uid}`;
                                  const userRef = doc(db, 'users', user.uid);
                                  try {
                                    await updateDoc(userRef, { isSubscribed: !isSubscribed });
                                  } catch (error) {
                                    handleFirestoreError(error, OperationType.UPDATE, path);
                                  }
                                }}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-serif font-bold transition-all ${
                                  isSubscribed 
                                    ? 'bg-guofeng-red text-white' 
                                    : 'bg-white text-guofeng-ink/40 border border-[#EAE3D5]'
                                }`}
                              >
                                {isSubscribed ? '已开启' : '开启提醒'}
                              </button>
                            </div>

                            <button
                              onClick={startDivination}
                              disabled={!divinationQuestion.trim()}
                              className="w-full py-5 guofeng-button text-lg font-serif tracking-widest flex items-center justify-center disabled:opacity-50"
                            >
                              {divinationType === 'stick' ? '开启虔诚求签' : '开启周易卜卦'}
                            </button>
                          </motion.div>
                        )}

                        {divinationStep === 'shake' && (
                          <motion.div
                            key="shake-step"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[600px] flex flex-col items-center justify-center"
                          >
                            {divinationType === 'stick' ? (
                              <>
                                <div className="relative h-80 w-full flex items-center justify-center perspective-1000">
                                  {/* Ink Wash Background Effect */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-50/20 to-transparent blur-3xl rounded-full"></div>
                                  
                                  <motion.div
                                    animate={isDivining ? { 
                                      rotateZ: [0, -12, 12, -12, 12, 0],
                                      y: [0, -8, 8, -8, 8, 0],
                                      x: [0, -4, 4, -4, 4, 0]
                                    } : {}}
                                    transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
                                    className="relative w-40 h-72 z-10"
                                  >
                                    {/* Spiritual Aura / Glow */}
                                    {isDivining && (
                                      <motion.div 
                                        animate={{ 
                                          scale: [1, 1.2, 1],
                                          opacity: [0.3, 0.6, 0.3]
                                        }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="absolute inset-x-[-20%] inset-y-[-10%] bg-guofeng-gold/20 blur-3xl rounded-full -z-10"
                                      />
                                    )}

                                    {/* The Cylinder Body (Divining Cup) */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#991B1B] via-[#7F1D1D] to-[#991B1B] rounded-b-[3rem] rounded-t-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-x-2 border-white/5 overflow-hidden">
                                      {/* Gold Rims */}
                                      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B] shadow-inner"></div>
                                      <div className="absolute bottom-12 left-0 w-full h-2 bg-[#B8860B]/30"></div>
                                      
                                      {/* Texture/Pattern */}
                                      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                                      
                                      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                        <div className="writing-mode-vertical text-5xl font-serif font-black tracking-[0.8em] text-guofeng-gold">灵签</div>
                                      </div>
                                    </div>

                                    {/* Sticks inside the cylinder */}
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 flex items-end justify-center space-x-0.5 overflow-visible">
                                      {[...Array(15)].map((_, i) => (
                                        <motion.div
                                          key={i}
                                          animate={isDivining ? {
                                            y: [0, -25, 0],
                                            rotate: [i % 2 === 0 ? -8 : 8, i % 2 === 0 ? 8 : -8, i % 2 === 0 ? -8 : 8],
                                          } : {
                                            rotate: (i - 7) * 3
                                          }}
                                          transition={{ 
                                            repeat: Infinity, 
                                            duration: 0.25 + Math.random() * 0.15,
                                            delay: Math.random() * 0.1
                                          }}
                                          className="w-2 h-40 bg-[#D4A373] rounded-t-sm border-x border-black/10 shadow-md origin-bottom relative"
                                          style={{
                                            backgroundColor: i % 3 === 0 ? '#D4A373' : i % 3 === 1 ? '#C29363' : '#E5B383',
                                            zIndex: i % 5
                                          }}
                                        >
                                          {/* Stick Tip Detail */}
                                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-black/10 rounded-full"></div>
                                        </motion.div>
                                      ))}
                                    </div>

                                    {/* Emerging Lot (The chosen one) */}
                                    {isDivining && shakeCountdown < 1.2 && (
                                      <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: -140, opacity: 1 }}
                                        transition={{ duration: 1.8, ease: "backOut" }}
                                        className="absolute left-1/2 -translate-x-1/2 top-0 w-4 h-48 z-30"
                                      >
                                        {/* Glow behind the stick */}
                                        <div className="absolute inset-0 bg-guofeng-gold blur-md opacity-50 animate-pulse"></div>
                                        
                                        <div className="relative w-full h-full bg-gradient-to-b from-guofeng-gold to-[#B8860B] rounded-t-lg shadow-[0_0_20px_rgba(212,163,115,0.8)] flex flex-col items-center py-4 border border-white/20">
                                          <div className="w-1 h-32 bg-black/10 rounded-full"></div>
                                          <div className="mt-3 writing-mode-vertical text-[8px] font-serif font-black text-guofeng-red tracking-tighter">感应天机</div>
                                          
                                          {/* Sparkles around the emerging stick */}
                                          {[...Array(4)].map((_, j) => (
                                            <motion.div
                                              key={j}
                                              animate={{ 
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                x: [0, (j % 2 === 0 ? 20 : -20)],
                                                y: [0, -40]
                                              }}
                                              transition={{ repeat: Infinity, duration: 0.8, delay: j * 0.2 }}
                                              className="absolute top-0 w-1 h-1 bg-white rounded-full"
                                            />
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                </div>

                                <div className="text-center space-y-6 mt-12">
                                  <div className="space-y-2">
                                    <p className="text-lg font-serif font-black text-guofeng-ink">
                                      {isDivining ? '诚心摇动，感应天机...' : '准备就绪，开启求签'}
                                    </p>
                                    {isDivining && (
                                      <div className="flex items-center justify-center space-x-2">
                                        <div className="w-32 h-1.5 bg-guofeng-bg rounded-full overflow-hidden border border-[#EAE3D5]">
                                          <motion.div 
                                            initial={{ width: "100%" }}
                                            animate={{ width: "0%" }}
                                            transition={{ duration: 3, ease: "linear" }}
                                            className="h-full bg-guofeng-red"
                                          />
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-guofeng-red">{shakeCountdown}s</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {!isDivining && (
                                    <button
                                      onClick={() => handleDivination()}
                                      className="px-12 py-4 bg-guofeng-red text-white rounded-2xl font-serif font-bold shadow-xl shadow-red-900/20 active:scale-95 transition-all flex items-center space-x-3 mx-auto"
                                    >
                                      <RefreshCw size={18} className="animate-spin-slow" />
                                      <span>开始摇签</span>
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="w-full max-w-xs space-y-12">
                                {/* Coins Display */}
                                <div className="flex justify-center space-x-8 h-32 items-center">
                                  {ichingCoins.map((side, i) => (
                                    <motion.div
                                      key={`${ichingYao.length}-${i}`}
                                      initial={{ y: 0, rotateY: 0, scale: 1 }}
                                      animate={isDivining ? {
                                        y: [0, -120, -60, -100, 0],
                                        rotateY: [0, 720, 1440, 2160, 2880],
                                        rotateX: [0, 45, 0, -45, 0],
                                        scale: [1, 1.5, 1.2, 1.4, 1],
                                      } : {
                                        y: [0, -5, 0],
                                        transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                                      }}
                                      transition={isDivining ? { 
                                        duration: 1.2, 
                                        ease: "easeOut",
                                        times: [0, 0.4, 0.6, 0.8, 1]
                                      } : {}}
                                      className="w-16 h-16 relative perspective-1000 group"
                                    >
                                      {/* Coin Front (字) */}
                                      <motion.div 
                                        className={`absolute inset-0 rounded-full border-4 border-[#B8860B] shadow-2xl flex items-center justify-center backface-hidden ${side === 0 ? 'z-10' : 'z-0'}`}
                                        style={{ 
                                          background: 'radial-gradient(circle at 30% 30%, #DAA520, #B8860B)',
                                          transformStyle: 'preserve-3d'
                                        }}
                                        animate={{ rotateY: side === 0 ? 0 : 180 }}
                                        transition={{ duration: 0.6 }}
                                      >
                                        <div className="w-8 h-8 border-2 border-[#8B4513]/30 flex items-center justify-center font-serif font-black text-[#8B4513] text-sm bg-[#DAA520]/20 rounded-sm">
                                          字
                                        </div>
                                        {/* Decorative Rim */}
                                        <div className="absolute inset-1 rounded-full border border-[#8B4513]/10"></div>
                                      </motion.div>

                                      {/* Coin Back (背) */}
                                      <motion.div 
                                        className={`absolute inset-0 rounded-full border-4 border-[#B8860B] shadow-2xl flex items-center justify-center backface-hidden ${side === 1 ? 'z-10' : 'z-0'}`}
                                        style={{ 
                                          background: 'radial-gradient(circle at 30% 30%, #DAA520, #B8860B)',
                                          transform: 'rotateY(180deg)',
                                          transformStyle: 'preserve-3d'
                                        }}
                                        animate={{ rotateY: side === 1 ? 0 : 180 }}
                                        transition={{ duration: 0.6 }}
                                      >
                                        <div className="w-8 h-8 border-2 border-[#8B4513]/30 flex items-center justify-center font-serif font-black text-[#8B4513] text-sm bg-[#DAA520]/20 rounded-sm">
                                          背
                                        </div>
                                        <div className="absolute inset-1 rounded-full border border-[#8B4513]/10"></div>
                                      </motion.div>

                                      {/* Shadow on ground */}
                                      <motion.div 
                                        animate={isDivining ? {
                                          scale: [1, 0.4, 0.6, 0.5, 1],
                                          opacity: [0.2, 0.05, 0.1, 0.05, 0.2]
                                        } : {}}
                                        transition={{ duration: 1.2 }}
                                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/20 rounded-full blur-sm -z-10"
                                      />
                                    </motion.div>
                                  ))}
                                </div>

                                {/* Yao Lines (Bottom to Top) */}
                                <div className="flex flex-col-reverse items-center space-y-4 space-y-reverse">
                                  {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4 w-full">
                                      <span className="text-[10px] font-serif font-bold text-guofeng-ink/30 w-6 text-right">{['初', '二', '三', '四', '五', '上'][i]}爻</span>
                                      <div className="flex-1 h-10 flex items-center justify-center bg-white/40 rounded-xl border border-dashed border-guofeng-ink/10 relative overflow-hidden">
                                        {ichingYao[i] ? (
                                          <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="w-full h-full flex items-center justify-center px-4"
                                          >
                                            {/* Yao Line Visualization */}
                                            <div className="w-full flex items-center justify-center space-x-2">
                                              {/* 6: 老阴 (X), 7: 少阳 (---), 8: 少阴 (- -), 9: 老阳 (O) */}
                                              {ichingYao[i] === 7 || ichingYao[i] === 9 ? (
                                                <div className="w-full h-2 bg-guofeng-ink rounded-full relative">
                                                  {ichingYao[i] === 9 && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                      <div className="w-4 h-4 rounded-full border-2 border-guofeng-red bg-white"></div>
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <div className="w-full flex justify-between">
                                                  <div className="w-[45%] h-2 bg-guofeng-ink rounded-full"></div>
                                                  {ichingYao[i] === 6 && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                      <div className="text-guofeng-red font-black text-lg">✕</div>
                                                    </div>
                                                  )}
                                                  <div className="w-[45%] h-2 bg-guofeng-ink rounded-full"></div>
                                                </div>
                                              )}
                                            </div>
                                          </motion.div>
                                        ) : (
                                          <div className="text-[8px] font-serif text-guofeng-ink/10 tracking-widest uppercase">待起卦</div>
                                        )}
                                        {ichingYao.length === i && !isDivining && (
                                          <motion.div 
                                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute inset-0 bg-guofeng-gold/5"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Shake Button */}
                                <div className="text-center space-y-4">
                                  <button
                                    onClick={handleIChingShake}
                                    disabled={isDivining || ichingYao.length >= 6}
                                    className="px-12 py-4 guofeng-button text-sm font-serif font-bold disabled:opacity-50"
                                  >
                                    {isDivining ? '正在摇卦...' : ichingYao.length === 0 ? '开始摇卦' : `摇第 ${['二', '三', '四', '五', '六'][ichingYao.length] || '六'} 爻`}
                                  </button>
                                  <p className="text-[10px] text-guofeng-ink/40 font-serif">
                                    {ichingYao.length < 6 ? `已完成 ${ichingYao.length}/6 次摇卦` : '卦象已成，正在解卦...'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {divinationStep === 'result' && divinationResult && (
                          <motion.div
                            key="result-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                          >
                            <div className="relative">
                              <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-50 rounded-full blur-2xl opacity-50"></div>
                              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 rounded-full blur-2xl opacity-50"></div>
                              
                              <div className="guofeng-card p-10 text-center relative overflow-hidden border-2 border-guofeng-gold/10 group guofeng-border-hui shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-guofeng-red animate-pulse"></div>
                                <div className="absolute -top-10 -left-10 w-32 h-32 bg-guofeng-red/5 rounded-full blur-3xl group-hover:bg-guofeng-red/10 transition-colors"></div>
                                
                                <div className="guofeng-stamp-complex guofeng-stamp-reveal absolute top-8 right-8 text-[12px] rotate-12 z-20">
                                  {divinationResult.lotNumber}
                                </div>
                                <div className="text-[10px] font-serif font-bold text-guofeng-red uppercase tracking-[0.4em] mb-4 opacity-40 guofeng-brush-border inline-block">
                                  {divinationResult.element} · {divinationResult.lotNumber}
                                </div>
                                <div className="text-3xl font-serif font-black text-guofeng-red mb-8 tracking-widest">
                                  {divinationResult.title}
                                </div>

                                {divinationType === 'iching' && (
                                  <div className="flex flex-col-reverse items-center space-y-2 space-y-reverse mb-8 opacity-60">
                                    {ichingYao.map((yao, idx) => (
                                      <div key={idx} className="w-24 flex justify-center">
                                        {yao === 7 && <div className="w-full h-1.5 bg-guofeng-red rounded-full" />}
                                        {yao === 8 && (
                                          <div className="w-full h-1.5 flex justify-between">
                                            <div className="w-[45%] h-full bg-guofeng-red rounded-full" />
                                            <div className="w-[45%] h-full bg-guofeng-red rounded-full" />
                                          </div>
                                        )}
                                        {yao === 9 && (
                                          <div className="w-full h-1.5 bg-guofeng-red rounded-full flex items-center justify-center relative border border-guofeng-red">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                          </div>
                                        )}
                                        {yao === 6 && (
                                          <div className="w-full h-1.5 flex justify-between relative items-center">
                                            <div className="w-[45%] h-full bg-guofeng-red rounded-full" />
                                            <div className="w-[45%] h-full bg-guofeng-red rounded-full" />
                                            <div className="absolute left-1/2 -translate-x-1/2 text-guofeng-red font-bold text-[8px]">✕</div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    <p className="text-[8px] font-serif text-guofeng-ink/30 mt-2">卦象爻位（自下而上）</p>
                                  </div>
                                )}

                                <div className="space-y-4 mb-10">
                                  {divinationResult.poem.split('，').map((line: string, i: number) => (
                                    <motion.div 
                                      key={i}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.2 }}
                                      className="text-2xl font-serif font-black text-guofeng-ink tracking-[0.2em]"
                                    >
                                      {line}
                                    </motion.div>
                                  ))}
                                </div>

                                <div className="guofeng-divider"></div>

                                <div className="space-y-8 text-left">
                                  <div className="p-6 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] relative mt-4">
                                    <div className="absolute -top-3 left-6 px-3 bg-white border border-[#EAE3D5] rounded-full text-[10px] font-serif font-bold text-guofeng-red">白话解读</div>
                                    <p className="text-sm text-guofeng-ink/70 leading-relaxed font-serif">
                                      {divinationResult.vernacular}
                                    </p>
                                  </div>

                                  <div className="p-6 bg-red-50/30 rounded-2xl border border-red-100/50 relative">
                                    <div className="absolute -top-3 left-6 px-3 bg-white border border-red-100/50 rounded-full text-[10px] font-serif font-bold text-guofeng-gold">针对性解读</div>
                                    <p className="text-sm text-guofeng-ink/70 leading-relaxed font-serif">
                                      {divinationResult.targetedInterpretation}
                                    </p>
                                  </div>

                                  <div className="p-6 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] relative">
                                    <div className="absolute -top-3 left-6 px-3 bg-white border border-[#EAE3D5] rounded-full text-[10px] font-serif font-bold text-guofeng-ink/40">治愈建议</div>
                                    <p className="text-sm text-guofeng-ink/60 leading-relaxed font-serif italic">
                                      {divinationResult.advice}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <button
                                onClick={() => setShowWallpaperModal(true)}
                                className="w-full py-4 bg-guofeng-gold text-white rounded-2xl text-sm font-serif font-bold shadow-lg shadow-yellow-900/10 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                              >
                                <Camera size={16} />
                                <span>生成签文壁纸</span>
                              </button>
                              
                              <div className="flex space-x-4">
                                <button
                                  onClick={() => {
                                    setDivinationStep('input');
                                    setDivinationCategory(null);
                                    setDivinationOption(null);
                                    setDivinationSubAnswer('');
                                    setDivinationResult(null);
                                  }}
                                  className="flex-1 py-4 bg-white border border-[#EAE3D5] rounded-2xl text-sm font-serif font-bold text-guofeng-ink/40 hover:text-guofeng-red transition-all flex items-center justify-center space-x-2"
                                >
                                  <ArrowLeft size={16} />
                                  <span>返回重选</span>
                                </button>
                                <button
                                  onClick={() => setDivinationStep('input')}
                                  className="flex-1 py-4 bg-white border border-[#EAE3D5] rounded-2xl text-sm font-serif font-bold text-guofeng-ink/40 hover:text-guofeng-red transition-all flex items-center justify-center space-x-2"
                                >
                                  <RefreshCw size={16} />
                                  <span>{divinationType === 'stick' ? '再求一签' : '再次起卦'}</span>
                                </button>
                              </div>
                              <button
                                onClick={handleShareDivination}
                                className="w-full py-4 guofeng-button text-sm font-serif font-bold flex items-center justify-center space-x-2"
                              >
                                <Share2 size={16} />
                                <span>{divinationType === 'stick' ? '分享灵签' : '分享卦象'}</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {mainTab === 'featured' && (
                  <motion.div
                    key="featured"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 pb-20"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <button 
                        onClick={() => setMainTab('report')}
                        className="p-2 bg-white rounded-full border border-[#EAE3D5] text-guofeng-ink/40 hover:text-guofeng-red transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <h2 className="text-xl font-serif font-black text-guofeng-ink">
                        {DIVINATION_CATEGORIES.find(c => c.id === selectedFeaturedCategory)?.label || '精选内容'}
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {(FEATURED_ARTICLES[selectedFeaturedCategory || 'general'] || FEATURED_ARTICLES.general).map((article, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="guofeng-card overflow-hidden group"
                        >
                          <div className="h-48 overflow-hidden">
                            <img 
                              src={article.image} 
                              alt={article.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <div className="p-6 space-y-4">
                            <h3 className="text-lg font-serif font-black text-guofeng-ink group-hover:text-guofeng-red transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm text-guofeng-ink/60 leading-relaxed font-serif">
                              {article.content}
                            </p>
                            <div className="pt-4 border-t border-[#EAE3D5] flex items-center justify-between">
                              <span className="text-[10px] font-serif text-guofeng-ink/30">发布于 2024年4月</span>
                              <button className="text-xs font-serif font-bold text-guofeng-red flex items-center space-x-1">
                                <span>深度阅读</span>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {mainTab === 'community' && (
                  <motion.div
                    key="community"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {communityView === 'main' ? (
                      <>
                        {/* Topics Grid (纵向排列) */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 px-1">
                            <LayoutGrid size={14} className="text-guofeng-red" />
                            <span className="text-xs font-serif font-black text-guofeng-ink">动态话题</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            <button 
                              onClick={() => setActiveTopic(null)}
                              className={`px-3 py-2.5 rounded-2xl text-[10px] font-serif font-bold transition-all border ${!activeTopic ? 'bg-guofeng-red text-white border-guofeng-red shadow-md' : 'bg-white text-guofeng-ink/40 border-[#EAE3D5] hover:border-guofeng-red/30'}`}
                            >
                              全部动态
                            </button>
                            {['# 考研互助', '# 职场解惑', '# 情感树洞', '# 锦鲤还愿', '# 每日一签', '# 择吉避凶', '# 命理交流', '# 治愈瞬间'].map(topic => (
                              <button 
                                key={topic}
                                onClick={() => setActiveTopic(topic)}
                                className={`px-3 py-2.5 rounded-2xl text-[10px] font-serif font-bold transition-all border ${activeTopic === topic ? 'bg-guofeng-red text-white border-guofeng-red shadow-md' : 'bg-white text-guofeng-ink/40 border-[#EAE3D5] hover:border-guofeng-red/30'}`}
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Featured Dynamics Entry (精选动态板块) */}
                        <motion.div 
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setCommunityView('featured')}
                          className="guofeng-card p-5 bg-gradient-to-r from-guofeng-red/5 to-transparent border-guofeng-red/20 cursor-pointer group guofeng-border-hui"
                        >
                          <div className="absolute top-0 right-0 w-20 h-full opacity-[0.02] guofeng-pattern pointer-events-none"></div>
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-guofeng-red/10 rounded-2xl flex items-center justify-center text-guofeng-red guofeng-border-hui border-guofeng-red/10">
                                <Sparkles size={20} />
                              </div>
                              <div>
                                <h3 className="text-sm font-serif font-black text-guofeng-ink">精选动态</h3>
                                <p className="text-[10px] text-guofeng-ink/40 font-serif mt-0.5">查看社区高赞优质内容</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                {posts.slice(0, 3).map((p, i) => (
                                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-guofeng-bg flex items-center justify-center text-[8px] font-serif font-bold text-guofeng-ink/40">
                                    {p.author.charAt(0)}
                                  </div>
                                ))}
                              </div>
                              <ChevronRight size={16} className="text-guofeng-ink/20 group-hover:text-guofeng-red transition-colors" />
                            </div>
                          </div>
                        </motion.div>

                    {/* Leaderboard Preview */}
                    <div className="guofeng-card p-6 bg-gradient-to-br from-guofeng-gold/5 to-transparent border-guofeng-gold/30 guofeng-border-hui">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-guofeng-gold/30 to-transparent"></div>
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center space-x-2">
                          <Trophy size={16} className="text-guofeng-gold" />
                          <span className="text-sm font-serif font-black text-guofeng-ink tracking-widest">本月锦鲤榜</span>
                        </div>
                        <button className="text-[10px] text-guofeng-gold font-serif font-bold group flex items-center">
                          查看全部 <ChevronRight size={10} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                      <div className="relative">
                        <div className="flex flex-nowrap items-center space-x-6 overflow-x-auto no-scrollbar pb-2 cursor-grab active:cursor-grabbing">
                          {leaderboard.length > 0 ? leaderboard.map((lbUser, i) => (
                            <div key={lbUser.uid} className="flex flex-col items-center space-y-1 shrink-0">
                              <div className="relative">
                                <div className="w-10 h-10 bg-white rounded-full border-2 border-guofeng-gold/30 flex items-center justify-center text-xs font-serif font-bold text-guofeng-ink/60">
                                  {lbUser.name.charAt(0)}
                                </div>
                                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${i === 0 ? 'bg-guofeng-gold' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-guofeng-ink/20'}`}>
                                  {i + 1}
                                </div>
                              </div>
                              <span className="text-[8px] font-serif font-bold text-guofeng-ink/60 truncate w-12 text-center">{lbUser.name}</span>
                              <span className="text-[8px] text-guofeng-gold font-mono">{lbUser.score} 运</span>
                            </div>
                          )) : (
                            <p className="text-[10px] text-guofeng-ink/40 font-serif">暂无数据，快去求签上榜吧~</p>
                          )}
                        </div>
                        <div className="absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-guofeng-bg to-transparent pointer-events-none z-10" />
                      </div>
                    </div>

                    <div className="guofeng-card p-8">
                      {!user ? (
                        <div className="text-center py-4 space-y-4">
                          <p className="text-xs text-guofeng-ink/40 font-serif">登录后即可分享你的治愈瞬间</p>
                          <button 
                            onClick={handleLogin}
                            className="px-8 py-2.5 bg-guofeng-red text-white rounded-full text-xs font-serif font-bold shadow-lg shadow-red-900/10"
                          >
                            立即登录
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-guofeng-red font-serif font-bold border border-red-100 shadow-sm">
                              {formData.name.charAt(0) || user.displayName?.charAt(0) || '匿'}
                            </div>
                            <div className="flex-1">
                              <textarea
                                placeholder="分享你的治愈瞬间或命盘感悟..."
                                className="w-full bg-[#FDFBF7] rounded-2xl p-5 text-sm outline-none border border-[#EAE3D5] focus:border-guofeng-red/30 transition-all resize-none h-28 font-serif"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          {/* Mood Selector */}
                          <div className="mb-6">
                            <p className="text-[10px] font-serif font-bold text-guofeng-ink/40 mb-3 flex items-center">
                              <Palette size={12} className="mr-2" />
                              选择今日心情徽章
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {MOODS.map((mood) => (
                                <button
                                  key={mood.id}
                                  onClick={() => setSelectedMood(mood.id)}
                                  className={`px-4 py-2 rounded-full text-[10px] font-serif font-bold border transition-all flex items-center space-x-1.5 ${
                                    selectedMood === mood.id 
                                      ? 'bg-guofeng-red text-white border-guofeng-red shadow-md' 
                                      : 'bg-[#FDFBF7] text-guofeng-ink/40 border-[#EAE3D5] hover:border-guofeng-red/20'
                                  }`}
                                >
                                  <span>{mood.emoji}</span>
                                  <span>{mood.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-3">
                              <button className="p-2.5 text-guofeng-ink/40 hover:text-guofeng-red transition-colors bg-[#FDFBF7] rounded-xl border border-[#EAE3D5]">
                                <ImageIcon size={20} />
                              </button>
                              <button className="p-2.5 text-guofeng-ink/40 hover:text-guofeng-red transition-colors bg-[#FDFBF7] rounded-xl border border-[#EAE3D5]">
                                <Star size={20} />
                              </button>
                            </div>
                            <button 
                              onClick={handlePost}
                              className="px-8 py-3 guofeng-button text-sm font-serif font-bold"
                            >
                              发布
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-6">
                      {posts
                        .filter(post => !activeTopic || post.content.includes(activeTopic))
                        .map((post) => (
                        <div key={post.id} className="guofeng-card p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-[#FDFBF7] rounded-full flex items-center justify-center text-guofeng-ink/40 font-serif font-bold border border-[#EAE3D5]">
                                {post.author.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-serif font-bold text-guofeng-ink">{post.author}</div>
                                <div className="text-[10px] text-guofeng-ink/40 font-serif">{post.time}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {post.mood && (
                                <div className="px-3 py-1 rounded-full text-[10px] font-serif font-bold bg-[#FDFBF7] border border-[#EAE3D5] text-guofeng-ink/60 flex items-center space-x-1">
                                  <span>{MOODS.find(m => m.id === post.mood)?.emoji}</span>
                                  <span>{MOODS.find(m => m.id === post.mood)?.label}</span>
                                </div>
                              )}
                              <div className={`px-3 py-1 rounded-full text-[10px] font-serif font-bold border ${
                                post.type === 'chart' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                post.type === 'fortune' ? 'bg-yellow-50 text-guofeng-gold border-yellow-100' : 
                                post.type === 'divination_help' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                'bg-red-50 text-guofeng-red border-red-100'
                              }`}>
                                {post.type === 'chart' ? '命盘' : post.type === 'fortune' ? '运势' : post.type === 'divination_help' ? '求助' : '治愈'}
                              </div>
                              {user?.uid === post.authorUid && (
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-1.5 text-guofeng-ink/20 hover:text-guofeng-red transition-colors"
                                  title="删除动态"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-guofeng-ink/70 leading-relaxed mb-6 font-serif">{post.content}</p>
                          
                          {post.divinationData && (
                            <div className="mb-6 p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-serif font-bold text-guofeng-red">{post.divinationData.lotNumber}</span>
                                <span className="text-[10px] font-serif font-bold text-guofeng-gold">{post.divinationData.title}</span>
                              </div>
                              <p className="text-xs font-serif font-black text-guofeng-ink text-center py-2 border-y border-guofeng-gold/10">
                                {post.divinationData.poem}
                              </p>
                              <p className="text-[10px] text-guofeng-ink/40 font-serif line-clamp-2 italic">
                                {post.divinationData.vernacular}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center space-x-8">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className="flex items-center space-x-2 text-guofeng-ink/40 hover:text-guofeng-red transition-colors active:scale-125"
                            >
                              <Heart size={18} className={post.likedBy?.includes(user?.uid || '') ? 'fill-guofeng-red text-guofeng-red' : ''} />
                              <span className="text-xs font-serif font-bold">{post.likes}</span>
                            </button>
                            <button 
                              onClick={() => setExpandedPostComments(expandedPostComments === post.id ? null : post.id)}
                              className="flex items-center space-x-2 text-guofeng-ink/40 hover:text-guofeng-red transition-colors"
                            >
                              <MessageCircle size={18} />
                              <span className="text-xs font-serif font-bold">评论</span>
                            </button>
                            <button 
                              onClick={() => handleShare(post)}
                              className="flex items-center space-x-2 text-guofeng-ink/40 hover:text-guofeng-red transition-colors"
                            >
                              <Share2 size={18} />
                              <span className="text-xs font-serif font-bold">分享</span>
                            </button>
                          </div>

                          {/* Comments Section */}
                          <AnimatePresence>
                            {expandedPostComments === post.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-8 pt-8 border-t border-[#EAE3D5] space-y-6 overflow-hidden"
                              >
                                <div className="space-y-6 max-h-60 overflow-y-auto no-scrollbar">
                                  {commentsMap[post.id]?.map((comment) => (
                                    <div key={comment.id} className="flex space-x-4">
                                      <div className="w-8 h-8 bg-[#FDFBF7] rounded-full flex items-center justify-center text-[10px] text-guofeng-ink/40 font-serif font-bold border border-[#EAE3D5] shrink-0">
                                        {comment.author.charAt(0)}
                                      </div>
                                      <div className="flex-1 bg-[#FDFBF7] rounded-2xl p-4 border border-[#EAE3D5]">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-[10px] font-serif font-bold text-guofeng-ink">{comment.author}</span>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-[8px] text-guofeng-ink/40 font-serif">{comment.time}</span>
                                            {(user?.uid === comment.authorUid || user?.uid === post.authorUid) && (
                                              <button 
                                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                                className="p-1 text-guofeng-ink/20 hover:text-guofeng-red transition-colors"
                                                title="删除评论"
                                              >
                                                <Trash2 size={10} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-xs text-guofeng-ink/60 leading-relaxed font-serif">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {(!commentsMap[post.id] || commentsMap[post.id].length === 0) && (
                                    <p className="text-center text-[10px] text-guofeng-ink/40 py-6 font-serif">暂无评论，快来抢沙发吧~</p>
                                  )}
                                </div>

                                <div className="flex items-center space-x-3 pt-4">
                                  <input
                                    type="text"
                                    placeholder="写下你的评论..."
                                    className="flex-1 bg-[#FDFBF7] rounded-full px-5 py-2.5 text-xs outline-none border border-[#EAE3D5] focus:border-guofeng-red/30 transition-all font-serif"
                                    value={newCommentContent}
                                    onChange={(e) => setNewCommentContent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                  />
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    className="p-2.5 bg-guofeng-red text-white rounded-full shadow-lg active:scale-95 transition-all"
                                  >
                                    <Send size={16} />
                                  </button>
                                </div>
                                <button 
                                  onClick={() => setExpandedPostComments(null)}
                                  className="w-full py-2 mt-2 text-[10px] font-serif font-bold text-guofeng-ink/20 hover:text-guofeng-red transition-colors flex items-center justify-center space-x-1"
                                >
                                  <ArrowLeft size={10} className="rotate-90" />
                                  <span>收起评论</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setCommunityView('main')}
                        className="p-2 text-guofeng-ink/40 hover:text-guofeng-red transition-colors flex items-center space-x-2"
                      >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-serif font-bold">返回社区</span>
                      </button>
                      <h2 className="text-lg font-serif font-black text-guofeng-ink">精选动态</h2>
                      <div className="w-10" />
                    </div>

                    <div className="space-y-6">
                      {posts
                        .sort((a, b) => b.likes - a.likes)
                        .slice(0, 10)
                        .map((post) => (
                          <motion.div
                            key={`featured-full-${post.id}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="guofeng-card p-8 border-guofeng-red/10 bg-gradient-to-br from-guofeng-red/[0.02] to-transparent"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-guofeng-red font-serif font-bold border border-red-100">
                                  {post.author.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="text-sm font-serif font-black text-guofeng-ink">{post.author}</h4>
                                  <p className="text-[10px] text-guofeng-ink/30 font-serif">{post.time}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 text-guofeng-red bg-guofeng-red/5 px-3 py-1 rounded-full">
                                <Sparkles size={12} />
                                <span className="text-[10px] font-serif font-bold">高赞精选</span>
                              </div>
                            </div>
                            <p className="text-sm text-guofeng-ink/80 leading-relaxed font-serif mb-6">
                              {post.content}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-[#F5EFE6]">
                              <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2 text-guofeng-red">
                                  <Heart size={18} className="fill-guofeng-red" />
                                  <span className="text-xs font-mono font-bold">{post.likes}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-guofeng-ink/40">
                                  <MessageCircle size={18} />
                                  <span className="text-xs font-mono font-bold">{commentsMap[post.id]?.length || 0}</span>
                                </div>
                              </div>
                              <button className="text-[10px] text-guofeng-red font-serif font-bold">查看详情</button>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

                {mainTab === 'checkin' && (
                  <motion.div
                    key="checkin"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {!user ? (
                      <div className="guofeng-card p-12 text-center space-y-8">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                          <CheckCircle2 className="w-10 h-10 text-guofeng-red" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-serif font-black text-guofeng-ink">开启成长打卡</h3>
                          <p className="text-sm text-guofeng-ink/40 font-serif leading-relaxed">
                            打卡功能需要登录账号以记录您的成长轨迹，并生成专属的阶段性报告。
                          </p>
                        </div>
                        <button 
                          onClick={handleLogin}
                          className="w-full py-4 guofeng-button text-sm font-serif font-bold"
                        >
                          登录开启打卡
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="guofeng-card p-12 text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-guofeng-red"></div>
                          
                          <GrowthPlant 
                            streak={checkInStreak} 
                            checkedInToday={checkInDates.includes(new Date().toISOString().split('T')[0])} 
                          />
                          
                          <div className="text-[10px] font-serif font-bold text-guofeng-red uppercase tracking-[0.3em] mb-4">坚持打卡 · Daily Check-in</div>
                          <div className="text-6xl font-serif font-black text-guofeng-ink mb-4">{checkInStreak}</div>
                          <div className="text-xs font-serif text-guofeng-ink/40 tracking-widest">连续打卡天数</div>
                          
                          <button 
                            onClick={handleCheckIn}
                            disabled={checkInDates.includes(new Date().toISOString().split('T')[0])}
                            className="mt-10 w-full py-5 guofeng-button text-sm font-serif font-bold disabled:opacity-50"
                          >
                            {checkInDates.includes(new Date().toISOString().split('T')[0]) ? '今日已打卡' : '立即打卡'}
                          </button>
                        </div>

                    <div className="guofeng-card p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-serif font-black text-guofeng-ink tracking-widest">成长报告</h3>
                        <div className="flex space-x-2">
                          {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => generateReport(t)}
                              className="px-3 py-1 bg-red-50 text-guofeng-red text-[10px] font-serif font-bold rounded-full border border-red-100 hover:bg-guofeng-red hover:text-white transition-all"
                            >
                              {t === 'daily' ? '日报' : t === 'weekly' ? '周报' : '月报'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-guofeng-ink/40 font-serif leading-relaxed">
                        点击上方按钮，基于您的打卡记录与咨询内容，AI将为您生成专属的阶段性成长解读与建议。
                      </p>
                    </div>

                    <div className="guofeng-card p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-serif font-black text-guofeng-ink tracking-widest">打卡日历</h3>
                        <div className="text-[10px] text-guofeng-gold font-serif font-bold">2026年4月</div>
                      </div>
                      <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: 30 }).map((_, i) => {
                          const dateStr = `2026-04-${(i + 1).toString().padStart(2, '0')}`;
                          const isChecked = checkInDates.includes(dateStr);
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          return (
                            <div 
                              key={i}
                              className={`aspect-square rounded-xl flex items-center justify-center text-xs font-serif font-bold transition-all border ${
                                isChecked ? 'bg-guofeng-red text-white border-guofeng-red shadow-md' : 
                                isToday ? 'border-2 border-guofeng-red text-guofeng-red' : 'bg-[#FDFBF7] text-guofeng-ink/20 border-[#EAE3D5]'
                              }`}
                            >
                              {i + 1}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="guofeng-card p-10 text-center">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                        <Share2 className="w-10 h-10 text-guofeng-red" />
                      </div>
                      <h3 className="text-lg font-serif font-black text-guofeng-ink mb-3 tracking-widest">生成打卡海报</h3>
                      <p className="text-xs text-guofeng-ink/40 mb-8 px-6 font-serif leading-relaxed">将你的治愈瞬间分享给好友，邀请他们一起开启治愈之旅</p>
                      <button className="px-10 py-4 guofeng-button text-sm font-serif font-bold">
                        保存并分享
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

                {mainTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-8"
                  >
                    {/* User Profile Header */}
                    {user && (
                      <div className="guofeng-card p-6 flex items-center space-x-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-guofeng-red font-serif font-bold text-xl border border-red-100 shadow-sm overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            formData.name.charAt(0) || '访'
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-serif font-black text-guofeng-ink">{user.displayName || formData.name || '游客用户'}</h3>
                          <p className="text-[10px] text-guofeng-ink/40 font-serif">UID: {user.uid.slice(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-serif font-bold text-guofeng-gold">福报值</div>
                          <div className="text-lg font-serif font-black text-guofeng-red">{userProfile?.luckScore || 0}</div>
                        </div>
                      </div>
                    )}

                    {!user ? (
                      <div className="guofeng-card p-12 text-center space-y-8">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                          <User2 className="w-10 h-10 text-guofeng-red" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-serif font-black text-guofeng-ink">开启云端存档</h3>
                          <p className="text-sm text-guofeng-ink/40 font-serif leading-relaxed">
                            登录后可同步求签记录、打卡进度及个人命理报告。
                          </p>
                        </div>
                        <button 
                          onClick={handleLogin}
                          className="w-full py-4 guofeng-button text-sm font-serif font-bold"
                        >
                          立即登录
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Profile Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="guofeng-card p-4 text-center">
                            <div className="text-[10px] font-serif font-bold text-guofeng-ink/40 mb-1">求签次数</div>
                            <div className="text-lg font-serif font-black text-guofeng-ink">{userProfile?.divinationCount || 0}</div>
                          </div>
                          <div className="guofeng-card p-4 text-center">
                            <div className="text-[10px] font-serif font-bold text-guofeng-ink/40 mb-1">打卡天数</div>
                            <div className="text-lg font-serif font-black text-guofeng-ink">{checkInStreak || 0}</div>
                          </div>
                          <div className="guofeng-card p-4 text-center">
                            <div className="text-[10px] font-serif font-bold text-guofeng-ink/40 mb-1">福报等级</div>
                            <div className="text-lg font-serif font-black text-guofeng-ink">
                              {userProfile?.luckScore && userProfile.luckScore > 100 ? '上' : userProfile?.luckScore && userProfile.luckScore > 50 ? '中' : '平'}
                            </div>
                          </div>
                        </div>
                        {/* QA Section */}
                        <div className="guofeng-card p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-serif font-black text-guofeng-ink">咨询记录</h3>
                            <HelpCircle size={16} className="text-guofeng-gold" />
                          </div>
                          
                          <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar mb-6">
                            {qaList.length === 0 ? (
                              <div className="text-center py-8 space-y-3">
                                <p className="text-xs text-guofeng-ink/30 font-serif">暂无咨询记录</p>
                              </div>
                            ) : (
                              qaList.map((qa) => (
                                <div key={qa.id} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5] space-y-3">
                                  <div className="flex items-start space-x-3">
                                    <div className="p-1.5 bg-white rounded-lg border border-[#EAE3D5]">
                                      <MessageSquare size={12} className="text-guofeng-red" />
                                    </div>
                                    <p className="text-xs font-serif font-bold text-guofeng-ink leading-relaxed">{qa.question}</p>
                                  </div>
                                  {qa.answer || qa.loading ? (
                                    <div className="pl-8 border-l-2 border-guofeng-gold/20">
                                      {qa.loading ? (
                                        <div className="flex items-center space-x-2 py-2">
                                          <div className="w-1.5 h-1.5 bg-guofeng-gold rounded-full animate-bounce"></div>
                                          <div className="w-1.5 h-1.5 bg-guofeng-gold rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                          <div className="w-1.5 h-1.5 bg-guofeng-gold rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] text-guofeng-ink/60 font-serif leading-relaxed italic">
                                          {qa.answer}
                                        </p>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              ))
                            )}
                          </div>

                          {/* New Consultation Input */}
                          <div className="flex items-center space-x-3 p-3 bg-[#FDFBF7] rounded-2xl border border-[#EAE3D5]">
                            <input
                              type="text"
                              value={question}
                              onChange={(e) => setQuestion(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                              placeholder="有什么疑惑想咨询 AI 导师？"
                              className="flex-1 bg-transparent border-none outline-none text-xs font-serif placeholder:text-guofeng-ink/20 px-2"
                            />
                            <button
                              onClick={handleAsk}
                              disabled={!question.trim()}
                              className="p-2 bg-guofeng-red text-white rounded-xl shadow-lg shadow-red-900/10 disabled:opacity-30 transition-opacity"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Settings / Actions */}
                        <div className="space-y-3">
                          <button 
                            onClick={() => auth.signOut()}
                            className="w-full py-4 bg-white border border-red-100 rounded-2xl text-xs font-serif font-bold text-guofeng-red hover:bg-red-50 transition-colors"
                          >
                            退出登录
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Report Modal */}
          <AnimatePresence>
            {showReportModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-guofeng-ink/40 backdrop-blur-md flex items-center justify-center px-6"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="guofeng-card w-full max-w-sm max-h-[80vh] overflow-y-auto no-scrollbar relative p-8"
                >
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="absolute top-4 right-4 p-2 text-guofeng-ink/20 hover:text-guofeng-red transition-colors"
                  >
                    <Plus className="rotate-45" size={24} />
                  </button>

                  {isGeneratingReport ? (
                      <div className="py-20 text-center space-y-6">
                        <RefreshCw className="w-12 h-12 text-guofeng-red animate-spin mx-auto" />
                        <p className="text-sm font-serif font-bold text-guofeng-ink">正在深度解析您的灵性轨迹...</p>
                      </div>
                    ) : reportData ? (
                      <div className="space-y-8">
                        <div className="text-center">
                          <div className="inline-block p-3 bg-red-50 rounded-2xl border border-red-100 mb-4">
                            <History className="text-guofeng-red w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-serif font-black text-guofeng-ink">{reportData.title}</h3>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <div className="h-[1px] w-4 bg-guofeng-gold/30"></div>
                            <span className="text-[10px] font-serif font-bold text-guofeng-gold uppercase tracking-widest">Growth Report</span>
                            <div className="h-[1px] w-4 bg-guofeng-gold/30"></div>
                          </div>
                        </div>

                        <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#EAE3D5] relative">
                          <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#EAE3D5] shadow-sm">
                            <Star size={14} className="text-guofeng-gold" />
                          </div>
                          <p className="text-sm text-guofeng-ink/60 leading-relaxed font-serif italic">
                            "{reportData.summary}"
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-serif font-black text-guofeng-red uppercase tracking-widest flex items-center">
                            <div className="w-1 h-3 bg-guofeng-red rounded-full mr-2"></div>
                            阶段亮点
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {reportData.highlights.map((h: string, i: number) => (
                              <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-[#EAE3D5] shadow-sm">
                                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                <span className="text-xs font-serif font-bold text-guofeng-ink/70">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-serif font-black text-guofeng-red uppercase tracking-widest flex items-center">
                            <div className="w-1 h-3 bg-guofeng-red rounded-full mr-2"></div>
                            深度解读
                          </h4>
                          <p className="text-xs text-guofeng-ink/60 leading-relaxed font-serif bg-[#FDFBF7] p-5 rounded-2xl border border-[#EAE3D5]">
                            {reportData.interpretation}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-serif font-black text-guofeng-red uppercase tracking-widest flex items-center">
                            <div className="w-1 h-3 bg-guofeng-red rounded-full mr-2"></div>
                            成长建议
                          </h4>
                          <div className="space-y-3">
                            {reportData.suggestions.map((s: string, i: number) => (
                              <div key={i} className="flex items-start space-x-3 p-4 bg-red-50/30 rounded-2xl border border-red-100/50">
                                <Lightbulb size={14} className="text-guofeng-gold mt-0.5 shrink-0" />
                                <p className="text-xs font-serif font-bold text-guofeng-ink/60">{s}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-[#EAE3D5] flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-serif font-bold text-guofeng-ink/40">能量指数</span>
                            <div className="w-24 h-1.5 bg-[#FDFBF7] rounded-full overflow-hidden border border-[#EAE3D5]">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${reportData.energyLevel}%` }}
                                className="h-full bg-guofeng-red"
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-guofeng-red">{reportData.energyLevel}%</span>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-guofeng-ink/30 font-serif uppercase">Lucky Tip</p>
                            <p className="text-[10px] font-serif font-black text-guofeng-gold">{reportData.luckyTip}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => setShowReportModal(false)}
                          className="w-full py-4 guofeng-button text-sm font-serif font-bold shadow-xl shadow-red-900/10"
                        >
                          收下这份指引
                        </button>
                      </div>
                    ) : null}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Wallpaper Modal */}
        <AnimatePresence>
          {showWallpaperModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-guofeng-ink/80 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="max-w-xs w-full relative flex flex-col items-center"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setShowWallpaperModal(false)}
                  className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white"
                >
                  <Plus size={24} className="rotate-45" />
                </button>

                {/* Wallpaper Canvas Container */}
                <div 
                  ref={wallpaperRef}
                  className="w-full aspect-[9/16] bg-guofeng-paper rounded-2xl shadow-2xl relative overflow-hidden p-8 flex flex-col"
                >
                  {/* Background Patterns for Wallpaper */}
                  <div className="absolute inset-0 opacity-[0.08] guofeng-fret-pattern"></div>
                  <div className="absolute inset-0 guofeng-cloud-pattern opacity-[0.05]"></div>
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-guofeng-red/5 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-guofeng-gold/5 rounded-full blur-3xl"></div>

                  {/* Wallpaper Content */}
                  <div className="relative z-10 flex-1 flex flex-col items-center text-center">
                    <div className="mt-4 mb-8">
                      <div className="guofeng-stamp-sm text-[10px] scale-125 mb-2">窥探天机</div>
                      <div className="text-[8px] font-mono text-guofeng-ink/30 tracking-widest">
                        {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-10">
                      <div className="space-y-2">
                        <div className="text-[10px] font-serif font-black text-guofeng-gold tracking-[0.3em] uppercase">
                          {divinationType === 'stick' ? '灵签所指' : '卦象大意'}
                        </div>
                        <h2 className="text-3xl font-serif font-black text-guofeng-ink">
                          {divinationResult?.title}
                        </h2>
                        {divinationType === 'stick' && (
                          <div className="text-sm font-serif font-bold text-guofeng-red mt-1">
                            {divinationResult?.lotNumber}
                          </div>
                        )}
                      </div>

                      <div className="bg-guofeng-red/5 p-8 rounded-3xl border border-guofeng-red/10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-guofeng-red/10">
                          <Sparkles size={12} className="text-guofeng-red" />
                        </div>
                        <div className="writing-mode-vertical mx-auto h-40 flex items-center justify-center space-x-6">
                          {divinationResult?.poem.split('，').map((line: string, i: number) => (
                            <p key={i} className="text-lg font-serif font-black text-guofeng-ink tracking-widest leading-loose">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 max-w-[200px]">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-px w-6 bg-guofeng-gold/30"></div>
                          <span className="text-[10px] font-serif font-black text-guofeng-gold">本期关键词</span>
                          <div className="h-px w-6 bg-guofeng-gold/30"></div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {(divinationResult?.advice || "保持谦逊, 静待良机").split(/[,，。]/).slice(0, 3).map((keyword: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-white border border-[#EAE3D5] rounded-full text-[9px] font-serif font-bold text-guofeng-ink/60">
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-8 flex flex-col items-center">
                      <div className="w-12 h-12 p-1 bg-white border-2 border-guofeng-gold/20 rounded-xl mb-3 flex items-center justify-center opacity-40 grayscale">
                        {/* Mock QR Code */}
                        <LayoutGrid size={24} className="text-guofeng-ink" />
                      </div>
                      <p className="text-[8px] font-serif font-black text-guofeng-ink/20 tracking-tighter">长按扫码 · 洞悉先机</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col items-center space-y-4 w-full">
                  <button
                    onClick={handleDownloadWallpaper}
                    disabled={generatingWallpaper}
                    className="w-full py-4 guofeng-button flex items-center justify-center space-x-3 shadow-2xl"
                  >
                    {generatingWallpaper ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                    <span className="font-serif font-bold tracking-widest">
                      {generatingWallpaper ? '正在雕琢壁纸...' : '保存至相册'}
                    </span>
                  </button>
                  <p className="text-white/40 text-[10px] font-serif flex items-center">
                    <Info size={10} className="mr-1" />
                    保存后可分享至朋友圈或设为手机壁纸
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

            {/* Bottom Navigation */}
            {!((!result && !isGuest) || showLandingForm) && (
              <div className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-guofeng-paper/95 backdrop-blur-xl border-t border-guofeng-gold/20 px-8 py-5 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-guofeng-red/20 to-transparent"></div>
                <div className="flex items-center justify-between">
              {[
                { id: 'divination', label: '求签', icon: Dices },
                { id: 'report', label: '报告', icon: Star },
                { id: 'community', label: '社区', icon: MessageSquare },
                { id: 'checkin', label: '打卡', icon: CheckCircle2 },
                { id: 'profile', label: '中心', icon: User2 },
              ].map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => setMainTab(nav.id as MainTab)}
                  className={`flex flex-col items-center space-y-1.5 transition-all ${
                    mainTab === nav.id || (nav.id === 'divination' && mainTab === 'featured') ? 'text-guofeng-red scale-110' : 'text-guofeng-ink/30'
                  }`}
                >
                  <nav.icon size={22} className={mainTab === nav.id || (nav.id === 'divination' && mainTab === 'featured') ? 'fill-red-50' : ''} />
                  <span className="text-[10px] font-serif font-bold tracking-widest">{nav.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
