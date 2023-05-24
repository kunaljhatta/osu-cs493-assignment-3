const { Router } = require('express')
const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { ValidationError } = require('sequelize')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')
const { User, UserClientFields } = require('../models/user')
const jwt = require('jsonwebtoken');

const router = Router()

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication, async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

/*
 * Route to create a new user.
 */
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body, UserClientFields)
    res.status(201).send({ id: user.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

/*
 * Route to login a registered user
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    try {
      const user = await User.findOne({ where: { email: email } });
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateAuthToken(user.userId);
        res.status(200).send({ token: token, message: "Login successful." });
      } else {
        res.status(401).send({ error: "Unauthorized access. Invalid email or password." });
      }
    } catch (err) {
      res.status(500).send({ error: "Internal server error. Please try again later." });
    }
  } else {
    res.status(400).send({ error: "Bad request. Please provide email and password." });
  }
});

/*
 * Route to fetch info about a specific user.
 */
router.get('/:userId', requireAuthentication, async function (req, res, next) {
  const userId = req.params.userId
  const user = await User.findByPk(userId)
  if (user) {
    res.status(200).json(user)
  } else {
    next()
  }
})

module.exports = router
