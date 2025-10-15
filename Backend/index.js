const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const Joi = require('joi')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors({origin: 'http://localhost:3000'}))

const dbPath = path.join(__dirname, 'goodreads.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        password TEXT,
        role TEXT DEFAULT 'user'
      );
    `)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `)
    app.listen(5000, () =>
      console.log('Server running at http://localhost:5000'),
    )
  } catch (e) {
    console.log('DB Error:', e.message)
    process.exit(1)
  }
}

initializeDBAndServer()

// Helper: Validate user input
const userSchema = Joi.object({
  username: Joi.string().min(3).required(),
  name: Joi.string().required(),
  password: Joi.string().min(5).required(),
  role: Joi.string().valid('user', 'admin').default('user'),
})

// Middleware for JWT
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers['authorization']
  const jwtToken = authHeader?.split(' ')[1]
  if (!jwtToken) return response.status(401).send('Missing JWT Token')

  jwt.verify(jwtToken, 'MY_SECRET_TOKEN', (error, payload) => {
    if (error) return response.status(401).send('Invalid JWT Token')
    request.user = payload
    next()
  })
}

// Role-based middleware
const authorizeRole = role => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).send('Access Denied')
  next()
}

// Register user
app.post('/users/', async (req, res) => {
  const {error} = userSchema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const {username, name, password, role} = req.body
  const user = await db.get('SELECT * FROM user WHERE username = ?', [username])
  if (user) return res.status(400).send('User already exists')

  const hashedPassword = await bcrypt.hash(password, 10)
  await db.run(
    'INSERT INTO user (username, name, password, role) VALUES (?, ?, ?, ?)',
    [username, name, hashedPassword, role],
  )
  res.send('User registered successfully')
})

// Login
app.post('/login', async (req, res) => {
  const {username, password} = req.body
  const user = await db.get('SELECT * FROM user WHERE username = ?', [username])
  if (!user) return res.status(400).send('Invalid username')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return res.status(400).send('Invalid password')

  const payload = {username: user.username, role: user.role}
  const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
  res.send({jwtToken})
})

// CRUD APIs for tasks
app.get('/tasks/', authenticateToken, async (req, res) => {
  const tasks = await db.all('SELECT * FROM task')
  res.send(tasks)
})

app.post('/tasks/', authenticateToken, async (req, res) => {
  const {title, description} = req.body
  const user = await db.get('SELECT id FROM user WHERE username = ?', [
    req.user.username,
  ])
  await db.run(
    'INSERT INTO task (title, description, user_id) VALUES (?, ?, ?)',
    [title, description, user.id],
  )
  res.send('Task added successfully')
})

app.put('/tasks/:id/', authenticateToken, async (req, res) => {
  const {title, description} = req.body
  const {id} = req.params
  await db.run('UPDATE task SET title = ?, description = ? WHERE id = ?', [
    title,
    description,
    id,
  ])
  res.send('Task updated successfully')
})

app.delete(
  '/tasks/:id/',
  authenticateToken,
  authorizeRole('admin'),
  async (req, res) => {
    const {id} = req.params
    await db.run('DELETE FROM task WHERE id = ?', [id])
    res.send('Task deleted successfully')
  },
)
