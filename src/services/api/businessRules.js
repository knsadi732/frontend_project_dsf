/**
 * Mock-layer business rules that simulate what a real backend would enforce
 * around the full order-to-cash flow: Sales -> (Inventory | raw-material
 * check -> urgent Purchase / Production) -> dispatch -> GST invoice ->
 * Returns -> cost adjustment. These run as `afterUpdate` hooks from
 * createMockCrudApi (see mockCrudApi.js) so a status change made from the
 * UI cascades into the other modules the same way it would against a real
 * API.
 */
import { ORDER_STATUS } from '@/constants/statusEnums';
import {
  salesOrders,
  workOrders,
  invoices,
  purchases,
  creditNotes,
  getProductById,
  getRawMaterialById,
  getRawMaterialByName,
  getStockQuantity,
  adjustStock,
  adjustInventoryBucket,
  adjustRawMaterial,
  checkBomAvailability,
  consumeBom,
  nextId,
  nextDocNumber,
  recomputeProductCost,
} from '@/services/api/mockDb';
import { addNotification } from '@/services/notification.api';

// Documented assumptions (spec gave the shape of the rules but not exact
// numbers) — see the plan for rationale.
const HEAVY_ORDER_THRESHOLD = 100000;
const ADVANCE_RATE = 0.3;
const GST_RATE_BREAKPOINT = 1000; // per-unit rate
const GST_LOW_RATE = 0.05;
const GST_HIGH_RATE = 0.18;
const PRODUCTION_LEAD_DAYS = 5;
const DISPATCH_LEAD_DAYS = 1;

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function checkStockForItems(items) {
  return items.every((item) => getStockQuantity(item.productId) >= Number(item.quantity));
}

function reserveStockForItems(items) {
  items.forEach((item) => adjustStock(item.productId, -Number(item.quantity)));
}

function releaseStockForItems(items) {
  items.forEach((item) => adjustStock(item.productId, Number(item.quantity)));
}

function gstRateForLine(rate) {
  return Number(rate) > GST_RATE_BREAKPOINT ? GST_HIGH_RATE : GST_LOW_RATE;
}

function buildInvoiceItems(order) {
  return order.items.map((item) => {
    const product = getProductById(item.productId);
    const lineAmount = Number(item.quantity) * Number(item.rate);
    const gstRate = gstRateForLine(item.rate);
    return {
      productId: item.productId,
      name: product?.name ?? item.productId,
      quantity: item.quantity,
      rate: item.rate,
      amount: lineAmount,
      gstRate,
      gstAmount: Math.round(lineAmount * gstRate),
    };
  });
}

function generateInvoiceForOrder(order) {
  const lineItems = buildInvoiceItems(order);
  const taxableAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = lineItems.reduce((sum, item) => sum + item.gstAmount, 0);
  const grandTotal = taxableAmount + gstAmount;
  const isHeavyOrder = grandTotal > HEAVY_ORDER_THRESHOLD;
  const advanceAmount = isHeavyOrder ? Math.round(grandTotal * ADVANCE_RATE) : 0;

  const invoice = {
    id: nextId(invoices),
    invoiceNumber: nextDocNumber(invoices, 'invoiceNumber', 'INV'),
    salesOrderId: order.id,
    salesOrderNumber: order.soNumber,
    orderDate: order.orderDate,
    party: order.customer,
    items: lineItems,
    taxableAmount,
    gstRate: taxableAmount > 0 ? Math.round((gstAmount / taxableAmount) * 100) : 0,
    gstAmount,
    amount: grandTotal,
    advanceAmount,
    balanceDue: grandTotal - advanceAmount,
    dueDate: addDays(order.orderDate, 15),
    status: isHeavyOrder ? 'partial' : 'unpaid',
  };
  invoices.unshift(invoice);

  addNotification({
    title: 'Invoice generated',
    message: isHeavyOrder
      ? `${invoice.invoiceNumber} generated for ${order.soNumber} — heavy order, advance ₹${advanceAmount.toLocaleString('en-IN')} due`
      : `${invoice.invoiceNumber} generated for ${order.soNumber}`,
    type: 'success',
  });

  return invoice;
}

export function onSalesOrderCreate(record) {
  addNotification({
    title: 'New sales order',
    message: `${record.soNumber} from ${record.customer} needs review`,
    type: 'approval',
    category: 'sales_order_review',
    entityId: record.id,
  });
  return record;
}

function notifyWarehousePacking(order) {
  addNotification({
    title: 'Order ready for packing',
    message: `${order.soNumber} accepted — pack & prepare for dispatch`,
    type: 'approval',
    category: 'sales_order_packing',
    entityId: order.id,
  });
}

function createUrgentPurchaseOrder(shortages, workOrder, order) {
  const items = shortages.map((shortage) => {
    const material = getRawMaterialById(shortage.rawMaterialId);
    const quantity = Math.ceil(shortage.shortfall);
    return { product: material?.name ?? shortage.rawMaterialId, quantity, rate: material?.rate ?? 0 };
  });
  const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const supplier = getRawMaterialById(shortages[0]?.rawMaterialId)?.defaultSupplier ?? 'Unassigned Supplier';

  const po = {
    id: nextId(purchases),
    poNumber: nextDocNumber(purchases, 'poNumber', 'PO'),
    supplier,
    orderDate: order.orderDate,
    status: 'pending',
    items,
    total,
    priority: 'urgent',
    sourceType: 'auto-shortfall',
    linkedWorkOrderId: workOrder.id,
  };
  purchases.unshift(po);

  addNotification({
    title: 'Urgent purchase order raised',
    message: `${po.poNumber} (URGENT) raised with ${supplier} — ${order.soNumber} production blocked on raw material`,
    type: 'warning',
  });

  return po;
}

function createWorkOrdersForShortfall(order) {
  const created = [];
  order.items.forEach((item) => {
    const shortfall = Number(item.quantity) - getStockQuantity(item.productId);
    if (shortfall <= 0) return;

    const product = getProductById(item.productId);
    const bomCheck = checkBomAvailability(item.productId, shortfall);

    const workOrder = {
      id: nextId(workOrders),
      workOrderNumber: nextDocNumber(workOrders, 'workOrderNumber', 'WO'),
      productId: item.productId,
      quantity: shortfall,
      stage: bomCheck.sufficient ? 'pending' : 'blocked_on_material',
      dueDate: addDays(order.orderDate, PRODUCTION_LEAD_DAYS),
      salesOrderId: order.id,
      salesOrderNumber: order.soNumber,
    };
    workOrders.unshift(workOrder);
    created.push(workOrder);

    if (bomCheck.sufficient) {
      consumeBom(item.productId, shortfall);
      addNotification({
        title: 'Work order created',
        message: `Insufficient stock for ${order.soNumber} — ${workOrder.workOrderNumber} created for ${shortfall} × ${product?.name ?? item.productId}, expected ${workOrder.dueDate}`,
        type: 'information',
      });
    } else {
      addNotification({
        title: 'Production blocked on raw material',
        message: `${workOrder.workOrderNumber} (${shortfall} × ${product?.name ?? item.productId}) can't start — raw material short`,
        type: 'warning',
      });
      createUrgentPurchaseOrder(bomCheck.shortages, workOrder, order);
    }
  });
  return created;
}

export function onSalesOrderStatusChange(previous, next) {
  if (next.status === previous.status) return next;

  if (next.status === ORDER_STATUS.APPROVED) {
    if (checkStockForItems(next.items)) {
      reserveStockForItems(next.items);
      const dispatchDate = addDays(next.orderDate, DISPATCH_LEAD_DAYS);
      addNotification({
        title: 'Stock reserved',
        message: `Stock reserved for ${next.soNumber} — dispatch by ${dispatchDate}`,
        type: 'success',
      });
      let updated = { ...next, _stockReserved: true, dispatchDate, productionEta: null };
      if (!updated.invoiceNumber) {
        const invoice = generateInvoiceForOrder(updated);
        updated = { ...updated, invoiceNumber: invoice.invoiceNumber };
      }
      notifyWarehousePacking(updated);
      return updated;
    }

    const created = createWorkOrdersForShortfall(next);
    const productionEta = created.reduce(
      (latest, wo) => (!latest || wo.dueDate > latest ? wo.dueDate : latest),
      null,
    );
    return {
      ...next,
      status: ORDER_STATUS.IN_PROGRESS,
      _stockReserved: false,
      productionEta,
      linkedWorkOrders: [...(next.linkedWorkOrders ?? []), ...created.map((wo) => wo.workOrderNumber)],
    };
  }

  if (next.status === ORDER_STATUS.COMPLETED) {
    if (!next._stockReserved) {
      if (!checkStockForItems(next.items)) {
        addNotification({
          title: 'Cannot complete order',
          message: `${next.soNumber} is still waiting on stock — not completed`,
          type: 'error',
        });
        return { ...next, status: previous.status };
      }
      reserveStockForItems(next.items);
    }

    if (next.invoiceNumber) {
      addNotification({ title: 'Order dispatched', message: `${next.soNumber} marked completed — ${next.invoiceNumber} already on file`, type: 'success' });
      return { ...next, _stockReserved: true };
    }

    const invoice = generateInvoiceForOrder(next);
    return { ...next, _stockReserved: true, invoiceNumber: invoice.invoiceNumber };
  }

  if (next.status === ORDER_STATUS.CANCELLED) {
    if (previous._stockReserved) releaseStockForItems(next.items);

    workOrders.forEach((wo, index) => {
      if (wo.salesOrderId === next.id && wo.stage !== 'completed' && wo.stage !== 'cancelled') {
        workOrders[index] = { ...wo, stage: 'cancelled' };
      }
    });

    addNotification({
      title: 'Order cancelled',
      message: `${next.soNumber} cancelled${previous._stockReserved ? ' — reserved stock released' : ''}`,
      type: 'warning',
    });
    return { ...next, _stockReserved: false };
  }

  if (next.status === ORDER_STATUS.REJECTED) {
    if (previous._stockReserved) releaseStockForItems(next.items);

    addNotification({
      title: 'Order rejected',
      message: `${next.soNumber} rejected`,
      type: 'error',
    });
    return { ...next, _stockReserved: false };
  }

  return next;
}

export function onWorkOrderStageChange(previous, next) {
  if (next.stage === previous.stage) return next;

  if (next.stage === 'completed') {
    if (previous.stage === 'blocked_on_material') {
      addNotification({
        title: 'Cannot complete work order',
        message: `${next.workOrderNumber} is still blocked on raw material — not completed`,
        type: 'error',
      });
      return { ...next, stage: previous.stage };
    }

    adjustStock(next.productId, Number(next.quantity));
    const product = getProductById(next.productId);
    addNotification({
      title: 'Production completed',
      message: `${next.workOrderNumber} added ${next.quantity} × ${product?.name ?? next.productId} to inventory`,
      type: 'success',
    });

    if (next.salesOrderId) {
      const soIndex = salesOrders.findIndex((so) => so.id === next.salesOrderId);
      if (soIndex !== -1) {
        const so = salesOrders[soIndex];
        if (so.status === ORDER_STATUS.IN_PROGRESS && checkStockForItems(so.items)) {
          reserveStockForItems(so.items);
          let updated = { ...so, status: ORDER_STATUS.APPROVED, _stockReserved: true };
          addNotification({
            title: 'Order ready',
            message: `${so.soNumber} stock fulfilled — ready to mark completed`,
            type: 'success',
          });
          if (!updated.invoiceNumber) {
            const invoice = generateInvoiceForOrder(updated);
            updated = { ...updated, invoiceNumber: invoice.invoiceNumber };
          }
          notifyWarehousePacking(updated);
          salesOrders[soIndex] = updated;
        }
      }
    }
  }

  return next;
}

/**
 * Purchase Order Chapter 11.16: "Inventory quantities increase only after
 * GRN approval" — completing a PO is just a status milestone now; the
 * actual raw-material increment moved to `onGrnStatusChange` below, fired
 * when a Goods Receipt Note against this PO is approved.
 */
export function onPurchaseOrderStatusChange(previous, next) {
  if (next.status === previous.status) return next;

  if (next.status === 'completed') {
    addNotification({
      title: 'Purchase order completed',
      message: `${next.poNumber} marked completed — awaiting GRN for inventory update`,
      type: 'information',
    });
  }

  return next;
}

export function onGrnStatusChange(previous, next) {
  if (next.status === previous.status) return next;

  if (next.status === 'approved') {
    next.items.forEach((item) => {
      const material = getRawMaterialByName(item.product);
      if (material) adjustRawMaterial(material.id, Number(item.acceptedQty));
    });

    addNotification({
      title: 'GRN approved — materials received',
      message: `${next.grnNumber} approved, inventory updated`,
      type: 'success',
    });

    const po = next.purchaseOrderId ? purchases.find((purchase) => purchase.id === next.purchaseOrderId) : null;
    if (po?.linkedWorkOrderId) {
      const woIndex = workOrders.findIndex((wo) => wo.id === po.linkedWorkOrderId);
      if (woIndex !== -1) {
        const wo = workOrders[woIndex];
        if (wo.stage === 'blocked_on_material') {
          const bomCheck = checkBomAvailability(wo.productId, wo.quantity);
          if (bomCheck.sufficient) {
            consumeBom(wo.productId, wo.quantity);
            workOrders[woIndex] = { ...wo, stage: 'pending' };
            addNotification({
              title: 'Work order unblocked',
              message: `${wo.workOrderNumber} — materials arrived, ready for production`,
              type: 'success',
            });
          } else {
            addNotification({
              title: 'Still short on material',
              message: `${wo.workOrderNumber} received partial materials — still blocked`,
              type: 'warning',
            });
          }
        }
      }
    }
  }

  return next;
}

// Return & Reverse Logistics Domain (Ch16): Requested -> Sales Review
// (Approved/Partially Approved/Rejected) -> Pickup -> Warehouse Receipt ->
// Quality Inspection -> Decision (restock/repair/scrap) -> Inventory Update
// -> Resolution (Refund generates a Credit Note / Replacement is created via
// the "Convert to Replacement Order" action) -> Resolved.
function createCreditNoteForReturn(record) {
  const invoice = invoices.find((inv) => inv.salesOrderId === record.salesOrderId);
  const gstAmount = invoice ? Math.round(Number(record.refundAmount) * (Number(invoice.gstRate ?? 0) / 100)) : 0;

  const creditNote = {
    id: nextId(creditNotes),
    creditNoteNumber: nextDocNumber(creditNotes, 'creditNoteNumber', 'CN'),
    returnId: record.id,
    invoiceId: invoice?.id ?? null,
    invoiceNumber: invoice?.invoiceNumber ?? null,
    customer: record.customer,
    amount: Number(record.refundAmount),
    gstAmount,
    createdDate: new Date().toISOString().slice(0, 10),
  };
  creditNotes.unshift(creditNote);

  addNotification({
    title: 'Credit note issued',
    message: `${creditNote.creditNoteNumber} issued for ${record.returnNumber} — ₹${creditNote.amount.toLocaleString('en-IN')}`,
    type: 'success',
  });

  return creditNote;
}

export function onReturnStatusChange(previous, next) {
  if (next.status === previous.status) return next;

  if (next.status === 'approved' || next.status === 'partially_approved') {
    addNotification({
      title: 'Return approved',
      message: `${next.returnNumber} (${next.soNumber}) ${next.status === 'partially_approved' ? 'partially approved' : 'approved'} — awaiting pickup`,
      type: 'success',
    });
  }

  if (next.status === 'rejected') {
    addNotification({
      title: 'Return rejected',
      message: `${next.returnNumber} rejected`,
      type: 'error',
    });
  }

  if (next.status === 'pickup_scheduled') {
    addNotification({
      title: 'Return pickup scheduled',
      message: `${next.returnNumber} — pickup via ${next.courierPartner || 'courier'} on ${next.pickupDate}`,
      type: 'information',
    });
  }

  if (next.status === 'warehouse_received') {
    addNotification({
      title: 'Return received at warehouse',
      message: `${next.returnNumber} received — awaiting quality inspection`,
      type: 'information',
    });
  }

  if (next.status === 'inspection_completed') {
    if (next.decision === 'restock') {
      adjustStock(next.productId, Number(next.quantity));
      addNotification({
        title: 'Return restocked',
        message: `${next.returnNumber} passed inspection — ${next.quantity} unit(s) restocked to Finished Goods`,
        type: 'success',
      });
    } else if (next.decision === 'repair') {
      adjustInventoryBucket(next.productId, 'repairQuantity', Number(next.quantity));
      addNotification({
        title: 'Return sent for repair',
        message: `${next.returnNumber} — ${next.quantity} unit(s) moved to Repair Inventory`,
        type: 'warning',
      });
    } else if (next.decision === 'scrap') {
      adjustInventoryBucket(next.productId, 'damagedQuantity', Number(next.quantity));
      const product = getProductById(next.productId);
      if (product) {
        product.damageCost += Math.round(Number(next.amount) * 0.1);
        recomputeProductCost(product);
      }
      addNotification({
        title: 'Return scrapped',
        message: `${next.returnNumber} failed inspection — ${next.quantity} unit(s) moved to Scrap/Damaged Inventory`,
        type: 'warning',
      });
    }
  }

  if (next.status === 'resolved') {
    if (next.resolutionType === 'refund') {
      createCreditNoteForReturn(next);
      return { ...next, refundStatus: 'completed' };
    }
    addNotification({
      title: 'Return resolved',
      message: `${next.returnNumber} resolved`,
      type: 'success',
    });
  }

  return next;
}

/**
 * Finance Chapter 15.11: a Customer Payment updates Accounts Receivable —
 * here, the linked invoice's paidAmount/balanceDue/status directly, since
 * this mock has no separate ledger to post to.
 */
export function onPaymentCreate(record) {
  const invoice = invoices.find((inv) => inv.id === record.invoiceId);
  if (invoice) {
    invoice.paidAmount = Number(invoice.paidAmount ?? 0) + Number(record.amount);
    invoice.balanceDue = Math.max(0, Number(invoice.amount) - invoice.paidAmount);
    invoice.status = invoice.balanceDue <= 0 ? 'paid' : 'partial';

    addNotification({
      title: 'Payment received',
      message: `₹${Number(record.amount).toLocaleString('en-IN')} received against ${invoice.invoiceNumber} — ${invoice.status}`,
      type: 'success',
    });
  }

  return record;
}
