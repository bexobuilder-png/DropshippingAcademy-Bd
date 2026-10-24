import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Certificate {
  id: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  certificateId: string;
  downloadUrl?: string;
  createdAt: string;
}

const CERTIFICATES_STORAGE_KEY = 'da_certificates_v1';

export async function fetchAllCertificates(): Promise<Certificate[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: Certificate[] = data.map((d) => ({
          id: d.id,
          studentEmail: d.student_email,
          studentName: d.student_name,
          courseId: d.course_id,
          courseTitle: d.course_title,
          issueDate: d.issue_date,
          certificateId: d.certificate_id,
          downloadUrl: d.download_url || undefined,
          createdAt: d.created_at,
        }));
        localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch {
      // Fall through
    }
  }

  try {
    const raw = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }

  return [];
}

export async function fetchStudentCertificates(email: string): Promise<Certificate[]> {
  const all = await fetchAllCertificates();
  return all.filter((c) => c.studentEmail.toLowerCase() === email.toLowerCase());
}

export async function issueCertificate(
  cert: Omit<Certificate, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string }> {
  const newCert: Certificate = {
    ...cert,
    id: `cert-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('certificates').insert({
        id: newCert.id,
        student_email: newCert.studentEmail,
        student_name: newCert.studentName,
        course_id: newCert.courseId,
        course_title: newCert.courseTitle,
        issue_date: newCert.issueDate,
        certificate_id: newCert.certificateId,
        download_url: newCert.downloadUrl || null,
        created_at: newCert.createdAt,
      });
      if (error) return { success: false, error: error.message };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }

  try {
    const existing = await fetchAllCertificates();
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify([newCert, ...existing]));
  } catch {
    // Ignore
  }

  return { success: true };
}

export async function deleteCertificate(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('certificates').delete().eq('id', id);
    } catch {
      // Ignore
    }
  }

  try {
    const all = await fetchAllCertificates();
    const updated = all.filter((c) => c.id !== id);
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  return true;
}
