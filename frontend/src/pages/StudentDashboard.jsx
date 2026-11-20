import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const CATEGORIES = ['Hostel', 'Mess', 'Academic', 'Infrastructure', 'Other'];

function formatDate(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: CATEGORIES[0], description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/my');
      setComplaints(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/complaints', form);
      setForm({ category: CATEGORIES[0], description: '' });
      await loadComplaints();
      setSuccessMessage('Complaint submitted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    await api.delete(`/complaints/${id}`);
    loadComplaints();
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard">
        <section className="card">
          <h3>Submit a Complaint</h3>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
          <form className="complaint-form" onSubmit={handleSubmit}>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <textarea
              name="description"
              placeholder="Describe your complaint"
              value={form.description}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </section>

        <section className="card">
          <h3>My Complaints</h3>
          {loading && <p className="loading">Loading complaints...</p>}
          {!loading && complaints.length === 0 && <p>No complaints submitted yet.</p>}
          <ul className="complaint-list">
            {complaints.map((c) => (
              <li key={c._id} className="complaint-item">
                <div>
                  <span className={`category category-${c.category}`}>{c.category}</span>{' '}
                  <span className={`status status-${c.status.replace(/\s/g, '')}`}>
                    {c.status}
                  </span>
                  <p>{c.description}</p>
                  <p className="timestamp">Submitted {formatDate(c.createdAt)}</p>
                </div>
                <button onClick={() => handleDelete(c._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
