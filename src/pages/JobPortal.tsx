import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API, { BASE_URL } from '../services/api';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import './ManageProducts.css';

interface Job {
  id: string;
  title: string;
  overview?: string;
  description?: string;
  experience?: string;
  industry?: string;
  employmentType?: string;
  location?: string;
  responsibilities?: string;
  skills?: string;
  postedDate?: string;
}

interface Application {
  id: string;
  jobId: string;
  applicantName: string;
  email: string;
  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  appliedDate: string;
  experience?: string;
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
  job?: { id: string; title: string };
}

const emptyJob: Omit<Job, 'id'> = {
  title: '', overview: '', description: '', experience: '',
  industry: '', employmentType: '', location: '', responsibilities: '', skills: ''
};

export default function JobPortal() {
  const [activeTab, setActiveTab] = useState<'applications' | 'accepted' | 'jobs'>('applications');
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const [totalAppPages, setTotalAppPages] = useState(1);
  const appsPerPage = 10;

  const [jobCurrentPage, setJobCurrentPage] = useState(1);
  const [totalJobPages, setTotalJobPages] = useState(1);
  const jobsPerPage = 10;

  const [jobSearch, setJobSearch] = useState('');
  const [debouncedAppSearch, setDebouncedAppSearch] = useState('');
  const [debouncedJobSearch, setDebouncedJobSearch] = useState('');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [newJob, setNewJob] = useState<Omit<Job, 'id'>>(emptyJob);


  // Debounce search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAppSearch(appSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [appSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedJobSearch(jobSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [jobSearch]);

  // Fetch jobs
  useEffect(() => {
    if (activeTab !== 'jobs') return;
    setLoadingJobs(true);
    API.get(`/career/jobs?page=${jobCurrentPage}&limit=${jobsPerPage}&search=${debouncedJobSearch}`)
      .then(res => {
        setJobs(res.data.data || []);
        setTotalJobPages(res.data.totalPages || 1);
      })
      .catch(() => Swal.fire('Error', 'Failed to load jobs.', 'error'))
      .finally(() => setLoadingJobs(false));
  }, [jobCurrentPage, debouncedJobSearch, activeTab]);

  // Fetch applications
  useEffect(() => {
    if (activeTab === 'jobs') return;
    setLoadingApps(true);
    let statusParam = '';
    if (activeTab === 'accepted') statusParam = 'Accepted';
    else if (activeTab === 'applications') statusParam = appStatusFilter || 'Pending,Reviewed';
    
    API.get(`/career/applications?page=${appCurrentPage}&limit=${appsPerPage}&search=${debouncedAppSearch}&status=${statusParam}`)
      .then(res => {
        setApplications(res.data.data || []);
        setTotalAppPages(res.data.totalPages || 1);
      })
      .catch(() => Swal.fire('Error', 'Failed to load applications.', 'error'))
      .finally(() => setLoadingApps(false));
  }, [appCurrentPage, debouncedAppSearch, activeTab, appStatusFilter]);

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJobId) {
        const res = await API.put(`/career/jobs/${editingJobId}`, newJob);
        setJobs(jobs.map(j => j.id === editingJobId ? res.data.data : j));
        Swal.fire('Updated!', 'Job updated successfully.', 'success');
      } else {
        const res = await API.post('/career/jobs', newJob);
        setJobs([res.data.data, ...jobs]);
        Swal.fire('Added!', 'New job posted.', 'success');
      }
      setNewJob(emptyJob);
      setEditingJobId(null);
      setIsAddingJob(false);
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to save job.', 'error');
    }
  };

  const handleEditJob = (job: Job) => {
    setNewJob({ title: job.title, overview: job.overview || '', description: job.description || '', experience: job.experience || '', industry: job.industry || '', employmentType: job.employmentType || '', location: job.location || '', responsibilities: job.responsibilities || '', skills: job.skills || '' });
    setEditingJobId(job.id);
    setIsAddingJob(true);
  };

  const handleDeleteJob = (id: string) => {
    Swal.fire({
      title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/career/jobs/${id}`);
          setJobs(jobs.filter(j => j.id !== id));
          Swal.fire('Deleted!', 'Job has been deleted.', 'success');
        } catch (err: any) {
          Swal.fire('Error', 'Failed to delete job.', 'error');
        }
      }
    });
  };

  const handleAppAction = (id: string, action: 'Accepted' | 'Rejected' | 'Reviewed') => {
    Swal.fire({
      title: `${action} Application?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'Accepted' ? '#10b981' : action === 'Rejected' ? '#ef4444' : '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${action}!`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await API.patch(`/career/applications/${id}/status`, { status: action });
          setApplications(applications.map(app => app.id === id ? { ...app, status: res.data.data.status } : app));
          Swal.fire(action + '!', `Application has been ${action.toLowerCase()}.`, 'success');
        } catch (err: any) {
          Swal.fire('Error', err.response?.data?.message || 'Failed to update status.', 'error');
        }
      }
    });
  };


  return (
    <div>
      <div className="manage-products-header" style={{ flexWrap: 'wrap', gap: '15px', padding: '16px', marginBottom: '13px' }}>
        <h1 className="page-title manage-products-title" style={{ fontSize: "1.5rem" }}>Job Portal</h1>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (!isAddingJob) { setEditingJobId(null); setNewJob(emptyJob); }
              setIsAddingJob(!isAddingJob);
            }}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: isAddingJob ? '#ef4444' : '#4F46E5', color: 'white', fontWeight: '600', cursor: 'pointer' }}
          >
            {isAddingJob ? 'Cancel' : '+ Add Job'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
        {(['applications', 'accepted', 'jobs'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setAppSearch(''); setAppCurrentPage(1); setJobCurrentPage(1); }}
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #4F46E5' : '2px solid transparent', color: activeTab === tab ? '#4F46E5' : '#64748b', fontWeight: activeTab === tab ? '600' : '500', cursor: 'pointer', textTransform: 'capitalize' }}>
            {tab === 'applications' ? 'Applications' : tab === 'accepted' ? 'Accepted' : 'Job Postings'}
          </button>
        ))}
      </div>

      {/* Add / Edit Job Form */}
      {isAddingJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button onClick={() => { setIsAddingJob(false); setEditingJobId(null); setNewJob(emptyJob); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
          <h3 style={{ margin: '0 0 20px', color: '#1e293b' }}>{editingJobId ? 'Edit Job' : 'Post a New Job'}</h3>
          <form onSubmit={handleJobSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { name: 'title', label: 'Job Title *', required: true },
                { name: 'industry', label: 'Industry' },
                { name: 'location', label: 'Location' },
                { name: 'experience', label: 'Experience Required' },
              ].map(({ name, label, required }) => (
                <div key={name}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>{label}</label>
                  <input
                    type="text"
                    value={(newJob as any)[name]}
                    onChange={e => setNewJob({ ...newJob, [name]: e.target.value })}
                    required={required}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Employment Type</label>
                <select value={newJob.employmentType} onChange={e => setNewJob({ ...newJob, employmentType: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}>
                  <option value="">Select Type</option>
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>Skills Required</label>
                <input type="text" value={newJob.skills} onChange={e => setNewJob({ ...newJob, skills: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
            </div>
            {[{ name: 'overview', label: 'Job Overview' }, { name: 'description', label: 'Job Description' }, { name: 'responsibilities', label: 'Responsibilities (one per line)' }].map(({ name, label }) => (
              <div key={name} style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>{label}</label>
                <textarea value={(newJob as any)[name]} onChange={e => setNewJob({ ...newJob, [name]: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#4F46E5', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                {editingJobId ? 'Update Job' : 'Post Job'}
              </button>
              <button type="button" onClick={() => { setIsAddingJob(false); setEditingJobId(null); setNewJob(emptyJob); }}
                style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
        </div>
      )}

      {/* Applications Tab */}
      {(activeTab === 'applications' || activeTab === 'accepted') && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search by name or job..." value={appSearch}
              onChange={e => { setAppSearch(e.target.value); setAppCurrentPage(1); }}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 200px' }} />
            {activeTab === 'applications' && (
              <select value={appStatusFilter} onChange={e => { setAppStatusFilter(e.target.value); setAppCurrentPage(1); }}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', flex: '0 1 200px' }}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
              </select>
            )}
          </div>

          {loadingApps ? <Loading /> : applications.length === 0 ? (
            <p style={{ color: '#64748b' }}>No applications found.</p>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    {['Applicant Name', 'Job Applied For', 'Experience', 'Date Applied', 'Resume', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '500' }}>{app.applicantName}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{app.job?.title || 'Unknown Job'}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{app.experience || 'Not specified'}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{app.appliedDate}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {app.resumeUrl ? (
                          <a href={`${BASE_URL}${app.resumeUrl}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '500' }}>
                            View Resume
                          </a>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500',
                          backgroundColor: app.status === 'Pending' ? '#fef3c7' : app.status === 'Reviewed' ? '#e0f2fe' : app.status === 'Accepted' ? '#dcfce7' : '#fee2e2',
                          color: app.status === 'Pending' ? '#d97706' : app.status === 'Reviewed' ? '#0284c7' : app.status === 'Accepted' ? '#166534' : '#dc2626'
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(app.status === 'Pending' || app.status === 'Reviewed') && (
                            <>
                              <button onClick={() => handleAppAction(app.id, 'Reviewed')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Review</button>
                              <button onClick={() => handleAppAction(app.id, 'Accepted')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Accept</button>
                              <button onClick={() => handleAppAction(app.id, 'Rejected')} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Reject</button>
                            </>
                          )}
                          <button onClick={() => setViewingApplication(app)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#64748b', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalAppPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Pagination currentPage={appCurrentPage} totalPages={totalAppPages} onPageChange={setAppCurrentPage} />
            </div>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search by job title or code..." value={jobSearch}
              onChange={e => { setJobSearch(e.target.value); setJobCurrentPage(1); }}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 200px' }} />
          </div>
          {loadingJobs ? <Loading /> : jobs.length === 0 ? (
            <p style={{ color: '#64748b' }}>No job postings yet. Click "+ Add Job" to create one.</p>
          ) : (
            <div>
              <div style={{ display: 'grid', gap: '16px' }}>
                {jobs.map(job => (
                  <div key={job.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '1.1rem' }}>{job.title}</h3>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {job.industry && <span style={{ fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{job.industry}</span>}
                        {job.location && <span style={{ fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{job.location}</span>}
                        {job.experience && <span style={{ fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{job.experience}</span>}
                        {job.employmentType && <span style={{ fontSize: '0.85rem', color: '#4F46E5', background: '#ede9fe', padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>{job.employmentType}</span>}
                      </div>
                      {job.overview && <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{job.overview.slice(0, 150)}{job.overview.length > 150 ? '...' : ''}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditJob(job)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#4F46E5', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                      <button onClick={() => handleDeleteJob(job.id)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalJobPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <Pagination currentPage={jobCurrentPage} totalPages={totalJobPages} onPageChange={setJobCurrentPage} />
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* Application Detail Modal */}
      {viewingApplication && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Application Details</h3>
              <button onClick={() => setViewingApplication(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>�</button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                ['Name', viewingApplication.applicantName],
                ['Email', viewingApplication.email],
                ['Phone', viewingApplication.phone],
                ['Gender', viewingApplication.gender],
                ['Date of Birth', viewingApplication.dob],
                ['Experience', viewingApplication.experience],
                ['Current Salary', viewingApplication.currentSalary],
                ['Expected Salary', viewingApplication.expectedSalary],
                ['Available To Join', viewingApplication.availableToJoin],
                ['Preferred Location', viewingApplication.preferredLocation],
                ['Current Location', viewingApplication.currentLocation],
                ['Skills', viewingApplication.skills],
                ['Status', viewingApplication.status],
                ['Applied For', viewingApplication.job?.title || '-'],
              ].map(([label, value]) => value ? (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>{label}</span>
                  <span style={{ color: '#1e293b' }}>{value}</span>
                </div>
              ) : null)}
              {viewingApplication.resumeUrl && (
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px', padding: '8px 0' }}>
                  <span style={{ color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>Resume</span>
                  <a href={`${BASE_URL}${viewingApplication.resumeUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', fontWeight: '500' }}>Download Resume</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
