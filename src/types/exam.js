// Skill metadata configuration
export const SKILL_METADATA = {
  verbal: {
    id: 'verbal',
    name: 'ความสามารถทางภาษา',
    range: 'ข้อ 1 - 20',
    icon: 'BookOpen',
    color: '#3B82F6', // Blue
    description: 'การสรุปความ ตีความ บริบทคำ ข้อบกพร่องทางภาษา และการใช้เหตุผลเชิงภาษา',
    subtopicIds: ['verbal_meaning', 'verbal_usage', 'verbal_reading', 'verbal_comprehension']
  },
  numerical: {
    id: 'numerical',
    name: 'ความสามารถทางตัวเลข',
    range: 'ข้อ 21 - 40',
    icon: 'Calculator',
    color: '#10B981', // Emerald
    description: 'อนุกรมตัวเลขและมิติ โอเปอเรชัน ตรรกะเชิงคณิตศาสตร์ และการวิเคราะห์ข้อมูล',
    subtopicIds: ['numerical_series', 'numerical_comparison', 'numerical_sufficiency', 'numerical_problem']
  },
  spatial: {
    id: 'spatial',
    name: 'ความสามารถทางมิติสัมพันธ์',
    range: 'ข้อ 41 - 60',
    icon: 'Boxes',
    color: '#8B5CF6', // Purple / Violet
    description: 'ภาพพับและคลี่ลูกบาศก์ อนุกรมภาพ 2D/3D การหมุนภาพ ภาพสะท้อน และการนับบล็อก',
    subtopicIds: ['spatial_folding', 'spatial_geometry', 'spatial_rotation', 'spatial_composition']
  },
  logical: {
    id: 'logical',
    name: 'ความสามารถทางเหตุผล',
    range: 'ข้อ 61 - 80',
    icon: 'BrainCircuit',
    color: '#F59E0B', // Amber
    description: 'ตรรกศาสตร์เงื่อนไข อุปมาอุปไมย การสรุปความสอดคล้อง และข้อบกพร่องเชิงตรรกะ',
    subtopicIds: ['logical_series', 'logical_relation', 'logical_symbol', 'logical_situation']
  }
};

/**
 * โครงสร้างพิมพ์เขียวข้อสอบ TGAT2 (Official TGAT2 Blueprint)
 * เรียงตามลำดับทางการ 16 หัวข้อย่อย หัวข้อย่อยละ 5 ข้อ รวม 80 ข้อ
 */
export const TGAT2_BLUEPRINT = [
  // 1. ความสามารถทางภาษา (ข้อ 1 - 20)
  {
    id: 'verbal_meaning',
    skill: 'verbal',
    skillLabel: 'ความสามารถทางภาษา',
    name: 'การสื่อความหมาย',
    range: 'ข้อ 1 - 5',
    itemCount: 5,
    description: 'ความหมายตรง-นัย, ความกำกวม, บริบทคำ และระดับความหมายของคำ'
  },
  {
    id: 'verbal_usage',
    skill: 'verbal',
    skillLabel: 'ความสามารถทางภาษา',
    name: 'การใช้ภาษา',
    range: 'ข้อ 6 - 10',
    itemCount: 5,
    description: 'ระดับภาษา, ภาษาแบบแผน, คำเชื่อม/บุพบท และการเขียนเชิงวิชาการ'
  },
  {
    id: 'verbal_reading',
    skill: 'verbal',
    skillLabel: 'ความสามารถทางภาษา',
    name: 'การอ่าน',
    range: 'ข้อ 11 - 15',
    itemCount: 5,
    description: 'การจับใจความสำคัญ, ตีความสาร, วิเคราะห์เจตนา และจุดประสงค์ผู้เขียน'
  },
  {
    id: 'verbal_comprehension',
    skill: 'verbal',
    skillLabel: 'ความสามารถทางภาษา',
    name: 'การเข้าใจสาร',
    range: 'ข้อ 16 - 20',
    itemCount: 5,
    description: 'การเติมคำในช่องว่าง, สำนวนไทย และการเลือกใช้คำตามบริบท'
  },

  // 2. ความสามารถทางตัวเลข (ข้อ 21 - 40)
  {
    id: 'numerical_series',
    skill: 'numerical',
    skillLabel: 'ความสามารถทางตัวเลข',
    name: 'อนุกรมมิติ',
    range: 'ข้อ 21 - 25',
    itemCount: 5,
    description: 'อนุกรมตัวเลข, ลำดับความสัมพันธ์ และรูปแบบทางคณิตศาสตร์'
  },
  {
    id: 'numerical_comparison',
    skill: 'numerical',
    skillLabel: 'ความสามารถทางตัวเลข',
    name: 'การเปรียบเทียบเชิงปริมาณ (สดมภ์)',
    range: 'ข้อ 26 - 30',
    itemCount: 5,
    description: 'การเปรียบเทียบค่าสดมภ์ ก, สดมภ์ ข และสดมภ์ ค'
  },
  {
    id: 'numerical_sufficiency',
    skill: 'numerical',
    skillLabel: 'ความสามารถทางตัวเลข',
    name: 'ความเพียงพอของข้อมูล',
    range: 'ข้อ 31 - 35',
    itemCount: 5,
    description: 'การประเมินความเพียงพอของข้อมูล ก และ ข ในการตอบคำถาม'
  },
  {
    id: 'numerical_problem',
    skill: 'numerical',
    skillLabel: 'ความสามารถทางตัวเลข',
    name: 'โจทย์ปัญหาคณิตศาสตร์',
    range: 'ข้อ 36 - 40',
    itemCount: 5,
    description: 'สมการ, ร้อยละ, อัตราส่วน, ความน่าจะเป็น และงานเวลา'
  },

  // 3. ความสามารถทางมิติสัมพันธ์ (ข้อ 41 - 60)
  {
    id: 'spatial_folding',
    skill: 'spatial',
    skillLabel: 'ความสามารถทางมิติสัมพันธ์',
    name: 'การพับกล่อง',
    range: 'ข้อ 41 - 45',
    itemCount: 5,
    description: 'การพับและคลี่แผ่นรูปเรขาคณิตเป็นลูกบาศก์และกล่อง 3 มิติ'
  },
  {
    id: 'spatial_geometry',
    skill: 'spatial',
    skillLabel: 'ความสามารถทางมิติสัมพันธ์',
    name: 'รูปทรงเรขาคณิต 3 มิติ',
    range: 'ข้อ 46 - 50',
    itemCount: 5,
    description: 'การมองภาพตัดขวาง, การนับบล็อก และมุมมองของรูปทรง 3 มิติ'
  },
  {
    id: 'spatial_rotation',
    skill: 'spatial',
    skillLabel: 'ความสามารถทางมิติสัมพันธ์',
    name: 'การหมุนภาพสามมิติ',
    range: 'ข้อ 51 - 55',
    itemCount: 5,
    description: 'การหมุนวัตถุ 3 มิติตามแกนต่าง ๆ ในทิศทางตามที่กำหนด'
  },
  {
    id: 'spatial_composition',
    skill: 'spatial',
    skillLabel: 'ความสามารถทางมิติสัมพันธ์',
    name: 'การประกอบภาพ',
    range: 'ข้อ 56 - 60',
    itemCount: 5,
    description: 'การต่อชิ้นส่วนย่อยเข้ากับรูปทรงหลักอย่างสมบูรณ์'
  },

  // 4. ความสามารถทางเหตุผล (ข้อ 61 - 80)
  {
    id: 'logical_series',
    skill: 'logical',
    skillLabel: 'ความสามารถทางเหตุผล',
    name: 'อนุกรมภาพ',
    range: 'ข้อ 61 - 65',
    itemCount: 5,
    description: 'การวิเคราะห์การเปลี่ยนแปลงและลำดับต่อเนื่องของภาพ'
  },
  {
    id: 'logical_relation',
    skill: 'logical',
    skillLabel: 'ความสามารถทางเหตุผล',
    name: 'ความสัมพันธ์ของภาพ',
    range: 'ข้อ 66 - 70',
    itemCount: 5,
    description: 'อุปมาอุปไมยรูปภาพและความสัมพันธ์เชิงตรรกะของคู่ภาพ'
  },
  {
    id: 'logical_symbol',
    skill: 'logical',
    skillLabel: 'ความสามารถทางเหตุผล',
    name: 'การวิเคราะห์เงื่อนไขสัญลักษณ์ / ตรรกศาสตร์',
    range: 'ข้อ 71 - 75',
    itemCount: 5,
    description: 'การสรุปความจากเงื่อนไขสัญลักษณ์ทางคณิตศาสตร์และตรรกะ'
  },
  {
    id: 'logical_situation',
    skill: 'logical',
    skillLabel: 'ความสามารถทางเหตุผล',
    name: 'การวิเคราะห์เงื่อนไขสถานการณ์',
    range: 'ข้อ 76 - 80',
    itemCount: 5,
    description: 'การจัดลำดับ, ตำแหน่งที่นั่ง และการแก้ปัญหาตามเงื่อนไขข้อความ'
  }
];

export const SUBTOPIC_MAP = Object.fromEntries(
  TGAT2_BLUEPRINT.map(sub => [sub.id, sub])
);

/**
 * ระบุรหัสหัวข้อย่อย (subtopicId) ให้กับข้อสอบแต่ละข้อ
 * @param {Object} q - ออบเจกต์ข้อสอบ
 * @returns {string} subtopicId เช่น 'verbal_meaning', 'numerical_series'
 */
export function getQuestionSubtopicId(q) {
  if (q.subtopicId) return q.subtopicId;
  const id = Number(q.id);
  const skill = q.skill;
  const topic = q.topic || '';

  if (skill === 'verbal') {
    if ((id >= 1 && id <= 5) || topic.includes('ความกำกวม') || topic.includes('ความหมายตรง') || topic.includes('ความหมายกว้าง') || topic.includes('การสื่อความหมาย') || (topic.includes('ความหมาย') && !topic.includes('เลือกใช้คำ'))) {
      return 'verbal_meaning';
    }
    if ((id >= 6 && id <= 10) || topic.includes('ระดับภาษา') || topic.includes('ภาษาแบบแผน') || topic.includes('ภาษาเชิงวิชาการ') || topic.includes('บุพบท') || topic.includes('เขียนรายงาน') || topic.includes('การใช้ภาษา')) {
      return 'verbal_usage';
    }
    if ((id >= 11 && id <= 15) || topic.includes('จับใจความ') || topic.includes('สาระสำคัญ') || topic.includes('ตีความสาร') || topic.includes('เจตนา') || topic.includes('แก่นสาร') || topic.includes('จุดประสงค์') || topic.includes('อุปมาอุปไมย') || topic.includes('การอ่าน')) {
      return 'verbal_reading';
    }
    if ((id >= 16 && id <= 20) || topic.includes('เติมคำ') || topic.includes('สำนวน') || topic.includes('เลือกใช้คำ') || topic.includes('จิตวิทยา') || topic.includes('เข้าใจสาร')) {
      return 'verbal_comprehension';
    }
    return 'verbal_meaning';
  }

  if (skill === 'numerical') {
    if ((id >= 21 && id <= 25) || topic.includes('อนุกรม')) {
      return 'numerical_series';
    }
    if ((id >= 26 && id <= 30) || topic.includes('สดมภ์') || topic.includes('เปรียบเทียบเชิงปริมาณ')) {
      return 'numerical_comparison';
    }
    if ((id >= 31 && id <= 35) || topic.includes('ความเพียงพอของข้อมูล') || topic.includes('Data Sufficiency')) {
      return 'numerical_sufficiency';
    }
    if ((id >= 36 && id <= 40) || topic.includes('โจทย์ปัญหา') || topic.includes('สมการ') || topic.includes('อัตราส่วน') || topic.includes('ความน่าจะเป็น')) {
      return 'numerical_problem';
    }
    return 'numerical_problem';
  }

  if (skill === 'spatial') {
    if ((id >= 41 && id <= 45) || topic.includes('พับกล่อง')) {
      return 'spatial_folding';
    }
    if ((id >= 46 && id <= 50) || topic.includes('รูปทรงเรขาคณิต') || (topic.includes('สามมิติ') && !topic.includes('หมุน'))) {
      return 'spatial_geometry';
    }
    if ((id >= 51 && id <= 55) || topic.includes('หมุนภาพ')) {
      return 'spatial_rotation';
    }
    if ((id >= 56 && id <= 60) || topic.includes('ประกอบภาพ')) {
      return 'spatial_composition';
    }
    return 'spatial_folding';
  }

  if (skill === 'logical') {
    if ((id >= 61 && id <= 65) || topic.includes('อนุกรมภาพ')) {
      return 'logical_series';
    }
    if ((id >= 66 && id <= 70) || topic.includes('ความสัมพันธ์ของภาพ')) {
      return 'logical_relation';
    }
    if ((id >= 71 && id <= 75) || topic.includes('เงื่อนไขสัญลักษณ์') || topic.includes('ตรรกะ') || topic.includes('จัดตำแหน่ง') || topic.includes('จัดกลุ่ม')) {
      return 'logical_symbol';
    }
    if ((id >= 76 && id <= 80) || topic.includes('เงื่อนไขสถานการณ์') || topic.includes('สถานการณ์')) {
      return 'logical_situation';
    }
    return 'logical_situation';
  }

  return 'unknown';
}
