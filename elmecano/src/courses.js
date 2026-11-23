// El Mecano Academy: trainings as published on elmecano.co/academic (prices in TND).
// Each text field is { fr, ar }.
export const GUARANTEE = { fr: 'Garantie satisfait ou remboursé 30 jours', ar: 'ضمان استرجاع المبلغ خلال 30 يومًا' };

export const COURSES = [
  {
    id: 'pack',
    featured: true,
    icon: 'pack',
    badge: { fr: 'Meilleure offre', ar: 'أفضل عرض' },
    title: { fr: 'Pack complet : Diagnostic + Reprog + Hybride/EV', ar: 'الباقة الكاملة: تشخيص + برمجة + هجين/كهربائي' },
    tagline: {
      fr: 'Nos trois formations phares réunies, avec un stage d’un mois dans notre garage. Idéal pour devenir un expert polyvalent de l’automobile.',
      ar: 'تكويناتنا الثلاثة الأساسية في باقة واحدة، مع تربص لمدة شهر في ورشتنا. مثالية لتصبح خبيرًا متعدد الاختصاصات في السيارات.',
    },
    price: 1500,
    chips: [{ fr: '3 formations', ar: '3 تكوينات' }, { fr: 'Stage 1 mois au garage', ar: 'تربص شهر في الورشة' }],
    bullets: [
      { fr: 'Formation Diagnostic automobile', ar: 'تكوين تشخيص السيارات' },
      { fr: 'Formation Reprogrammation ECU', ar: 'تكوين إعادة برمجة ECU' },
      { fr: 'Formation Véhicules hybrides & EV', ar: 'تكوين السيارات الهجينة والكهربائية' },
      { fr: 'Stage pratique d’un mois dans notre garage', ar: 'تربص تطبيقي لمدة شهر في ورشتنا' },
    ],
    modules: [
      { t: { fr: 'Partie 1 — Diagnostic automobile', ar: 'الجزء 1 — تشخيص السيارات' }, d: { fr: 'Systèmes électroniques, capteurs, actionneurs, ABS, airbag, CAN, outils de diag (Diagzone, Thinkcar, TEXA), travaux pratiques et gestion de garage.', ar: 'الأنظمة الإلكترونية، الحساسات، المشغلات، ABS، الوسائد الهوائية، CAN، أجهزة التشخيص (Diagzone وThinkcar وTEXA)، أعمال تطبيقية وتسيير الورشة.' } },
      { t: { fr: 'Partie 2 — Reprogrammation moteur', ar: 'الجزء 2 — إعادة برمجة المحرك' }, d: { fr: 'Lecture/écriture ECU, logiciels (EDC Suite, StageX, Flex), AFR, lambda, turbo, cartographies avancées, EGR, DPF, AdBlue.', ar: 'قراءة وكتابة ECU، البرمجيات (EDC Suite وStageX وFlex)، AFR، لامدا، التوربو، خرائط متقدمة، EGR، DPF، AdBlue.' } },
      { t: { fr: 'Partie 3 — Véhicules hybrides', ar: 'الجزء 3 — السيارات الهجينة' }, d: { fr: 'Thermique vs hybride, types (Mild, Full, Plug-in), composants, convertisseur DC-AC et haute tension, diagnostic et codes DTC, entretien et frein régénératif.', ar: 'المحرك الحراري مقابل الهجين، الأنواع (Mild وFull وPlug-in)، المكونات، محول DC-AC والجهد العالي، التشخيص ورموز DTC، الصيانة والكبح المسترجع.' } },
      { t: { fr: 'Travaux pratiques', ar: 'أعمال تطبيقية' }, d: { fr: 'Études de cas réels : diagnostic complet + reprogrammation (Golf 6, Amarok…).', ar: 'دراسة حالات حقيقية: تشخيص كامل + إعادة برمجة (Golf 6، Amarok…).' } },
      { t: { fr: 'Stage pratique d’un mois', ar: 'تربص تطبيقي لمدة شهر' }, d: { fr: 'Mettez en pratique vos connaissances directement dans notre garage.', ar: 'طبّق معارفك مباشرة داخل ورشتنا.' } },
      { t: { fr: 'Bonus & ressources', ar: 'هدايا وموارد' }, d: { fr: 'PDF capteurs, schémas de câblage, Haynes Pro, vidéos explicatives, fichiers de cartographie prêts à l’emploi.', ar: 'ملفات PDF للحساسات، مخططات الأسلاك، Haynes Pro، فيديوهات شرح، ملفات خرائط جاهزة للاستعمال.' } },
    ],
    perks: [
      { t: { fr: 'Expert polyvalent', ar: 'خبير متعدد الاختصاصات' }, d: { fr: 'Diagnostic, reprogrammation et hybride dans un seul pack.', ar: 'التشخيص والبرمجة والهجين في باقة واحدة.' } },
      { t: { fr: 'Encadrement expert', ar: 'تأطير من خبراء' }, d: { fr: 'Formateurs spécialisés en électronique et cartographie.', ar: 'مكونون مختصون في الإلكترونيك والخرائط.' } },
      { t: { fr: 'Logiciels inclus', ar: 'برمجيات مشمولة' }, d: { fr: 'Diagzone, Thinkcar, TEXA TXT, StageX, EDC Suite, Flex.', ar: 'Diagzone وThinkcar وTEXA TXT وStageX وEDC Suite وFlex.' } },
      { t: { fr: 'Support 24/7', ar: 'دعم 24/7' }, d: { fr: 'Accompagnement technique illimité.', ar: 'مرافقة تقنية غير محدودة.' } },
    ],
  },
  {
    id: 'diag',
    icon: 'diag',
    badge: { fr: 'Tous niveaux', ar: 'لكل المستويات' },
    title: { fr: 'Diagnostic automobile', ar: 'تشخيص السيارات' },
    tagline: {
      fr: 'Devenez expert en diagnostic électronique et mécanique : capteurs, actionneurs, ECU, outils de diag, travaux pratiques et gestion de garage.',
      ar: 'كن خبيرًا في التشخيص الإلكتروني والميكانيكي: الحساسات، المشغلات، ECU، أجهزة التشخيص، أعمال تطبيقية وتسيير الورشة.',
    },
    price: 500,
    chips: [{ fr: 'Débutant → Expert', ar: 'من مبتدئ إلى خبير' }, { fr: 'Logiciels inclus', ar: 'برمجيات مشمولة' }],
    bullets: [
      { fr: 'Comprendre les systèmes OBD-II', ar: 'فهم أنظمة OBD-II' },
      { fr: 'Outils et techniques de diagnostic avancé', ar: 'أدوات وتقنيات التشخيص المتقدم' },
      { fr: 'Pour tous les niveaux, de débutant à expert', ar: 'لكل المستويات، من مبتدئ إلى خبير' },
      { fr: 'Les nouvelles technologies de diagnostic', ar: 'أحدث تقنيات التشخيص' },
    ],
    modules: [
      { t: { fr: 'Module 1 — Les systèmes d’une voiture', ar: 'الوحدة 1 — أنظمة السيارة' }, d: { fr: 'Outils, relais, fusibles, multimètre, capteurs, actionneurs, gestion moteur essence/diesel, ABS, airbag, CAN, climatisation…', ar: 'الأدوات، المرحلات، الفيوزات، جهاز القياس، الحساسات، المشغلات، إدارة محرك البنزين/الديزل، ABS، الوسائد الهوائية، CAN، التكييف…' } },
      { t: { fr: 'Module 2 — Les meilleurs outils de diagnostic', ar: 'الوحدة 2 — أفضل أجهزة التشخيص' }, d: { fr: 'Valises de diag, Thinkcar vs Diagzone, tests matériels, présentation TEXA TXT.', ar: 'حقائب التشخيص، Thinkcar مقابل Diagzone، اختبار المعدات، تقديم TEXA TXT.' } },
      { t: { fr: 'Module 3 — Travaux pratiques diagnostic', ar: 'الوحدة 3 — أعمال تطبيقية في التشخيص' }, d: { fr: 'Étapes d’un diagnostic, mémoire défaut, effacement, valeurs réelles, suralimentation, tests capteurs et sondes.', ar: 'مراحل التشخيص، ذاكرة الأعطال، المسح، القيم الحقيقية، الشحن التوربيني، اختبار الحساسات والمجسات.' } },
      { t: { fr: 'Module 4 — Lancer votre garage', ar: 'الوحدة 4 — أطلق ورشتك' }, d: { fr: 'Créer un garage, clés de réussite, réseaux sociaux, stratégie business.', ar: 'إنشاء ورشة، مفاتيح النجاح، الشبكات الاجتماعية، استراتيجية العمل.' } },
      { t: { fr: 'Bonus & ressources', ar: 'هدايا وموارد' }, d: { fr: 'PDF capteurs en arabe, codes défauts, schémas de câblage, Haynes Pro, vidéos explicatives, reprogrammation en bonus.', ar: 'ملفات PDF للحساسات بالعربية، رموز الأعطال، مخططات الأسلاك، Haynes Pro، فيديوهات شرح، وإعادة البرمجة كهدية.' } },
    ],
    perks: [
      { t: { fr: 'Formation pratique', ar: 'تكوين تطبيقي' }, d: { fr: 'Diagnostics réels avec outils modernes.', ar: 'تشخيصات حقيقية بأدوات حديثة.' } },
      { t: { fr: 'Encadrement expert', ar: 'تأطير من خبراء' }, d: { fr: 'Formateurs certifiés en électronique automobile.', ar: 'مكونون معتمدون في إلكترونيك السيارات.' } },
      { t: { fr: 'Logiciels inclus', ar: 'برمجيات مشمولة' }, d: { fr: 'Diagzone, Thinkcar, TEXA TXT et simulateurs Electude.', ar: 'Diagzone وThinkcar وTEXA TXT ومحاكيات Electude.' } },
      { t: { fr: 'Mises à jour gratuites', ar: 'تحديثات مجانية' }, d: { fr: 'Contenu enrichi et actualisé régulièrement.', ar: 'محتوى يُثرى ويُحدَّث باستمرار.' } },
    ],
  },
  {
    id: 'ecu',
    icon: 'ecu',
    badge: { fr: '100 % en ligne', ar: '100% عن بعد' },
    title: { fr: 'Reprogrammation ECU', ar: 'إعادة برمجة ECU' },
    tagline: {
      fr: 'Apprenez la reprogrammation, la lecture/écriture et la maîtrise des ECU, du niveau débutant jusqu’au stage avancé.',
      ar: 'تعلّم إعادة البرمجة والقراءة والكتابة والتحكم في وحدات ECU، من المستوى المبتدئ إلى المراحل المتقدمة.',
    },
    price: 870,
    chips: [{ fr: 'À votre rythme', ar: 'حسب نسقك' }, { fr: 'Vidéos HD', ar: 'فيديوهات HD' }],
    bullets: [
      { fr: 'Techniques de reprogrammation avancées', ar: 'تقنيات إعادة برمجة متقدمة' },
      { fr: 'Vidéos HD et guides détaillés', ar: 'فيديوهات HD وأدلة مفصلة' },
      { fr: 'Formation 100 % en ligne, à votre rythme', ar: 'تكوين 100% عن بعد وحسب نسقك' },
    ],
    modules: [
      { t: { fr: 'Module 1 — Les bases', ar: 'الوحدة 1 — الأساسيات' }, d: { fr: 'Introduction, pourquoi reprogrammer, checksum, matériel, master/slave, interfaces, outils…', ar: 'مقدمة، لماذا نعيد البرمجة، checksum، المعدات، master/slave، الواجهات، الأدوات…' } },
      { t: { fr: 'Module 2 — Software : lecture & écriture', ar: 'الوحدة 2 — البرمجيات: القراءة والكتابة' }, d: { fr: 'Logiciels, Flex, lecture/écriture, BOOT, assistance technique.', ar: 'البرمجيات، Flex، القراءة والكتابة، BOOT، المساعدة التقنية.' } },
      { t: { fr: 'Module 3 — Bases moteur diesel', ar: 'الوحدة 3 — أساسيات محرك الديزل' }, d: { fr: 'Principe moteur, AFR, IQ, MAF, ECU, pédale, limiteurs, pressions, EGR, FAP…', ar: 'مبدأ المحرك، AFR، IQ، MAF، ECU، الدواسة، المحددات، الضغوط، EGR، FAP…' } },
      { t: { fr: 'Module 4 — TP Stage 1', ar: 'الوحدة 4 — تطبيق Stage 1' }, d: { fr: 'Calculs AFR/lambda, relation MAF-IQ, Stage 1 EDC Suite, astuces carto, turbo, N75…', ar: 'حسابات AFR/لامدا، علاقة MAF-IQ، Stage 1 على EDC Suite، حيل الخرائط، التوربو، N75…' } },
      { t: { fr: 'Module 5 — Stages X', ar: 'الوحدة 5 — مراحل X' }, d: { fr: 'Présentation StageX, TP Golf 6, Amarok, remaps avancés (EGR, DPF, AdBlue).', ar: 'تقديم StageX، تطبيق على Golf 6 وAmarok، خرائط متقدمة (EGR وDPF وAdBlue).' } },
    ],
    perks: [
      { t: { fr: 'Formation pratique', ar: 'تكوين تطبيقي' }, d: { fr: 'Travaux pratiques sur véhicules réels.', ar: 'أعمال تطبيقية على سيارات حقيقية.' } },
      { t: { fr: 'Expert formateur', ar: 'مكوّن خبير' }, d: { fr: 'Formateurs certifiés et expérimentés.', ar: 'مكونون معتمدون وذوو خبرة.' } },
      { t: { fr: 'Ressources complètes', ar: 'موارد شاملة' }, d: { fr: 'Documentation technique exclusive.', ar: 'وثائق تقنية حصرية.' } },
      { t: { fr: 'Support 24/7', ar: 'دعم 24/7' }, d: { fr: 'Assistance technique illimitée.', ar: 'مساعدة تقنية غير محدودة.' } },
    ],
  },
  {
    id: 'hybrid',
    icon: 'hybrid',
    badge: { fr: 'Niveau expert', ar: 'مستوى خبير' },
    title: { fr: 'Mécanique véhicules hybrides & EV', ar: 'ميكانيك السيارات الهجينة والكهربائية' },
    tagline: {
      fr: 'Maîtrisez les technologies hybrides et électriques : de la théorie à la pratique, tout sur les véhicules du futur.',
      ar: 'أتقن التقنيات الهجينة والكهربائية: من النظري إلى التطبيقي، كل شيء عن سيارات المستقبل.',
    },
    price: 500,
    oldPrice: 800,
    chips: [{ fr: 'Haute tension', ar: 'جهد عالٍ' }, { fr: 'Contenu complet', ar: 'محتوى شامل' }],
    bullets: [
      { fr: 'Technologie des moteurs hybrides', ar: 'تكنولوجيا المحركات الهجينة' },
      { fr: 'Diagnostic des systèmes haute tension (HV)', ar: 'تشخيص أنظمة الجهد العالي (HV)' },
      { fr: 'Réparation des onduleurs et convertisseurs', ar: 'إصلاح المموجات والمحولات' },
      { fr: 'Maintenance des batteries lithium-ion', ar: 'صيانة بطاريات الليثيوم أيون' },
    ],
    modules: [
      { t: { fr: 'Introduction & histoire', ar: 'مقدمة وتاريخ' }, d: { fr: 'Objectifs de la formation et évolution des véhicules hybrides.', ar: 'أهداف التكوين وتطور السيارات الهجينة.' } },
      { t: { fr: 'Thermique vs hybride', ar: 'الحراري مقابل الهجين' }, d: { fr: 'Comparaison des motorisations et technologies des constructeurs (Toyota, Honda…).', ar: 'مقارنة المحركات وتقنيات المصنّعين (Toyota وHonda…).' } },
      { t: { fr: 'Types d’hybrides', ar: 'أنواع الهجين' }, d: { fr: 'Mild, Full et Plug-in hybrides.', ar: 'Mild وFull وPlug-in.' } },
      { t: { fr: 'Composants, BMS & convertisseur DC-AC', ar: 'المكونات وBMS ومحول DC-AC' }, d: { fr: 'Batterie, moteur, architecture, gestion des batteries, onduleurs : principes et réparation.', ar: 'البطارية، المحرك، البنية، إدارة البطاريات، المموجات: المبادئ والإصلاح.' } },
      { t: { fr: 'Entretien & frein régénératif', ar: 'الصيانة والكبح المسترجع' }, d: { fr: 'Maintenance préventive, points de vigilance, récupération d’énergie.', ar: 'الصيانة الوقائية، نقاط الانتباه، استرجاع الطاقة.' } },
      { t: { fr: 'Haute tension, défauts & outils', ar: 'الجهد العالي والأعطال والأدوات' }, d: { fr: 'Sécurité et normes, codes DTC, pannes courantes, outillage spécialisé.', ar: 'السلامة والمعايير، رموز DTC، الأعطال الشائعة، المعدات المختصة.' } },
    ],
    perks: [
      { t: { fr: 'Formation pratique', ar: 'تكوين تطبيقي' }, d: { fr: 'Travaux pratiques sur véhicules réels.', ar: 'أعمال تطبيقية على سيارات حقيقية.' } },
      { t: { fr: 'Expert formateur', ar: 'مكوّن خبير' }, d: { fr: 'Formateurs certifiés et expérimentés.', ar: 'مكونون معتمدون وذوو خبرة.' } },
      { t: { fr: 'Ressources complètes', ar: 'موارد شاملة' }, d: { fr: 'Documentation technique exclusive.', ar: 'وثائق تقنية حصرية.' } },
      { t: { fr: 'Mises à jour gratuites', ar: 'تحديثات مجانية' }, d: { fr: 'Contenu actualisé régulièrement.', ar: 'محتوى يُحدَّث باستمرار.' } },
    ],
  },
];

// Extra request type available in the sign-up form.
export const CONSULT = {
  id: 'consult',
  title: { fr: 'Consultation (sur rendez-vous)', ar: 'استشارة (بموعد)' },
};

export const CITIES = ['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'];
