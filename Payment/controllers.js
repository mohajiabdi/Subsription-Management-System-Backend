const Payment = require("./model");
const Subscription = require("../Subscription/model");

const BILLING_OPTIONS = {
  monthly: { months: 1, discountPercent: 0 },
  quarterly: { months: 3, discountPercent: 20 },
  annual: { months: 12, discountPercent: 40 },
};

function calculatePlanPrice(monthlyPrice, billingCycle = "monthly") {
  const option = BILLING_OPTIONS[billingCycle] || BILLING_OPTIONS.monthly;
  const subtotal = Number(monthlyPrice || 0) * option.months;
  const discount = subtotal * (option.discountPercent / 100);

  return Math.round((subtotal - discount) * 100) / 100;
}

function getBillingPeriod(billingCycle = "monthly") {
  const now = new Date();
  const start = now;
  return getBillingPeriodFromDate(start, billingCycle);
}

function getBillingPeriodFromDate(startDate, billingCycle = "monthly") {
  const start = new Date(startDate);
  const option = BILLING_OPTIONS[billingCycle] || BILLING_OPTIONS.monthly;
  const end = new Date(start);
  end.setMonth(end.getMonth() + option.months);

  return { start, end, ...option };
}

function addMonths(date, months) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function getActivePaymentFilter(customerId, excludePaymentId) {
  const now = new Date();
  const filter = {
    customer: customerId,
    status: "completed",
    $or: [
      { billingPeriodEnd: { $gt: now } },
      {
        billingPeriodEnd: { $exists: false },
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
    ],
  };

  if (excludePaymentId) {
    filter._id = { $ne: excludePaymentId };
  }

  return filter;
}

function isSamePlanAndCycle(payment, subscription, billingCycle) {
  return (
    String(payment.subscription?._id || payment.subscription) ===
      String(subscription) &&
    (payment.billingCycle || "monthly") === billingCycle
  );
}

function getPaymentPlanId(payment) {
  return String(payment.subscription?._id || payment.subscription);
}

const createPayment = async (req, res) => {
  try {
    const {
      customer,
      subscription,
      billingCycle = "monthly",
      method,
      status = "completed",
    } = req.body;
    const customerId = req.user.role === "customer" ? req.user.id : customer;

    if (!customerId || !subscription || !method) {
      return res.status(400).json({
        success: false,
        message: "customer, subscription, and method are required",
      });
    }

    const plan = await Subscription.findById(subscription);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    const { start, end, months, discountPercent } =
      getBillingPeriod(billingCycle);
    const amountBeforeCredit = calculatePlanPrice(plan.price, billingCycle);
    const existingPayment = await Payment.findOne({
      customer: customerId,
      subscription,
    })
      .sort({ createdAt: 1 })
      .populate("subscription");
    const existingEnd = existingPayment?.billingPeriodEnd
      ? new Date(existingPayment.billingPeriodEnd)
      : null;
    const hasActivePayment = existingEnd && existingEnd > new Date();
    const amountDue =
      status === "completed" &&
      existingPayment &&
      hasActivePayment &&
      !isSamePlanAndCycle(existingPayment, subscription, billingCycle)
        ? Math.max(amountBeforeCredit - Number(existingPayment.amount || 0), 0)
        : amountBeforeCredit;

    if (existingPayment) {
      const isExtension =
        hasActivePayment &&
        isSamePlanAndCycle(existingPayment, subscription, billingCycle);
      const baseEnd =
        isExtension && existingEnd && existingEnd > new Date()
          ? existingEnd
          : start;
      const nextEnd = addMonths(baseEnd, months);
      const nextAmount =
        status === "completed" && hasActivePayment
          ? Number(existingPayment.amount || 0) + amountDue
          : amountDue;
      const payment = await Payment.findByIdAndUpdate(
        existingPayment._id,
        {
          subscription,
          amount: nextAmount,
          amountBeforeCredit,
          creditApplied:
            status === "completed" && hasActivePayment && !isExtension
              ? Number(existingPayment.amount || 0)
              : 0,
          billingCycle,
          discountPercent,
          monthsCovered: months,
          billingPeriodStart: isExtension
            ? existingPayment.billingPeriodStart ||
              existingPayment.createdAt ||
              start
            : start,
          billingPeriodEnd: nextEnd,
          method,
          status,
        },
        { new: true, runValidators: true },
      );

      return res.status(200).json({
        success: true,
        message: isExtension
          ? "Existing payment updated and access time extended."
          : "Existing payment updated successfully.",
        data: payment,
      });
    }

    const payment = await Payment.create({
      customer: customerId,
      subscription,
      amount: amountDue,
      amountBeforeCredit,
      creditApplied: 0,
      billingCycle,
      discountPercent,
      monthsCovered: months,
      billingPeriodStart: start,
      billingPeriodEnd: end,
      method,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

const getPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "customer") {
      query.customer = req.user.id;
    }

    const payments = await Payment.find(query)
      .populate("customer", "fullName email")
      .populate("subscription")
      .sort({ createdAt: -1 });
    const seenCustomerPlans = new Set();
    const uniqueCustomerPlanPayments = payments.filter((payment) => {
      const customerKey = String(payment.customer?._id || payment.customer);
      const planKey = getPaymentPlanId(payment);
      const key = `${customerKey}:${planKey}`;
      if (seenCustomerPlans.has(key)) return false;
      seenCustomerPlans.add(key);
      return true;
    });

    return res.status(200).json({
      success: true,
      data: uniqueCustomerPlanPayments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { customer, subscription, amount, method, status, billingCycle } =
      req.body;
    const existingPayment = await Payment.findById(req.params.id);

    if (!existingPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    const payload = {};
    const nextCustomer = customer || existingPayment.customer;
    const nextSubscription = subscription || existingPayment.subscription;
    const nextBillingCycle =
      billingCycle || existingPayment.billingCycle || "monthly";
    const nextStatus = status || existingPayment.status || "pending";

    if (nextStatus === "completed") {
      const duplicatePayment = await Payment.findOne({
        ...getActivePaymentFilter(nextCustomer, existingPayment._id),
        subscription: nextSubscription,
      });

      if (duplicatePayment) {
        return res.status(409).json({
          success: false,
          message:
            "This customer already has an active payment for this plan. Update the existing payment instead of creating another one.",
        });
      }
    }

    if (customer !== undefined) payload.customer = customer;
    if (subscription !== undefined) payload.subscription = subscription;
    if (amount !== undefined) payload.amount = amount;
    if (method !== undefined) payload.method = method;
    if (status !== undefined) payload.status = status;

    if (subscription !== undefined || billingCycle !== undefined) {
      const plan = await Subscription.findById(nextSubscription);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Subscription plan not found",
        });
      }

      const periodStart =
        existingPayment.billingPeriodStart ||
        existingPayment.createdAt ||
        new Date();
      const { start, end, months, discountPercent } =
        getBillingPeriodFromDate(periodStart, nextBillingCycle);
      const amountBeforeCredit = calculatePlanPrice(
        plan.price,
        nextBillingCycle,
      );

      payload.billingCycle = nextBillingCycle;
      payload.discountPercent = discountPercent;
      payload.monthsCovered = months;
      payload.amountBeforeCredit = amountBeforeCredit;
      payload.billingPeriodStart = start;
      payload.billingPeriodEnd = end;

      if (amount === undefined) {
        payload.amount = Math.max(
          amountBeforeCredit - Number(existingPayment.creditApplied || 0),
          0,
        );
      }
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    await Payment.deleteMany({
      customer: payment.customer,
      subscription: payment.subscription,
    });

    return res.status(200).json({
      success: true,
      message: "Payment records deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  updatePayment,
  deletePayment,
};
