import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { AdminProduct } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readProducts(): Promise<AdminProduct[]> {
  try {
    const raw = await readFile(PRODUCTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isProduct);
  } catch {
    return [];
  }
}

function isProduct(value: unknown): value is AdminProduct {
  if (!value || typeof value !== "object") return false;
  const p = value as AdminProduct;
  return typeof p.id === "string" && typeof p.name === "string" && typeof p.slug === "string";
}

async function writeProducts(products: AdminProduct[]) {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = `${PRODUCTS_FILE}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(products, null, 2), "utf8");
  await rename(temp, PRODUCTS_FILE);
}

export async function listProducts(opts?: {
  category?: string;
  status?: string;
  stock?: "in" | "out" | "low";
}): Promise<AdminProduct[]> {
  let products = await readProducts();
  if (opts?.category) products = products.filter((p) => p.category === opts.category);
  if (opts?.status) products = products.filter((p) => p.status === opts.status);
  if (opts?.stock === "in") products = products.filter((p) => p.stock > 0);
  if (opts?.stock === "out") products = products.filter((p) => p.stock === 0);
  if (opts?.stock === "low") products = products.filter((p) => p.stock > 0 && p.stock <= 5);
  return products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  const products = await readProducts();
  return products.find((p) => p.id === id) ?? null;
}

export async function createProduct(input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">): Promise<AdminProduct> {
  return withLock(async () => {
    const products = await readProducts();
    const now = new Date().toISOString();
    const product: AdminProduct = {
      ...input,
      id: `rsr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    products.unshift(product);
    await writeProducts(products);
    return product;
  });
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<AdminProduct, "id" | "createdAt">>
): Promise<AdminProduct | null> {
  return withLock(async () => {
    const products = await readProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...input, updatedAt: new Date().toISOString() };
    await writeProducts(products);
    return products[index];
  });
}

export async function deleteProduct(id: string): Promise<boolean> {
  return withLock(async () => {
    const products = await readProducts();
    const had = products.some((p) => p.id === id);
    await writeProducts(products.filter((p) => p.id !== id));
    return had;
  });
}

