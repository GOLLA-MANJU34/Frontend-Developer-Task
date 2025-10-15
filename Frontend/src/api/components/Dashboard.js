import { useEffect, useState } from 'react'
import API from '../api/axios'
import { removeToken } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ title: '', description: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks')
      if (res.data.success) setTasks(res.data.data)
    } catch (err) {
      setError('Failed to load tasks')
    }
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const addTask = async e => {
    e.preventDefault()
    try {
      const res = await API.post('/tasks', form)
      if (res.data.success) {
        setForm({ title: '', description: '' })
        fetchTasks()
      }
    } catch (err) {
      setError('Failed to add task')
    }
  }

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <form onSubmit={addTask}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <button type="submit">Add Task</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <b>{task.title}</b> — {task.description}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard
