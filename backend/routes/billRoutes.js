const router = require('express').Router();
const billController = require("../controllers/billController");
const { authGuardAdmin } = require('../middleware/authGuard');

router.post("/create-order", billController.createBill)
router.put("/add-to-order/:billId", billController.addToBill)

router.get("/get-table-orders/:tableId", authGuardAdmin, billController.getBillsByTable)
router.get("/get-history/:date", authGuardAdmin, billController.getHistory)
router.get("/get-summary", authGuardAdmin, billController.getCheckedOutBillsSummary)

router.put("/update-status/:id", authGuardAdmin, billController.updateStatus)
router.put("/update-payment/:id", billController.updatePaymentStatus)
router.put("/checkout/:id", billController.updateCheckout)

router.delete("/delete-order/:id", authGuardAdmin, billController.deleteOrder)


router.get("/get-orders/:userId", billController.getUserOrder)

module.exports = router;