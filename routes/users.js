var express = require('express');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();

router.get('/', function(req, res) {
  var db = req.db;
  db.collection('userlist').find().toArray(function(e, docs) {
    res.json(docs);
  });
});

router.post('/', function(req, res) {
  var db = req.db;
  db.collection('userlist').insertOne(
    req.body,
    function(err, result) {
      res.send(
        (err === null) ? {
          msg: ''
        } : {
          msg: err
        }
      );
    });
});

router.delete('/:id', function(req, res) {
  var db = req.db;
  var userToDelete = req.params.id;
  db.collection('userlist').deleteOne({
    "_id": ObjectId(userToDelete)
  }, function(err, results) {
    res.send((err === null) ? {
      msg: ''
    } : {
      msg: err
    });
  });
});

module.exports = router;
