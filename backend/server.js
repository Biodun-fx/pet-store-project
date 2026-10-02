require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const connectDB = require('./config/db');
const User = require('./models/User');
const Order = require('./models/Order');
const Provider = require('./models/Provider');
const Appointment = require('./models/Appointment');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const memoryStore = {
  users: [],
  providers: [],
  appointments: [],
  orders: []
};

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const createMemoryId = (prefix = 'mem') => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

const getMemoryUser = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  city: user.city || '',
  state: user.state || '',
  postalCode: user.postalCode || '',
  petName: user.petName || '',
  petType: user.petType || '',
  petBreed: user.petBreed || '',
  petBirthday: user.petBirthday || '',
  profilePhoto: user.profilePhoto || '',
  role: user.role || 'customer',
  memberDiscount: 10,
  createdAt: user.createdAt || new Date().toISOString()
});

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 1,
    name: 'Premium Dog Food',
    category: 'Food',
    price: 29.99,
    stock: 20,
    description: 'Balanced nutrition for active dogs.'
  },
  {
    id: 2,
    name: 'Cat Scratching Post',
    category: 'Accessories',
    price: 42.5,
    stock: 12,
    description: 'Sturdy scratching post with plush base.'
  },
  {
    id: 3,
    name: 'Pet Grooming Kit',
    category: 'Care',
    price: 18.75,
    stock: 30,
    description: 'Includes brush, comb, and shampoo tray.'
  }
];

const sendSuccess = (res, statusCode, data, message) => {
  res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message });
};

const sanitizeUser = (user) => ({
  id: user._id ? user._id.toString() : user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  city: user.city || '',
  state: user.state || '',
  postalCode: user.postalCode || '',
  petName: user.petName || '',
  petType: user.petType || '',
  petBreed: user.petBreed || '',
  petBirthday: user.petBirthday || '',
  profilePhoto: user.profilePhoto || '',
  role: user.role,
  memberDiscount: 10,
  createdAt: user.createdAt || new Date().toISOString()
});

const generateToken = (user) => jwt.sign(
  { id: user._id ? user._id.toString() : user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return sendError(res, 401, 'Authentication required.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Admin access required.');
  }

  return next();
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg);
  }

  return next();
};

const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  body('email').trim().normalizeEmail().isEmail().withMessage('A valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('phone').optional().isLength({ min: 6 }).withMessage('Phone number must be at least 6 characters long.'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('postalCode').optional().trim(),
  body('petName').optional().trim(),
  body('petType').optional().trim()
];

const loginRules = [
  body('email').trim().normalizeEmail().isEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

const orderRules = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required.'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required.'),
  body('total').isNumeric().withMessage('Order total must be numeric.')
];

const appointmentRules = [
  body('providerId').notEmpty().withMessage('Provider is required.'),
  body('petName').trim().notEmpty().withMessage('Pet name is required.'),
  body('serviceName').trim().notEmpty().withMessage('Service name is required.'),
  body('appointmentDate').trim().notEmpty().withMessage('Appointment date is required.'),
  body('appointmentTime').trim().notEmpty().withMessage('Appointment time is required.')
];

const seedAdmin = async () => {
  if (!isDatabaseConnected()) {
    return;
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Admin seeding skipped. Set ADMIN_EMAIL and ADMIN_PASSWORD to create an admin account.');
    return;
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }

  const adminExists = await User.findOne({ email });
  if (adminExists) return;

  await User.create({
    name: process.env.ADMIN_NAME?.trim() || 'Pet Haven Admin',
    email,
    password,
    role: 'admin'
  });
};

const seedProviders = async () => {
  const companyProvider = {
    name: 'Pet Haven Care Team',
    specialty: 'Company care',
    location: 'Lekki, Lagos, Nigeria',
    rating: 4.9,
    bio: 'Book pet care directly with the Pet Haven team.',
    image: '',
    isAvailable: true,
    services: [
      { name: 'General Consultation', description: 'Routine wellness consultation for your pet.', duration: '30 mins', price: 18000 },
      { name: 'Vaccination', description: 'Vaccination appointment and care guidance.', duration: '45 mins', price: 25000 },
      { name: 'Grooming', description: 'Grooming care arranged by the Pet Haven team.', duration: '1 hour', price: 22000 },
      { name: 'Pet Care Advice', description: 'Talk with our team about your pet’s care needs.', duration: '30 mins', price: 12000 }
    ]
  };

  if (isDatabaseConnected()) {
    await Provider.findOneAndUpdate(
      { name: companyProvider.name },
      { $setOnInsert: companyProvider },
      { upsert: true, new: true }
    );
    return;
  }

  if (!memoryStore.providers.some((provider) => provider.name === companyProvider.name)) {
    memoryStore.providers.push({
      id: 'pethaven-care-team',
      ...companyProvider,
      createdAt: new Date().toISOString()
    });
  }
};

app.get('/api/health', async (req, res) => {
  const dbReady = require('mongoose').connection.readyState === 1;
  sendSuccess(res, 200, { status: 'ok', database: dbReady ? 'connected' : 'disconnected' }, 'Pet Store API is running');
});

app.get('/api/products', (req, res) => {
  sendSuccess(res, 200, products, 'Products fetched successfully');
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  return sendSuccess(res, 200, product, 'Product fetched successfully');
});

app.get('/api/company/booking', async (req, res) => {
  try {
    const provider = isDatabaseConnected()
      ? await Provider.findOne({ name: 'Pet Haven Care Team' }).lean()
      : memoryStore.providers.find((entry) => entry.name === 'Pet Haven Care Team');

    if (!provider) {
      return sendError(res, 404, 'Company booking is currently unavailable.');
    }

    return sendSuccess(res, 200, provider, 'Company care options fetched successfully');
  } catch (error) {
    return sendError(res, 500, 'Unable to load company care options');
  }
});

app.post('/api/register', registerRules, validateRequest, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone = '',
      address = '',
      city = '',
      state = '',
      postalCode = '',
      petName = '',
      petType = '',
      petBreed = '',
      petBirthday = ''
    } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!isDatabaseConnected()) {
      const existingUser = memoryStore.users.find((user) => user.email === normalizedEmail || user.name === name);
      if (existingUser) {
        return sendError(res, 409, 'User already exists');
      }

      const safePassword = password;
      const user = {
        id: createMemoryId('user'),
        name,
        email: normalizedEmail,
        password: await bcrypt.hash(safePassword, 10),
        phone,
        address,
        city,
        state,
        postalCode,
        petName,
        petType,
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      memoryStore.users.push(user);
      const token = generateToken(getMemoryUser(user));
      return sendSuccess(res, 201, {
        token,
        user: getMemoryUser(user)
      }, 'User registered successfully');
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return sendError(res, 409, 'User already exists');
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      address,
      city,
      state,
      postalCode,
      petName,
      petType,
      petBreed,
      petBirthday,
      role: 'customer'
    });

    const token = generateToken(user);
    console.log('New registration:', sanitizeUser(user));

    return sendSuccess(res, 201, {
      token,
      user: sanitizeUser(user)
    }, 'User registered successfully');
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 500, 'Unable to register user');
  }
});

app.post('/api/login', loginRules, validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!isDatabaseConnected()) {
      const user = memoryStore.users.find((entry) => entry.email === normalizedEmail);
      if (!user) {
        return sendError(res, 401, 'No account found for this email. Register first or check that the development server has not restarted.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 401, 'Invalid credentials');
      }

      const token = generateToken(getMemoryUser(user));
      return sendSuccess(res, 200, {
        token,
        user: getMemoryUser(user)
      }, 'Login successful');
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return sendError(res, 401, 'No account found for this email. Register first or check that the development server has not restarted.');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user);
    console.log('Login attempt:', sanitizeUser(user));

    return sendSuccess(res, 200, {
      token,
      user: sanitizeUser(user)
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Unable to log in');
  }
});

app.post('/api/orders', orderRules, validateRequest, async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const order = {
        id: createMemoryId('order'),
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      memoryStore.orders.unshift(order);
      return sendSuccess(res, 201, { order }, 'Order placed successfully');
    }

    const order = await Order.create({
      ...req.body,
      status: 'pending'
    });

    console.log('New order:', order.toObject());

    return sendSuccess(res, 201, { order: order.toObject() }, 'Order placed successfully');
  } catch (error) {
    console.error('Order error:', error);
    return sendError(res, 500, 'Unable to place order');
  }
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return sendSuccess(res, 200, memoryStore.users.map(({ password, ...user }) => user), 'Admin users fetched successfully');
    }

    const users = await User.find({}).select('-password').lean();
    return sendSuccess(res, 200, users, 'Admin users fetched successfully');
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch admin users');
  }
});

app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return sendSuccess(res, 200, [...memoryStore.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), 'Admin orders fetched successfully');
    }

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 200, orders, 'Admin orders fetched successfully');
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch admin orders');
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const user = memoryStore.users.find((entry) => String(entry.id || entry._id) === String(req.user.id));
      if (!user) {
        return sendError(res, 404, 'User profile not found');
      }
      return sendSuccess(res, 200, getMemoryUser(user), 'Profile fetched successfully');
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    return sendSuccess(res, 200, sanitizeUser(user.toObject()), 'Profile fetched successfully');
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch profile');
  }
});

app.put('/api/profile', authMiddleware, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  body('email').optional().isEmail().withMessage('A valid email is required.'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('postalCode').optional().trim(),
  body('petName').optional().trim(),
  body('petType').optional().trim(),
  body('petBreed').optional().trim(),
  body('petBirthday').optional().trim(),
  body('profilePhoto').optional().isLength({ max: 700000 }).withMessage('Profile photo is too large.')
], validateRequest, async (req, res) => {
  try {
    const { name, email, phone, address, city, state, postalCode, petName, petType, petBreed, petBirthday, profilePhoto } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (postalCode !== undefined) updates.postalCode = postalCode;
    if (petName !== undefined) updates.petName = petName;
    if (petType !== undefined) updates.petType = petType;
    if (petBreed !== undefined) updates.petBreed = petBreed;
    if (petBirthday !== undefined) updates.petBirthday = petBirthday;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'No profile updates provided');
    }

    if (!isDatabaseConnected()) {
      const userIndex = memoryStore.users.findIndex((entry) => String(entry.id || entry._id) === String(req.user.id));
      if (userIndex === -1) {
        return sendError(res, 404, 'User profile not found');
      }

      if (email) {
        const emailTaken = memoryStore.users.some((entry) => entry.email === updates.email && String(entry.id || entry._id) !== String(req.user.id));
        if (emailTaken) {
          return sendError(res, 409, 'Email already in use');
        }
      }

      const current = memoryStore.users[userIndex];
      memoryStore.users[userIndex] = { ...current, ...updates };
      return sendSuccess(res, 200, getMemoryUser(memoryStore.users[userIndex]), 'Profile updated successfully');
    }

    const existingUser = email ? await User.findOne({ email: updates.email, _id: { $ne: req.user.id } }) : null;

    if (existingUser) {
      return sendError(res, 409, 'Email already in use');
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');

    return sendSuccess(res, 200, sanitizeUser(user.toObject()), 'Profile updated successfully');
  } catch (error) {
    return sendError(res, 500, 'Unable to update profile');
  }
});

app.get('/api/providers', async (req, res) => {
  try {
    const { search, specialty, location, minRating } = req.query;

    if (!isDatabaseConnected()) {
      let providers = [...memoryStore.providers];
      if (search) {
        providers = providers.filter((provider) =>
          provider.name.toLowerCase().includes(search.toLowerCase()) ||
          provider.specialty.toLowerCase().includes(search.toLowerCase()) ||
          provider.location.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (specialty) providers = providers.filter((provider) => provider.specialty.toLowerCase().includes(specialty.toLowerCase()));
      if (location) providers = providers.filter((provider) => provider.location.toLowerCase().includes(location.toLowerCase()));
      if (minRating) providers = providers.filter((provider) => Number(provider.rating) >= Number(minRating));
      return sendSuccess(res, 200, providers.sort((a, b) => Number(b.rating) - Number(a.rating)), 'Providers fetched successfully');
    }

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const providers = await Provider.find(filter).sort({ rating: -1, createdAt: -1 }).lean();
    return sendSuccess(res, 200, providers, 'Providers fetched successfully');
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch providers');
  }
});

app.get('/api/providers/:id', async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const provider = memoryStore.providers.find((entry) => String(entry.id || entry._id) === String(req.params.id));
      if (!provider) return sendError(res, 404, 'Provider not found');
      return sendSuccess(res, 200, provider, 'Provider fetched successfully');
    }

    const provider = await Provider.findById(req.params.id).lean();

    if (!provider) {
      return sendError(res, 404, 'Provider not found');
    }

    return sendSuccess(res, 200, provider, 'Provider fetched successfully');
  } catch (error) {
    return sendError(res, 404, 'Provider not found');
  }
});

app.get('/api/providers/:id/services', async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const provider = memoryStore.providers.find((entry) => String(entry.id || entry._id) === String(req.params.id));
      if (!provider) return sendError(res, 404, 'Provider not found');
      return sendSuccess(res, 200, provider.services || [], 'Provider services fetched successfully');
    }

    const provider = await Provider.findById(req.params.id).lean();

    if (!provider) {
      return sendError(res, 404, 'Provider not found');
    }

    return sendSuccess(res, 200, provider.services || [], 'Provider services fetched successfully');
  } catch (error) {
    return sendError(res, 404, 'Provider not found');
  }
});

app.post('/api/appointments', authMiddleware, appointmentRules, validateRequest, async (req, res) => {
  try {
    const { providerId, petName, serviceName, appointmentDate, appointmentTime, notes } = req.body;

    if (!isDatabaseConnected()) {
      const provider = memoryStore.providers.find((entry) => String(entry.id || entry._id) === String(providerId));
      if (!provider) {
        return sendError(res, 404, 'Provider not found');
      }

      const appointment = {
        id: createMemoryId('appt'),
        userId: req.user.id,
        providerId,
        petName,
        serviceName,
        appointmentDate,
        appointmentTime,
        notes: notes || '',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        provider: provider
      };
      memoryStore.appointments.push(appointment);
      return sendSuccess(res, 201, { appointment }, 'Appointment booked successfully');
    }

    const provider = await Provider.findById(providerId);

    if (!provider) {
      return sendError(res, 404, 'Provider not found');
    }

    const appointment = await Appointment.create({
      userId: req.user.id,
      providerId,
      petName,
      serviceName,
      appointmentDate,
      appointmentTime,
      notes: notes || '',
      status: 'scheduled'
    });

    return sendSuccess(res, 201, { appointment }, 'Appointment booked successfully');
  } catch (error) {
    console.error('Appointment booking error:', error);
    return sendError(res, 500, 'Unable to book appointment');
  }
});

app.get('/api/appointments', authMiddleware, async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const appointments = memoryStore.appointments
        .filter((appointment) => String(appointment.userId) === String(req.user.id))
        .map((appointment) => ({
          ...appointment,
          providerId: memoryStore.providers.find((provider) => String(provider.id || provider._id) === String(appointment.providerId)) || null
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return sendSuccess(res, 200, appointments, 'Appointments fetched successfully');
    }

    const appointments = await Appointment.find({ userId: req.user.id })
      .populate('providerId', 'name specialty location rating bio image')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, appointments, 'Appointments fetched successfully');
  } catch (error) {
    return sendError(res, 500, 'Unable to fetch appointments');
  }
});

app.patch('/api/appointments/:id/cancel', authMiddleware, async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const appointmentIndex = memoryStore.appointments.findIndex((appointment) => String(appointment.id || appointment._id) === String(req.params.id) && String(appointment.userId) === String(req.user.id));
      if (appointmentIndex === -1) {
        return sendError(res, 404, 'Appointment not found');
      }

      memoryStore.appointments[appointmentIndex].status = 'cancelled';
      return sendSuccess(res, 200, { appointment: memoryStore.appointments[appointmentIndex] }, 'Appointment cancelled successfully');
    }

    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user.id });

    if (!appointment) {
      return sendError(res, 404, 'Appointment not found');
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return sendSuccess(res, 200, { appointment }, 'Appointment cancelled successfully');
  } catch (error) {
    return sendError(res, 500, 'Unable to cancel appointment');
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }

  return sendError(res, 500, 'Internal server error');
});

connectDB()
  .then(async () => {
    if (isDatabaseConnected()) {
      await seedAdmin();
    }
    await seedProviders();
    app.listen(PORT, () => {
      console.log(`Pet Store API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start backend:', error);
    process.exit(1);
  });
