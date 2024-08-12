const router = require('express').Router();
const billController = require("../controllers/billController");
const { authGuardAdmin } = require('../middleware/authGuard');

// Handler for method not allowed
function methodNotAllowed(req, res) {
    res.status(405).json({ message: "Method Not Allowed" });
}

router.route("/create-order")
    .post(billController.createBill)
    .all(methodNotAllowed);

router.route("/add-to-order/:billId")
    .put(billController.addToBill)
    .all(methodNotAllowed);

router.route("/get-table-orders/:tableId")
    .get(authGuardAdmin, billController.getBillsByTable)
    .all(methodNotAllowed);

router.route("/get-history/:date")
    .get(authGuardAdmin, billController.getHistory)
    .all(methodNotAllowed);

router.route("/get-summary")
    .get(authGuardAdmin, billController.getCheckedOutBillsSummary)
    .all(methodNotAllowed);

router.route("/update-status/:id")
    .put(authGuardAdmin, billController.updateStatus)
    .all(methodNotAllowed);

router.route("/update-payment/:id")
    .put(billController.updatePaymentStatus)
    .all(methodNotAllowed);

router.route("/checkout/:id")
    .put(billController.updateCheckout)
    .all(methodNotAllowed);

router.route("/delete-order/:id")
    .delete(authGuardAdmin, billController.deleteOrder)
    .all(methodNotAllowed);

router.route("/get-orders/:userId")
    .get(billController.getUserOrder)
    .all(methodNotAllowed);

module.exports = router;