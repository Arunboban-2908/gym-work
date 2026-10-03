import { SectionProps } from './types';

export function PersonalInfo({ formData, handleChange, errors, getInputClass, getIconClass }: SectionProps) {
    return (
        <div className="bg-adm-card border border-adm-border rounded-xl p-6 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wide text-adm-muted mb-4 pb-2.5 border-b border-adm-border2">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4 mb-3.5">
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">First Name *</label>
                    <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className={getInputClass('firstName')} />
                    {errors.firstName && <span className="text-red-500 text-[10px] mt-1 block">{errors.firstName}</span>}
                </div>
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Last Name *</label>
                    <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Mitchell" className={getInputClass('lastName')} />
                    {errors.lastName && <span className="text-red-500 text-[10px] mt-1 block">{errors.lastName}</span>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3.5">
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Date of Birth *</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={getInputClass('dob')} />
                    {errors.dob && <span className="text-red-500 text-[10px] mt-1 block">{errors.dob}</span>}
                </div>
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={getInputClass('gender', true)}>
                        <option>Male</option><option>Female</option><option>Non-binary</option>
                    </select>
                    {errors.gender && <span className="text-red-500 text-[10px] mt-1 block">{errors.gender}</span>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Phone *</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 555-000-0000" className={getInputClass('phone')} />
                    {errors.phone && <span className="text-red-500 text-[10px] mt-1 block">{errors.phone}</span>}
                </div>
                <div>
                    <label className="block text-11 font-semibold text-adm-muted mb-1.5 uppercase tracking-wide">Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="patient@email.com" className={getInputClass('email')} />
                    {errors.email && <span className="text-red-500 text-[10px] mt-1 block">{errors.email}</span>}
                </div>
            </div>
        </div>
    );
}
