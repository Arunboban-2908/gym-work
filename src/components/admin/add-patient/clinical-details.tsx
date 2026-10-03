import { SectionProps } from './types';

export function ClinicalDetails({ formData, handleChange, errors, getInputClass, getIconClass }: SectionProps) {
    return (
        <div className="bg-adm-card border border-adm-border rounded-xl p-6 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wide text-adm-muted mb-4 pb-2.5 border-b border-adm-border2">SCI Clinical Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-3.5">
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Injury Level *</label>
                    <select name="injuryLevel" value={formData.injuryLevel} onChange={handleChange} className={getInputClass('injuryLevel', true)}>
                        <option>C1-C4</option><option>C5-C8</option><option>T1-T6</option><option>T7-T12</option><option>L1-L5</option><option>S1-S5</option>
                    </select>
                    {errors.injuryLevel && <span className="text-red-500 text-[10px] mt-1 block">{errors.injuryLevel}</span>}
                </div>
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">AIS Classification *</label>
                    <select name="ais" value={formData.ais} onChange={handleChange} className={getInputClass('ais', true)}>
                        <option>AIS A</option><option>AIS B</option><option>AIS C</option><option>AIS D</option><option>AIS E</option>
                    </select>
                    {errors.ais && <span className="text-red-500 text-[10px] mt-1 block">{errors.ais}</span>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3.5">
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Assigned Therapist</label>
                    <select name="therapist" value={formData.therapist} onChange={handleChange} className={getInputClass('therapist', true)}>
                        <option>Dr. Sarah Chen</option><option>Mark Rivera, PT</option><option>Dr. Priya Nair</option><option>James Wong, OT</option>
                    </select>
                    {errors.therapist && <span className="text-red-500 text-[10px] mt-1 block">{errors.therapist}</span>}
                </div>
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Program</label>
                    <select name="program" value={formData.program} onChange={handleChange} className={getInputClass('program', true)}>
                        <option>Acute Inpatient</option><option>Sub-acute Rehab</option><option>Outpatient PT</option><option>Home-based</option>
                    </select>
                    {errors.program && <span className="text-red-500 text-[10px] mt-1 block">{errors.program}</span>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3.5">
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Status *</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={getInputClass('status', true)}>
                        <option value="ACTIVE">Active</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                    {errors.status && <span className="text-red-500 text-[10px] mt-1 block">{errors.status}</span>}
                </div>
                {/* Empty div to preserve the 2-column grid structure so the width matches fields above */}
                <div></div>
            </div>
            <div>
                <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Clinical Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="ASIA scores, precautions, assistive devices..." className={`${getInputClass('notes')} min-h-20`} />
                {errors.notes && <span className="text-red-500 text-[10px] mt-1 block">{errors.notes}</span>}
            </div>
        </div>
    );
}
