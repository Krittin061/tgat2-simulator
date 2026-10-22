import './globals.css';

export const metadata = {
  title: 'TGAT2 จำลองสอบเสมือนจริง (การคิดอย่างมีเหตุผล) | 80 ข้อ 90 นาที 100 คะแนน',
  description: 'เว็บแอปพลิเคชันจำลองการสอบเสมือนจริงวิชา TGAT2 (การคิดอย่างมีเหตุผล) ตามเกณฑ์จริงของ ทปอ. ปรนัย 5 ตัวเลือก 80 ข้อ 90 นาที คะแนนเต็ม 100 คะแนน พัฒนาด้วย Next.js และ Supabase',
  keywords: ['TGAT2', 'การคิดอย่างมีเหตุผล', 'TCAS', 'ทปอ', 'สอบเสมือนจริง', 'มิติสัมพันธ์', 'ตรรกศาสตร์', 'Next.js', 'Supabase'],
  authors: [{ name: 'TGAT2 Simulator Team' }]
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
