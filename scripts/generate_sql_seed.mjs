import { verbalQuestions } from '../src/data/questions/verbal.js';
import { numericalQuestions } from '../src/data/questions/numerical.js';
import { spatialQuestions } from '../src/data/questions/spatial.js';
import { logicalQuestions } from '../src/data/questions/logical.js';
import fs from 'fs';
import path from 'path';

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'` + String(str).replace(/'/g, `''`) + `'`;
}

function main() {
  const allQuestions = [
    ...verbalQuestions,
    ...numericalQuestions,
    ...spatialQuestions,
    ...logicalQuestions
  ];

  const lines = [
    `-- ========================================================`,
    `-- TGAT2 Simulator - Seed 80 Questions into Supabase`,
    `-- Copy and paste this script into your Supabase SQL Editor and click RUN`,
    `-- ========================================================`,
    ``,
    `-- 1. Ensure 'image' column exists in 'questions' table`,
    `ALTER TABLE questions ADD COLUMN IF NOT EXISTS image TEXT;`,
    ``,
    `-- 2. Configure Row Level Security (RLS) to allow public reading & management`,
    `ALTER TABLE questions ENABLE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS "Allow public select on questions" ON questions;`,
    `CREATE POLICY "Allow public select on questions" ON questions FOR SELECT TO public USING (true);`,
    `DROP POLICY IF EXISTS "Allow public insert on questions" ON questions;`,
    `CREATE POLICY "Allow public insert on questions" ON questions FOR INSERT TO public WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "Allow public update on questions" ON questions;`,
    `CREATE POLICY "Allow public update on questions" ON questions FOR UPDATE TO public USING (true);`,
    ``,
    `-- 3. Clear existing questions and insert all 80 real questions`,
    `DELETE FROM questions;`,
    ``,
    `INSERT INTO questions (id, skill, skill_label, topic, content, choices, correct_answer, explanation, image, svg_illustration) VALUES`
  ];

  const valueRows = allQuestions.map(q => {
    const id = q.id;
    const skill = escapeSql(q.skill);
    const skillLabel = escapeSql(q.skillLabel);
    const topic = escapeSql(q.topic);
    const content = escapeSql(q.content);
    const choices = escapeSql(JSON.stringify(q.choices));
    const correctAnswer = q.correctAnswer;
    const explanation = escapeSql(JSON.stringify(q.explanation));
    const image = escapeSql(q.image || null);
    const svgIllustration = escapeSql(q.svgIllustration || null);

    return `(${id}, ${skill}, ${skillLabel}, ${topic}, ${content}, ${choices}::jsonb, ${correctAnswer}, ${explanation}::jsonb, ${image}, ${svgIllustration})`;
  });

  lines.push(valueRows.join(',\n') + ';');
  lines.push('');
  lines.push(`-- Verification query`);
  lines.push(`SELECT count(*) as total_questions, skill FROM questions GROUP BY skill;`);

  const outPath = path.resolve('supabase/seed_questions.sql');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`Generated ${outPath} successfully with ${allQuestions.length} questions!`);
}

main();
