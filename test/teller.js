var request = require('request')
var should = require('should')

require('../index')
  .get('/', function(req, res) {
    res.end('get')
  })
  .get(/^\/(reg|ex)$/, function(req, res) {
    res.end('regex')
  })
  .get('/query', function(req, res) {
    res.end(req.query.a)
  })
  .get('/json', function(req, res) {
    res.json(req.query, req.query.code)
  })
  .get('/render', function(req, res) {
    var data = { title: req.query.code }
    res.render('template.ejs', data, req.query.code)
  })
  .get('/redirect', function(req, res) {
    res.redirect('/render', req.query.code)
  })
  .post('/post', function(req, res) {
    res.end('post')
  })
  .post(/^\/[a-z][0-9]$/, function(req, res) {
    res.end('regex')
  })
  .post('/body', function(req, res) {
    res.end(req.body.a)
  })
  .settings({
    template: { dir: __dirname },
    static: { route: '/public', dir: __dirname+'/static' }
  })
  .listen(1234)


describe('app', function() {

  describe('get()', function() {
    it('should match a string route', function(done) {
      request('http://localhost:1234', function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        body.should.equal('get')
        done()
      })
    })
    it('should match a regex route', function(done) {
      request('http://localhost:1234/ex', function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        body.should.equal('regex')
        done()
      })
    })
    it('should pass through parsed query string', function(done) {
      request('http://localhost:1234/query?a=b', function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        body.should.equal('b')
        done()
      })
    })
  })
  
  describe('post()', function() {
    it('should match a string route', function(done) {
      request({
        form: {},
        url: 'http://localhost:1234/post',
        method: 'post'
      }, function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        body.should.equal('post')
        done()
      })
    })
    it('should match a regex route', function(done) {
      request({
        form: {},
        url: 'http://localhost:1234/a1',
        method: 'post'
      }, function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        body.should.equal('regex')
        done()
      })
    })
    it('should pass through parsed form fields', function(done) {
      request({
        form: { a: 1 },
        url: 'http://localhost:1234/body',
        method: 'post'
      }, function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        body.should.equal('1')
        done()
      })
    })
  })
  
  describe('settings()', function() {
    it('should allow static file serving', function(done) {
      request('http://localhost:1234/public/static.txt', function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        res.headers['content-type'].should.equal('text/plain')
        res.statusCode.should.equal(200)
        body.should.equal('static')
        done()
      })
    })
  })
  
})

describe('res', function() {
  
  describe('json()', function() {
    it('should respond with json', function(done) {
      request('http://localhost:1234/json?code=200', function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        res.headers['content-type'].should.equal('application/json')
        body.should.equal('{"code":"200"}')
        done()
      })
    })
    it('should respond with correct status codes', function(done) {
      request('http://localhost:1234/json?code=404', function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        res.statusCode.should.equal(404)
        body.should.equal('{"code":"404"}')
        done()
      })
    })  
  })
  
  describe('render()', function() {
    it('should respond with rendered html', function(done) {
      request('http://localhost:1234/render?code=200', function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        res.headers['content-type'].should.equal('text/html')
        body.should.equal('<h1>200</h1>')
        done()
      })
    })
    it('should respond with correct status code', function(done) {
      request('http://localhost:1234/render?code=404', function(err, res, body) {
        should.not.exist(err)
        should.exist(res)
        res.statusCode.should.equal(404)
        body.should.equal('<h1>404</h1>')
        done()
      })
    })
  })
  
  describe('redirect()', function() {
    it('should redirect to to correct page', function(done) {
      request('http://localhost:1234/redirect', function(err, res) {
        should.not.exist(err)
        should.exist(res)
        res.request.uri.pathname.should.equal('/render')
        done()
      })
    })
    it('should redirect with correct status code', function(done) {
      request({
        followRedirect: false,
        url: 'http://localhost:1234/redirect?code=303'
      }, function(err, res) {
        should.not.exist(err)
        res.statusCode.should.equal(303)
        res.headers.location.should.equal('/render')
        done()
      })
    })
  })

})