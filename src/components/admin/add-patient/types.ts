export interface PatientFormData {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    injuryLevel: string;
    ais: string;
    therapist: string;
    program: string;
    notes: string;
    status: string;
}

export interface SectionProps {
    formData: PatientFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    errors: Record<string, string>;
    getInputClass: (fieldName: string, isSelect?: boolean) => string;
    getIconClass: (fieldName: string) => string;
}
