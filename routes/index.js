const express = require('express');
const router = express.Router();

const authRouter = require('./authRoutes');
const userRouter = require('./userRoutes');
const categoryRouter = require('./categoryRoutes');
const wishlistRouter = require('./wishlistRoutes');
const mediaRouter = require('./mediaRoutes');
const likeRouter = require('./likeRoutes');
const topicsRouter = require('./topicsRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/categories', categoryRouter);
router.use('/medias', mediaRouter);
router.use('/wishlist', wishlistRouter);
router.use('/like', likeRouter);
router.use('/topics', topicsRouter);

module.exports = router;
