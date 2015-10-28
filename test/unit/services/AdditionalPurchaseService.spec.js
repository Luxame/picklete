
describe("Additional Purchase", () => {
  var additionalPurchaseLimited = {};
  var additionalPurchase = {};
  let createdProductA, createdProductB;
  before(async () => {
    let createdProductGmGood = await db.ProductGm.create({
      brandId: 1,
      name: "威力棒棒 spec",
      explain: '好棒棒，好棒棒',
      usage: '大口吸，潮爽的',
      notice: '18 歲以下請勿使用',

      coverPhoto: ['https://dl.dropboxusercontent.com/u/9662264/iplusdeal/images/demo/JC1121-set-My-Mug-blue-22.jpg', 'https://dl.dropboxusercontent.com/u/9662264/iplusdeal/images/demo/JC1121-set-My-Mug-blue-2.jpg']
    });

    createdProductA = await db.Product.create({
      name: '超值組 spec A',
      description: '讚讚讚',
      stockQuantity: '100',
      isPublish: 'true',
      price: 999,
      size: 'normal',
      service: ["express"],
      country: 'U.K',
      madeby: 'TW',
      color: 3,
      productNumber: '1-USA-2-G',
      spec: 'super-metal',
      photos: ['https://dl.dropboxusercontent.com/u/9662264/iplusdeal/images/demo/shop-type-1.jpg']
    });

    createdProductB = await db.Product.create({
      name: '超值組 spec B',
      description: '讚讚讚',
      stockQuantity: '100',
      isPublish: 'true',
      price: 999,
      size: 'normal',
      service: ["express"],
      country: 'U.K',
      madeby: 'TW',
      color: 3,
      productNumber: '1-USA-2-G',
      spec: 'super-metal',
      photos: ['https://dl.dropboxusercontent.com/u/9662264/iplusdeal/images/demo/shop-type-1.jpg']
    });

    createdProductGmGood.setProducts([createdProductA, createdProductB]);


    additionalPurchaseLimited = {
      name: '加價購測試商品 limted spec ' ,
      activityLimit: 1500,
      reducePrice: 100,
      type: 'reduce',
      startDate: new Date(2000, 9, 7),
      endDate: new Date(2000, 9, 11)


    }

    additionalPurchaseLimited = await db.AdditionalPurchase.create(additionalPurchaseLimited);
    await additionalPurchaseLimited.setProducts([createdProductA])

    additionalPurchase = {
      name: '加價購測試商品 unlimted spec ' ,
      activityLimit: 0,
      reducePrice: 100,
      type: 'reduce',
      startDate: new Date(2000, 9, 7),
      endDate: new Date(2000, 9, 11)
    }

    additionalPurchase = await db.AdditionalPurchase.create(additionalPurchase);
    await additionalPurchase.setProducts([createdProductA, createdProductB])

  });

  it('get Current Item with paymentTotalAmount=1000 should get one additional Purchase', async (done) => {

    try {
      let date = new Date(2000, 9, 9);
      let query = {date, paymentTotalAmount: 1000}
      let additionalPurchaseProductGms = await AdditionalPurchaseService.getProducts(query);

      additionalPurchaseProductGms.additionalProducts.length.should.be.equal(2);

      done();

    } catch (e) {

      done(e);

    }

  });

  it('get Current Item with paymentTotalAmount=2000 should get two additional Purchases', async (done) => {

    try {
      let date = new Date(2000, 9, 9);
      let query = {date, paymentTotalAmount: 2000}
      let additionalPurchaseProductGms = await AdditionalPurchaseService.getProducts(query);
      sails.log.info(additionalPurchaseProductGms);
      additionalPurchaseProductGms.additionalProducts.length.should.be.equal(3);

      done();

    } catch (e) {

      done(e);

    }

  });

  it('get cartAddAdditionalPurchases and show information',async(done) =>{
    try {
      let additionalPurchasesItems = [ { additionalPurchasesId: additionalPurchaseLimited.id, productId: createdProductA.id },
        { additionalPurchasesId: additionalPurchase.id, productId: createdProductB.id } ];
      sails.log.info(additionalPurchasesItems);
      let result = await AdditionalPurchaseService.cartAddAdditionalPurchases(additionalPurchasesItems);
      sails.log.info(JSON.stringify(result,null,2));
      result.buyMoreTotalPrice.should.be.equal((createdProductA.price - additionalPurchaseLimited.reducePrice ) + (createdProductB.price - additionalPurchase.reducePrice));
      done();

    } catch (e) {

      done(e);

    }
  });


});
