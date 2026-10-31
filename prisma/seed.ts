import { PrismaClient, StudyYear, BookCategory } from "@prisma/client";

const prisma = new PrismaClient();

const C = (paperback: number, hardcoverDelta: number, ebookDelta: number) =>
  JSON.stringify([
    { key: "paperback", delta: 0, stock: true },
    { key: "hardcover", delta: hardcoverDelta, stock: true },
    { key: "ebook", delta: ebookDelta, stock: true },
  ]);

type CategorySeed = {
  slug: string;
  name: string;
  nameAr: string;
  nameFr: string;
  icon: string;
  parentSlug: string | null;
  categoryType: BookCategory;
};

const categories: CategorySeed[] = [
  { slug: "human-medicine", name: "Human Medicine", nameAr: "الطب البشري", nameFr: "Médecine humaine", icon: "Stethoscope", parentSlug: null, categoryType: "HUMAN_MEDICINE" },
  { slug: "dentistry", name: "Dentistry", nameAr: "طب الأسنان", nameFr: "Dentisterie", icon: "Smile", parentSlug: null, categoryType: "DENTISTRY" },
  { slug: "pharmacy", name: "Pharmacy & Pharmacology", nameAr: "الصيدلة والدواء", nameFr: "Pharmacie et pharmacologie", icon: "Pill", parentSlug: null, categoryType: "PHARMACOLOGY" },
  { slug: "nursing-allied", name: "Nursing & Allied Health", nameAr: "التمريض والعلوم الصحية", nameFr: "Soins infirmiers et santé", icon: "HeartPulse", parentSlug: null, categoryType: "NURSING_ALLIED" },
  { slug: "physical-therapy", name: "Physical Therapy", nameAr: "العلاج الطبيعي", nameFr: "Kinésithérapie", icon: "PersonStanding", parentSlug: null, categoryType: "PHYSICAL_THERAPY" },
  { slug: "lab-sciences", name: "Laboratory Sciences", nameAr: "العلوم المخبرية", nameFr: "Sciences de laboratoire", icon: "FlaskConical", parentSlug: null, categoryType: "LAB_SCIENCES" },
  { slug: "radiology", name: "Radiology & Imaging", nameAr: "الأشعة والتصوير", nameFr: "Imagerie médicale", icon: "ScanLine", parentSlug: null, categoryType: "RADIOLOGY" },
  { slug: "board-exams", name: "Board Exams", nameAr: "الامتحانات والمسابقات", nameFr: "Examens classants", icon: "ClipboardList", parentSlug: null, categoryType: "BOARD_EXAMS" },
  { slug: "atlases-dictionaries", name: "Atlases & Dictionaries", nameAr: "المجموعات والمعاجم", nameFr: "Atlas et dictionnaires", icon: "BookMarked", parentSlug: null, categoryType: "ATLASES_DICTIONARIES" },
  { slug: "pocket-guides", name: "Pocket Guides", nameAr: "أدلة الجيب", nameFr: "Guides de poche", icon: "Pocket", parentSlug: null, categoryType: "POCKET_GUIDES" },
  { slug: "medical-devices", name: "Medical Devices", nameAr: "الأجهزة الطبية", nameFr: "Dispositifs médicaux", icon: "Syringe", parentSlug: null, categoryType: "MEDICAL_DEVICES" },
  { slug: "basic-sciences", name: "Basic Sciences", nameAr: "العلوم الأساسية", nameFr: "Sciences fondamentales", icon: "Dna", parentSlug: "human-medicine", categoryType: "BASIC_SCIENCES" },
  { slug: "clinical-sciences", name: "Clinical Sciences", nameAr: "العلوم الإكلينيكية", nameFr: "Sciences cliniques", icon: "Hospital", parentSlug: "human-medicine", categoryType: "HUMAN_MEDICINE" },
  { slug: "anatomy", name: "Anatomy", nameAr: "التشريح", nameFr: "Anatomie", icon: "Bone", parentSlug: "basic-sciences", categoryType: "BASIC_SCIENCES" },
  { slug: "physiology", name: "Physiology", nameAr: "الفيزيولوجيا", nameFr: "Physiologie", icon: "Activity", parentSlug: "basic-sciences", categoryType: "BASIC_SCIENCES" },
  { slug: "pathology", name: "Pathology", nameAr: "علم الأمراض", nameFr: "Anatomie pathologique", icon: "Microscope", parentSlug: "basic-sciences", categoryType: "BASIC_SCIENCES" },
  { slug: "pharmacology", name: "Pharmacology", nameAr: "علم الأدوية", nameFr: "Pharmacologie", icon: "PillBottle", parentSlug: "basic-sciences", categoryType: "PHARMACOLOGY" },
  { slug: "biochemistry", name: "Biochemistry", nameAr: "الكيمياء الحيوية", nameFr: "Biochimie", icon: "TestTube", parentSlug: "basic-sciences", categoryType: "BASIC_SCIENCES" },
  { slug: "histology-embryology", name: "Histology & Embryology", nameAr: "الأنسجة والتطور الجنيني", nameFr: "Histologie et embryologie", icon: "Layers", parentSlug: "basic-sciences", categoryType: "BASIC_SCIENCES" },
  { slug: "microbiology-immunology", name: "Microbiology & Immunology", nameAr: "الميكروبيولوجيا والمناعة", nameFr: "Microbiologie et immunologie", icon: "Bug", parentSlug: "basic-sciences", categoryType: "BASIC_SCIENCES" },
  { slug: "internal-medicine", name: "Internal Medicine", nameAr: "الطب الباطني", nameFr: "Médecine interne", icon: "HeartPulse", parentSlug: "clinical-sciences", categoryType: "INTERNAL_MEDICINE" },
  { slug: "surgery", name: "Surgery", nameAr: "الجراحة", nameFr: "Chirurgie", icon: "Scissors", parentSlug: "clinical-sciences", categoryType: "SURGERY" },
  { slug: "pediatrics", name: "Pediatrics", nameAr: "طب الأطفال", nameFr: "Pédiatrie", icon: "Baby", parentSlug: "clinical-sciences", categoryType: "PEDIATRICS" },
  { slug: "obstetrics-gynecology", name: "Obstetrics & Gynecology", nameAr: "الولادة وأمراض النساء", nameFr: "Obstétrique et gynécologie", icon: "Heart", parentSlug: "clinical-sciences", categoryType: "OBSTETRICS_GYNECOLOGY" },
  { slug: "ophthalmology", name: "Ophthalmology", nameAr: "طب العيون", nameFr: "Ophtalmologie", icon: "Eye", parentSlug: "clinical-sciences", categoryType: "OPHTHALMOLOGY" },
  { slug: "ent", name: "ENT", nameAr: "أنف وأذن وحنجرة", nameFr: "ORL", icon: "Ear", parentSlug: "clinical-sciences", categoryType: "ENT" },
  { slug: "dermatology", name: "Dermatology", nameAr: "الأمراض الجلدية", nameFr: "Dermatologie", icon: "Sparkles", parentSlug: "clinical-sciences", categoryType: "DERMATOLOGY" },
  { slug: "emergency-critical", name: "Emergency & Critical Care", nameAr: "الطوارئ والعناية المركزة", nameFr: "Urgences et réanimation", icon: "Siren", parentSlug: "clinical-sciences", categoryType: "EMERGENCY_CRITICAL" },
  { slug: "psychiatry", name: "Psychiatry", nameAr: "الطب النفسي", nameFr: "Psychiatrie", icon: "Brain", parentSlug: "clinical-sciences", categoryType: "PSYCHIATRY" },
];

const publishers = [
  { name: "Elsevier", nameAr: "إلفيير", nameFr: "Elsevier" },
  { name: "Wolters Kluwer", nameAr: "ولترز كلوفير", nameFr: "Wolters Kluwer" },
  { name: "McGraw-Hill", nameAr: "ماكجرو هيل", nameFr: "McGraw-Hill" },
  { name: "Oxford", nameAr: "أكسفورد", nameFr: "Oxford" },
  { name: "Cambridge", nameAr: "كامبريدج", nameFr: "Cambridge" },
  { name: "Springer", nameAr: "شبرينغر", nameFr: "Springer" },
  { name: "Wiley", nameAr: "وايلي", nameFr: "Wiley" },
  { name: "Pearson", nameAr: "بيرسون", nameFr: "Pearson" },
  { name: "Saunders", nameAr: "ساوندرز", nameFr: "Saunders" },
  { name: "Lippincott Williams & Wilkins", nameAr: "ليبينكوت ويليامز وويلكينس", nameFr: "Lippincott Williams & Wilkins" },
  { name: "Thieme", nameAr: "تايما", nameFr: "Thieme" },
  { name: "Churchill Livingstone", nameAr: "تشرشيل ليفينغستون", nameFr: "Churchill Livingstone" },
];

const series = [
  {
    id: "series-robbins",
    slug: "robbins-pathology-collection",
    name: "Robbins Pathology Collection",
    nameAr: "مجموعة روبنز لل病理ولوجيا",
    nameFr: "Collection Robbins Pathologie",
    description:
      "The gold-standard pathology duo: the full Robbins Basic Pathology plus the companion review book for exam drilling.",
    bundlePrice: 9900,
    oldPrice: 11900,
    cover: "https://covers.openlibrary.org/b/id/1786324-L.jpg",
  },
  {
    id: "series-gray",
    slug: "grays-anatomy-collection",
    name: "Gray's Anatomy Collection",
    nameAr: "مجموعة غراي للتشريح",
    nameFr: "Collection Gray's Anatomy",
    description:
      "Two complementary anatomy references: the classic Gray's Anatomy and the student-friendly Gray's Anatomy for Students.",
    bundlePrice: 8900,
    oldPrice: 10500,
    cover: "https://covers.openlibrary.org/b/id/692969-L.jpg",
  },
  {
    id: "series-usmle",
    slug: "usmle-step-series",
    name: "USMLE Step Series",
    nameAr: "سلسلة امتحان USMLE",
    nameFr: "Série USMLE Step",
    description:
      "The two First Aid companions that carry students through Step 1 theory and Step 2 CK clinical preparation.",
    bundlePrice: 8200,
    oldPrice: 9200,
    cover: "https://covers.openlibrary.org/b/id/60567-L.jpg",
  },
];

type Seed = {
  title: string;
  titleAr: string;
  titleFr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  author: string;
  authorAr: string;
  publisher: string;
  isbn: string;
  pages: number;
  originLanguage: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  edition: number;
  editionYear: number;
  studyYear: StudyYear;
  quantity: number;
  formats: string;
  sampleText?: string;
  cover: string;
  categorySlug: string;
  seriesId?: string;
  seriesOrder?: number;
  year: number;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
};

const books: Seed[] = [
  {
    title: "Gray's Anatomy",
    titleAr: "تشريح غراي",
    titleFr: "Gray's Anatomy",
    slug: "grays-anatomy",
    description:
      "The anatomical bible, first published in 1858 and refined across generations. Classic engravings meet modern clinical notes in this reference used by medical students and surgeons worldwide.",
    descriptionAr:
      "الكتاب المرجعي في التشريح منذ عام 1858، يجمع النقوش الكلاسيكية مع ملاحظات إكلينيكية حديثة. مرجع يومي لطلبة الطب والجراحين في كل أنحاء العالم.",
    descriptionFr:
      "La bible de l'anatomie, publiée pour la première fois en 1858 et affinée au fil des générations. Gravures classiques et notes cliniques modernes pour étudiants et chirurgiens.",
    author: "Henry Gray",
    authorAr: "هنري غراي",
    publisher: "Elsevier",
    isbn: "9780702074822",
    pages: 1600,
    originLanguage: "English",
    price: 7900,
    formats: C(7900, 2500, -1800),
    sampleText:
      "The human body, in its adult form, consists of a number of systems which are anatomically separable... Introduction to the study of anatomy begins with the osteological framework — the bones that give the body its shape and protection.",
    cover: "https://covers.openlibrary.org/b/id/692969-L.jpg",
    categorySlug: "anatomy",
    edition: 41,
    editionYear: 2020,
    studyYear: "YEAR_1",
    quantity: 30,
    seriesId: "series-gray",
    seriesOrder: 1,
    year: 2020,
    rating: 4.9,
    reviewsCount: 18,
    salesCount: 320,
    featured: true,
    bestSeller: true,
  },
  {
    title: "Harrison's Principles of Internal Medicine",
    titleAr: "مبادئ هاريسون للطب الباطني",
    titleFr: "Harrison's Principles of Internal Medicine",
    slug: "harrisons-principles-internal-medicine",
    description:
      "The world's most trusted internal medicine reference. Comprehensive chapters on pathophysiology, diagnosis and evidence-based therapeutics, regularly updated by leading clinicians.",
    descriptionAr:
      "المرجع الأشهر عالمياً في الطب الباطني. فصول شاملة في الباثوفيزيولوجيا والتشخيص والعلاج القائم على الأدلة، يحدّثه كبار الأطباء كل عام.",
    descriptionFr:
      "La référence mondiale en médecine interne. Chapitres complets sur la physiopathologie, le diagnostic et la thérapeutique fondée sur les preuves.",
    author: "Dennis Kasper",
    authorAr: "دينيس كاسبر",
    publisher: "McGraw-Hill",
    isbn: "9781260455562",
    pages: 4032,
    originLanguage: "English",
    price: 12500,
    formats: C(12500, 3000, -3000),
    sampleText:
      "Chapter 1 — The Practice of Modern Medicine: Clinical reasoning begins with a careful history and physical examination. The art of diagnosis rests on pattern recognition refined by experience.",
    cover: "https://covers.openlibrary.org/b/id/4945297-L.jpg",
    categorySlug: "internal-medicine",
    edition: 21,
    editionYear: 2022,
    studyYear: "YEAR_5",
    quantity: 12,
    year: 2022,
    rating: 4.8,
    reviewsCount: 24,
    salesCount: 210,
    featured: true,
    bestSeller: true,
  },
  {
    title: "Robbins Basic Pathology",
    titleAr: "أساسيات روبنز لل病理ولوجيا",
    titleFr: "Robbins Basic Pathology",
    slug: "robbins-basic-pathology",
    description:
      "The student edition of the Robbins trilogy: clear explanations of disease mechanisms with superb microscopy images and clinical correlations for every chapter.",
    descriptionAr:
      "النسخة الطلابية من ثلاثية روبنز: شرح واضح لآليات المرض مع صور مجهرية ممتازة وربط إكلينيكى مع كل فصل. الأكثر مبيعاً بين طلبة الطب في الجزائر.",
    descriptionFr:
      "L'édition étudiante de la trilogie Robbins : explications claires des mécanismes pathologiques, images microscopiques et corrélations cliniques.",
    author: "Vinay Kumar",
    authorAr: "فيناي كومار",
    publisher: "Elsevier",
    isbn: "9780323679459",
    pages: 928,
    originLanguage: "English",
    price: 6900,
    oldPrice: 7900,
    discountPercent: 13,
    formats: C(6900, 2000, -1500),
    sampleText:
      "Cell injury is a fundamental concept in pathology. When cells are stressed beyond their capacity to adapt, a sequence of reversible and then irreversible changes unfolds.",
    cover: "https://covers.openlibrary.org/b/id/1786324-L.jpg",
    categorySlug: "pathology",
    edition: 10,
    editionYear: 2021,
    studyYear: "YEAR_3",
    quantity: 26,
    seriesId: "series-robbins",
    seriesOrder: 1,
    year: 2021,
    rating: 4.9,
    reviewsCount: 31,
    salesCount: 410,
    featured: true,
    bestSeller: true,
  },
  {
    title: "Robbins and Cotran Review of Pathology",
    titleAr: "مراجعة روبنز وكوتران لل病理ولوجيا",
    titleFr: "Robbins and Cotran Review of Pathology",
    slug: "robbins-cotran-review-pathology",
    description:
      "The perfect companion for exam preparation: thousands of USMLE-style questions with explanations mapped to every chapter of Robbins Basic Pathology.",
    descriptionAr:
      "الرفيق المثالي للاستعداد للاختبارات: آلاف الأسئلة بأسلوب USMLE مع شروحات مرتبطة بكل فصل من فصول أساسيات روبنز.",
    descriptionFr:
      "Le compagnon idéal pour les examens : des milliers de questions style USMLE avec explications alignées sur Robbins Basic Pathology.",
    author: "Edward Klatt",
    authorAr: "إدوارد كلات",
    publisher: "Elsevier",
    isbn: "9780323793094",
    pages: 360,
    originLanguage: "English",
    price: 4200,
    formats: C(4200, 1200, -900),
    cover: "https://covers.openlibrary.org/b/id/13200574-L.jpg",
    categorySlug: "pathology",
    edition: 6,
    editionYear: 2022,
    studyYear: "BOARD_PREP",
    quantity: 18,
    seriesId: "series-robbins",
    seriesOrder: 2,
    year: 2022,
    rating: 4.7,
    reviewsCount: 14,
    salesCount: 260,
    bestSeller: true,
  },
  {
    title: "Guyton and Hall Textbook of Medical Physiology",
    titleAr: "كتاب غايتن وهول للفسيولوجيا الطبية",
    titleFr: "Guyton and Hall — Physiologie médicale",
    slug: "guyton-hall-medical-physiology",
    description:
      "The clearest explanation of human physiology ever written. Graphs and clinical boxes make complex mechanisms intuitive — the physiology book every medical student ends up loving.",
    descriptionAr:
      "أوضح شرح للفسيولوجيا البشرية على الإطلاق. الرسوم والصناديق الإكلينيكية تجعل الآليات المعقدة مفهومة — الكتاب الذي يحبه كل طالب طب في النهاية.",
    descriptionFr:
      "L'explication la plus claire de la physiologie humaine. Graphiques et encadrés cliniques rendent les mécanismes complexes intuitifs.",
    author: "John Hall",
    authorAr: "جون هول",
    publisher: "Elsevier",
    isbn: "9780323946278",
    pages: 784,
    originLanguage: "English",
    price: 5900,
    formats: C(5900, 1800, -1200),
    sampleText:
      "The heart as a pump: cardiac output is the product of heart rate and stroke volume. Regulation of cardiac output is among the most elegant examples of physiological feedback.",
    cover: "https://covers.openlibrary.org/b/id/7903978-L.jpg",
    categorySlug: "physiology",
    edition: 14,
    editionYear: 2020,
    studyYear: "YEAR_2",
    quantity: 28,
    year: 2020,
    rating: 4.9,
    reviewsCount: 27,
    salesCount: 380,
    featured: true,
    bestSeller: true,
  },
  {
    title: "Davidson's Principles and Practice of Medicine",
    titleAr: "مبادئ و practice ديفيدسون للطب",
    titleFr: "Davidson — Principes et pratique de la médecine",
    slug: "davidsons-principles-practice-medicine",
    description:
      "The classic clinical companion that generations of students carry to the wards. Problem-oriented chapters, superb illustrations and an emphasis on clinical reasoning.",
    descriptionAr:
      "الرفيق الإكلينيكي الكلاسيكي الذي حمله أجيال من الطلبة إلى المصحات. فصول موجهة حول المشكلات مع رسوم ممتازة وتركيز على التفكير الإكلينيكي.",
    descriptionFr:
      "Le compagnon clinique classique des étudiants. Chapitres orientés problème, illustrations soignées et raisonnement clinique.",
    author: "Brian Walker",
    authorAr: "براين ووكر",
    publisher: "Elsevier",
    isbn: "9780702070266",
    pages: 768,
    originLanguage: "English",
    price: 5400,
    formats: C(5400, 1600, -1100),
    sampleText:
      "Clinical approach to the patient: history taking remains the single most powerful diagnostic tool available to a clinician, ahead of any investigation.",
    cover: "https://covers.openlibrary.org/b/id/9530010-L.jpg",
    categorySlug: "internal-medicine",
    edition: 25,
    editionYear: 2021,
    studyYear: "YEAR_4",
    quantity: 32,
    year: 2021,
    rating: 4.8,
    reviewsCount: 22,
    salesCount: 450,
    bestSeller: true,
  },
  {
    title: "Kumar and Clark's Clinical Medicine",
    titleAr: "الطب الإكلينيكي كومار وكلارك",
    titleFr: "Kumar & Clark — Médecine clinique",
    slug: "kumar-clark-clinical-medicine",
    description:
      "The clinical medicine reference students actually read end to end. Systems-based chapters with algorithms, key-points boxes and a genuinely readable style.",
    descriptionAr:
      "مرجع الطب الإكلينيكي الذي يقرأه الطلبة فعلاً من الغلاف إلى الغلاف. فصول على مستوى الأنظمة مع خوارزميات وصناديق نقاط مفتاحية.",
    descriptionFr:
      "La référence de médecine clinique que les étudiants lisent vraiment. Chapitres par systèmes, algorithmes et encadrés clés.",
    author: "Parveen Kumar",
    authorAr: "بارفين كومار",
    publisher: "Elsevier",
    isbn: "9780702078682",
    pages: 928,
    originLanguage: "English",
    price: 6200,
    formats: C(6200, 1800, -1300),
    cover: "https://covers.openlibrary.org/b/id/12665505-L.jpg",
    categorySlug: "internal-medicine",
    edition: 10,
    editionYear: 2021,
    studyYear: "YEAR_4",
    quantity: 30,
    year: 2021,
    rating: 4.8,
    reviewsCount: 19,
    salesCount: 340,
    featured: true,
    bestSeller: true,
  },
  {
    title: "Netter's Atlas of Human Anatomy",
    titleAr: "أطلس نيتر للتشريح البشري",
    titleFr: "Atlas de Netter — Anatomie humaine",
    slug: "netters-atlas-human-anatomy",
    description:
      "Frank Netter's legendary illustrations make this the most beautiful anatomy atlas ever printed. An essential companion for dissection and clinical anatomy.",
    descriptionAr:
      "رسوم فرانك نيتر الأسطورية تجعله أجمل أطلس تشريح طُبع ever. رفيق أساسي في التشريح العملي والتشريح الإكلينيكي.",
    descriptionFr:
      "Les illustrations légendaires de Frank Netter en font l'atlas d'anatomie le plus beau jamais imprimé.",
    author: "Frank Netter",
    authorAr: "فرانك نيتر",
    publisher: "Elsevier",
    isbn: "9780323613002",
    pages: 640,
    originLanguage: "English",
    price: 6800,
    formats: C(6800, 2200, -1400),
    cover: "https://covers.openlibrary.org/b/id/4292531-L.jpg",
    categorySlug: "anatomy",
    edition: 7,
    editionYear: 2019,
    studyYear: "YEAR_1",
    quantity: 24,
    year: 2019,
    rating: 4.9,
    reviewsCount: 16,
    salesCount: 280,
    bestSeller: true,
  },
  {
    title: "Gray's Anatomy for Students",
    titleAr: "غراي للطلبة",
    titleFr: "Gray's Anatomy for Students",
    slug: "grays-anatomy-for-students",
    description:
      "A modern, student-oriented reimagining of Gray's: concise text, imaging correlations and clinical boxes that fit the medical curriculum.",
    descriptionAr:
      "إعادة تصوّر عصرية موجهة للطلبة من غراي: نص موجز وربط بالتصوير الطبي وصناديق إكلينيكية تناسب المنهاج.",
    descriptionFr:
      "Une réinterprétation moderne et étudiante de Gray's : texte concis, imagerie et encadrés cliniques alignés sur le cursus.",
    author: "Richard Drake",
    authorAr: "ريتشارد دريك",
    publisher: "Elsevier",
    isbn: "9780323393041",
    pages: 1160,
    originLanguage: "English",
    price: 6400,
    formats: C(6400, 2000, -1400),
    cover: "https://covers.openlibrary.org/b/id/13140513-L.jpg",
    categorySlug: "anatomy",
    edition: 4,
    editionYear: 2020,
    studyYear: "YEAR_1",
    quantity: 27,
    seriesId: "series-gray",
    seriesOrder: 2,
    year: 2020,
    rating: 4.8,
    reviewsCount: 21,
    salesCount: 300,
  },
  {
    title: "Bates' Guide to Physical Examination",
    titleAr: "دليل بايت للفحص السريري والتاريخ",
    titleFr: "Bates — Examen clinique",
    slug: "bates-guide-physical-examination",
    description:
      "The definitive guide to patient examination and history taking, with step-by-step techniques, normal and abnormal findings and hundreds of clinical photos.",
    descriptionAr:
      "الدليل الأمثل لفحص المرضى وجمع التاريخ المرضي، مع تقنيات خطوة بخطوة وصور إكلينيكية للم normal والمعيب.",
    descriptionFr:
      "Le guide définitif de l'examen clinique et de l'anamnèse, avec techniques pas à pas et photos cliniques.",
    author: "Lynn Bickley",
    authorAr: "لين بيكللي",
    publisher: "Wolters Kluwer",
    isbn: "9781975145491",
    pages: 768,
    originLanguage: "English",
    price: 4900,
    formats: C(4900, 1500, -1000),
    sampleText:
      "Chapter 1 — General Survey and Vital Signs: The general survey begins the moment the patient walks into the room — posture, gait and facial expression already carry diagnostic information.",
    cover: "https://covers.openlibrary.org/b/id/8347978-L.jpg",
    categorySlug: "internal-medicine",
    edition: 13,
    editionYear: 2021,
    studyYear: "YEAR_3",
    quantity: 20,
    year: 2021,
    rating: 4.7,
    reviewsCount: 12,
    salesCount: 190,
    isNew: true,
  },
  {
    title: "Katzung Basic & Clinical Pharmacology",
    titleAr: "كاتسونغ الصيدلة الأساسية والإكلينيكية",
    titleFr: "Katzung — Pharmacologie fondamentale et clinique",
    slug: "katzung-basic-clinical-pharmacology",
    description:
      "The pharmacology textbook that balances mechanism with clinical use: every drug class explained, then applied to real patient scenarios.",
    descriptionAr:
      "كتاب الصيدلة الذي يوازن بين الآلية والاستعمال الإكلينيكي: كل عائلة أدوية تُشرح ثم تُطبَّق على حالات مرضى حقيقية.",
    descriptionFr:
      "Le manuel qui équilibre mécanisme et usage clinique : chaque classe de médicaments expliquée puis appliquée à des cas réels.",
    author: "Bertram Katzung",
    authorAr: "برترام كاتسونغ",
    publisher: "McGraw-Hill",
    isbn: "9781260116632",
    pages: 1248,
    originLanguage: "English",
    price: 5700,
    formats: C(5700, 1700, -1200),
    cover: "https://covers.openlibrary.org/b/id/4946724-L.jpg",
    categorySlug: "pharmacology",
    edition: 14,
    editionYear: 2021,
    studyYear: "YEAR_2",
    quantity: 25,
    year: 2021,
    rating: 4.7,
    reviewsCount: 15,
    salesCount: 220,
    bestSeller: true,
  },
  {
    title: "Sabiston Textbook of Surgery",
    titleAr: "كتاب سابيستون للجراحة",
    titleFr: "Sabiston — Traité de chirurgie",
    slug: "sabiston-textbook-surgery",
    description:
      "The cornerstone surgery reference: biological basis, operative techniques and evidence-based decision making across every surgical specialty.",
    descriptionAr:
      "المرجع الأساسى في الجراحة: الأساس البيولوجي، التقنيات الجراحية واتخاذ القرار القائم على الأدلة في كل تخصصات الجراحة.",
    descriptionFr:
      "La pierre angulaire de la chirurgie : bases biologiques, techniques opératoires et décision fondée sur les preuves.",
    author: "Courtney Townsend",
    authorAr: "كورتني تاونسند",
    publisher: "Elsevier",
    isbn: "9780323640633",
    pages: 1584,
    originLanguage: "English",
    price: 9800,
    formats: C(9800, 2800, -2200),
    cover: "https://covers.openlibrary.org/b/id/13104817-L.jpg",
    categorySlug: "surgery",
    edition: 20,
    editionYear: 2020,
    studyYear: "YEAR_5",
    quantity: 9,
    year: 2020,
    rating: 4.8,
    reviewsCount: 11,
    salesCount: 140,
    featured: true,
  },
  {
    title: "Nelson Textbook of Pediatrics",
    titleAr: "كتاب نيلسون لطب الأطفال",
    titleFr: "Nelson — Pédiatrie",
    slug: "nelson-textbook-pediatrics",
    description:
      "Two volumes of pediatric excellence covering every childhood disease, growth and development, and neonatology — the standard reference worldwide.",
    descriptionAr:
      "المجلدان المرجعيان في طب الأطفال: كل أمراض الطفولة، النمو والتطور وطب حديث الولادة — المرجع المقبول عالمياً.",
    descriptionFr:
      "Deux volumes de pédiatrie couvrant toutes les maladies de l'enfant, la croissance et le nouveau-né.",
    author: "Robert Kliegman",
    authorAr: "روبرت كليجمان",
    publisher: "Elsevier",
    isbn: "9780323528900",
    pages: 2976,
    originLanguage: "English",
    price: 11500,
    formats: C(11500, 3000, -2800),
    cover: "https://covers.openlibrary.org/b/id/5480734-L.jpg",
    categorySlug: "pediatrics",
    edition: 21,
    editionYear: 2020,
    studyYear: "YEAR_5",
    quantity: 10,
    year: 2020,
    rating: 4.8,
    reviewsCount: 9,
    salesCount: 95,
  },
  {
    title: "Williams Gynecology",
    titleAr: "ويليامز أمراض النساء والتوليد",
    titleFr: "Williams — Gynécologie",
    slug: "williams-gynecology",
    description:
      "A clinically oriented gynecology text with surgical illustrations, evidence-based algorithms and a strong focus on diagnosis and management.",
    descriptionAr:
      "كتاب إكلينيكي في أمراض النساء مع رسوم جراحية وخوارزميات قائمة على الأدلة وتركيز قوي على التشخيص والمعالجة.",
    descriptionFr:
      "Un traité de gynécologie orienté clinique : illustrations chirurgicales, algorithmes et gestion thérapeutique.",
    author: "Joseph Schaffer",
    authorAr: "جوزيف شافر",
    publisher: "McGraw-Hill",
    isbn: "9781260084962",
    pages: 1376,
    originLanguage: "English",
    price: 8700,
    formats: C(8700, 2500, -2000),
    cover: "https://covers.openlibrary.org/b/id/12415586-L.jpg",
    categorySlug: "obstetrics-gynecology",
    edition: 4,
    editionYear: 2019,
    studyYear: "YEAR_5",
    quantity: 11,
    year: 2019,
    rating: 4.6,
    reviewsCount: 8,
    salesCount: 80,
  },
  {
    title: "The ECG Made Easy",
    titleAr: "التخطيط الكهربائي للقلب ببساطة",
    titleFr: "The ECG Made Easy",
    slug: "ecg-made-easy",
    description:
      "The world's best-selling ECG primer. Simple language, hundreds of tracing examples and a practical approach that turns every student into a confident reader.",
    descriptionAr:
      "كتاب التخطيط الكهربائي الأكثر مبيعاً في العالم. لغة بسيطة ومئات الأمثلة ومقاربة عملية تجعل كل طالب قارئاً واثقاً.",
    descriptionFr:
      "Le manuel ECG le plus vendu au monde. Langage simple, centaines de tracés et approche pratique.",
    author: "John Hampton",
    authorAr: "جون هامبتون",
    publisher: "Elsevier",
    isbn: "9780702074776",
    pages: 208,
    originLanguage: "English",
    price: 2400,
    formats: C(2400, 700, -500),
    sampleText:
      "An ECG is simply a graph of the heart's electrical activity plotted against time. Learn to read it systematically: rate, rhythm, axis, then every wave in turn.",
    cover: "https://covers.openlibrary.org/b/id/6291596-L.jpg",
    categorySlug: "emergency-critical",
    edition: 8,
    editionYear: 2019,
    studyYear: "INTERNSHIP",
    quantity: 35,
    year: 2019,
    rating: 4.7,
    reviewsCount: 25,
    salesCount: 520,
    bestSeller: true,
  },
  {
    title: "Pocket Medicine",
    titleAr: "الطب الجيب (بوكت ميديسين)",
    titleFr: "Pocket Medicine",
    slug: "pocket-medicine",
    description:
      "The Massachusetts General Hospital handbook that lives in every resident's coat pocket: algorithms, normal values and management tables on the go.",
    descriptionAr:
      "دليل مستشفى ماساتشوستس العام الذي يحمله كل متربص في جيبه: خوارزميات وقيم طبيعية وجداول معالجة في أي وقت.",
    descriptionFr:
      "Le manuel du Massachusetts General Hospital, dans la poche de chaque interne : algorithmes et valeurs de référence.",
    author: "Marc Sabatine",
    authorAr: "مارك ساباتين",
    publisher: "Wolters Kluwer",
    isbn: "9781975161019",
    pages: 448,
    originLanguage: "English",
    price: 3200,
    formats: C(3200, 900, -700),
    cover: "https://covers.openlibrary.org/b/id/12772649-L.jpg",
    categorySlug: "pocket-guides",
    edition: 9,
    editionYear: 2022,
    studyYear: "INTERNSHIP",
    quantity: 34,
    year: 2022,
    rating: 4.8,
    reviewsCount: 17,
    salesCount: 430,
    isNew: true,
    featured: true,
  },
  {
    title: "Adams and Victor's Principles of Neurology",
    titleAr: "مبادئ آدامز وكتور في علم الأعصاب",
    titleFr: "Adams & Victor — Neurologie",
    slug: "adams-victor-neurology",
    description:
      "The classic neurology text known for its elegant clinical descriptions. Combines neuroanatomy, diagnosis and management in a readable narrative.",
    descriptionAr:
      "الكتاب الكلاسيكي في علم الأعصاب المعروف بوصوفه الإكلينيكي الراقي. يجمع التشريح العصبي والتشخيص والمعالجة في سرد مقروء.",
    descriptionFr:
      "Le classique de la neurologie, réputé pour ses descriptions cliniques élégantes.",
    author: "Allan Ropper",
    authorAr: "ألان روبر",
    publisher: "McGraw-Hill",
    isbn: "9781259860812",
    pages: 1408,
    originLanguage: "English",
    price: 8900,
    formats: C(8900, 2500, -2000),
    cover: "https://covers.openlibrary.org/b/id/7165305-L.jpg",
    categorySlug: "internal-medicine",
    edition: 12,
    editionYear: 2019,
    studyYear: "SPECIALIZATION",
    quantity: 8,
    year: 2019,
    rating: 4.7,
    reviewsCount: 10,
    salesCount: 110,
  },
  {
    title: "Murray and Nadel's Textbook of Respiratory Medicine",
    titleAr: "كتاب موراي ونادل لطب الأمراض الصدرية",
    titleFr: "Murray & Nadel — Médecine respiratoire",
    slug: "murray-nadel-respiratory-medicine",
    description:
      "The definitive reference for pulmonary medicine: physiology, imaging, interstitial disease, infection and critical care written by the field's leaders.",
    descriptionAr:
      "المرجع الأمثل في أمراض الصدر: الفسيولوجيا والتصوير والأمراض والعدوى والرعاية الحرجة بأقلام رواد التخصص.",
    descriptionFr:
      "La référence en pneumologie : physiologie, imagerie, maladies interstitielles, infection et réanimation.",
    author: "V. Courtney Broaddus",
    authorAr: "كورتني بروداس",
    publisher: "Elsevier",
    isbn: "9780323674515",
    pages: 2560,
    originLanguage: "English",
    price: 10900,
    formats: C(10900, 2800, -2500),
    cover: "https://covers.openlibrary.org/b/id/1358056-L.jpg",
    categorySlug: "internal-medicine",
    edition: 7,
    editionYear: 2020,
    studyYear: "SPECIALIZATION",
    quantity: 7,
    year: 2020,
    rating: 4.6,
    reviewsCount: 7,
    salesCount: 70,
  },
  {
    title: "Surgery: Basic Science and Clinical Evidence",
    titleAr: "الجراحة: الأساس العلمي والدليل الإكلينيكي",
    titleFr: "Chirurgie — Sciences fondamentales et preuves cliniques",
    slug: "surgery-basic-science-clinical-evidence",
    description:
      "A evidence-first surgery reference linking basic science to operative decisions, with critical appraisal of the trials that shape modern practice.",
    descriptionAr:
      "مرجع جراحي يضع الدليل أولاً، يربط الأساس العلمي بالقرارات الجراحية مع تقدير حرج للتجارب التي شكلت الممارسة الحديثة.",
    descriptionFr:
      "Un traité de chirurgie fondé sur les preuves, reliant sciences fondamentales et décisions opératoires.",
    author: "Philip Barie",
    authorAr: "فيليب باري",
    publisher: "Springer",
    isbn: "9780387941158",
    pages: 1312,
    originLanguage: "English",
    price: 7600,
    formats: C(7600, 2200, -1600),
    cover: "https://covers.openlibrary.org/b/id/1191574-L.jpg",
    categorySlug: "surgery",
    edition: 2,
    editionYear: 2018,
    studyYear: "YEAR_5",
    quantity: 13,
    year: 2018,
    rating: 4.5,
    reviewsCount: 6,
    salesCount: 55,
  },
  {
    title: "Carranza's Clinical Periodontology",
    titleAr: "البارودونتيا السريرية (كارانزا)",
    titleFr: "Carranza's Clinical Periodontology",
    slug: "carranza-clinical-periodontology",
    description:
      "The periodontology standard: etiology, diagnosis and step-by-step surgical and non-surgical treatment of periodontal disease, with full-color clinical photography.",
    descriptionAr:
      "المرجع القياسي في البارودونتيا: الأسباب والتشخيص وخطوات العلاج الجراحي والغير جراحي لأمراض اللثة، مع صور سريرية ملونة.",
    descriptionFr:
      "La référence en parodontologie : étiologie, diagnostic et traitement chirurgical ou non, étape par étape, avec photographies cliniques en couleurs.",
    author: "Michael G. Newman",
    authorAr: "مايكل نيومان",
    publisher: "Elsevier",
    isbn: "9780323188241",
    pages: 832,
    originLanguage: "English",
    price: 5900,
    formats: C(5900, 1800, -1300),
    cover: "https://covers.openlibrary.org/b/id/1786178-L.jpg",
    categorySlug: "dentistry",
    edition: 13,
    editionYear: 2023,
    studyYear: "SPECIALIZATION",
    quantity: 12,
    year: 2023,
    rating: 4.6,
    reviewsCount: 6,
    salesCount: 48,
    featured: true,
  },
  {
    title: "Brunner & Suddarth's Medical-Surgical Nursing",
    titleAr: "تمريض الطب والجراحة (برنر وسودارث)",
    titleFr: "Brunner & Suddarth's Medical-Surgical Nursing",
    slug: "brunner-suddarth-medical-surgical-nursing",
    description:
      "The nursing classic covering pathophysiology, assessment and evidence-based management of adult medical-surgical conditions, organized by body system.",
    descriptionAr:
      "المرجع الكلاسيكي في التريض: الباثوفيزيولوجيا والتقييم والعلاج القائم على الأدلة لحالات الباطنة والجراحة عند الكبار، مرتباً حسب أجهزة الجسم.",
    descriptionFr:
      "Le classique des soins infirmiers : physiopathologie, évaluation et prise en charge des affections médicales et chirurgicales de l'adulte.",
    author: "Suzanne C. Smeltzer",
    authorAr: "سوزان سميلتزر",
    publisher: "Wolters Kluwer",
    isbn: "9781608310807",
    pages: 1408,
    originLanguage: "English",
    price: 6800,
    formats: C(6800, 2000, -1400),
    cover: "https://covers.openlibrary.org/b/id/8597627-L.jpg",
    categorySlug: "nursing-allied",
    edition: 14,
    editionYear: 2021,
    studyYear: "YEAR_3",
    quantity: 15,
    year: 2021,
    rating: 4.7,
    reviewsCount: 8,
    salesCount: 62,
    featured: true,
    isNew: true,
  },
  {
    title: "Kinesiology of the Musculoskeletal System",
    titleAr: "كينيولوجيا جهاز العضلات الهيكلية",
    titleFr: "Kinesiology of the Musculoskeletal System",
    slug: "kinesiology-musculoskeletal-system",
    description:
      "A complete clinical kinesiology text linking anatomy, biomechanics and pathology to functional movement, with hundreds of illustrations for therapists.",
    descriptionAr:
      "كتاب كامل في الكينيولوجيا السريرية يربط التشريح والميكانيكا الحيوية والمرض بالحركة الوظيفية، مع مئات الرسوم لطلبة العلاج الطبيعي.",
    descriptionFr:
      "Un traité complet de kinésiologie clinique reliant anatomie, biomécanique et pathologie au mouvement fonctionnel.",
    author: "Donald A. Neumann",
    authorAr: "دونالد نيومان",
    publisher: "Elsevier",
    isbn: "9780323287531",
    pages: 760,
    originLanguage: "English",
    price: 7200,
    formats: C(7200, 2200, -1500),
    cover: "https://covers.openlibrary.org/b/id/12826634-L.jpg",
    categorySlug: "physical-therapy",
    edition: 6,
    editionYear: 2017,
    studyYear: "YEAR_3",
    quantity: 10,
    year: 2017,
    rating: 4.8,
    reviewsCount: 5,
    salesCount: 36,
  },
  {
    title: "Henry's Clinical Diagnosis and Management by Laboratory Methods",
    titleAr: "التشخيص والعلاج المخبري (هنري)",
    titleFr: "Henry's Clinical Diagnosis and Management by Laboratory Methods",
    slug: "henrys-clinical-laboratory-methods",
    description:
      "A practical guide to clinical laboratory testing: selection and interpretation of analyses, quality control and evidence-based use of laboratory data.",
    descriptionAr:
      "دليل عملي للاختبارات المخبرية: اختيار الفحوص وتفسيرها ومراقبة الجودة واستخدام البيانات المخبرية استناداً إلى الأدلة.",
    descriptionFr:
      "Guide pratique du laboratoire : choix et interprétation des analyses, contrôle qualité et utilisation raisonnée des données.",
    author: "Robert L. Henry",
    authorAr: "روبرت هنري",
    publisher: "Elsevier",
    isbn: "9781416061855",
    pages: 768,
    originLanguage: "English",
    price: 6900,
    formats: C(6900, 2000, -1400),
    cover: "https://covers.openlibrary.org/b/id/14318716-L.jpg",
    categorySlug: "lab-sciences",
    edition: 23,
    editionYear: 2021,
    studyYear: "YEAR_3",
    quantity: 9,
    year: 2021,
    rating: 4.5,
    reviewsCount: 4,
    salesCount: 30,
  },
  {
    title: "Brant and Helms' Fundamentals of Diagnostic Radiology",
    titleAr: "أساسيات الأشعة التشخيصية (برانت وهيلمز)",
    titleFr: "Brant and Helms' Fundamentals of Diagnostic Radiology",
    slug: "brant-helms-diagnostic-radiology",
    description:
      "The imaging backbone for students and residents: systematic coverage of radiography, CT, MRI, ultrasound and interventional radiology by organ system.",
    descriptionAr:
      "المرجع الأساسي في التصوير الطبي: تغطية منهجية للأشعة السينية والتصوير المقطعي والرنين والموجات فوق الصوتية حسب أجهزة الجسم.",
    descriptionFr:
      "La référence en imagerie diagnostique : radiographie, TDM, IRM, échographie et radiologie interventionnelle, système par système.",
    author: "William Brant",
    authorAr: "ويليام برانت",
    publisher: "Lippincott Williams & Wilkins",
    isbn: "9781496367396",
    pages: 1648,
    originLanguage: "English",
    price: 9500,
    formats: C(9500, 2600, -2000),
    cover: "https://covers.openlibrary.org/b/id/9332607-L.jpg",
    categorySlug: "radiology",
    edition: 5,
    editionYear: 2019,
    studyYear: "YEAR_4",
    quantity: 11,
    year: 2019,
    rating: 4.7,
    reviewsCount: 7,
    salesCount: 42,
  },
  {
    title: "First Aid for the USMLE Step 1",
    titleAr: "الدليل الأول لامتحان USMLE Step 1",
    titleFr: "First Aid for the USMLE Step 1",
    slug: "first-aid-usmle-step-1",
    description:
      "The best-selling USMLE review: high-yield facts, mnemonics and rapid review notes condensed from the entire medical school curriculum.",
    descriptionAr:
      "الكتاب الأكثر مبيعاً لمراجعة USMLE: حقائق عالية العائد وتقنيات حفظ ومراجعات سريعة مكثفة من مناهج مدرسة الطب كاملة.",
    descriptionFr:
      "La revue USMLE la plus vendue : faits clés, mnémotechniques et notes de révision issus du cursus médical.",
    author: "Tao Le",
    authorAr: "تاو لي",
    publisher: "McGraw-Hill",
    isbn: "9780071429481",
    pages: 832,
    originLanguage: "English",
    price: 4600,
    formats: C(4600, 1400, -900),
    cover: "https://covers.openlibrary.org/b/id/60567-L.jpg",
    categorySlug: "board-exams",
    edition: 35,
    editionYear: 2025,
    studyYear: "BOARD_PREP",
    quantity: 40,
    seriesId: "series-usmle",
    seriesOrder: 1,
    year: 2025,
    rating: 4.8,
    reviewsCount: 22,
    salesCount: 210,
    featured: true,
    bestSeller: true,
    isNew: true,
  },
  {
    title: "First Aid for the USMLE Step 2 CK",
    titleAr: "الدليل الأول لامتحان USMLE Step 2 CK",
    titleFr: "First Aid for the USMLE Step 2 CK",
    slug: "first-aid-usmle-step-2ck",
    description:
      "The clinical companion to Step 1: case-based high-yield reviews of internal medicine, surgery, pediatrics, obstetrics and psychiatry for CK preparation.",
    descriptionAr:
      "الرفيق السريري لـ Step 1: مراجعات حالات عالية العائد في الباطنة والجراحة والأطفال والولادة والطب النفسي للتحضير لاختبار CK.",
    descriptionFr:
      "Le compagnon clinique de Step 1 : revues par cas haute densité en médecine interne, chirurgie, pédiatrie, obstétrique et psychiatrie.",
    author: "Tao Le",
    authorAr: "تاو لي",
    publisher: "McGraw-Hill",
    isbn: "9780071487955",
    pages: 704,
    originLanguage: "English",
    price: 4600,
    formats: C(4600, 1400, -900),
    cover: "https://covers.openlibrary.org/b/id/60069-L.jpg",
    categorySlug: "board-exams",
    edition: 13,
    editionYear: 2025,
    studyYear: "BOARD_PREP",
    quantity: 36,
    seriesId: "series-usmle",
    seriesOrder: 2,
    year: 2025,
    rating: 4.7,
    reviewsCount: 14,
    salesCount: 130,
    isNew: true,
  },
  {
    title: "Dorland's Illustrated Medical Dictionary",
    titleAr: "معجم دورلاند الطبي المرئي",
    titleFr: "Dorland's Illustrated Medical Dictionary",
    slug: "dorlands-illustrated-medical-dictionary",
    description:
      "The most trusted medical dictionary for over 125 years: precise definitions of more than 40,000 terms with illustrations.",
    descriptionAr:
      "أكثر المعاجم الطبية ثقة منذ أكثر من 125 عاماً: تعريفات دقيقة لأكثر من 40000 مصطلح مع الرسوم التوضيحية.",
    descriptionFr:
      "Le dictionnaire médical de référence depuis plus de 125 ans : plus de 40 000 définitions illustrées.",
    author: "William A. N. Dorland",
    authorAr: "ويليام دورلاند",
    publisher: "Elsevier",
    isbn: "9781416062578",
    pages: 1248,
    originLanguage: "English",
    price: 5200,
    formats: C(5200, 1600, -1100),
    cover: "https://covers.openlibrary.org/b/id/6928126-L.jpg",
    categorySlug: "atlases-dictionaries",
    edition: 34,
    editionYear: 2023,
    studyYear: "CONTINUING_ED",
    quantity: 22,
    year: 2023,
    rating: 4.6,
    reviewsCount: 9,
    salesCount: 78,
    bestSeller: true,
  },
  {
    title: "Oxford Handbook of Clinical Medicine",
    titleAr: "دليل أكسفورد للطب السريري",
    titleFr: "Oxford Handbook of Clinical Medicine",
    slug: "oxford-handbook-clinical-medicine",
    description:
      "The pocket classic of ward medicine: concise coverage of symptoms, investigations and treatments in a format that fits a coat pocket.",
    descriptionAr:
      "دليل الجيب الكلاسيكي في الطب السريري: موجز وعملي يغطي الأعراض والفحوصات والعلاجات في حجم جيب المعطف.",
    descriptionFr:
      "Le classique de poche de la médecine hospitalière : symptômes, examens et traitements, format veste.",
    author: "Richard A. Hope",
    authorAr: "ريتشارد هوب",
    publisher: "Oxford",
    isbn: "9780199603121",
    pages: 760,
    originLanguage: "English",
    price: 5300,
    formats: C(5300, 1500, -1100),
    cover: "https://covers.openlibrary.org/b/id/2333694-L.jpg",
    categorySlug: "pocket-guides",
    edition: 10,
    editionYear: 2023,
    studyYear: "YEAR_4",
    quantity: 18,
    year: 2023,
    rating: 4.8,
    reviewsCount: 12,
    salesCount: 95,
    featured: true,
    isNew: true,
  },
  {
    title: "Anesthesia Equipment: Principles and Application",
    titleAr: "أجهزة التخدير: المبادئ والتطبيقات",
    titleFr: "Anesthesia Equipment: Principles and Application",
    slug: "anesthesia-equipment-principles-application",
    description:
      "A practical tour of the anesthesia workstation: vaporizers, ventilators, monitoring and machine troubleshooting explained for clinicians and engineers.",
    descriptionAr:
      "جولة عملية في محطة التخدير: البخاخات وأجهزة التنفس وأنظمة المراقبة واستكشاف أعطال الجهاز، مشروحة للطاقم الطبي والمهندسين.",
    descriptionFr:
      "Panorama pratique du poste d'anesthésie : vapeurs, ventilateurs, surveillance et dépannage des appareils.",
    author: "John Ehrenwerth",
    authorAr: "جون إيرنورث",
    publisher: "Elsevier",
    isbn: "9780323112376",
    pages: 640,
    originLanguage: "English",
    price: 7800,
    formats: C(7800, 2200, -1600),
    cover: "https://covers.openlibrary.org/b/id/5107607-L.jpg",
    categorySlug: "medical-devices",
    edition: 3,
    editionYear: 2022,
    studyYear: "SPECIALIZATION",
    quantity: 8,
    year: 2022,
    rating: 4.5,
    reviewsCount: 3,
    salesCount: 22,
  },
  {
    title: "Cummings Otolaryngology: Head and Neck Surgery",
    titleAr: "كامينغج لجراحة الأنف والأذن والعنق",
    titleFr: "Cummings Otolaryngology: Head and Neck Surgery",
    slug: "cummings-otolaryngology",
    description:
      "The definitive ENT reference covering otology, rhinology, head and neck surgery and laryngology with operative techniques and outcomes.",
    descriptionAr:
      "المرجع الحاسم في أنف وأذن وحنجرة: طب الأذن والأنف وجراحة الرأس والعنق والحنجرة مع تقنيات الجراحة ونتائجها.",
    descriptionFr:
      "La référence ORL : otologie, rhinologie, chirurgie tête et cou et laryngologie, avec techniques opératoires et résultats.",
    author: "Paul W. Flint",
    authorAr: "بول فلينت",
    publisher: "Elsevier",
    isbn: "9789997639509",
    pages: 2600,
    originLanguage: "English",
    price: 13500,
    formats: C(13500, 3200, -3000),
    cover: "https://covers.openlibrary.org/b/id/5451364-L.jpg",
    categorySlug: "ent",
    edition: 7,
    editionYear: 2021,
    studyYear: "SPECIALIZATION",
    quantity: 7,
    year: 2021,
    rating: 4.7,
    reviewsCount: 5,
    salesCount: 28,
  },
  {
    title: "Vaughan & Asbury's General Ophthalmology",
    titleAr: "الطب العام للعيون (فوغان وأسباوري)",
    titleFr: "Vaughan & Asbury's General Ophthalmology",
    slug: "vaughan-asbury-general-ophthalmology",
    description:
      "The concise ophthalmology standard: diagnostic approach, examination techniques and management of the full range of eye diseases.",
    descriptionAr:
      "المرجع الموجز في طب العيون: منهجية التشخيص وتقنيات الفحص وعلاج أمراض العين الشائعة والنادرة.",
    descriptionFr:
      "La référence concise en ophtalmologie : diagnostic, examen et prise en charge des maladies de l'œil.",
    author: "Paul Kaufman",
    authorAr: "بول كوفمان",
    publisher: "Lippincott Williams & Wilkins",
    isbn: "9780870411038",
    pages: 544,
    originLanguage: "English",
    price: 4900,
    formats: C(4900, 1400, -1000),
    cover: "https://covers.openlibrary.org/b/id/5093718-L.jpg",
    categorySlug: "ophthalmology",
    edition: 21,
    editionYear: 2023,
    studyYear: "YEAR_4",
    quantity: 12,
    year: 2023,
    rating: 4.6,
    reviewsCount: 6,
    salesCount: 40,
  },
  {
    title: "Kaplan & Sadock's Synopsis of Psychiatry",
    titleAr: "ملخص الطب النفسي (كابلان وسا독)",
    titleFr: "Kaplan & Sadock's Synopsis of Psychiatry",
    slug: "kaplan-sadock-synopsis-psychiatry",
    description:
      "The behavioral sciences summary used worldwide: diagnostic criteria, pharmacology and psychosocial treatments of every major psychiatric disorder.",
    descriptionAr:
      "ملخص العلوم السلوكية المعتمد عالمياً: معايير التشخيص والعلاج الدوائي والنفسي لكل اضطراب نفسي رئيسي.",
    descriptionFr:
      "La synthèse en psychiatrie utilisée dans le monde entier : critères diagnostiques, pharmacologie et traitements.",
    author: "Benjamin J. Sadock",
    authorAr: "بنجامين سادوك",
    publisher: "Wolters Kluwer",
    isbn: "9780781731836",
    pages: 1440,
    originLanguage: "English",
    price: 8300,
    formats: C(8300, 2400, -1800),
    cover: "https://covers.openlibrary.org/b/id/533147-L.jpg",
    categorySlug: "psychiatry",
    edition: 12,
    editionYear: 2021,
    studyYear: "YEAR_5",
    quantity: 10,
    year: 2021,
    rating: 4.7,
    reviewsCount: 7,
    salesCount: 45,
  },
  {
    title: "Harper's Illustrated Biochemistry",
    titleAr: "الكيمياء الحيوية المرئية (هاربر)",
    titleFr: "Harper's Illustrated Biochemistry",
    slug: "harpers-illustrated-biochemistry",
    description:
      "Biochemistry made memorable: clear explanations of metabolism, molecular biology and clinical correlates, illustrated for first-year review.",
    descriptionAr:
      "الكيمياء الحيوية بشكل ممتع: شرح واضح للأيض والأحياء الجزيئية والربط الإكلينيكى مع رسوم توضيحية لطلبة السنة الأولى.",
    descriptionFr:
      "La biochimie de façon mémorable : métabolisme, biologie moléculaire et corrélations cliniques, illustrés.",
    author: "Robert K. Murray",
    authorAr: "روبرت موري",
    publisher: "McGraw-Hill",
    isbn: "9780071461979",
    pages: 800,
    originLanguage: "English",
    price: 4900,
    formats: C(4900, 1400, -1000),
    cover: "https://covers.openlibrary.org/b/id/8657891-L.jpg",
    categorySlug: "biochemistry",
    edition: 31,
    editionYear: 2021,
    studyYear: "YEAR_1",
    quantity: 22,
    year: 2021,
    rating: 4.7,
    reviewsCount: 10,
    salesCount: 80,
  },
  {
    title: "Junqueira's Basic Histology: Text and Atlas",
    titleAr: "أساسيات الأنسجة (جونكيرا): نص ومجموعة",
    titleFr: "Junqueira's Basic Histology: Text and Atlas",
    slug: "junqueiras-basic-histology",
    description:
      "The histology standard pairing concise text with superb micrographs, chapter summaries and review questions for the laboratory curriculum.",
    descriptionAr:
      "المرجع في علم الأنسجة: نص موجز مع صور مجهرية ممتازة وملخصات وأسئلة مراجعة لمناهج المختبرات.",
    descriptionFr:
      "La référence en histologie : texte concis, superbes micrographes et questions de révision.",
    author: "Leonor C. Junqueira",
    authorAr: "ليونور جونكيرا",
    publisher: "McGraw-Hill",
    isbn: "9781260462982",
    pages: 448,
    originLanguage: "English",
    price: 4600,
    formats: C(4600, 1300, -900),
    cover: "https://covers.openlibrary.org/b/id/12424298-L.jpg",
    categorySlug: "histology-embryology",
    edition: 16,
    editionYear: 2021,
    studyYear: "YEAR_1",
    quantity: 24,
    year: 2021,
    rating: 4.8,
    reviewsCount: 11,
    salesCount: 85,
    featured: true,
    bestSeller: true,
  },
  {
    title: "Jawetz, Melnick & Adelberg's Medical Microbiology",
    titleAr: "الميكروبيولوجيا الطبية (جاويتز)",
    titleFr: "Jawetz, Melnick & Adelberg's Medical Microbiology",
    slug: "jawetz-medical-microbiology",
    description:
      "A streamlined microbiology classic: bacteriology, virology, mycology and immunology distilled into clinically oriented chapters.",
    descriptionAr:
      "كلاسيكية ميكروبيولوجيا موجزة: بكتريات وفيروسات وفطريات ومناعة في فصول مركزة على الجانب الإكلينيكى.",
    descriptionFr:
      "Un classique de microbiologie allégé : bactériologie, virologie, mycologie et immunologie orientés clinique.",
    author: "Ernest Jawetz",
    authorAr: "إرنست جاويتز",
    publisher: "McGraw-Hill",
    isbn: "9780838563168",
    pages: 432,
    originLanguage: "English",
    price: 4300,
    formats: C(4300, 1200, -900),
    cover: "https://covers.openlibrary.org/b/id/5384678-L.jpg",
    categorySlug: "microbiology-immunology",
    edition: 29,
    editionYear: 2024,
    studyYear: "YEAR_2",
    quantity: 16,
    year: 2024,
    rating: 4.6,
    reviewsCount: 6,
    salesCount: 50,
  },
  {
    title: "Fitzpatrick's Dermatology",
    titleAr: "الأمراض الجلدية (فيتزباتريك)",
    titleFr: "Fitzpatrick's Dermatology",
    slug: "fitzpatricks-dermatology",
    description:
      "The comprehensive dermatology reference: clinical recognition, differential diagnosis and therapy of skin, hair and nail diseases, with an outstanding image bank.",
    descriptionAr:
      "المرجع الشامل في الأمراض الجلدية: التعرف السريري والتشخيص التفريقي والعلاج لأمراض الجلد والشعر والأظافر مع بنك صور فريد.",
    descriptionFr:
      "La référence complète en dermatologie : reconnaissance clinique, diagnostic différentiel et traitement, banque d'images exceptionnelle.",
    author: "Thomas B. Fitzpatrick",
    authorAr: "توماس فيتزباتريك",
    publisher: "McGraw-Hill",
    isbn: "9780071380764",
    pages: 2640,
    originLanguage: "English",
    price: 12800,
    formats: C(12800, 3000, -2800),
    cover: "https://covers.openlibrary.org/b/id/12797227-L.jpg",
    categorySlug: "dermatology",
    edition: 9,
    editionYear: 2019,
    studyYear: "YEAR_5",
    quantity: 6,
    year: 2019,
    rating: 4.6,
    reviewsCount: 4,
    salesCount: 25,
    isNew: true,
  },
  {
    title: "Tintinalli's Emergency Medicine: A Comprehensive Study Guide",
    titleAr: "طب الطوارئ (تينتينالي): دليل دراسة شامل",
    titleFr: "Tintinalli's Emergency Medicine: A Comprehensive Study Guide",
    slug: "tintinallis-emergency-medicine",
    description:
      "The emergency medicine standard: evidence-based diagnosis and management of thousands of acute presentations, formatted for point-of-care use.",
    descriptionAr:
      "المرجع في طب الطوارئ: تشخيص وعلاج آلاف الحالات الحادة استناداً إلى الأدلة، بصيغة تُستخدم مباشرة عند المريض.",
    descriptionFr:
      "La référence en urgences : diagnostic et prise en charge fondés sur les preuves de milliers de situations aiguës.",
    author: "Judith E. Tintinalli",
    authorAr: "جوديث تينتينالي",
    publisher: "McGraw-Hill",
    isbn: "9781259921643",
    pages: 2496,
    originLanguage: "English",
    price: 9900,
    formats: C(9900, 2600, -2200),
    cover: "https://covers.openlibrary.org/b/id/13326500-L.jpg",
    categorySlug: "emergency-critical",
    edition: 9,
    editionYear: 2020,
    studyYear: "INTERNSHIP",
    quantity: 13,
    year: 2020,
    rating: 4.8,
    reviewsCount: 9,
    salesCount: 55,
    featured: true,
  },
];

const reviews: {
  bookSlug: string;
  name: string;
  city: string;
  stars: number;
  comment: string;
  helpful: number;
}[] = [
  {
    bookSlug: "robbins-basic-pathology",
    name: "Amine K.",
    city: "Alger",
    stars: 5,
    comment: "L'édition est originale et les images microscopiques sont superbes. Livré en 48h à Bab Ezzouar.",
    helpful: 12,
  },
  {
    bookSlug: "robbins-basic-pathology",
    name: "سارة ب.",
    city: "قسنطينة",
    stars: 5,
    comment: "أفضل كتاب باثولوغي للتحضير للامتحان، الطبعة أصلية والسعر معقول مقارنة بالسوق.",
    helpful: 9,
  },
  {
    bookSlug: "guyton-hall-medical-physiology",
    name: "Yacine M.",
    city: "Oran",
    stars: 5,
    comment: "Le roi de la physiologie. Les schémas sont clairs et le papier est de qualité.",
    helpful: 15,
  },
  {
    bookSlug: "netters-atlas-human-anatomy",
    name: "Lina B.",
    city: "Annaba",
    stars: 5,
    comment: "رسوم نيتر لا تُقارن بأي كتاب آخر. الطبعة أصلية والتوصيل كان سريعاً إلى عنابة.",
    helpful: 21,
  },
  {
    bookSlug: "bates-guide-physical-examination",
    name: "Karim T.",
    city: "Sétif",
    stars: 4,
    comment: "Très bon guide pratique, mais j'aurais aimé plus d'images en couleur pour l'examen clinique.",
    helpful: 6,
  },
  {
    bookSlug: "davidsons-principles-practice-medicine",
    name: "Nour H.",
    city: "Tizi Ouzou",
    stars: 5,
    comment: "Le compagnon idéal des stages. Les chapitres orientés problèmes sont parfaits pour l'externat.",
    helpful: 11,
  },
  {
    bookSlug: "harrisons-principles-internal-medicine",
    name: "Meriem A.",
    city: "Blida",
    stars: 5,
    comment: "هدية مثالية لابن أخي. الكتاب أصلي والسعر أفضل من المكتبات المحلية.",
    helpful: 8,
  },
  {
    bookSlug: "ecg-made-easy",
    name: "Dr. Farid Z.",
    city: "Constantine",
    stars: 5,
    comment: "Encore le meilleur intro ECG pour les stagiaires. Je l'offre à chaque nouvel interne.",
    helpful: 19,
  },
  {
    bookSlug: "grays-anatomy",
    name: "Sofiane L.",
    city: "Alger",
    stars: 5,
    comment: "Édition reliée magnifique, papier épais. Un investissement pour toute la carrière.",
    helpful: 10,
  },
  {
    bookSlug: "adams-victor-neurology",
    name: "Imane R.",
    city: "Oran",
    stars: 5,
    comment: "شرح ممتاز لعلم الأعصاب، خصوصاً فصول الدماغ. وصلني الكتاب في 3 أيام.",
    helpful: 14,
  },
  {
    bookSlug: "grays-anatomy-for-students",
    name: "Aya S.",
    city: "Béjaïa",
    stars: 5,
    comment: "Édition claire et illustrée, parfaite pour réviser l'anatomie avant les examens.",
    helpful: 7,
  },
  {
    bookSlug: "kumar-clark-clinical-medicine",
    name: "Riad B.",
    city: "Batna",
    stars: 5,
    comment: "Acheté pour le concours de résidanat. Livraison rapide et facture incluse.",
    helpful: 13,
  },
  {
    bookSlug: "pocket-medicine",
    name: "Hiba M.",
    city: "Annaba",
    stars: 5,
    comment: "حجم مثالي للمصحات، القيم الطبيعية والخوارزميات مفيدة جداً في الطوارئ.",
    helpful: 9,
  },
  {
    bookSlug: "katzung-basic-clinical-pharmacology",
    name: "Oussama D.",
    city: "Tlemcen",
    stars: 4,
    comment: "كتاب مرجعي في الصيدلة الدوائية. الفصول مرتبة بشكل ممتاز مع جداول ملخصة.",
    helpful: 5,
  },
  {
    bookSlug: "sabiston-textbook-surgery",
    name: "Rania F.",
    city: "Sétif",
    stars: 5,
    comment: "المرجع الأمثل في الجراحة. الطبعة أصلية والورق ممتاز، يستحق الثمن.",
    helpful: 8,
  },
];

const bundles = [
  {
    slug: "med-starter-pack",
    title: "Medical Starter Pack",
    titleAr: "حزمة الطالب الطبي المبتدئ",
    titleFr: "Pack étudiant en médecine",
    description:
      "The three books every first-year medical student in Algeria ends up buying: Davidson for clinical medicine, Guyton for physiology and Kumar & Clark as the daily companion.",
    price: 14900,
    oldPrice: 17500,
    cover: "https://covers.openlibrary.org/b/id/9530010-L.jpg",
    bookSlugs: ["davidsons-principles-practice-medicine", "guyton-hall-medical-physiology", "kumar-clark-clinical-medicine"],
  },
  {
    slug: "clinical-skills-pack",
    title: "Clinical Skills Pack",
    titleAr: "حزمة المهارات الإكلينيكية",
    titleFr: "Pack compétences cliniques",
    description:
      "Three practical companions for externat and internship: Bates for physical examination, The ECG Made Easy for arrhythmias and Pocket Medicine for the ward.",
    price: 9400,
    oldPrice: 10500,
    cover: "https://covers.openlibrary.org/b/id/8347978-L.jpg",
    bookSlugs: ["bates-guide-physical-examination", "ecg-made-easy", "pocket-medicine"],
  },
];

const orders = [
  {
    code: "MDZ-TEST01",
    customerName: "Amine Kessai",
    phone: "0550123456",
    wilaya: "16",
    commune: "Bab Ezzouar",
    address: null,
    shippingType: "STOP_DESK" as const,
    paymentMethod: "COD" as const,
    subtotal: 6900,
    shippingFee: 400,
    discount: 690,
    promoCode: "MEDZ10",
    total: 6610,
    status: "DELIVERED" as const,
    itemsCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    items: [
      { bookSlug: "robbins-basic-pathology", format: "paperback", price: 6210, quantity: 1 },
    ],
  },
  {
    code: "MDZ-TEST02",
    customerName: "Nour Hamidi",
    phone: "0661234567",
    wilaya: "31",
    commune: "Oran",
    address: "Cité AADL, Es Sénia",
    shippingType: "A_DOMICILE" as const,
    paymentMethod: "COD" as const,
    subtotal: 8600,
    shippingFee: 600,
    discount: 0,
    promoCode: null,
    total: 9200,
    status: "SHIPPED" as const,
    itemsCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    items: [
      { bookSlug: "kumar-clark-clinical-medicine", format: "paperback", price: 6200, quantity: 1 },
      { bookSlug: "ecg-made-easy", format: "paperback", price: 2400, quantity: 1 },
    ],
  },
];

const shippingCompanies = [
  {
    name: "Yalidine",
    nameAr: "يلدين",
    nameFr: "Yalidine",
    code: "YALIDINE",
    trackingUrl: "https://yalidine.com/en/tracking-parcel",
    active: true,
  },
  {
    name: "ZR Express",
    nameAr: "زد أر إكسبريس",
    nameFr: "ZR Express",
    code: "ZR_EXPRESS",
    trackingUrl: "https://www.zrexpress.com/",
    active: true,
  },
  {
    name: "Maystro Delivery",
    nameAr: "مايسترو ديلايفري",
    nameFr: "Maystro Delivery",
    code: "MAYSTRO",
    trackingUrl: "https://www.maystro-delivery.com/",
    active: true,
  },
  {
    name: "Noest",
    nameAr: "نوست",
    nameFr: "Noest",
    code: "NOEST",
    trackingUrl: "https://noest.net/",
    active: true,
  },
];

const giftCards: {
  code: string;
  amount: number;
  message?: string;
  buyerName?: string;
  isUsed?: boolean;
  usedAt?: Date;
  usedByOrder?: string;
  expiresAt?: Date;
  items: { slug: string; quantity: number }[];
}[] = [
  {
    code: "MEDZ-GIFT-2000",
    amount: 2000,
    message: "Good luck for your exams!",
    buyerName: "Amine K.",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    items: [],
  },
  {
    code: "MEDZ-GIFT-5000",
    amount: 5000,
    message: "ألف مبروك النجاح",
    buyerName: "Nour H.",
    isUsed: true,
    usedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    usedByOrder: "MDZ-TEST01",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    items: [{ slug: "davidsons-principles-practice-medicine", quantity: 1 }],
  },
];

async function main() {
  console.log("Seeding Medical Books DZ...");

  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.giftCardItem.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.book.deleteMany();
  await prisma.series.deleteMany();
  await prisma.category.deleteMany({ where: { parentSlug: { not: null } } });
  await prisma.category.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.shippingCompany.deleteMany();
  await prisma.publisher.deleteMany();

  const publisherIds = new Map<string, string>();
  for (const p of publishers) {
    const created = await prisma.publisher.create({ data: p });
    publisherIds.set(p.name, created.id);
  }
  console.log(`✓ ${publishers.length} publishers`);

  for (const c of categories) {
    await prisma.category.create({ data: c });
  }
  console.log(`✓ ${categories.length} categories`);

  for (const s of series) {
    await prisma.series.create({ data: s });
  }
  console.log(`✓ ${series.length} series`);

  for (const b of books) {
    const { publisher, ...data } = b;
    await prisma.book.create({
      data: {
        ...data,
        formats: JSON.parse(data.formats),
        sampleText: data.sampleText ?? null,
        oldPrice: data.oldPrice ?? null,
        discountPercent: data.discountPercent ?? null,
        seriesId: data.seriesId ?? null,
        seriesOrder: data.seriesOrder ?? null,
        featured: data.featured ?? false,
        bestSeller: data.bestSeller ?? false,
        isNew: data.isNew ?? false,
        publisherId: publisherIds.get(publisher) ?? null,
      },
    });
  }
  console.log(`✓ ${books.length} books`);

  for (const r of reviews) {
    const book = await prisma.book.findUnique({ where: { slug: r.bookSlug } });
    if (!book) continue;
    await prisma.review.create({
      data: {
        bookId: book.id,
        name: r.name,
        city: r.city,
        stars: r.stars,
        comment: r.comment,
        helpful: r.helpful,
      },
    });
  }
  console.log(`✓ ${reviews.length} reviews`);

  for (const b of bundles) {
    const items = await Promise.all(
      b.bookSlugs.map(async (slug) => {
        const book = await prisma.book.findUnique({ where: { slug } });
        return book ? { bookId: book.id } : null;
      })
    );
    const valid = items.filter(Boolean) as { bookId: string }[];
    const { bookSlugs, ...rest } = b;
    void bookSlugs;
    await prisma.bundle.create({
      data: {
        ...rest,
        items: { create: valid.map((it, i) => ({ ...it, order: i })) },
      },
    });
  }
  console.log(`✓ ${bundles.length} bundles`);

  await prisma.promoCode.createMany({
    data: [
      { code: "MEDZ10", percent: 10, active: true, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90) },
      { code: "WELCOME15", percent: 15, active: true, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
      { code: "EXPIRED10", percent: 10, active: true, expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    ],
  });
  console.log("✓ promo codes");

  for (const o of orders) {
    const created = await prisma.order.create({
      data: {
        code: o.code,
        customerName: o.customerName,
        phone: o.phone,
        wilaya: o.wilaya,
        commune: o.commune,
        address: o.address,
        shippingType: o.shippingType,
        paymentMethod: o.paymentMethod,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        discount: o.discount,
        promoCode: o.promoCode,
        total: o.total,
        status: o.status,
        itemsCount: o.itemsCount,
        createdAt: o.createdAt,
      },
    });
    for (const it of o.items) {
      if (it.quantity <= 0) continue;
      const book = await prisma.book.findUnique({ where: { slug: it.bookSlug } });
      await prisma.orderItem.create({
        data: {
          orderId: created.id,
          bookId: book?.id ?? null,
          title: book?.title ?? it.bookSlug,
          titleAr: book?.titleAr ?? null,
          format: it.format,
          price: it.price,
          quantity: it.quantity,
          image: book?.cover ?? null,
        },
      });
    }
  }
  console.log(`✓ ${orders.length} demo orders (track: MDZ-TEST01, MDZ-TEST02)`);

  await prisma.newsletter.createMany({
    data: [
      { email: "amine@example.com" },
      { email: "nour@example.com" },
      { email: "sofiane@example.com" },
    ],
    skipDuplicates: true,
  });
  console.log("✓ newsletter subscribers");

  for (const s of shippingCompanies) {
    await prisma.shippingCompany.create({ data: s });
  }
  console.log(`✓ ${shippingCompanies.length} shipping companies`);

  for (const g of giftCards) {
    const { items, ...data } = g;
    const created = await prisma.giftCard.create({ data });
    for (const it of items) {
      const book = await prisma.book.findUnique({ where: { slug: it.slug } });
      if (!book) continue;
      await prisma.giftCardItem.create({
        data: { giftCardId: created.id, bookId: book.id, quantity: it.quantity },
      });
    }
  }
  console.log(`✓ ${giftCards.length} gift cards`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
