"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  type: "sale" | "rent";
  price: number;
  stock: number | null;
  status: "available" | "rented" | null;
  image_url: string | null;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  persistenceError: string | null;
  addItem: (item: Omit<CartItem, "qty">) => string | null;
  setQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const storageKey = "padel-shop-cart";
const CartContext = createContext<CartContextValue | null>(null);

function readCart() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return { items: [] as CartItem[], error: null };
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return { items: [] as CartItem[], error: "Keranjang lokal tidak valid." };
    }
    return {
      items: parsed.filter(
        (item): item is CartItem =>
          typeof item?.id === "string" &&
          typeof item?.name === "string" &&
          (item?.type === "sale" || item?.type === "rent") &&
          typeof item?.price === "number" &&
          Number.isInteger(item?.qty) &&
          item.qty > 0,
      ),
      error: null,
    };
  } catch {
    return { items: [] as CartItem[], error: "Keranjang lokal tidak dapat dibaca." };
  }
}

function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
    return null;
  } catch {
    return "Keranjang tidak dapat disimpan di perangkat ini.";
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = readCart();
      setItems(stored.items);
      setPersistenceError(stored.error);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const saveItems = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems);
    if (hydrated) setPersistenceError(writeCart(nextItems));
  }, [hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    const current = items.find((entry) => entry.id === item.id);
    const nextQty = (current?.qty ?? 0) + 1;

    if (item.type === "rent" && current) {
      return "Item sewa ini sudah ada di keranjang.";
    }
    if (item.type === "rent" && item.status !== "available") {
      return "Item sewa ini sudah tidak tersedia.";
    }
    if (item.type === "sale" && nextQty > (item.stock ?? 0)) {
      return "Jumlah melebihi stok yang tersedia.";
    }

    saveItems(
      current
        ? items.map((entry) =>
            entry.id === item.id ? { ...entry, qty: nextQty } : entry,
          )
        : [...items, { ...item, qty: 1 }],
    );
    return null;
  }, [items, saveItems]);

  const setQuantity = useCallback((id: string, qty: number) => {
    saveItems(
      items.map((item) => {
        if (item.id !== id || item.type === "rent") return item;
        return {
          ...item,
          qty: Math.max(1, Math.min(Math.floor(qty), item.stock ?? 1)),
        };
      }),
    );
  }, [items, saveItems]);

  const removeItem = useCallback((id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  }, [items, saveItems]);

  const clearCart = useCallback(() => saveItems([]), [saveItems]);

  const value = useMemo(
    () => ({
      items,
      hydrated,
      persistenceError,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      hydrated,
      persistenceError,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus digunakan di dalam CartProvider.");
  return context;
}
