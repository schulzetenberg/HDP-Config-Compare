var expect = require('chai').expect,
    hdpConfigCompare = require('..');

describe('hdp-config-compare', function() {
  it('should say hello', function(done) {
    expect(hdpConfigCompare()).to.equal('Hello, world');
    done();
  });
});
