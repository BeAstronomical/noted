import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  // Auth State
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('noted_user')) || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Task State
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('work');
  const [dueDate, setDueDate] = useState('');
  const [extraDetails, setExtraDetails] = useState('');

  // Bring tasks when user logs in
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks/${user.userId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  // Handle Login / Register Submit
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, {
        username: usernameInput,
        password: passwordInput
      });

      if (isRegistering) {
        alert('Account created! Please log in.');
        setIsRegistering(false);
      } else {
        const userData = { userId: res.data.userId, username: res.data.username };
        setUser(userData);
        localStorage.setItem('noted_user', JSON.stringify(userData));
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Authentication failed.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('noted_user');
  };

  // Handle Adding a Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await axios.post(`${API_URL}/tasks`, {
        userId: user.userId,
        title,
        category,
        dueDate: dueDate || null,
        extraDetails
      });

      // Reset form fields
      setTitle('');
      setCategory('work');
      setDueDate('');
      setExtraDetails('');
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  // Handle Deleting a Task
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  // If user is not logged in, show Auth screen
  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Noted.</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}> by Samson Joshua.</p>

        <div className="notepad-box">
          <h3 style={{ marginBottom: '1rem' }}>{isRegistering ? 'Create an Account' : 'Login'}</h3>
          {authError && <p style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.9rem' }}>{authError}</p>}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
            <button type="submit" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ color: 'var(--text-main)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegistering ? 'Login here' : 'Create one'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Filter tasks with due dates for the top 3 ticker, and separate general list
  const topUpcomingTasks = tasks
    .filter(t => t.dueDate)
    .slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Noted.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> logged in as @{user.username}</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Logout
        </button>
      </div>

      {/* Top 3 Upcoming Tasks Section */}
      <div className="notepad-box" style={{ borderColor: 'var(--accent)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>❗ Upcoming Tasks</h3>
        {topUpcomingTasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming tasks found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topUpcomingTasks.map(task => (
              <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.75rem' }}>[{task.category}]</span>
                  <span style={{ fontWeight: '500' }}>{task.title}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontFamily: 'JetBrains Mono', color: '#ffb703' }}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Task Form */}
      <div className="notepad-box">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>+ New Task</h3>
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Work">work</option>
              <option value="Personal">personal</option>
              <option value="Other">other</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <textarea
            placeholder="Extra details / markdown notes (optional)..."
            value={extraDetails}
            onChange={(e) => setExtraDetails(e.target.value)}
            rows="2"
          />

          <button type="submit" style={{ padding: '0.75rem' }}>Save Task</button>
        </form>
      </div>

      {/* All Tasks List */}
      <div className="notepad-box">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📋 All Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No saved tasks.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map(task => (
              <div key={task._id} style={{ background: 'var(--bg)', padding: '1rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>[{task.category}]</span>
                    <strong style={{ fontSize: '1rem' }}>{task.title}</strong>
                  </div>
                  <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', color: '#ff6b6b', padding: '0.2rem 0.5rem', fontSize: '0.75rem', border: '1px solid #ff6b6b' }}>
                    Delete
                  </button>
                </div>

                {task.extraDetails && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
                    {task.extraDetails}
                  </p>
                )}

                {task.dueDate && (
                  <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}