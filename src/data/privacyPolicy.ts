/** Draft Datenschutzerklärung / سياسة الخصوصية — describes what Brifo actually
 * does technically (see DataContext, src/server/analyze.ts, src/server/push.ts).
 * This is NOT a substitute for legal review: the bracketed placeholders
 * (company name/address/email, hosting region) must be filled in and a
 * lawyer should sign off before this is relied on for a paying product. */

export interface PolicySection {
  heading: string;
  body: string;
}

export const PRIVACY_POLICY_VERSION = 1;
export const PRIVACY_POLICY_LAST_UPDATED = '2026-07-11';

export const privacyPolicyDe: PolicySection[] = [
  {
    heading: '1. Verantwortlicher',
    body: '[Firmenname], [Adresse], [PLZ Ort], Österreich\nE-Mail: [E-Mail-Adresse]\nFirmenbuchnummer: [FN-Nummer]\n\nVerantwortlich für die Verarbeitung personenbezogener Daten im Rahmen der App "Brifo" im Sinne der Datenschutz-Grundverordnung (DSGVO) ist die oben genannte Gesellschaft.',
  },
  {
    heading: '2. Allgemeines',
    body: 'Brifo hilft arabischsprachigen Eltern in Österreich, Schulbriefe zu verstehen, Termine zu verwalten und Antworten auf Deutsch zu verfassen. Diese Erklärung beschreibt, welche Daten die App verarbeitet, wofür, und welche Rechte Sie als betroffene Person haben.\n\nBrifo verzichtet bewusst auf ein Benutzerkonto: Es gibt keine Registrierung mit Name, E-Mail oder Passwort. Die meisten Daten werden ausschließlich lokal auf Ihrem Gerät gespeichert.',
  },
  {
    heading: '3. Welche Daten wir verarbeiten',
    body: 'a) Familienprofile: Name, Rolle (Kind/Erwachsene:r), Schulstufe und Schulname, die Sie selbst eingeben. Gespeichert ausschließlich lokal auf Ihrem Gerät (localStorage), nicht auf unseren Servern.\n\nb) Fotos von Schulbriefen: Wenn Sie einen Brief fotografieren, wird das Bild einmalig zur Analyse an unseren KI-Dienstleister Anthropic (siehe Punkt 5) übermittelt. Das Bild selbst wird weder von uns noch von Anthropic dauerhaft gespeichert — nur die daraus erstellte Textzusammenfassung (Betreff, Fristen, geforderte Zahlungen) wird lokal auf Ihrem Gerät gespeichert.\n\nc) Termine, Zahlungen, Aufgaben und Ihre Bewertung/Ihr Feedback zur App: ebenfalls ausschließlich lokal auf Ihrem Gerät.\n\nd) Push-Benachrichtigungen (optional, nur wenn Sie diese aktivieren): Ihr Gerät erhält eine zufällige Geräte-ID (keine Verknüpfung zu Ihrem Namen) sowie eine Push-Berechtigung (Endpoint-URL und Verschlüsselungsschlüssel Ihres Browsers). Diese sowie die Titel und Daten Ihrer bevorstehenden Termine werden auf unserem Server gespeichert, ausschließlich um Ihnen Erinnerungen zuzustellen.\n\ne) Technische Daten: Spracheinstellung (Arabisch/Deutsch) und Anzeigemodus (hell/dunkel) — lokal gespeichert.',
  },
  {
    heading: '4. Speicherort und Speicherdauer',
    body: 'Familienprofile, Briefzusammenfassungen, Termine, Zahlungen, Aufgaben und Bewertungen verbleiben ausschließlich auf Ihrem Gerät, bis Sie sie löschen (einzeln, pro Profil, oder vollständig über die Funktion "Nutzungsdaten löschen" in den Einstellungen). Wir haben keinen Zugriff darauf und keine eigene Kopie.\n\nDaten für Push-Benachrichtigungen (Geräte-ID, Push-Berechtigung, Termintitel/-daten) werden auf unserem Server gespeichert, solange die Erinnerungsfunktion aktiviert ist, und automatisch gelöscht, wenn Sie diese deaktivieren oder Ihre Push-Berechtigung widerrufen.',
  },
  {
    heading: '5. Weitergabe an Dritte (Auftragsverarbeiter)',
    body: 'Anthropic PBC (USA): verarbeitet fotografierte Schulbriefe einmalig zur Texterkennung/Analyse. Es gilt eine Datenübermittlung in ein Drittland (USA); wir stellen sicher, dass hierfür geeignete Garantien (z. B. Standardvertragsklauseln) bestehen.\n\nVercel Inc.: Hosting der App und, falls Push-Benachrichtigungen genutzt werden, Speicherung der dafür nötigen Daten (siehe Punkt 3d). [Region/Serverstandort bitte ergänzen.]\n\nWir verkaufen keine Daten an Dritte und nutzen keine Werbe- oder Tracking-Dienste.',
  },
  {
    heading: '6. Daten von Kindern',
    body: 'Brifo richtet sich an Erziehungsberechtigte, die Angaben zu ihren Kindern (Name, Schulstufe) selbst eingeben, um Schulbriefe zu organisieren. Es liegt in der Verantwortung der Erziehungsberechtigten, diese Angaben einzugeben und zu verwalten. Die Angaben verbleiben lokal auf dem Gerät der Erziehungsberechtigten.',
  },
  {
    heading: '7. Ihre Rechte',
    body: 'Sie haben nach der DSGVO das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten sowie auf Datenübertragbarkeit und Widerspruch. Da die meisten Daten lokal auf Ihrem Gerät liegen, können Sie diese Rechte direkt in der App ausüben (Ansehen, Bearbeiten, Löschen, Export als Datei über "Nutzungsdaten sichern"). Für Daten, die auf unserem Server liegen (Push-Benachrichtigungen), kontaktieren Sie uns unter der in Punkt 1 genannten E-Mail-Adresse.\n\nSie haben zudem das Recht, sich bei der österreichischen Datenschutzbehörde (dsb.gv.at) zu beschweren.',
  },
  {
    heading: '8. Kontakt',
    body: 'Bei Fragen zum Datenschutz erreichen Sie uns unter: [E-Mail-Adresse]',
  },
];

export const privacyPolicyAr: PolicySection[] = [
  {
    heading: '١. المسؤول عن حماية البيانات',
    body: '[اسم الشركة]، [العنوان]، [الرمز البريدي والمدينة]، النمسا\nالبريد الإلكتروني: [البريد الإلكتروني]\nرقم السجل التجاري: [رقم السجل]\n\nالشركة المذكورة أعلاه هي المسؤولة عن معالجة البيانات الشخصية ضمن تطبيق "Brifo" وفق اللائحة الأوروبية العامة لحماية البيانات (GDPR).',
  },
  {
    heading: '٢. عموميات',
    body: 'Brifo بيساعد الأهل الناطقين بالعربي بالنمسا يفهموا رسائل المدرسة، وينظّموا المواعيد، ويكتبوا ردود بالألماني. هاي الوثيقة بتوضح شو البيانات يلي التطبيق بيعالجها، لأي هدف، وشو حقوقك كصاحب/ة البيانات.\n\nBrifo ما بيطلب إنشاء حساب: ما في تسجيل باسم أو إيميل أو كلمة سر. معظم البيانات بتتخزن محلياً على جهازك بس.',
  },
  {
    heading: '٣. شو البيانات يلي منعالجها',
    body: 'أ) ملفات أفراد العائلة: الاسم، النوع (طفل/بالغ)، الصف واسم المدرسة، يلي بتدخليهم إنتِ بنفسك. بتتخزن محلياً على جهازك بس (localStorage)، مو على سيرفراتنا.\n\nب) صور رسائل المدرسة: لما تصوّري رسالة، الصورة بتنبعت مرة وحدة لمزوّد الذكاء الاصطناعي Anthropic لتحليلها (شوفي البند ٥). الصورة نفسها ما بتتخزن، لا عندنا ولا عند Anthropic — بس الملخّص النصي (الموضوع، المواعيد، المبالغ المطلوبة) هو يلي بيتخزن محلياً على جهازك.\n\nج) المواعيد والمدفوعات والمهام وتقييمك/ملاحظاتك عن التطبيق: كمان محلياً على جهازك بس.\n\nد) إشعارات التذكير (اختيارية، بس إذا فعّلتيها): جهازك بياخد معرّف عشوائي (مو مرتبط باسمك) وصلاحية إشعارات من المتصفح. هاد المعرّف مع عناوين وتواريخ مواعيدك القادمة بيتخزنوا على سيرفرنا، بس لإرسال التذكيرات إلك.\n\nه) بيانات تقنية: إعداد اللغة (عربي/ألماني) والمظهر (فاتح/داكن) — محلياً بس.',
  },
  {
    heading: '٤. مكان وحفظ البيانات',
    body: 'ملفات العائلة وملخصات الرسائل والمواعيد والمدفوعات والمهام والتقييمات بتضل محلياً على جهازك بس، لحد ما تحذفيها (فرد فرد، أو بالكامل عبر "حذف بيانات الاستخدام" بالإعدادات). إحنا ما عنا وصول إلها ولا نسخة منها.\n\nبيانات إشعارات التذكير (المعرّف، صلاحية الإشعارات، عناوين/تواريخ المواعيد) بتتخزن عندنا طول ما ميزة التذكير مفعّلة، وبتنمسح تلقائياً لما توقفيها.',
  },
  {
    heading: '٥. مشاركة البيانات مع أطراف تالتة',
    body: 'Anthropic PBC (أمريكا): بتعالج صور رسائل المدرسة مرة وحدة لتحليلها. هاد نقل بيانات لدولة خارج الاتحاد الأوروبي؛ منتأكد إنه في ضمانات مناسبة إلها (متل بنود تعاقدية معيارية).\n\nVercel Inc.: استضافة التطبيق، وإذا استخدمتِ إشعارات التذكير، تخزين البيانات اللازمة إلها (شوفي البند ٣-د). [الرجاء إضافة موقع السيرفر/المنطقة.]\n\nما منبيع أي بيانات لأي جهة، وما منستخدم أدوات إعلانات أو تتبّع.',
  },
  {
    heading: '٦. بيانات الأطفال',
    body: 'Brifo موجّه للأهل/الأوصياء يلي بيدخلوا معلومات عن أطفالهم (الاسم، الصف) بأنفسهم لتنظيم رسائل المدرسة. المسؤولية بإدخال وإدارة هالمعلومات على عاتق الأهل/الوصي. المعلومات بتضل محلياً على جهاز الأهل.',
  },
  {
    heading: '٧. حقوقك',
    body: 'حسب GDPR، إلك الحق بالاطلاع على بياناتك وتصحيحها وحذفها وتقييد معالجتها، وكمان حق نقل البيانات والاعتراض. بما إنه معظم البيانات محلية على جهازك، فيك تمارسي هالحقوق مباشرة من التطبيق (اطلاع، تعديل، حذف، تصدير كملف عبر "نسخة احتياطية"). للبيانات يلي عندنا (إشعارات التذكير)، تواصلي معنا عبر البريد الإلكتروني المذكور بالبند ١.\n\nكمان إلك الحق تقدمي شكوى لهيئة حماية البيانات النمساوية (dsb.gv.at).',
  },
  {
    heading: '٨. تواصل معنا',
    body: 'لأي سؤال عن الخصوصية، تواصلي معنا عبر: [البريد الإلكتروني]',
  },
];
