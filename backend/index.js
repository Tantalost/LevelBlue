require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard Gmail SMTP. Adjust if using SendGrid/Mailgun etc.
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// In-memory cache for MFA codes (In production, consider Redis)
const mfaCache = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client (anon key — for student auth operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Service-role client — bypasses RLS for server-side bounty operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || supabaseKey;
const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

// --- API Endpoints ---

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Fetch student by email
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email.trim())
      .single();

    if (error || !student) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Check if this is the first login (requires_password_change)
    if (student.requires_password_change) {
      // Generate a 6-digit MFA code
      const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store in cache (expires in 10 minutes)
      mfaCache.set(email.trim(), {
        code: mfaCode,
        studentId: student.id,
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      // Send email asynchronously
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email.trim(),
        subject: 'LevelBlue Security Uplink - Verification Code',
        text: `Your Identity Verification Code is: ${mfaCode}\nThis code will expire in 10 minutes.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error('Error sending MFA email:', error);
        else console.log('MFA email sent:', info.response);
      });

      // Return response prompting for MFA
      return res.status(200).json({ mfaRequired: true, message: 'MFA code sent to your email.' });
    } else {
      // 4. Normal login, bypass MFA and generate JWT token immediately
      const jwtSecret = process.env.JWT_SECRET || 'supersecret_levelblue_key';
      const token = jwt.sign(
        { id: student.id, role: 'student' },
        jwtSecret,
        { expiresIn: '365d' } // Extended to 365 days to prevent unexpected logouts
      );

      return res.status(200).json({
        token: token,
        user: {
          _id: student.id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          email: student.email,
          role: 'student',
          roleLabel: 'Student',
          section: student.section,
          status: student.status || 'Active',
          technical: student.technical !== false,
          pre: student.pre || 0,
          post: student.post || 0,
          sessions: student.sessions || 0,
          points: student.points || 0,
          mastery: {
            Phishing: student.mastery_phishing || 0,
            Smishing: student.mastery_smishing || 0,
            Vishing: student.mastery_vishing || 0,
            Pretexting: student.mastery_pretexting || 0,
            Baiting: student.mastery_baiting || 0
          }
        }
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify MFA Endpoint
app.post('/api/auth/verify-mfa', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const cached = mfaCache.get(email.trim());
  
  if (!cached) {
    return res.status(401).json({ error: 'MFA code expired or invalid. Please login again.' });
  }

  if (Date.now() > cached.expiresAt) {
    mfaCache.delete(email.trim());
    return res.status(401).json({ error: 'MFA code expired. Please login again.' });
  }

  if (cached.code !== code.trim()) {
    return res.status(401).json({ error: 'Invalid verification code.' });
  }

  // Code is valid, remove from cache
  mfaCache.delete(email.trim());

  try {
    // Re-fetch student to construct payload
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', cached.studentId)
      .single();

    if (error || !student) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate a JWT token
    const jwtSecret = process.env.JWT_SECRET || 'supersecret_levelblue_key';
    const token = jwt.sign(
      { id: student.id, role: 'student' },
      jwtSecret,
      { expiresIn: '365d' } // Extended to 365 days
    );

    // Return formatted response expected by the mobile app
    res.status(200).json({
      token: token,
      user: {
        _id: student.id,
        name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        email: student.email,
        role: 'student',
        roleLabel: 'Student',
        section: student.section,
        status: student.status || 'Active',
        technical: student.technical !== false,
        pre: student.pre || 0,
        post: student.post || 0,
        sessions: student.sessions || 0,
        points: student.points || 0,
        mastery: {
          Phishing: student.mastery_phishing || 0,
          Smishing: student.mastery_smishing || 0,
          Vishing: student.mastery_vishing || 0,
          Pretexting: student.mastery_pretexting || 0,
          Baiting: student.mastery_baiting || 0
        }
      }
    });
  } catch (err) {
    console.error('Verify MFA error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Password Endpoint
app.post('/api/auth/change-password', async (req, res) => {
  const { newPassword } = req.body;
  const authHeader = req.headers.authorization;

  if (!newPassword || !authHeader) {
    return res.status(400).json({ error: 'New password and token are required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwtSecret = process.env.JWT_SECRET || 'supersecret_levelblue_key';
    const decoded = jwt.verify(token, jwtSecret);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the students table
    const { error } = await supabase
      .from('students')
      .update({ 
        password: hashedPassword,
        requires_password_change: false 
      })
      .eq('id', decoded.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(401).json({ error: 'Invalid token or failed to update password' });
  }
});

// Get student's requires_password_change flag
app.get('/api/students/:id/password-flag', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('requires_password_change')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student's requires_password_change flag
app.put('/api/students/:id/password-flag', async (req, res) => {
  const { id } = req.params;
  const { requires_password_change } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('students')
      .update({ requires_password_change })
      .eq('id', id)
      .select() // Return updated data
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = header.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'supersecret_levelblue_key';
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ─── Support Bounties Routes ──────────────────────────────────────────────────
const generateClearanceCode = () => Math.floor(1000 + Math.random() * 9000).toString();

// GET /api/bounties/student/:id
app.get('/api/bounties/student/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await serviceSupabase
      .from('support_bounties')
      .select('*, mentee:mentee_id (name, section), mentor:mentor_id (name, section)')
      .or(`mentor_id.eq.${id},mentee_id.eq.${id}`)
      .order('created_at', { ascending: false });
    if (error) { if (error.code === '42P01') return res.json([]); throw error; }
    res.json(data);
  } catch (err) {
    console.error('Fetch bounties error:', err);
    res.status(500).json({ error: 'Server error fetching bounties' });
  }
});

// POST /api/bounties
app.post('/api/bounties', authMiddleware, async (req, res) => {
  const { mentor_id, mentee_id, topics } = req.body;
  if (!mentor_id || !mentee_id || !topics || topics.length === 0)
    return res.status(400).json({ error: 'Missing required fields' });
  const topic = topics[0];
  try {
    const { data, error } = await serviceSupabase
      .from('support_bounties').insert({ mentor_id, mentee_id, topic, status: 'PENDING' })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Create bounty error:', err);
    res.status(500).json({ error: 'Server error creating bounty' });
  }
});

// MECHANIC 1a: PUT /api/bounties/:id/accept — generates OTP, AWAITING_LINK
app.put('/api/bounties/:id/accept', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const clearanceCode = generateClearanceCode();
  try {
    const { data, error } = await serviceSupabase
      .from('support_bounties')
      .update({ status: 'AWAITING_LINK', clearance_code: clearanceCode, otp_verified: false })
      .eq('id', id).select().single();
    if (error) throw error;
    // Do NOT return the code — mentor must get it from mentee
    const { clearance_code: _, ...safeData } = data;
    res.json(safeData);
  } catch (err) {
    console.error('Accept bounty error:', err);
    res.status(500).json({ error: 'Server error accepting bounty' });
  }
});

// MECHANIC 1b: POST /api/bounties/:id/verify-otp — mentor submits OTP
app.post('/api/bounties/:id/verify-otp', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Clearance code is required' });
  try {
    const { data: bounty, error: fetchErr } = await serviceSupabase
      .from('support_bounties').select('*').eq('id', id).single();
    if (fetchErr || !bounty) return res.status(404).json({ error: 'Bounty not found' });
    if (bounty.clearance_code !== code.trim())
      return res.status(400).json({ error: 'Invalid clearance code. Contact the mentee.' });
    const { data, error } = await serviceSupabase
      .from('support_bounties').update({ status: 'ACCEPTED', otp_verified: true })
      .eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error verifying OTP' });
  }
});

// MECHANIC 1c: GET /api/bounties/mentee-code/:bountyId — mentee fetches their code
app.get('/api/bounties/mentee-code/:bountyId', authMiddleware, async (req, res) => {
  const { bountyId } = req.params;
  try {
    const { data, error } = await serviceSupabase
      .from('support_bounties')
      .select('id, clearance_code, status, mentor:mentor_id (name), topic')
      .eq('id', bountyId).single();
    if (error || !data) return res.status(404).json({ error: 'Bounty not found' });
    if (data.status !== 'AWAITING_LINK')
      return res.status(400).json({ error: 'No active clearance code' });
    res.json({ clearance_code: data.clearance_code, mentor_name: data.mentor?.name, topic: data.topic });
  } catch (err) {
    console.error('Get mentee code error:', err);
    res.status(500).json({ error: 'Server error fetching clearance code' });
  }
});

// MECHANIC 3a: PUT /api/bounties/:id/validate — mentee confirms → VALIDATED
app.put('/api/bounties/:id/validate', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await serviceSupabase
      .from('support_bounties').update({ status: 'VALIDATED', mentee_confirmed: true })
      .eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Validate bounty error:', err);
    res.status(500).json({ error: 'Server error validating bounty' });
  }
});

// MECHANIC 3b: PUT /api/bounties/:id/self-clear — mentee denies → SELF_CLEARED
app.put('/api/bounties/:id/self-clear', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await serviceSupabase
      .from('support_bounties').update({ status: 'SELF_CLEARED', mentee_confirmed: false })
      .eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Self-clear bounty error:', err);
    res.status(500).json({ error: 'Server error self-clearing bounty' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});


