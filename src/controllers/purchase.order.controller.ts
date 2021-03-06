import { NextFunction, Request, Response } from "express";
import { PurchaseOrdeModel } from "../models/po.model";
import { ItemPurchaseOrderModel } from "../models/item.po.model";
import { SupplierModel } from "../models/supplier.model";

class PurchaseOrderController {
   static async home(req: Request, res: Response, next: NextFunction) {
      try {
         const purchase_orders = await PurchaseOrdeModel.find().sort({created_at: 'desc'})
         res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Get All Purchase Order`,
            data: purchase_orders
         });
      } catch (error) {
         next(error)
      }
      
   }

   static async getOne(req: Request, res: Response, next: NextFunction) {
      try {
         const found_purchase_orders = await PurchaseOrdeModel.findById(req.params.id)
         res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Get Spesific Purchase Order`,
            data: found_purchase_orders
         });
      } catch (error) {
         next(error)
      }
   }

   static async addItem(req: Request, res: Response, next: NextFunction) {
      try {
         // Validasi jika product sudaha ada di Item Delivery Order
         const thisPO:any = await PurchaseOrdeModel.findById(req.params.id)
         // console.log(thisPO.items)
         thisPO.items.forEach((item:any) => {
            if (req.body.unit == item.unit) {
               throw { name: "Data Has Been Addedd" };
            }
         });

         let price = parseInt(req.body.quantity) * parseInt(req.body.buyPrice)
         const addedItem = await ItemPurchaseOrderModel.create({
            product: req.body.product,
            unit: req.body.unit,
            quantity: parseInt(req.body.quantity),
            buyPrice: parseInt(req.body.buyPrice),
            totalPrice: price
         })

         const pushedItem = await PurchaseOrdeModel.findByIdAndUpdate(req.params.id, {
            $push: { 'items': addedItem },
            $inc: {'subTotalPrice': price, 'totalPrice': price}
         }, {new: true})

         res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Add Item to Purchase Order`,
            data: addedItem,
            dataPO: pushedItem
         });
      } catch (error) {
         next(error)
      }
   }

   static async deleteItem(req: Request, res: Response, next: NextFunction) {
      try {
         const item:any = await ItemPurchaseOrderModel.findById(req.params.id_item)
         let price:number = parseInt(item.totalPrice)
         const deletedItem = await PurchaseOrdeModel.findByIdAndUpdate(req.params.id_po, {
            $pull: { 'items': { _id: req.params.id_item } },
            $inc: {'subTotalPrice': - price, 'totalPrice': - price}
         }, { new: true })
         
         await ItemPurchaseOrderModel.findByIdAndDelete(req.params.id_item)

         res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Delete Item from Purchase Order`,
         });
      } catch (error) {
         next(error)
         console.log(error)
      }
   }

   static async getItem(req: Request, res: Response, next: NextFunction) {
      try {
         const foundItem = await ItemPurchaseOrderModel.find()
          res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Get Item from Purchase Order`,
            data: foundItem
         });
      } catch (error) {
         next(error)
      }
   }

   static async getOneItem(req: Request, res: Response, next: NextFunction) {
      try {
         const foundItem = await ItemPurchaseOrderModel.findById(req.params.id_item)
          res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Get One Item from Purchase Order`,
            data: foundItem
         });
      } catch (error) {
         next(error)
      }
   }

   static async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
      function next_id(input:any) {
         var output:any = parseInt(input, 10);
         output += "";
         while (output.length < 2) output = "0" + output;
         return output;
      }

      function next_id2(input:any) {
         var output:any = parseInt(input, 10) + 1;
         output += "";
         while (output.length < 3) output = "0" + output;
         return output;
      }

      let no_po:any
      let tanggal = new Date().getDate()
      let bulan = new Date().getMonth()
      let tahun:any = new Date().getFullYear()
      tahun += ""
      
      const purchaseOrder:any = await PurchaseOrdeModel.find()
      if (!purchaseOrder[0]) {
         no_po = 'PO' + tahun.slice(2) + next_id(tanggal) + next_id(bulan) + '001'
      } else {
         const no_purchaseOrder = purchaseOrder.pop().no_po
         no_po = 'PO' + tahun.slice(2) + next_id(tanggal) + next_id(bulan) + next_id2(no_purchaseOrder.slice(8))
      }
      
      console.log(req.body.supplierID)
      console.log(req.body.requestUser)
      const pushSupplier = await SupplierModel.findById(req.body.supplierID)
      
      try {
         const newPO = await PurchaseOrdeModel.create({
            no_po: no_po,
            supplierID: pushSupplier,
            requestUser: req.body.requestUser
         })

         res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Create Purchase Order`,
            data: newPO,
         });
      } catch (error) {
         next(error)
      }
      
   }

   static async addDiscount(req: Request, res: Response, next: NextFunction) {
      const discountPrice = req.body.discountPrice
      try {
         const addedDiscount = await PurchaseOrdeModel.findByIdAndUpdate(req.params.id_po, {
            discount: true,
            discountPrice: discountPrice,
            $inc: {'totalPrice': - parseInt(discountPrice)}
         }, {new: true})

         res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Add Discount`,
            data: addedDiscount
         });
      } catch (error) {
         next(error)
         console.log(error)
      }
   }

   static async deleteDiscount(req: Request, res: Response, next: NextFunction) {
      try {
         const foundPO:any = await PurchaseOrdeModel.findById(req.params.id_po)
         const addedDiscount = await PurchaseOrdeModel.findByIdAndUpdate(req.params.id_po, {
            discount: false,
            discountPrice: foundPO.discountPrice,
            $inc: {'totalPrice': + parseInt(foundPO.discountPrice)}
         }, {new: true})

         res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Delete Discount`,
            data: addedDiscount
         });
      } catch (error) {
         next(error)
      }
   }

   static async endPuchaseOrder(req: Request, res: Response, next: NextFunction) {
      try {
         const endedPurchaseOrder = await PurchaseOrdeModel.findByIdAndUpdate(req.params.id_po, {
            prosesStatus: 'pending',
         }, { new: true })
         
         res.status(200).json({
            success: true,
            statusCode: 200,
            responseStatus: "Status OK",
            message: `Success Ended Purchase Order`,
            data: endedPurchaseOrder
         });
      } catch (error) {
         next(error)
      }
   }


}

export default PurchaseOrderController;