var express = require('express');
var router = express.Router();

var api = require('instagram-node').instagram();
var moment = require('moment');

api.use({
  client_id: '7d36b8506e3241ebbd811a1650f40a41',
  client_secret: '2f0bfc8b7e1848f3a715c78672ed8132'
});

var redirect_uri = 'http://h120n8-sto-a12.ias.bredband.telia.com:10001/r';

router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Welcome!'
  });
});

router.use(function(req, res, next) {
  if (req.session.token == null && req.path != '/auth' && req.path != '/r') {
    res.redirect('/auth?t=' + encodeURIComponent(req.originalUrl));
  } else {
    next();
  }
});

router.get('/auth', function(req, res) {
  res.redirect(
    api.get_authorization_url(redirect_uri, {
      scope: ['public_content', 'follower_list'],
      state: req.query.t
    })
  );
});

router.get('/r', function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send('error >:(');
    } else {
      console.log('yay! welcome ' + result.user.username + ' access_token: ' + result.access_token);
      req.session.token = result.access_token;

      if (req.query.state != null) {
        res.redirect(decodeURIComponent(req.query.state));
      } else {
        res.redirect('/media');
      }
    }
  });
});

router.get('/media', function(req, res) {
  api.use({
    access_token: req.session.token
  });

  var n_medias = 10;
  if (req.query.c > 0) {
    n_medias = req.query.c;
  }

  api.user_self_media_recent({
    count: n_medias
  }, function(err, medias, pagination, remaining, limit) {
    var html_list = medias.map(function(media) {
      return '<a href="' + media.link + '"><img src="' + media.images.thumbnail.url + '"/></a>';
    }).join('');
    res.send(html_list);
  });
});

router.get('/moment', function(req, res) {
  api.use({
    access_token: req.session.token
  });

  var from_ts = moment(0, 'HH');
  var to_ts = moment();
  if (req.query.d != null) {
    from_ts = moment(req.query.d);
    to_ts = moment(from_ts).add(1, 'days');
  }

  var options = {
    min_timestamp: from_ts.unix(),
    max_timestamp: to_ts.unix()
  };

  console.log('moment: ' + from_ts.format() + ' - ' + to_ts.format());

  api.user_self_media_recent(options, function(err, medias, pagination, remaining, limit) {
    if (medias == null) return;

    var html_list = medias.map(function(media) {
      return '<a href="' + media.link + '">' +
        '<img src="' + media.images.thumbnail.url + '"/></a>';
    }).join('');

    res.send(html_list);
  });

});

module.exports = router;
