import { createClient } from '@supabase/supabase-js';
import { verbalQuestions } from '../src/data/questions/verbal.js';
import { numericalQuestions } from '../src/data/questions/numerical.js';
import { spatialQuestions } from '../src/data/questions/spatial.js';
import { logicalQuestions } from '../src/data/questions/logical.js';

const url = 'https://gcdjeudviekotstbujuh.supabase.co';
const anonKey = 'sb_publishable_vr8T5vdoiDwfeEMthJY3qQ_WWcCioXe';
const supabase = createClient(url, anonKey);

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
