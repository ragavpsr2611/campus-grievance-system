import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const CATEGORIES = ['Hostel', 'Mess', 'Academic', 'Infrastructure', 'Other'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

function formatDate(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.get('/complaints', { params });
      setComplaints(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/complaints/${id}/status`, { status });
      await loadComplaints();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    await api.delete(`/complaints/${id}`);
    loadComplaints();
  };

  const hasActiveFilters = statusFilter || categoryFilter;

  return (
    <div>
      <Navbar />
      <div className="dashboard">
        <section className="card">
          <h3>All Complaints</h3>
          <div className="filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="loading">Loading complaints...</p>}
          {!loading && complaints.length === 0 && (
            <p>
              {hasActiveFilters
                ? 'No complaints match these filters.'
                : 'No complaints have been submitted yet.'}
            </p>
          )}
          <ul className="complaint-list">
            {complaints.map((c) => (
              <li key={c._id} className="complaint-item">
                <div>
                  <span className={`category category-${c.category}`}>{c.category}</span>{' '}
                  <strong>{c.student?.name}</strong> ({c.student?.email})
                  <p>{c.description}</p>
                  <p className="timestamp">Submitted {formatDate(c.createdAt)}</p>
                </div>
                <div className="complaint-actions">
                  <select
                    value={c.status}
                    disabled={updatingId === c._id}
                    onChange={(e) => handleStatusChange(c._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
