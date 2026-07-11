/** Impressum / بيان الهوية القانونية — required under Austrian §5 ECG for any
 * commercial website/app, separate from the Datenschutzerklärung. Draft based
 * on the company details provided; VAT ID (UID) and the commercial-register
 * court are placeholders pending confirmation, and a lawyer should still
 * sign off before this is relied on. */
import type { PolicySection } from './privacyPolicy';

export const IMPRESSUM_LAST_UPDATED = '2026-07-11';

export const impressumDe: PolicySection[] = [
  {
    heading: 'Angaben gemäß § 5 ECG',
    body: 'Smartordi OG\nSteingasse 6A\nLinz, Österreich\n\nE-Mail: team@smartordi.eu\nFirmenbuchnummer: FN 675586 i\nFirmenbuchgericht: Landesgericht Linz [bitte bestätigen]\nUID-Nummer: [bitte ergänzen]\nUnternehmensgegenstand: Softwareentwicklung und Erbringung digitaler Dienstleistungen',
  },
  {
    heading: 'Vertretungsbefugte Person(en)',
    body: '[Name der/des vertretungsbefugten Gesellschafter:in bitte ergänzen]',
  },
  {
    heading: 'Mitgliedschaften',
    body: 'Mitglied der Wirtschaftskammer Österreich (WKO) [falls zutreffend, bitte bestätigen]. Es gelten die gewerberechtlichen Vorschriften Österreichs, abrufbar unter www.ris.bka.gv.at.',
  },
  {
    heading: 'EU-Streitschlichtung',
    body: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
  },
  {
    heading: 'Haftung für Inhalte',
    body: 'Brifo unterstützt Sie bei der Einordnung von Schulbriefen mittels KI-gestützter Analyse. Die Ergebnisse stellen keine rechtliche, behördliche oder pädagogische Beratung dar und ersetzen nicht die Prüfung des Originalschreibens. Wir übernehmen keine Gewähr für die Vollständigkeit oder Richtigkeit der automatisiert erstellten Zusammenfassungen.',
  },
];

export const impressumAr: PolicySection[] = [
  {
    heading: 'بيانات وفق المادة ٥ من قانون التجارة الإلكترونية النمساوي (ECG)',
    body: 'Smartordi OG\nSteingasse 6A\nLinz، النمسا\n\nالبريد الإلكتروني: team@smartordi.eu\nرقم السجل التجاري: FN 675586 i\nمحكمة السجل التجاري: Landesgericht Linz [بانتظار التأكيد]\nرقم ضريبة القيمة المضافة (UID): [بانتظار الإضافة]\nنشاط الشركة: تطوير برمجيات وتقديم خدمات رقمية',
  },
  {
    heading: 'الشخص/الأشخاص المخوّلون بالتمثيل',
    body: '[الرجاء إضافة اسم الشريك/ة المخوّل بالتمثيل القانوني]',
  },
  {
    heading: 'العضويات',
    body: 'عضو بغرفة الاقتصاد النمساوية (WKO) [إذا كان ينطبق، الرجاء التأكيد]. تسري الأنظمة التجارية النمساوية، متوفرة على www.ris.bka.gv.at.',
  },
  {
    heading: 'تسوية النزاعات الأوروبية',
    body: 'المفوضية الأوروبية بتوفر منصة لتسوية النزاعات إلكترونياً: https://ec.europa.eu/consumers/odr. إحنا مش ملزمين ولا مستعدين للمشاركة بإجراء تسوية نزاعات أمام هيئة تحكيم استهلاكية.',
  },
  {
    heading: 'المسؤولية عن المحتوى',
    body: 'Brifo بيساعدك تفهمي رسائل المدرسة عبر تحليل بالذكاء الاصطناعي. النتائج مش استشارة قانونية أو رسمية أو تربوية، وما بتغني عن مراجعة الرسالة الأصلية بنفسك. ما منضمن اكتمال أو دقة الملخصات المولّدة آلياً بشكل كامل.',
  },
];
