import moment from "moment";
import fs from 'fs';
import mime from "mime";
import util from "util";

/*
  PromotionService.js
*/

module.exports = {

  // findAll
  findAll: async () => {
    let promotions = await db.Promotion.findAll();
    return promotions;
  },
  // end findAll

  // getModel
  getModel: async () => {
    let promotions = await db.Promotion.find({
        where: {
          type: 'flash'
        },
        include:[{
          model: db.Product,
          required: true
        }]
      });
    console.log('=== find flash promotion ==>',promotions);
    return promotions;
  },
  // end getModel

  // create
  create: async (promotion) => {
    try {
      console.log('=== raw promotion ==>',promotion);

      if(promotion.discount =='')
        delete promotion.discount;
      if(promotion.price=='')
        delete promotion.price;

      // create promotion
      let createdPromotion = await db.Promotion.create(promotion);

      await createdPromotion.setProducts(promotion.productIds);

      return createdPromotion;
    } catch (e) {
      console.log('=== create err ==>',e.stack);
      return false;
    }
  },

  createDpt: async ({promotion, productIds}) => {
    try {
      let dptSubName;
      if(promotion.type == 'flash')
        dptSubName = '閃購專區'
      else dptSubName = promotion.title;


      let targetDptSub = await db.DptSub.findOne({
        where:{
          name: dptSubName
        }
      })

      let doCreateNewDptSub = (targetDptSub == null);

      if(doCreateNewDptSub){
        let selectionDpt = await db.Dpt.findOne({
          where:{
            name: '特別企劃'
          }
        })

        targetDptSub = await db.DptSub.create({
          name: dptSubName,
          weight: 999,
          official: true,
          DptId: selectionDpt.id
        });
      }

      let products = await db.Product.findAll({
        where: {
          id: productIds
        },
        include: [{
          model: db.DptSub
        }]
      });

      await* products.map((product) => {
        return product.addDptSubs(targetDptSub)
      });

    } catch (e) {
      throw e;
    }

  },


  // update
  update: async (promotion) => {
    try {
      console.log('=== raw promotion ==>',promotion);
      let updatePromoiton = await db.Promotion.find({
        where: {
          id: promotion.id
        }
      });
      console.log('=== updatePromoiton ==>',updatePromoiton);
      updatePromoiton.title = promotion.title;
      updatePromoiton.description = promotion.description;
      updatePromoiton.type = promotion.type;
      updatePromoiton.startDate = promotion.startDate;
      updatePromoiton.endDate = promotion.endDate;
      if(promotion.discount == '' || promotion.discount==100){
        updatePromoiton.discount = 100;
      }
      else{
        updatePromoiton.discount = promotion.discount;
      }

      if(promotion.price == '' || promotion.price == 0){
        updatePromoiton.price = 0;
      }
      else{
        updatePromoiton.price = promotion.price;
      }
      updatePromoiton.discountType = promotion.discountType;
      updatePromoiton.coverPhoto = promotion.coverPhoto;


      await updatePromoiton.save();
      await updatePromoiton.setProducts(promotion.productIds);


      return updatePromoiton;
    } catch (e) {
      console.log('=== update err ==>',e.stack);
      return false;
    }
  },
  // end update

  // delete
  delete: async (promotion) => {
    try {
      console.log('=== raw promotion ==>',promotion);
      let findProduct = await db.Product.findById(promotion.id);
      if (!findPromotion) {
        throw new Error('cant find this promotion! id is ==>',promotion.id);
      }
      await findPromotion.destroy();
      return true;
    } catch (e) {
      console.log('=== delete err ==>',e.stack);
      return false;
    }
  },
  // end delete

  // productPriceTransPromotionPrice
  productPriceTransPromotionPrice: async(date, products) => {
    try {
      // find all promotions within a specific date

      // check each prduct
      if(!products.length) return products;

      let productIds = products.map((product) => product.id)

      let findPromotions = await db.Promotion.findAll({
        where:{
          startDate: {
            lt: date
          },
          endDate: {
            gte: date
          }
        },
        include:[{
          model: db.Product,
          where: {
            id: productIds
          },
          required: true
        }]
      });
      // sails.log.verbose('=== findPromotions ==>',findPromotions);

      if(!findPromotions.length) return products;

      products.forEach((product) => {
        // sails.log.verbose('=== findPromotions ==>',findPromotions);
        //
        findPromotions.forEach((promotion) => {
          //
          promotion.Products.forEach((promotedProduct) => {
            let startDate = promotion.startDate;
            let endDate = promotion.endDate;
            //
            if(product.id == promotedProduct.id){
              console.log('=== promotedProduct ==>',promotedProduct);
              console.log('=== promotedProduct.price ==>',promotedProduct.price);
              //
              product.originPrice = promotedProduct.price;
              let duration = moment.duration(moment(endDate).diff(moment(date)));
              //
              product.promotionCountDown =
                `${duration.get("days")} 天 ${duration.get("hours")
                + ":"
                + duration.get("minutes")
                + ":"
                + duration.get("seconds")}`;
              //
              product.status = 'discount';
              //
              if(promotion.discountType == 'discount'){
                console.log('=== promotion.discount ==>',promotion.discount);
                product.price = parseInt(product.price * promotion.discount);
              }else if(promotion.discountType == 'price'){
                console.log('=== promotion.price ==>',promotion.price);
                product.price = parseInt(product.price - promotion.price);
              }

              if(product.price < 0) product.price = 0;
            } // end if
          }); // end forEach
        }); // end forEach
        // return product;
      }); // end map
      return products;
    } catch (e) {
      console.log('=== productPriceTransPromotionPrice err ==>',e.stack);
      throw e;
    }
  }
  // end productPriceTransPromotionPrice

};
