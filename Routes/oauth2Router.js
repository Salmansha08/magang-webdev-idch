// routes/oauth2Router.js
const express = require('express');
const passport = require('../helpers/oauth2Helper');

const router = express.Router();

router.get(
  '/idcloudhost',
  passport.authenticate('idch', {
    scope: ['scope1', 'scope2']
  })
)

router.get(
  '/idcloudhost/callback',
  passport.authenticate('idch', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

module.exports = router;
