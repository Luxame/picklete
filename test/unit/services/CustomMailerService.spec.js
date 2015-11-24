
describe("about Mailer service", () => {
  let order = {
    serialNumber: 'test',
    User: {
      username: 'testUser',
      email: 'smlsun@gmail.com'
    }
  }

  let user = {
      fullName: 'testUser',
      email: 'xyz@gmail.com',
      link: 'google.com.tw'
  }

  it('send paymentConfirm', async (done) => {

    try {
      await CustomMailerService.paymentConfirm(order);
      done();
    } catch (e) {
      done(e);
    }

  });

  it('send deliveryConfirm', async (done) => {

    try {
      await CustomMailerService.deliveryConfirm(order);
      done();
    } catch (e) {
      done(e);
    }

  });

  it('send verification Mail', async (done) => {

    try {
      let result = await CustomMailerService.verificationMail(user,user.link);
      console.log("!!",result);
      result.to.should.be.equal(user.email);
      result.type.should.be.equal('verification');
      done();
    } catch (e) {
      done(e);
    }

  });

  it('offer code send', () => {
    let shopCode = {
      token: '11223344',
      startDate: new Date(),
      endDate: new Date()
    }

    let result = CustomMailerService.shopCodeMail({shopCode, user});
    result.type.should.be.equal('shopCode');

  });

  it('offer code without limited time send', () => {
    let shopCode = {
      token: '11223344',
      restrictionDate: 'on'
    }

    let result = CustomMailerService.shopCodeMail({shopCode, user});
    result.type.should.be.equal('shopCode');

  });

  it('contactUs send', () => {
    let user = {
        name: 'testUser',
        email: 'xyz@gmail.com',
        contact: '123456789',
        issue: '商品問題',
        question: '沒什麼問題'
    }

    let result = CustomMailerService.contactUs(user, user.email);
    result.type.should.be.equal('contactUs');

  });

});
