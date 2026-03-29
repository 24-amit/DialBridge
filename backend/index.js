const userRoutes = require('./modules/user/user.routes');
const authRoutes = require('./modules/auth/auth.routes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);