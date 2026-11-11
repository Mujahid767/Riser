import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { AdminOrder, OrderStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readOrders(): Promise<AdminOrder[]> {
  try {
    const raw = await readFile(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOrder);
  } catch {
    return [];
  }
}

function isOrder(value: unknown): value is AdminOrder {
  if (!value || typeof value !== "object") return false;
  const o = value as AdminOrder;
  return typeof o.id === "string" && typeof o.orderNumber === "string";
}

async function writeOrdersFile(orders: AdminOrder[]) {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = `${ORDERS_FILE}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(orders, null, 2), "utf8");
  await rename(temp, ORDERS_FILE);
}

function nextOrderNumber(orders: AdminOrder[]): string {
  const year = new Date().getFullYear();
  const max = orders
    .filter((o) => o.orderNumber.startsWith(`RIS-${year}-`))
    .map((o) => parseInt(o.orderNumber.split("-")[2] ?? "0", 10))
    .reduce((a, b) => Math.max(a, b), 0);
  return `RIS-${year}-${String(max + 1).padStart(6, "0")}`;
}

export async function listOrders(opts?: {
  status?: OrderStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: AdminOrder[]; total: number }> {
  let orders = await readOrders();
  orders = orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (opts?.status) orders = orders.filter((o) => o.status === opts.status);
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
    );
  }

  const total = orders.length;
  const offset = opts?.offset ?? 0;
  const limit = opts?.limit ?? 50;
  return { orders: orders.slice(offset, offset + limit), total };
}

export async function getOrder(id: string): Promise<AdminOrder | null> {
  const orders = await readOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function createOrder(
  input: Omit<AdminOrder, "id" | "orderNumber" | "createdAt" | "updatedAt">
): Promise<AdminOrder> {
  return withLock(async () => {
    const orders = await readOrders();
    const now = new Date().toISOString();
    const order: AdminOrder = {
      ...input,
      id: `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      orderNumber: nextOrderNumber(orders),
      createdAt: now,
      updatedAt: now,
    };
    orders.unshift(order);
    await writeOrdersFile(orders);
    return order;
  });
}

export async function updateOrder(
  id: string,
  input: Partial<Pick<AdminOrder, "status" | "paymentStatus" | "trackingNumber" | "note">>
): Promise<AdminOrder | null> {
  return withLock(async () => {
    const orders = await readOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    orders[index] = { ...orders[index], ...input, updatedAt: new Date().toISOString() };
    await writeOrdersFile(orders);
    return orders[index];
  });
}

