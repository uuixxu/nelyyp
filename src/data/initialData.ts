import { DevTrackerData } from '../types';

export const initialTrackerData: DevTrackerData = {
  project: {
    name: 'Demonfall 2',
    genre: 'Action / RPG / Story / Adventure',
    targetReleaseDate: '2027-01-01',
    placeId: '133815254397626',
    gameVersion: 'v0.0.1 Alpha',
    currentActiveTaskId: null,
  },
  progression: [
    {
      id: 'map',
      name: 'Map & Environment',
      nameAr: 'الخريطة والبيئة',
      icon: 'MapPin',
      description: 'تصميم التضاريس، اللوبي، ساحات القتال، وتأثيرات الإضاءة في Studio',
      items: [
        {
          id: 'pitem-1790439374246',
          title: 'جرافكس اللعبة',
          isCompleted: false,
          notes: 'يُفضل لِكُل منطقة جرافكسها الخاص وتضاريسها الخاصة مثل المنطقة الخضراء والمنطقة الثلجية والخ ..',
          updatedAt: '2026-09-26T16:16:14.246Z',
        },
        {
          id: 'pitem-1790439461204',
          title: 'المنطقة الثلجية',
          isCompleted: false,
          notes: 'جرافكس ضبابي، 3 قُرَاء للمنطقة، منطقة وحش واحدة ..',
          updatedAt: '2026-09-26T16:17:41.204Z',
        },
        {
          id: 'pitem-1790439516848',
          title: 'المنطقة الخضراء',
          isCompleted: false,
          notes: 'جرافكس هادئ، 5 قٌراء، جبال ضخمة يمكن تسلقها، 3 مناطق وحوش ..',
          updatedAt: '2026-09-26T16:18:36.848Z',
        },
        {
          id: 'pitem-1790439565002',
          title: 'المنطقة الجبلية',
          isCompleted: false,
          notes: 'جرافكس ضبابي، قريتين، جبال طويلة، منطقتين وحوش ..',
          updatedAt: '2026-09-26T16:19:25.002Z',
        },
        {
          id: 'pitem-1790439624037',
          title: 'المنطقة الصحراوية',
          isCompleted: false,
          notes: 'جرافكس حاد قليلًا، 4 قٌراء، جبال رملية، منطقة وحش ..',
          updatedAt: '2026-09-26T16:20:24.037Z',
        },
      ],
    },
    {
      id: 'gameplay',
      name: 'Gameplay & Mechanics',
      nameAr: 'أسلوب اللعب والميكانيكا',
      icon: 'Gamepad2',
      description: 'حركات اللاعب، أنظمة الضربات، التدريب، وتوازن الشخصيات',
      items: [
        {
          id: 'pitem-1790439721301',
          title: 'برمجة الحركة',
          isCompleted: false,
          notes: 'المشي - الركض - التسلق - Crouch - Dodge / Dash',
          updatedAt: '2026-09-26T16:22:01.301Z',
        },
        {
          id: 'pitem-1790439831817',
          title: 'برمجة السيوف',
          isCompleted: false,
          notes: '5 كومبوات، 4 عادية، 1 ثقيلة .. مع نظام Parry و Block لا ينكسر انما يخفف الدمج ولكن ضد الضربة الثقيلة فتتدحرج للخلف',
          updatedAt: '2026-09-26T16:23:57.222Z',
        },
        {
          id: 'pitem-1790439887712',
          title: 'برمجة التنفسات',
          isCompleted: false,
          notes: 'مياة - نار - هواء - ضباب - شمس - قمر - برق - صوت - وحش - فراشة - حب',
          updatedAt: '2026-09-26T16:24:47.712Z',
        },
        {
          id: 'pitem-1790440092278',
          title: 'برمجة الشياطين',
          isCompleted: false,
          notes: 'نظام الشياطين والـ Demon Arts لديهم',
          updatedAt: '2026-09-26T16:28:12.278Z',
        },
      ],
    },
    {
      id: 'ui',
      name: 'UI & Interfaces',
      nameAr: 'الواجهات وتجربة المستخدم',
      icon: 'Layout',
      description: 'شاشات المتجر، شريط الصحة، الرانك، ودعم أجهزة الجوال والكونسول',
      items: [
        {
          id: 'pitem-1790440074898',
          title: 'قائمة رئيسية',
          isCompleted: false,
          notes: 'أسم اللاعب، قدر دمه، قدر جوعه، قدر طاقته، مبلغ المال لدية',
          updatedAt: '2026-09-26T16:27:54.898Z',
        },
      ],
    },
    {
      id: 'systems',
      name: 'Systems & Backend',
      nameAr: 'الأنظمة البرمجية والداتا',
      icon: 'Cpu',
      description: 'حفظ البيانات عبر ProfileService، مانع الاختراق، ومعالجة السيرفر',
      items: [
        {
          id: 'pitem-1790440004337',
          title: 'برمجة الحفظ التلقائي لـ تقدم اللاعب',
          isCompleted: false,
          notes: 'Player LVL . Skilltree . Money . Sword Appearence . ETC',
          updatedAt: '2026-09-26T16:26:44.337Z',
        },
      ],
    },
  ],
  tasks: [
    {
      id: 'task-1790440280607',
      title: 'برمجة الحركة',
      description: 'مشي - ركض - Crouch - تسلق - Dodge / Dash',
      status: 'todo',
      priority: 'high',
      category: 'gameplay',
      dueDate: '2026-09-28',
      createdAt: '2026-09-26T16:31:20.607Z',
    },
    {
      id: 'task-1790440205872',
      title: 'تصميم منطقة الثلج',
      description: 'يجب الانتهاء من منزل اللاعب اولاً ومقبرة اهله وبيته من ثم نبدا بتصميم القٌراء والاجهاز عليها',
      status: 'in_progress',
      priority: 'high',
      category: 'map',
      dueDate: '2026-09-27',
      createdAt: '2026-09-26T16:30:05.872Z',
    },
  ],
  ideas: [],
  bugs: [],
  notes: [
    {
      id: 'note-1',
      title: 'بنية أنظمة السيرفر والتحقق (Server Architecture & Security)',
      content: `-- [Demonfall 2 System Architecture]
-- 1. All hit detection happens on Server with sanity checks
-- 2. Client sends request via RemoteFunction: Fire("RequestAttack", attackId)
-- 3. Server validates distance <= 8 studs and cooldowns before dealing damage

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local function validateCombatAction(player, targetCharacter, distanceLimit)
    local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
    local targetRoot = targetCharacter and targetCharacter:FindFirstChild("HumanoidRootPart")
    if not root or not targetRoot then return false end
    
    local dist = (root.Position - targetRoot.Position).Magnitude
    return dist <= (distanceLimit or 9.5)
end`,
      category: 'architecture',
      tags: ['Server', 'Luau', 'Security', 'Combat'],
      createdAt: '2026-09-26T16:40:00.000Z',
      updatedAt: '2026-09-26T17:10:00.000Z',
    },
    {
      id: 'note-2',
      title: 'ملاحظات توازن أسلوب القتال والتنفسات (Breathing Balance Notes)',
      content: `ملاحظات توازن القتال في Demonfall 2:
- تنفس الماء: دفاعي وسريع مع حركات دفع وتراجع سلسة (I-Frames أقل ولكن تعافي أسرع).
- تنفس الشمس: يتطلب مقياس طاقة عالي ويستهلك الجوع بشكل أسرع لموازنة الدمج العالي.
- نظام الـ Parry:
  * الضغط في توقيت مثالي (0.2s) يعكس 30% من الضرر ويشل حركة الخصم لـ 0.6s.
  * الـ Block العادي يقلل 60% من الدمج ولا ينكسر إلا ضد الضربة الثقيلة (Heavy Attack).`,
      category: 'game_design',
      tags: ['GameDesign', 'Combat', 'Balancing'],
      createdAt: '2026-09-26T17:00:00.000Z',
      updatedAt: '2026-09-26T17:00:00.000Z',
    }
  ],
  activities: [
    {
      id: 'act-1790440280607-2joq',
      type: 'task_created',
      message: 'تمت إضافة مهمة جديدة: برمجة الحركة',
      timestamp: '2026-09-26T16:31:20.607Z',
    },
    {
      id: 'act-1790440205872-v30w',
      type: 'task_created',
      message: 'تمت إضافة مهمة جديدة: تصميم منطقة الثلج',
      timestamp: '2026-09-26T16:30:05.872Z',
    },
    {
      id: 'act-1790439343107-ch8i',
      type: 'milestone_checked',
      message: 'تم إكمال عنصر التطوير: قرافكس اللعبة',
      timestamp: '2026-09-26T16:15:43.107Z',
    },
    {
      id: 'act-1790439127068-ma95',
      type: 'task_completed',
      message: 'تم إنجاز المهمة: برمجة وتنسيق نافذة المتجر (Shop GUI) مع ربط أزرار الشراء',
      timestamp: '2026-09-26T16:12:07.068Z',
    },
    {
      id: 'act-1',
      type: 'task_completed',
      message: 'تم إنجاز المهمة: إصلاح ارتداد كاميرا اللاعب عند الدخول في الممرات الضيقة',
      timestamp: '2026-09-25T11:30:00Z',
    },
    {
      id: 'act-2',
      type: 'milestone_checked',
      message: 'تم إنهاء مرحلة: تصميم ساحة المعارك (Combat Arena 1)',
      timestamp: '2026-09-25T16:00:00Z',
    },
    {
      id: 'act-3',
      type: 'bug_fixed',
      message: 'تم إصلاح مشكلة: تأخير في تحديث قيمة العملات في الـ HUD',
      timestamp: '2026-09-24T16:00:00Z',
    },
    {
      id: 'act-4',
      type: 'task_created',
      message: 'تمت إضافة مهمة جديدة: برمجة فحص الصلاحيات لسيرفر RemoteEvent',
      timestamp: '2026-09-26T07:00:00Z',
    },
  ],
};
