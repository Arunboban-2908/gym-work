import { getPatients } from '@/actions/patient';
import PatientsClient from '../../../components/admin/list-patient/patients-client';

export const metadata = {
    title: 'Patients | NeuroPath Admin',
    description: 'Manage all patients in the NeuroPath system',
};

export default async function PatientsPage() {
    const res = await getPatients();
    const patients = res.success ? res.data : [];

    return <PatientsClient initialPatients={patients} />;
}
