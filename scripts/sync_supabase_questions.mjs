import { createClient } from '@supabase/supabase-js';
import { verbalQuestions } from '../src/data/questions/verbal.js';
import { numericalQuestions } from '../src/data/questions/numerical.js';
import { spatialQuestions } from '../src/data/questions/spatial.js';
import { logicalQuestions } from '../src/data/questions/logical.js';

// ใช้ SUPABASE_SERVICE_ROLE_KEY (Supabase > Project Settings > API > service_role)
// เพราะหลังรัน supabase/secure_auth.sql แล้ว anon key ไม่มีสิทธิ์เขียนข้อมูลนี้
// ตัวอย่าง: SUPABASE_SERVICE_ROLE_KEY=... node scripts/<ชื่อไฟล์>.mjs
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcdjeudviekotstbujuh.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const allQuestions = [
    ...verbalQuestions,
    ...numericalQuestions,
    ...spatialQuestions,
    ...logicalQuestions
  ];

  console.log(`Starting clean sync of ${allQuestions.length} questions to Supabase...`);
  
  let successCount = 0;
  for (const q of allQuestions) {
    const row = {
      id: q.id,
      skill: q.skill,
      skill_label: q.skillLabel || 'ทั่วไป',
      topic: q.topic || 'ทั่วไป',
      content: q.content,
      choices: q.choices,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      image: q.image || (q.id >= 41 && q.id <= 70 ? `/exam_images/q${q.id}.png` : null),
      svg_illustration: q.svgIllustration || null
    };

    const { error } = await supabase.from('questions').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error(`Failed on question ${q.id}:`, error.message);
    } else {
      successCount++;
    }
  }

  console.log(`Finished! Successfully synced ${successCount}/${allQuestions.length} questions.`);
}

main().catch(console.error);
