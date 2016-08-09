var express = require('express');
var https = require('https');
var app = express();
app.enable('trust proxy');

// export MLAB_LITTLE_URL_URI="mongodb://user:pass@ds042729.mlab.com:42729/little-url"
// heroku config:set MLAB_LITTLE_URL_URI=mongodb://user:pass@ds042729.mlab.com:42729/little-url
// export GOOGLE_CUSTOM_SEARCH_API_KEY="key"
// heroku config:set GOOGLE_CUSTOM_SEARCH_API_KEY=key
var apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
var client = require('mongodb').MongoClient;
var dburl = process.env.MLAB_LITTLE_URL_URI;
var db;
var collection;

client.connect(dburl, function(err, connection) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
    throw err;
  } else {
    console.log('Connection established to', dburl);
    db = connection;
    collection = db.collection('image-search');
  }
});

app.get("/", function(req, res) {
  res.send("Image Search Abstract Layer. Sample Usage: /api/imagesearch?q=locat ");
});

app.get("/api/imagesearch", function(req, res, next) {
  var query = encodeURIComponent(req.query.q);
  if (!(query)) { res.send("use /api/imagesearch?q=<SEARCH_STRING> to start your search"); }
  console.log(typeof req.query.offset);
  var start = +req.query.offset;
  if (isNaN(start)) { start = 0; }
  var options = {
    hostname: 'www.googleapis.com',
    path: '/customsearch/v1?q='+query+"&cx=006064609831781604018%3A_1uwtb4z7jw&num=10&searchType=image&start=10&key="+ apiKey + ( start ? ("&start="+start) : "" ),
    method: 'GET'
  };
  console.log(options.path);
  var newjson = [];
  var request = https.request(options, function(resp) {
    console.log('statusCode: ', resp.statusCode);
    console.log('headers: ', resp.headers);
    resp.on('data', function(httpsdata) {
      console.log("data",httpsdata);
      json = JSON.parse(httpsdata);
      if (json.hasOwnProperty("items")) {
        items.forEach(function(item) {
          obj = {
            url: item.image.link,
            snippet: item.snippet,
            thumbnail: item.image.thumbnailLink,
            context: item.image.contextLink
          };
          newjson.push(obj);
        });
      } else {
        newjson = {error: "error"};
      }
   });
  });
  request.end();
  request.on('error', function(err) {
    console.log(err);
  });
  res.send(JSON.stringify(newjson));
});

app.get("/api/latest/imagesearch/", function(req, res) {
  res.send("latest imagesearch");
});

var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log('Node.js listening on port ' + port + '...');
});
