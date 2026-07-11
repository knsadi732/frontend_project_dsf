/**
 * Mock-layer business rules that simulate what a real backend would enforce
 * around the Sales -> Inventory -> Production -> Finance flow. These run as
 * `afterUpdate` hooks from createMockCrudApi (see mockCrudApi.js) so a
 * status change made from the UI cascades into the other modules the same
 * way it would against a real API.
 */
import { ORDER_STATUS } from '@/constants/statusEnums';
import {
  salesOrders,
  workOrders,
  invoices,
  getProductById,
  getStockQuantity,
  adjustStock,
  nextId,
  nextDocNumber,
} from '@/services/api/mockDb';
import { addNotification } from '@/services/notification.api';

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

function createWorkOrdersForShortfall(order) {
  const created = [];
  order.items.forEach((item) => {
    const shortfall = Number(item.quantity) - getStockQuantity(item.productId);
    if (shortfall > 0) {
      const product = getProductById(item.productId);
      const workOrder = {
        id: nextId(workOrders),
        workOrderNumber: nextDocNumber(workOrders, 'workOrderNumber', 'WO'),
        productId: item.productId,
        quantity: shortfall,
        stage: 'pending',
        dueDate: order.orderDate,
        salesOrderId: order.id,
        salesOrderNumber: order.soNumber,
      };
      workOrders.unshift(workOrder);
      created.push(workOrder);
      addNotification({
        title: 'Work order created',
        message: `Insufficient stock for ${order.soNumber} — ${workOrder.workOrderNumber} created for ${shortfall} × ${product?.name ?? item.productId}`,
      });
    }
  });
  return created;
}

export function onSalesOrderStatusChange(previous, next) {
  if (next.status === previous.status) return next;

  if (next.status === ORDER_STATUS.APPROVED) {
    if (checkStockForItems(next.items)) {
      reserveStockForItems(next.items);
      addNotification({ title: 'Stock reserved', message: `Stock reserved for ${next.soNumber}` });
      return { ...next, _stockReserved: true };
    }

    const created = createWorkOrdersForShortfall(next);
    return {
      ...next,
      status: ORDER_STATUS.IN_PROGRESS,
      _stockReserved: false,
      linkedWorkOrders: [...(next.linkedWorkOrders ?? []), ...created.map((wo) => wo.workOrderNumber)],
    };
  }

  if (next.status === ORDER_STATUS.COMPLETED) {
    if (!next._stockReserved) {
      if (!checkStockForItems(next.items)) {
        addNotification({
          title: 'Cannot complete order',
          message: `${next.soNumber} is still waiting on stock — not completed`,
        });
        return { ...next, status: previous.status };
      }
      reserveStockForItems(next.items);
    }

    const invoice = {
      id: nextId(invoices),
      invoiceNumber: nextDocNumber(invoices, 'invoiceNumber', 'INV'),
      salesOrderId: next.id,
      salesOrderNumber: next.soNumber,
      party: next.customer,
      amount: next.total,
      dueDate: addDays(next.orderDate, 15),
      status: 'unpaid',
    };
    invoices.unshift(invoice);
    addNotification({
      title: 'Invoice generated',
      message: `${invoice.invoiceNumber} generated for ${next.soNumber}`,
    });
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
    });
    return { ...next, _stockReserved: false };
  }

  return next;
}

export function onWorkOrderStageChange(previous, next) {
  if (next.stage === previous.stage) return next;

  if (next.stage === 'completed') {
    adjustStock(next.productId, Number(next.quantity));
    const product = getProductById(next.productId);
    addNotification({
      title: 'Production completed',
      message: `${next.workOrderNumber} added ${next.quantity} × ${product?.name ?? next.productId} to inventory`,
    });

    if (next.salesOrderId) {
      const soIndex = salesOrders.findIndex((so) => so.id === next.salesOrderId);
      if (soIndex !== -1) {
        const so = salesOrders[soIndex];
        if (so.status === ORDER_STATUS.IN_PROGRESS && checkStockForItems(so.items)) {
          reserveStockForItems(so.items);
          salesOrders[soIndex] = { ...so, status: ORDER_STATUS.APPROVED, _stockReserved: true };
          addNotification({
            title: 'Order ready',
            message: `${so.soNumber} stock fulfilled — ready to mark completed`,
          });
        }
      }
    }
  }

  return next;
}
