const express =require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();


const app = express();
const PORT = 5000;

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet()); // Security headers
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
}));


// ✅ Middleware (IMPORTANT: express.json() must be first!)
app.use(express.json()); 
app.use(cors({
    origin: ["http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
;




// ✅ Debugging Middleware (Logs Raw Body)
app.use((req, res, next) => {
    console.log("📌 Raw Request Body:", req.body);
    next();
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON format' });
    }
    next();
});
const jwt = require('jsonwebtoken'); // Add this at the top
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const jwtToken = token.replace("Bearer ", "");

    const sql = "SELECT * FROM token_blacklist WHERE token = ?";
    db.query(sql, [jwtToken], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (results.length > 0) {
            return res.status(403).json({ error: "Invalid token. Please log in again." });
        }

        try {
            const decoded = jwt.verify(jwtToken, SECRET_KEY);
            console.log("📌 Decoded JWT Payload:", decoded); // Debugging log
            req.user = decoded; // Attach user info
            next();
        } catch (err) {
            res.status(403).json({ error: "Invalid token." });
        }
    });
};



// ✅ Admin Login Route
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM admins WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const admin = results[0];
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ admin_id: admin.id, username: admin.username }, SECRET_KEY, { expiresIn: '2h' });

        res.json({ message: 'Admin login successful', token });
    });
});

app.use((req, res, next) => {
    console.log(`🔎 Received request: ${req.method} ${req.url}`);
    next();
});


// ✅ Admin Registration Route (Only for Logged-in Admins)
app.post('/admin/register', authenticateToken, async (req, res) => {
    const { username, email, password } = req.body;
    
    // Check if all fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    
    try {
        // Check if the logged-in user is an admin
        if (!req.user || !req.user.admin_id) {
            return res.status(403).json({ error: "Access denied. Only admins can register new admins." });
        }

        // Check if username or email already exists
        const sqlCheck = "SELECT * FROM admins WHERE username = ? OR email = ?";
        db.query(sqlCheck, [username, email], async (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });

            if (results.length > 0) {
                return res.status(400).json({ error: "Username or email already exists" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new admin
            const sqlInsert = "INSERT INTO admins (username, email, password_hash) VALUES (?, ?, ?)";
            db.query(sqlInsert, [username, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ error: "Database error" });
                res.json({ message: "New admin registered successfully", admin_id: result.insertId });
            });
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    
});





// ✅ User Registration Route
app.post('/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const sqlCheck = 'SELECT * FROM users WHERE email = ?';
        db.query(sqlCheck, [email], (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }

            // ✅ Insert new user after checking existence
            const sqlInsert = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
            db.query(sqlInsert, [name, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.json({ message: 'User registered successfully', user_id: result.insertId });
            });
        });
    } catch (error) {
        console.error('❌ Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ✅ User Login Route
app.post('/users/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ user_id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    });
});

//questions route
app.get('/questions', authenticateToken, (req, res) => {
    const subjectId = req.query.subject_id;
    const limit = parseInt(req.query.limit);
    const user_id = req.user.user_id;
    const email = req.user.email;

    if (!subjectId) {
        return res.status(400).json({ error: "Subject ID is required" });
    }

    // Step 1: Get last_question_id from user_progress
    const progressQuery = `SELECT last_question_id FROM user_progress WHERE email = ? AND subject_id = ?`;

    db.query(progressQuery, [email, subjectId], (err, progressResult) => {
        if (err) return res.status(500).json({ error: err.message });

        let lastQuestionId = progressResult.length > 0 ? progressResult[0].last_question_id : 0;

        // Step 2: Fetch unattempted questions (id > lastQuestionId)
        let questionQuery = `
            SELECT question_id, question_text, option_a, option_b, option_c, option_d 
            FROM questions 
            WHERE subject_id = ? AND question_id > ?
            ORDER BY subject_id
        `;

        const queryParams = [subjectId, lastQuestionId];
        if (limit && !isNaN(limit)) {
            questionQuery += ` LIMIT ?`;
            queryParams.push(limit);
        }

        db.query(questionQuery, queryParams, (err, questions) => {
            if (err) return res.status(500).json({ error: err.message });

            // Case 1: Found unattempted questions → Return them
            if (questions.length > 0) {
                return res.json(questions);
            }

            // Case 2: No more questions → Reset progress and fetch from start
            const resetQuery = `
                UPDATE user_progress 
                SET last_question_id = 0 
                WHERE user_id = ? AND subject_id = ?
            `;
            db.query(resetQuery, [user_id, subjectId], (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Re-fetch from the beginning (id > 0)
                let newQuery = `
                    SELECT id, question_text, option_a, option_b, option_c, option_d 
                    FROM questions 
                    WHERE subject_id = ? AND question_id > 0 
                    ORDER BY question_id
                `;
                const newParams = [subjectId];
                if (limit && !isNaN(limit)) {
                    newQuery += ` LIMIT ?`;
                    newParams.push(limit);
                }

                db.query(newQuery, newParams, (err, newQuestions) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json(newQuestions);
                });
            });
        });
    });
});


   
  //cheack answer
app.post('/check-answer', authenticateToken, (req, res) => {
    const { question_id, selected_option, subject_id } = req.body;

    if (!question_id || !selected_option || !subject_id) {
        return res.status(400).json({ error: "Question ID and selected option are required" });
    }

    const query = `SELECT correct_option, explanation FROM questions WHERE question_id = ? AND subject_id =?`;

    db.query(query, [question_id, subject_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Question not found" });
        }

        const correctOption = results[0].correct_option;
        const explanation = results[0].explanation;

        if (selected_option === correctOption) {
            res.json({ correct: true, message: "Correct answer!",Explanation: explanation });
        } else {
            res.json({ correct: false, message: "Wrong answer!", correct_option: correctOption,Explanation: explanation });
        }
    });
});



   //responses route
app.post('/responses', authenticateToken, (req, res) => {
    const { question_id, selected_option } = req.body;
    const user_id = req.user.user_id; // Get user ID from token

    if (!question_id || !selected_option) {
        return res.status(400).json({ error: 'Question ID and selected option are required' });
    }

    // Get the correct answer from the database
    const sql = 'SELECT correct_option FROM questions WHERE id = ?';
    db.query(sql, [question_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const correct_option = results[0].correct_option;
        const is_correct = (selected_option === correct_option) ? 1 : 0; // Convert boolean to tinyint (0 or 1)

        // Store the user's response
        const insertSQL = 'INSERT INTO user_responses (user_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?)';
        db.query(insertSQL, [user_id, question_id, selected_option, is_correct], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Response recorded', is_correct: !!is_correct });
        });
    });
});

app.post('/submit-score', authenticateToken, (req, res) => {
    const { subject_id, score, questions_attempted, session_id } = req.body;
    const user_id = req.user.user_id;
    const email=req.user.email;

    // Validate required fields
    if (!subject_id || score === undefined  || !questions_attempted || !session_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Record the score
    db.query(
        'INSERT INTO user_scores (user_id, subject_id, score, total_questions, session_id) VALUES (?, ?, ?, ?, ?)',
        [user_id, subject_id, score, questions_attempted, session_id],
        (err, scoreResult) => {
            if (err) {
                console.error("Score recording failed:", err);
                return res.status(500).json({ error: "Failed to record score" });
            }

            // 2. Update progress
            db.query(
                `INSERT INTO user_progress 
                 (user_id,email, subject_id, last_question_id, session_id) 
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    last_question_id = last_question_id + ?,
                    session_id = ?`,
                [user_id, email, subject_id, questions_attempted, session_id, questions_attempted, session_id],
                (err) => {
                    if (err) {
                        console.error("Progress update failed:", err);
                        return res.status(500).json({ 
                            partial_success: true,
                            score_id: scoreResult.insertId,
                            error: "Progress update failed" 
                        });
                    }
                    res.json({ success: true, score_id: scoreResult.insertId });
                }
            );
        }
    );
});

app.get('/scores', authenticateToken, (req, res) => {
    const user_id = req.user.user_id;

    const sql = `
        SELECT 
            user_id,
            subject_id, 
            CASE 
                WHEN subject_id = 1 THEN 'Computer Network'
                WHEN subject_id = 2 THEN 'DBMS'
                WHEN subject_id = 3 THEN 'DSA'
                WHEN subject_id = 4 THEN 'OOP'
                WHEN subject_id = 5 THEN 'OS'
                WHEN subject_id = 6 THEN 'Programming'
                ELSE 'General'
            END as subject_name,
            score, 
            total_questions, 
            ROUND((score / total_questions * 100), 1) as percentage, 
            timestamp
        FROM user_scores
        WHERE user_id = ?
        ORDER BY timestamp DESC
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ 
                error: "Failed to fetch scores",
                details: process.env.NODE_ENV === 'development' ? err.message : null
            });
        }
        
        res.json(results);
    });
});
// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
// Move this to the bottom of server.js
app.use((req, res, next) => {
    if (!res.headersSent) {
        return res.status(404).json({ error: "Route not found" });
    }
    next();
});
