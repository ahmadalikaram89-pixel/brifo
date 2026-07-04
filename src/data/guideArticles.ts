import type { Lang } from '../context/translations';

export interface GuideArticle {
  id: string;
  icon: string;
  title: string;
  teaser: string;
  paragraphs: string[];
}

const ar: GuideArticle[] = [
  {
    id: 'school-types',
    icon: '🏫',
    title: 'أنواع المدارس بالنمسا',
    teaser: 'Volksschule، Mittelschule، Gymnasium... شو الفرق؟',
    paragraphs: [
      'Volksschule (المدرسة الابتدائية): من عمر 6 لـ10 سنوات، أربع صفوف، بتتعلم فيها القراءة والكتابة والحساب الأساسي.',
      'Mittelschule (المدرسة المتوسطة): من عمر 10 لـ14 سنة، بتحضّر الطالب للمرحلة اللي بعدها، سواء أكاديمية أو مهنية.',
      'Gymnasium/AHS (الغيمنازيوم): من عمر 10 سنوات (أو بعد الـ Mittelschule بعمر 14)، مستوى أكاديمي أعلى، وبيأهّل للجامعة مباشرة بعد إنهاء الـ Matura.',
      'Berufsschule / Lehre (المدرسة المهنية والتلمذة الحرفية): تعليم مهني بيمشي بموازاة شغل حقيقي عند صاحب عمل.',
      'بعد عمر 14 سنة، الأهل والطالب مع بعض بيقرروا المسار الأنسب حسب ميول الطالب وقدراته.',
    ],
  },
  {
    id: 'grading-system',
    icon: '📊',
    title: 'نظام العلامات والشهادات',
    teaser: 'من 1 (ممتاز) لـ 5 (راسب) — وشو معنى كل رقم',
    paragraphs: [
      'العلامات بالنمسا من 1 لـ 5، ورقم 1 هو الأحسن.',
      '1 = Sehr gut (ممتاز)',
      '2 = Gut (جيد جداً)',
      '3 = Befriedigend (جيد)',
      '4 = Genügend (مقبول)',
      '5 = Nicht genügend (راسب بالمادة)',
      'الشهادة (Zeugnis) بتنعطى مرتين بالسنة: شهادة نص السنة (Semesterzeugnis) وشهادة آخر السنة (Jahreszeugnis). شهادة آخر السنة هي اللي بتحدد إذا الطالب ناجح وبينتقل للصف اللي بعده.',
    ],
  },
  {
    id: 'sprechstunde',
    icon: '🗣️',
    title: 'Sprechstunde: كيف تحكي مع المعلم',
    teaser: 'وقت مخصص للأهل يحكوا مباشرة مع المعلم',
    paragraphs: [
      'شو هو الـ Sprechstunde؟ وقت محدد أسبوعياً بيقدر فيه الأهل يحجزوا موعد ويحكوا مع المعلم وجهاً لوجه عن وضع ابنهم أو بنتهم.',
      'كيف تحجز موعد؟ عادة عن طريق دفتر الملاحظات (Mitteilungsheft)، أو إيميل المدرسة، أو تطبيق مثل Schoolfox.',
      'شو تحضّر قبل الموعد؟ اكتب أسئلتك مسبقاً، جهّز أي أوراق أو شهادات مهمة، ولو حسّيت الحكي بالألماني صعب، تقدر تاخذ معك حدا يترجم لك.',
      'شو تسأل بالموعد؟ كيف أداء ابنك أو بنتك بالصف، في تحسّن ولا في شي محتاج انتباه أكتر، وكيف فيك تساعد بالبيت.',
    ],
  },
  {
    id: 'parent-rights',
    icon: '⚖️',
    title: 'حقوق وواجبات الأهل',
    teaser: 'شو إلك كأهل، وشو المطلوب منك',
    paragraphs: [
      'حقوق الأهل: تعرف وضع ابنك الدراسي أول بأول، تشارك باجتماع الصف (Elternabend)، وتنتخب ممثل عن الأهل (Elternverein / Klassenelternvertreter) يحكي باسم كل الأهل.',
      'واجبات الأهل: تتأكد إن ابنك يواظب على الدوام (أي غياب لازم يكون إله عذر رسمي)، توقّع وترجّع أي ورقة مطلوبة من المدرسة بالوقت المحدد، وتتابع الواجبات المدرسية معه.',
      'التعليم إلزامي (Schulpflicht) بالنمسا من عمر 6 لـ 15 سنة — يعني لازم كل طفل يواظب على مدرسة رسمية بهاد العمر.',
    ],
  },
  {
    id: 'fruehwarnung',
    icon: '🚨',
    title: 'Frühwarnung: شو يعني وشو تعمل',
    teaser: '"إنذار مبكر" — مو معناها رسوب أكيد',
    paragraphs: [
      'شو هو الـ Frühwarnung؟ رسالة رسمية من المدرسة ("إنذار مبكر") بتوصل لما يكون في خطر إن الطالب يرسب بمادة معينة.',
      'ليش بتوصل هلق بالتحديد؟ عادة بعد نص السنة، لما يكون لسا في وقت كافي يتحسّن فيه الوضع قبل الشهادة النهائية.',
      'شو لازم تعمل؟ خذها بجدية بس ما تنهار — احجز موعد Sprechstunde مع المعلم، اسأل شو بالضبط ناقص، وفكر بدروس تقوية (Nachhilfe) إذا لزم الأمر.',
      'مهم تعرف: الـ Frühwarnung مو معناها رسوب أكيد — هي فرصة تتحرك من بدري قبل ما يفوت الوقت.',
    ],
  },
];

const de: GuideArticle[] = [
  {
    id: 'school-types',
    icon: '🏫',
    title: 'Schularten in Österreich',
    teaser: 'Volksschule, Mittelschule, Gymnasium — was ist der Unterschied?',
    paragraphs: [
      'Volksschule: 6 bis 10 Jahre, vier Schulstufen, Grundlagen in Lesen, Schreiben und Rechnen.',
      'Mittelschule: 10 bis 14 Jahre, Vorbereitung auf den weiterführenden Bildungsweg.',
      'Gymnasium (AHS): ab 10 Jahren (oder nach der Mittelschule ab 14), höheres akademisches Niveau, direkter Weg zur Universität nach der Matura.',
      'Berufsschule / Lehre: Berufsausbildung parallel zu echter Arbeit bei einem Betrieb.',
      'Ab dem 14. Lebensjahr entscheiden Eltern und Kind gemeinsam über den passenden Bildungsweg.',
    ],
  },
  {
    id: 'grading-system',
    icon: '📊',
    title: 'Notensystem und Zeugnisse',
    teaser: 'Von 1 (sehr gut) bis 5 (nicht genügend)',
    paragraphs: [
      'Die Noten in Österreich reichen von 1 bis 5, wobei 1 die beste Note ist.',
      '1 = Sehr gut, 2 = Gut, 3 = Befriedigend, 4 = Genügend, 5 = Nicht genügend.',
      'Das Zeugnis gibt es zweimal im Jahr: das Semesterzeugnis und das Jahreszeugnis. Das Jahreszeugnis entscheidet, ob das Kind in die nächste Schulstufe aufsteigt.',
    ],
  },
  {
    id: 'sprechstunde',
    icon: '🗣️',
    title: 'Sprechstunde: Wie man mit der Lehrperson spricht',
    teaser: 'Eine feste Zeit für ein direktes Gespräch',
    paragraphs: [
      'Was ist die Sprechstunde? Eine wöchentliche, feste Zeit, zu der Eltern einen Termin vereinbaren und persönlich mit der Lehrperson sprechen können.',
      'Wie vereinbart man einen Termin? Meist über das Mitteilungsheft, per E-Mail an die Schule oder über eine App wie Schoolfox.',
      'Was sollte man vorbereiten? Fragen vorher aufschreiben, wichtige Unterlagen mitbringen und bei Bedarf eine Vertrauensperson zum Übersetzen mitnehmen.',
      'Was kann man fragen? Wie steht es um die schulischen Leistungen, gibt es Fortschritte oder Punkte, die Aufmerksamkeit brauchen, und wie kann man zuhause unterstützen.',
    ],
  },
  {
    id: 'parent-rights',
    icon: '⚖️',
    title: 'Rechte und Pflichten der Eltern',
    teaser: 'Was Eltern dürfen — und was von ihnen erwartet wird',
    paragraphs: [
      'Rechte der Eltern: laufend über die schulische Situation informiert zu werden, am Elternabend teilzunehmen und einen Elternvertreter zu wählen (Elternverein / Klassenelternvertreter).',
      'Pflichten der Eltern: den regelmäßigen Schulbesuch sicherstellen (Fehlzeiten müssen entschuldigt werden), geforderte Formulare rechtzeitig unterschreiben und zurückgeben, und die Hausaufgaben begleiten.',
      'Die Schulpflicht in Österreich gilt von 6 bis 15 Jahren — jedes Kind muss in diesem Alter eine anerkannte Schule besuchen.',
    ],
  },
  {
    id: 'fruehwarnung',
    icon: '🚨',
    title: 'Frühwarnung: Was sie bedeutet und was zu tun ist',
    teaser: 'Eine "frühe Warnung" — kein sicheres Sitzenbleiben',
    paragraphs: [
      'Was ist eine Frühwarnung? Eine offizielle Mitteilung der Schule, wenn die Gefahr besteht, dass ein Kind in einem Fach eine negative Note bekommt.',
      'Warum kommt sie zu diesem Zeitpunkt? Meist nach dem Semester, wenn noch genug Zeit bleibt, die Situation bis zum Jahreszeugnis zu verbessern.',
      'Was sollte man tun? Ernst nehmen, aber nicht in Panik geraten — einen Sprechstunden-Termin vereinbaren, genau nachfragen, was fehlt, und bei Bedarf Nachhilfe in Betracht ziehen.',
      'Wichtig zu wissen: Eine Frühwarnung bedeutet nicht automatisch ein Sitzenbleiben — sie ist eine Chance, frühzeitig zu handeln.',
    ],
  },
];

export function getGuideArticles(lang: Lang): GuideArticle[] {
  return lang === 'de' ? de : ar;
}
