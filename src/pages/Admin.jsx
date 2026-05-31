import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Check, X, Clock, Edit3 } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('plant_suggestions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSuggestions(data || []);
    } catch(err) {
      console.warn('Supabase not connected, using mock suggestions.');
      setSuggestions([
        { id: 1, plant_name: 'Tomato', suggested_field: 'Watering', suggested_value: 'Daily in Summer', reason: 'Dries out fast in BLR', status: 'pending', created_at: new Date().toISOString() },
        { id: 2, plant_name: 'Tulsi', suggested_field: 'Sunlight', suggested_value: 'Morning Sun only', reason: 'Too much sun burns it', status: 'approved', created_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('plant_suggestions').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      // In a real database flow, approving this would trigger an update on the public.plants table
      fetchSuggestions();
    } catch(err) {
      alert(`Mock Mode: Suggestion ${id} marked as ${newStatus}`);
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
  };

  return (
    <div className="admin-page page-transition">
      <section className="admin-hero">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Review and manage community encyclopedia suggestions.</p>
      </section>

      <div className="admin-content">
        <h2 className="section-header"><Edit3 size={20}/> Pending Suggestions</h2>
        {isLoading ? (
           <p className="loading-text">Loading suggestions...</p>
        ) : (
          <div className="table-container hide-scrollbar">
            <table className="suggestions-table">
              <thead>
                <tr>
                  <th>Plant</th>
                  <th>Field</th>
                  <th>Suggested Value</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.plant_name}</strong></td>
                    <td><span className="field-tag">{s.suggested_field}</span></td>
                    <td><span className="bold-value">{s.suggested_value}</span></td>
                    <td className="reason-cell">{s.reason || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${s.status}`}>
                        {s.status === 'pending' && <Clock size={12}/>}
                        {s.status === 'approved' && <Check size={12}/>}
                        {s.status === 'rejected' && <X size={12}/>}
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {s.status === 'pending' ? (
                        <div className="action-buttons">
                          <button onClick={() => updateStatus(s.id, 'approved')} className="approve-btn" title="Approve">
                            <Check size={16}/>
                          </button>
                          <button onClick={() => updateStatus(s.id, 'rejected')} className="reject-btn" title="Reject">
                            <X size={16}/>
                          </button>
                        </div>
                      ) : (
                        <span className="action-done">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {suggestions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '32px'}}>No suggestions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
