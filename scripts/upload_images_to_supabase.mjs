import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

const IMAGES_DIR = path.resolve('public/exam_images');

async function main() {
  console.log('Starting cloud upload of all 30 exam images (Q41 - Q70) to Supabase Storage...');

  let successUploads = 0;
  for (let qId = 41; qId <= 70; qId++) {
    const filename = `q${qId}.png`;
    const filePath = path.join(IMAGES_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Upload to Supabase Storage bucket 'exam-images'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exam-images')
      .upload(filename, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error(`Failed to upload ${filename}:`, uploadError.message);
      continue;
    }

    // Get Public Cloud URL
    const { data: urlData } = supabase.storage
      .from('exam-images')
      .getPublicUrl(filename);

    const cloudImageUrl = urlData.publicUrl;

    // Update 'image' column in 'questions' table
    const { error: dbError } = await supabase
      .from('questions')
      .update({ image: cloudImageUrl })
      .eq('id', qId);

    if (dbError) {
      console.error(`Failed to update DB for Q${qId}:`, dbError.message);
    } else {
      successUploads++;
      console.log(`[${successUploads}/30] Q${qId} uploaded & DB updated -> ${cloudImageUrl}`);
    }
  }

  // Clean up test file if it exists
  await supabase.storage.from('exam-images').remove(['test.txt']);

  console.log(`\n🎉 All done! Successfully uploaded and updated ${successUploads}/30 images to Supabase Storage.`);
}

main().catch(console.error);
