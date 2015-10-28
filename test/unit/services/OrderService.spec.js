import moment from 'moment';
describe("about order service", () => {
  it('date to order SerialNumber', async (done) => {

    try {
      let date = moment("2015-08-31", "YYYY-MM-DD");
      let orderSerialNumber = await OrderService._dateFormat(date);
      orderSerialNumber.should.be.equal('158v');
      done();
    } catch (e) {
      done(e);
    }

  });

  it('date to order SerialNumber2', async (done) => {

    try {
      let orderSerialNumber = await OrderService.generateOrderSerialNumber();
      orderSerialNumber.should.be.String
      done();
    } catch (e) {
      done(e);
    }

  });

  //@TODO , need to add product number and product items
});
