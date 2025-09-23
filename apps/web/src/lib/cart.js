const STORAGE_KEY = "atw_cart_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function readRaw() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRaw(items) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    // Let other tabs/pages know cart changed.
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: JSON.stringify(items),
      })
    );
  } catch {}
}

export function getCart() {
  return readRaw();
}

export function clearCart() {
  writeRaw([]);
}

export function setCart(items) {
  // Full replace (use sparingly)
  writeRaw(items);
}

export function addItem(item, qty = 1) {
  const items = readRaw();
  const idx = items.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    items[idx].quantity = Math.min(999, items[idx].quantity + qty);
  } else {
    items.push({
      id: item.id,
      name: item.name,
      unitAmountCents: item.unitAmountCents,
      imageUrl: item.imageUrl || "",
      currency: item.currency || "usd",
      quantity: Math.max(1, qty),
    });
  }
  writeRaw(items);
  return items;
}

export function removeItem(id) {
  const items = readRaw().filter((x) => x.id !== id);
  writeRaw(items);
  return items;
}

export function setQuantity(id, qty) {
  const items = readRaw();
  const idx = items.findIndex((x) => x.id === id);
  if (idx >= 0) {
    items[idx].quantity = Math.max(0, Math.min(999, qty));
    if (items[idx].quantity === 0) items.splice(idx, 1);
    writeRaw(items);
  }
  return items;
}

export function increment(id, step = 1) {
  const items = readRaw();
  const idx = items.findIndex((x) => x.id === id);
  if (idx >= 0) {
    items[idx].quantity = Math.min(999, items[idx].quantity + step);
    writeRaw(items);
  }
  return items;
}

export function decrement(id, step = 1) {
  const items = readRaw();
  const idx = items.findIndex((x) => x.id === id);
  if (idx >= 0) {
    const next = items[idx].quantity - step;
    if (next <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx].quantity = next;
    }
    writeRaw(items);
  }
  return items;
}

export function getSubtotalCents() {
  const items = readRaw();
  return items.reduce((sum, i) => sum + i.unitAmountCents * i.quantity, 0);
}
