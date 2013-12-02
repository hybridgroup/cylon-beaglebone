(function() {
  'use strict';
  var cylonBeaglebone;

  cylonBeaglebone = source("cylon-beaglebone");

  describe("basic tests", function() {
    it("standard async test", function(done) {
      var bool;
      bool = false;
      bool.should.be["false"];
      setTimeout(function() {
        bool.should.be["false"];
        bool = true;
        return bool.should.be["true"];
      });
      150;
      setTimeout(function() {
        bool.should.be["true"];
        return done();
      });
      return 300;
    });
    it("standard sync test", function() {
      var data, obj;
      data = [];
      obj = {
        id: 5,
        name: 'test'
      };
      data.should.be.empty;
      data.push(obj);
      data.should.have.length(1);
      data[0].should.be.eql(obj);
      return data[0].should.be.equal(obj);
    });
    return it("cylon-beaglebone should be awesome", function() {
      cylonBeaglebone.should.have.keys('awesome');
      cylonBeaglebone.awesome.should.be.a('function');
      return cylonBeaglebone.awesome().should.be.equal('awesome');
    });
  });

}).call(this);
