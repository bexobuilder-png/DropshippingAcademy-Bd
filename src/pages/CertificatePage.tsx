import React, { useEffect, useState } from 'react';
import { getCurrentUserSession } from '../services/auth';
import { useLanguage } from '../context/LanguageContext';
import { fetchStudentCertificates, Certificate } from '../services/certificates';
import { Award, Download, Eye, FileText, Search } from 'lucide-react';

export const CertificatePage: React.FC = () => {
  const { t } = useLanguage();
  const session = getCurrentUserSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const loadCerts = async () => {
      const list = await fetchStudentCertificates(session.email);
      setCertificates(list);
      setLoading(false);
    };

    loadCerts();
  }, [session]);

  const tabs = [
    { id: 'earned', label: t('প্রাপ্ত সার্টিফিকেট', 'Earned Certificate') },
    { id: 'pending', label: t('প্রক্রিয়াধীন', 'Processing') },
  ];

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8 sm:pl-64">
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('সার্টিফিকেট', 'Certificate')}</h1>
        <p className="text-sm text-gray-500 mb-8">আপনার অর্জিত সার্টিফিকেটগুলো এখানে দেখুন এবং ডাউনলোড করুন।</p>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                tab.id === 'earned'
                  ? 'text-[#059669]'
                  : 'text-gray-400'
              }`}
            >
              {tab.label}
              {tab.id === 'earned' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#059669] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border border-[#059669] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={40} className="text-gray-200" />
            </div>
            <p className="text-gray-500 font-bold">{t('এখনো কোনো সার্টিফিকেট পাওয়া যায়নি', 'No certificates earned yet')}</p>
            <p className="text-xs text-gray-400 mt-1">কোর্স সম্পন্ন করার পর আপনার সার্টিফিকেট এখানে দেখা যাবে।</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                    <FileText size={32} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{cert.courseTitle}</h3>
                    <p className="text-xs text-gray-500">ID: {cert.certificateId}</p>
                    <p className="text-[10px] text-gray-400 mt-1">প্রদানের তারিখ: {new Date(cert.issueDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-emerald-600 shrink-0">
                    <Award size={24} />
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <a 
                    href={cert.downloadUrl || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-[#059669] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#047857] transition-colors"
                  >
                    <Download size={16} />
                    <span>{t('ডাউনলোড', 'Download')}</span>
                  </a>
                  <button className="flex-1 bg-white text-[#059669] border border-[#059669] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
                    <Eye size={16} />
                    <span>{t('দেখুন', 'View')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Professional Note */}
        {!loading && certificates.length > 0 && (
          <div className="mt-12 p-6 bg-emerald-900 rounded-[32px] text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Award size={20} className="text-yellow-400" />
                অভিনন্দন, {session.firstName}!
              </h4>
              <p className="text-sm opacity-80 leading-relaxed">
                আপনার অর্জিত দক্ষতা এখন একটি আন্তর্জাতিক মানের সার্টিফিকেটের মাধ্যমে স্বীকৃত। এই সার্টিফিকেটটি আপনার ক্যারিয়ারের নতুন পথ উন্মোচন করবে।
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          </div>
        )}
      </div>
    </div>
  );
};
