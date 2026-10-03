import React from 'react';
import { getPatientById } from '@/actions/patient';
import { getExercises } from '@/actions/exercise';
import EditPatientClient from './edit-client';
import { redirect } from 'next/navigation';

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const patientId = parseInt(id);
    if (isNaN(patientId)) redirect('/admin/patients');

    const patientRes = await getPatientById(patientId);
    if (!patientRes.success || !patientRes.data) {
        redirect('/admin/patients');
    }

    const patient = patientRes.data;
    const exercisesRes = await getExercises();
    const allExercises = (exercisesRes.success && exercisesRes.data) ? exercisesRes.data : [];

    return <EditPatientClient patient={patient} allExercises={allExercises} />;
}
