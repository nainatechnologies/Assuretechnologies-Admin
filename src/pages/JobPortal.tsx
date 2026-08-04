import { useState } from 'react';
import Swal from 'sweetalert2';
import './ManageProducts.css'; // Reusing existing styling patterns

interface Job {
  id: string;
  overview: string;
  description: string;
  experience: string;
  industry: string;
  employmentType: string;
  location: string;
  responsibilities: string;
  skills: string;
  postedDate: string;
}

interface Application {
  id: string;
  jobId: string;
  applicantName: string;
  email: string;
  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  appliedDate: string;
  applicantExperience?: string;
  resumeFileName?: string;
  resumeUrl?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  availableToJoin?: string;
  currentSalary?: string;
  expectedSalary?: string;
  preferredLocation?: string;
  currentLocation?: string;
  skills?: string;
}

export default function JobPortal() {
  const [activeTab, setActiveTab] = useState<'applications' | 'accepted' | 'jobs'>('applications');
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);

  // Applications Table State
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const appsPerPage = 5;

  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'j1',
      overview: 'Join our dynamic team as a Software Engineer.',
      description: 'We are looking for a skilled Software Engineer to build scalable web applications.',
      experience: '3-5 years',
      industry: 'Information Technology',
      employmentType: 'full-time',
      location: 'New York, NY',
      responsibilities: 'Develop and maintain web apps.\nCollaborate with cross-functional teams.',
      skills: 'React, TypeScript, Node.js',
      postedDate: '2023-09-15'
    },
    {
      id: 'j2',
      overview: 'Exciting opportunity for a Marketing Manager.',
      description: 'Lead our marketing campaigns and drive brand awareness.',
      experience: '5+ years',
      industry: 'Marketing',
      employmentType: 'full-time',
      location: 'Remote',
      responsibilities: 'Plan marketing strategies.\nManage social media accounts.',
      skills: 'SEO, Content Marketing, Google Analytics',
      postedDate: '2023-09-20'
    }
  ]);

  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'a1',
      jobId: 'j1',
      applicantName: 'Alice Smith',
      email: 'alice@example.com',
      status: 'Pending',
      appliedDate: '2023-10-01',
      applicantExperience: '4 years',
      resumeFileName: 'Alice_Smith_Resume.pdf',
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      phone: '9876543210',
      gender: 'Female',
      dob: '1995-05-15',
      availableToJoin: 'Immediate',
      currentSalary: '8 LPA',
      expectedSalary: '12 LPA',
      preferredLocation: 'Remote',
      currentLocation: 'New York, NY',
      skills: 'React, Node.js, TypeScript'
    },
    {
      id: 'a2',
      jobId: 'j2',
      applicantName: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'Reviewed',
      appliedDate: '2023-10-02',
      applicantExperience: '6 years',
      resumeFileName: 'Bob_Johnson_CV.pdf',
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'a3',
      jobId: 'j1',
      applicantName: 'Charlie Brown',
      email: 'charlie@example.com',
      status: 'Accepted',
      appliedDate: '2023-10-03',
      applicantExperience: '3 years',
      resumeFileName: 'CBrown_Resume.pdf',
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'a4',
      jobId: 'j2',
      applicantName: 'Diana Prince',
      email: 'diana@example.com',
      status: 'Rejected',
      appliedDate: '2023-10-04',
      applicantExperience: '8 years',
      resumeFileName: 'Diana_Prince_Resume.pdf',
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'a5',
      jobId: 'j1',
      applicantName: 'Ethan Hunt',
      email: 'ethan@example.com',
      status: 'Pending',
      appliedDate: '2023-10-05',
      applicantExperience: '5 years',
      resumeFileName: 'EHunt_CV.pdf',
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'a6',
      jobId: 'j2',
      applicantName: 'Fiona Gallagher',
      email: 'fiona@example.com',
      status: 'Reviewed',
      appliedDate: '2023-10-06',
      applicantExperience: '7 years',
      resumeFileName: 'Fiona_G_Resume.pdf',
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ]);

  const [newJob, setNewJob] = useState<Omit<Job, 'id' | 'postedDate'>>({
    overview: '',
    description: '',
    experience: '',
    industry: '',
    employmentType: '',
    location: '',
    responsibilities: '',
    skills: ''
  });

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJobId) {
      setJobs(jobs.map(j => j.id === editingJobId ? { ...j, ...newJob } as Job : j));
      Swal.fire('Updated!', 'Job has been updated successfully.', 'success');
    } else {
      const jobToAdd: Job = {
        ...newJob,
        id: Math.random().toString(36).substring(2, 9),
        postedDate: new Date().toISOString().split('T')[0]
      };
      setJobs([...jobs, jobToAdd]);
      Swal.fire('Added!', 'New job has been posted.', 'success');
    }
    setNewJob({
      overview: '',
      description: '',
      experience: '',
      industry: '',
      employmentType: '',
      location: '',
      responsibilities: '',
      skills: ''
    });
    setEditingJobId(null);
    setIsAddingJob(false);
  };

  const handleEditJob = (job: Job) => {
    setNewJob(job);
    setEditingJobId(job.id);
    setIsAddingJob(true);
  };

  const handleDeleteJob = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setJobs(jobs.filter(j => j.id !== id));
        Swal.fire('Deleted!', 'The job has been deleted.', 'success');
      }
    });
  };

  const handleAppAction = (id: string, action: 'Accepted' | 'Rejected') => {
    Swal.fire({
      title: action === 'Accepted' ? 'Accept Application?' : 'Reject Application?',
      text: action === 'Accepted' ? "This will move the application to Accepted tab." : "This will remove the application permanently.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'Accepted' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: action === 'Accepted' ? 'Yes, Accept!' : 'Yes, Reject!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (action === 'Rejected') {
          setApplications(applications.filter(app => app.id !== id));
          Swal.fire('Rejected!', 'Application has been rejected and removed.', 'info');
        } else {
          setApplications(applications.map(app => app.id === id ? { ...app, status: action } : app));
          Swal.fire('Accepted!', 'Application has been accepted.', 'success');
        }
      }
    });
  };

  const filteredApps = applications.filter(app => {
    if (activeTab === 'applications') {
      if (app.status === 'Accepted' || app.status === 'Rejected') return false;
      if (appStatusFilter && app.status !== appStatusFilter) return false;
    } else if (activeTab === 'accepted') {
      if (app.status !== 'Accepted') return false;
    } else {
      return false;
    }
    const matchesSearch = appSearch ? (app.applicantName.toLowerCase().includes(appSearch.toLowerCase()) ||
      (jobs.find(j => j.id === app.jobId)?.overview.toLowerCase().includes(appSearch.toLowerCase()) || false)) : true;
    return matchesSearch;
  });

  const totalAppPages = Math.ceil(filteredApps.length / appsPerPage);
  const currentApps = filteredApps.slice((appCurrentPage - 1) * appsPerPage, appCurrentPage * appsPerPage);

  return (
    <div>
      <div className="manage-products-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <h1 className="page-title manage-products-title">Job Portal</h1>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (!isAddingJob) {
                setEditingJobId(null);
                setNewJob({ overview: '', description: '', experience: '', industry: '', employmentType: '', location: '', responsibilities: '', skills: '' });
              }
              setIsAddingJob(!isAddingJob);
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: isAddingJob ? '#ef4444' : '#4F46E5',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {isAddingJob ? 'Cancel' : '+ Add Job'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => { setActiveTab('applications'); setAppSearch(''); setAppCurrentPage(1); }}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'applications' ? '2px solid #4F46E5' : '2px solid transparent',
            color: activeTab === 'applications' ? '#4F46E5' : '#64748b',
            fontWeight: activeTab === 'applications' ? '600' : '500',
            fontSize: '1.15rem',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          Received Applications
        </button>
        <button
          onClick={() => { setActiveTab('accepted'); setAppSearch(''); setAppCurrentPage(1); }}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'accepted' ? '2px solid #4F46E5' : '2px solid transparent',
            color: activeTab === 'accepted' ? '#4F46E5' : '#64748b',
            fontWeight: activeTab === 'accepted' ? '600' : '500',
            fontSize: '1.15rem',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          Accepted Applications
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'jobs' ? '2px solid #4F46E5' : '2px solid transparent',
            color: activeTab === 'jobs' ? '#4F46E5' : '#64748b',
            fontWeight: activeTab === 'jobs' ? '600' : '500',
            fontSize: '1.15rem',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          Posted Jobs
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {activeTab === 'applications' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#1e293b' }}>Received Applications</h2>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name or job..."
                value={appSearch}
                onChange={e => { setAppSearch(e.target.value); setAppCurrentPage(1); }}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 200px' }}
              />
              <select
                value={appStatusFilter}
                onChange={e => { setAppStatusFilter(e.target.value); setAppCurrentPage(1); }}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', flex: '0 1 200px' }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
              </select>
            </div>

            {filteredApps.length === 0 ? (
              <p style={{ color: '#64748b' }}>No applications found.</p>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Applicant Name</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Job Applied For</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Experience</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Date Applied</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Job Posted</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Resume</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentApps.map((app, index) => {
                      const job = jobs.find(j => j.id === app.jobId);
                      return (
                        <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '500' }}>{app.applicantName}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{job?.overview || 'Unknown Job'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{app.applicantExperience || 'Not specified'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{app.appliedDate}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{job?.postedDate || '-'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>
                            {app.resumeFileName && app.resumeUrl ? (
                              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '500' }}>
                                📄 {app.resumeFileName}
                              </a>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500',
                              backgroundColor: app.status === 'Pending' ? '#fef3c7' : app.status === 'Reviewed' ? '#e0f2fe' : '#dcfce3',
                              color: app.status === 'Pending' ? '#d97706' : app.status === 'Reviewed' ? '#0284c7' : '#166534'
                            }}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {app.status === 'Pending' || app.status === 'Reviewed' ? (
                                <>
                                  <button onClick={() => handleAppAction(app.id, 'Accepted')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Accept</button>
                                  <button onClick={() => handleAppAction(app.id, 'Rejected')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>Reject</button>
                                </>
                              ) : null}
                              <button onClick={() => setViewingApplication(app)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>View</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalAppPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '15px', gap: '10px' }}>
                <button
                  onClick={() => setAppCurrentPage(p => Math.max(1, p - 1))}
                  disabled={appCurrentPage === 1}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: appCurrentPage === 1 ? 'not-allowed' : 'pointer', color: appCurrentPage === 1 ? '#94a3b8' : '#334155' }}
                >
                  Previous
                </button>
                <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '500' }}>Page {appCurrentPage} of {totalAppPages}</span>
                <button
                  onClick={() => setAppCurrentPage(p => Math.min(totalAppPages, p + 1))}
                  disabled={appCurrentPage === totalAppPages}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: appCurrentPage === totalAppPages ? 'not-allowed' : 'pointer', color: appCurrentPage === totalAppPages ? '#94a3b8' : '#334155' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'accepted' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#1e293b' }}>Accepted Applications</h2>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name or job..."
                value={appSearch}
                onChange={e => { setAppSearch(e.target.value); setAppCurrentPage(1); }}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 200px' }}
              />
            </div>

            {filteredApps.length === 0 ? (
              <p style={{ color: '#64748b' }}>No accepted applications found.</p>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Applicant Name</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Job Applied For</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Experience</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Date Applied</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentApps.map((app, index) => {
                      const job = jobs.find(j => j.id === app.jobId);
                      return (
                        <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '500' }}>{app.applicantName}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{job?.overview || 'Unknown Job'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{app.applicantExperience || 'Not specified'}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{app.appliedDate}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500',
                              backgroundColor: '#dcfce3',
                              color: '#166534'
                            }}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => setViewingApplication(app)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>View</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalAppPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '15px', gap: '10px' }}>
                <button
                  onClick={() => setAppCurrentPage(p => Math.max(1, p - 1))}
                  disabled={appCurrentPage === 1}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: appCurrentPage === 1 ? 'not-allowed' : 'pointer', color: appCurrentPage === 1 ? '#94a3b8' : '#334155' }}
                >
                  Previous
                </button>
                <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '500' }}>Page {appCurrentPage} of {totalAppPages}</span>
                <button
                  onClick={() => setAppCurrentPage(p => Math.min(totalAppPages, p + 1))}
                  disabled={appCurrentPage === totalAppPages}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: appCurrentPage === totalAppPages ? 'not-allowed' : 'pointer', color: appCurrentPage === totalAppPages ? '#94a3b8' : '#334155' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#1e293b' }}>Posted Jobs</h2>
            {jobs.length === 0 ? (
              <p style={{ color: '#64748b' }}>No jobs posted yet.</p>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Job Overview</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Experience</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Location</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Type / Industry</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Posted Date</th>
                      <th style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job, index) => (
                      <tr key={job.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '500' }}>
                          <div style={{ marginBottom: '4px' }}>{job.overview}</div>
                          <div style={{ color: '#64748b', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {job.description}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{job.experience}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{job.location}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{job.employmentType} / {job.industry}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{job.postedDate}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditJob(job)} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                            <button onClick={() => handleDeleteJob(job.id)} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      {isAddingJob && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: 'white',
            padding: '25px', borderRadius: '12px', position: 'relative'
          }}>
            <button
              onClick={() => setIsAddingJob(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'none', border: 'none', fontSize: '1.5rem',
                cursor: 'pointer', color: '#64748b'
              }}
            >
              &times;
            </button>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>{editingJobId ? 'Edit Job' : 'Add New Job'}</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={handleJobSubmit}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Job Overview</label>
                <textarea rows={2} className="input-field" style={{ width: '100%' }} placeholder="Brief overview of the job..." value={newJob.overview} onChange={e => setNewJob({ ...newJob, overview: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Job Description</label>
                <textarea rows={3} className="input-field" style={{ width: '100%' }} placeholder="Detailed job description..." value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Experience</label>
                  <input type="text" className="input-field" style={{ width: '100%' }} placeholder="e.g. 2-4 years" value={newJob.experience} onChange={e => setNewJob({ ...newJob, experience: e.target.value })} required />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Industry</label>
                  <input type="text" className="input-field" style={{ width: '100%' }} placeholder="e.g. Technology" value={newJob.industry} onChange={e => setNewJob({ ...newJob, industry: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Employment Type</label>
                  <select className="input-field" style={{ width: '100%' }} value={newJob.employmentType} onChange={e => setNewJob({ ...newJob, employmentType: e.target.value })} required>
                    <option value="">Select Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Location</label>
                  <input type="text" className="input-field" style={{ width: '100%' }} placeholder="e.g. New York, NY (or Remote)" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Key Responsibilities</label>
                <textarea rows={3} className="input-field" style={{ width: '100%' }} placeholder="List key responsibilities..." value={newJob.responsibilities} onChange={e => setNewJob({ ...newJob, responsibilities: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#334155' }}>Required Skills and Qualifications</label>
                <textarea rows={3} className="input-field" style={{ width: '100%' }} placeholder="List required skills and qualifications..." value={newJob.skills} onChange={e => setNewJob({ ...newJob, skills: e.target.value })} required />
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingJob(false)}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', cursor: 'pointer', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#4F46E5', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  {editingJobId ? 'Save Changes' : 'Save Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Application Modal - Minimalist Notion Style */}
      {viewingApplication && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '20px', backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff',
            borderRadius: '12px', position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '40px'
          }}>
            <button
              onClick={() => setViewingApplication(null)}
              style={{
                position: 'absolute', top: '25px', right: '25px',
                background: 'transparent', border: 'none', fontSize: '1.5rem',
                cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              &times;
            </button>

            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '2.5rem' }}>📄</span>
                <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: '700', letterSpacing: '-0.02em' }}>
                  {viewingApplication.applicantName}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em',
                  backgroundColor: viewingApplication.status === 'Pending' ? '#fffbeb' : viewingApplication.status === 'Reviewed' ? '#eff6ff' : viewingApplication.status === 'Accepted' ? '#f0fdf4' : '#fef2f2',
                  color: viewingApplication.status === 'Pending' ? '#b45309' : viewingApplication.status === 'Reviewed' ? '#1d4ed8' : viewingApplication.status === 'Accepted' ? '#15803d' : '#b91c1c',
                  border: `1px solid ${viewingApplication.status === 'Pending' ? '#fde68a' : viewingApplication.status === 'Reviewed' ? '#bfdbfe' : viewingApplication.status === 'Accepted' ? '#bbf7d0' : '#fecaca'}`
                }}>
                  {viewingApplication.status}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  <strong style={{ color: '#475569', fontWeight: '600' }}>Email ID:</strong> {viewingApplication.email}
                </span>
                {viewingApplication.phone && (
                  <span style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    • <strong style={{ color: '#475569', fontWeight: '600' }}>Phone No:</strong> {viewingApplication.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Content Table / Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

              {/* Row: Experience & Skills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', padding: '20px 0', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ color: '#000000', fontSize: '0.9rem', fontWeight: '600' }}>Professional</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Experience</span>
                    <span style={{ color: '#000000', fontWeight: '600' }}>{viewingApplication.applicantExperience || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Skills</span>
                    <span style={{ color: '#000000', fontWeight: '600', lineHeight: '1.6' }}>{viewingApplication.skills || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Row: Expectations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', padding: '20px 0', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ color: '#000000', fontSize: '0.9rem', fontWeight: '600' }}>Expectations</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Current Salary</span>
                    <span style={{ color: '#000000', fontWeight: '600' }}>{viewingApplication.currentSalary || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Expected Salary</span>
                    <span style={{ color: '#000000', fontWeight: '600' }}>{viewingApplication.expectedSalary || '-'}</span>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Availability</span>
                    <span style={{ color: '#000000', fontWeight: '600' }}>{viewingApplication.availableToJoin || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Row: Personal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', padding: '20px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ color: '#000000', fontSize: '0.9rem', fontWeight: '600' }}>Personal</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Location</span>
                    <span style={{ color: '#000000', fontWeight: '600' }}>{viewingApplication.currentLocation || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Preferred Location</span>
                    <span style={{ color: '#000000', fontWeight: '600' }}>{viewingApplication.preferredLocation || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Gender</span>
                    <span style={{ color: '#000000', fontWeight: '600' }}>{viewingApplication.gender || '-'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#000000', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Date of Birth</span>
                    <span style={{ color: '#000000', fontWeight: '600' }}>{viewingApplication.dob || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
              {viewingApplication.status !== 'Accepted' && viewingApplication.status !== 'Rejected' && (
                <>
                  <button
                    onClick={() => { handleAppAction(viewingApplication.id, 'Accepted'); setViewingApplication(null); }}
                    style={{
                      padding: '10px 24px', borderRadius: '8px', border: 'none',
                      background: '#10b981', color: 'white', fontWeight: '600',
                      cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => { handleAppAction(viewingApplication.id, 'Rejected'); setViewingApplication(null); }}
                    style={{
                      padding: '10px 24px', borderRadius: '8px', border: 'none',
                      background: '#ef4444', color: 'white', fontWeight: '600',
                      cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setViewingApplication(null)}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  background: '#0f172a', color: 'white', fontWeight: '600',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0f172a'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
