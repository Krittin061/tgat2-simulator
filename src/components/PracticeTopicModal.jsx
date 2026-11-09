'use client';

/**
 * คอมโพเนนต์: PracticeTopicModal
 * หน้าที่: หน้าต่างเลือกหมวดวิชา / หัวข้อย่อยสำหรับโหมดฝึกหัด
 * - เลือกทั้งหมวดผ่านช่องติ๊กของหมวด (รองรับสถานะเลือกบางส่วน)
 * - กดที่ชื่อหมวดเพื่อเปิด/ปิดรายการหัวข้อย่อย
 * - รองรับคีย์บอร์ด (Tab, Space, Esc) และ screen reader
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, X, ChevronDown, ArrowRight, Loader2 } from 'lucide-react';
import { TGAT2_BLUEPRINT } from '@/types/exam';

// ข้อมูลหมวดวิชาหลัก TGAT2 ทั้ง 4 ด้าน
export const PRACTICE_SKILLS = [
  { id: 'verbal', no: 1, name: 'ความสามารถทางภาษา', range: 'ข้อ 1 - 20', color: '#3B82F6' },
  { id: 'numerical', no: 2, name: 'ความสามารถทางตัวเลข', range: 'ข้อ 21 - 40', color: '#10B981' },
  { id: 'spatial', no: 3, name: 'ความสามารถทางมิติสัมพันธ์', range: 'ข้อ 41 - 60', color: '#8B5CF6' },
  { id: 'logical', no: 4, name: 'ความสามารถทางเหตุผล', range: 'ข้อ 61 - 80', color: '#F59E0B' }
];

const SUBTOPICS_BY_SKILL = Object.fromEntries(
  PRACTICE_SKILLS.map(skill => [skill.id, TGAT2_BLUEPRINT.filter(st => st.skill === skill.id)])
);
const SKILL_COLOR = Object.fromEntries(PRACTICE_SKILLS.map(s => [s.id, s.color]));

const countItems = subs => subs.reduce((sum, st) => sum + (st.itemCount || 5), 0);

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function SkillCheckbox({ checked, indeterminate, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" className="ptm-check" checked={checked} {...props} />;
}

export function PracticeTopicModal({ open, selected, onChange, onClose, onStart }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [expanded, setExpanded] = useState({});
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // ล็อกการเลื่อนหน้าหลัก, โฟกัสในหน้าต่าง, Esc เพื่อปิด และวนโฟกัสด้วย Tab
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedSubs = TGAT2_BLUEPRINT.filter(st => selectedSet.has(st.id));
  const selectedItems = countItems(selectedSubs);
  const totalSubs = TGAT2_BLUEPRINT.length;
  const isNone = selectedSubs.length === 0;
  const isAll = selectedSubs.length === totalSubs;
  const allExpanded = PRACTICE_SKILLS.every(s => expanded[s.id]);

  if (!open) return null;

  // เก็บลำดับตามพิมพ์เขียวเสมอ
  const commit = (nextSet) => onChange(TGAT2_BLUEPRINT.filter(st => nextSet.has(st.id)).map(st => st.id));

  const toggleSubtopic = (id) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id); else next.add(id);
    commit(next);
  };

  const toggleSkill = (skillId) => {
    const ids = SUBTOPICS_BY_SKILL[skillId].map(st => st.id);
    const allOn = ids.every(id => selectedSet.has(id));
    const next = new Set(selectedSet);
    ids.forEach(id => (allOn ? next.delete(id) : next.add(id)));
    commit(next);
  };

  const toggleExpand = (skillId) => setExpanded(prev => ({ ...prev, [skillId]: !prev[skillId] }));
  const setAllExpanded = (value) => setExpanded(Object.fromEntries(PRACTICE_SKILLS.map(s => [s.id, value])));

  return (
    <div
      className="modal-overlay ptm-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="ptm-dialog animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ptm-title"
        aria-describedby="ptm-desc"
        tabIndex={-1}
      >
        {/* Header */}
        <header className="ptm-header">
          <div className="ptm-header-icon" aria-hidden="true">
            <Filter size={20} />
          </div>
          <div className="ptm-header-text">
            <h3 id="ptm-title">เลือกหัวข้อสำหรับโหมดฝึกหัด</h3>
            <p id="ptm-desc">ติ๊กเพื่อเลือกทั้งหมด หรือกดชื่อหมวดเพื่อเลือกเฉพาะหัวข้อย่อย · ข้อสอบเรียงตามพิมพ์เขียว</p>
          </div>
          <button type="button" className="ptm-icon-btn" onClick={onClose} aria-label="ปิดหน้าต่าง">
            <X size={20} />
          </button>
        </header>

        {/* Summary + blueprint coverage map */}
        <section className="ptm-summary">
          <div className="ptm-summary-row">
            <div aria-live="polite">
              <div className="ptm-summary-count">
                <strong>{selectedItems}</strong> ข้อ
              </div>
              <div className="ptm-summary-sub">เลือก {selectedSubs.length} จาก {totalSubs} หัวข้อย่อย</div>
            </div>
            <div className="ptm-quick">
              <button type="button" className="ptm-chip" onClick={() => commit(new Set(TGAT2_BLUEPRINT.map(st => st.id)))} disabled={isAll}>
                เลือกทั้งหมด
              </button>
              <button type="button" className="ptm-chip" onClick={() => commit(new Set())} disabled={isNone}>
                ล้าง
              </button>
            </div>
          </div>

          <div className="ptm-map" aria-hidden="true">
            {PRACTICE_SKILLS.map(skill => (
              <div key={skill.id} className="ptm-map-group">
                {SUBTOPICS_BY_SKILL[skill.id].map(st => (
                  <span
                    key={st.id}
                    className={`ptm-map-cell ${selectedSet.has(st.id) ? 'is-on' : ''}`}
                    style={{ '--skill': SKILL_COLOR[st.skill] }}
                    title={`${st.name} (${st.range})`}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Category list */}
        <div className="ptm-list">
          <div className="ptm-list-head">
            <span>หมวดวิชา</span>
            <button type="button" className="ptm-link" onClick={() => setAllExpanded(!allExpanded)}>
              {allExpanded ? 'ย่อทั้งหมด' : 'ขยายทั้งหมด'}
            </button>
          </div>

          {PRACTICE_SKILLS.map(skill => {
            const subs = SUBTOPICS_BY_SKILL[skill.id];
            const chosen = subs.filter(st => selectedSet.has(st.id));
            const allOn = chosen.length === subs.length;
            const partial = chosen.length > 0 && !allOn;
            const isOpen = !!expanded[skill.id];
            const panelId = `ptm-subs-${skill.id}`;

            return (
              <section
                key={skill.id}
                className={`ptm-skill ${chosen.length > 0 ? 'is-active' : ''}`}
                style={{ '--skill': skill.color }}
              >
                <div className="ptm-skill-head">
                  <label className="ptm-check-hit">
                    <SkillCheckbox
                      checked={allOn}
                      indeterminate={partial}
                      onChange={() => toggleSkill(skill.id)}
                      aria-label={`เลือกทั้งหมวด ${skill.name}`}
                    />
                  </label>
                  <button
                    type="button"
                    className="ptm-skill-toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleExpand(skill.id)}
                  >
                    <span className="ptm-skill-text">
                      <span className="ptm-skill-title">
                        <span className="ptm-skill-no">หมวด {skill.no}</span>
                        {skill.name}
                      </span>
                      <span className="ptm-skill-meta">
                        {skill.range} · เลือก {chosen.length}/{subs.length} หัวข้อ ({countItems(chosen)} ข้อ)
                      </span>
                    </span>
                    <ChevronDown size={18} className={`ptm-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true" />
                  </button>
                </div>

                {isOpen && (
                  <ul id={panelId} className="ptm-subs">
                    {subs.map(sub => {
                      const isOn = selectedSet.has(sub.id);
                      return (
                        <li key={sub.id}>
                          <label className={`ptm-sub ${isOn ? 'is-selected' : ''}`}>
                            <input
                              type="checkbox"
                              className="ptm-check"
                              checked={isOn}
                              onChange={() => toggleSubtopic(sub.id)}
                            />
                            <span className="ptm-sub-text">
                              <span className="ptm-sub-name">
                                {sub.name} <span className="ptm-sub-range">{sub.range}</span>
                              </span>
                              <span className="ptm-sub-desc">{sub.description}</span>
                            </span>
                            <span className="ptm-sub-count">{sub.itemCount || 5} ข้อ</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="ptm-footer">
          {isNone && (
            <p className="ptm-hint" role="status">เลือกอย่างน้อย 1 หัวข้อเพื่อเริ่มฝึก</p>
          )}
          <div className="ptm-actions">
            <button type="button" className="btn-outline ptm-btn" onClick={onClose}>
              ยกเลิก
            </button>
            <button
              type="button"
              className="btn-primary ptm-btn ptm-btn-primary"
              disabled={isNone || starting}
              aria-busy={starting}
              onClick={async () => {
                setStarting(true);
                try {
                  await onStart(selectedSubs.map(st => st.id));
                } finally {
                  setStarting(false);
                }
              }}
            >
              {starting ? (
                <>
                  <Loader2 size={16} className="ptm-spin" aria-hidden="true" /> กำลังเตรียมข้อสอบ…
                </>
              ) : (
                <>
                  เริ่มฝึก {selectedItems} ข้อ <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
