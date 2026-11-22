import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { siteConfig } from "../config";
import { getCourses } from "../lib/api";
import { readJSON, writeJSON } from "../lib/storage";
import type { Course, Currency } from "../types";

interface StoreValue {
  courses: Course[];
  loading: boolean;
  cartIds: string[];
  cartCourses: Course[];
  has: (id: string) => boolean;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  currency: Currency;
  setCurrencyCode: (code: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  quickViewId: string | null;
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "cp.cart";
const CURRENCY_KEY = "cp.currency";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartIds, setCartIds] = useState<string[]>(() => readJSON<string[]>(CART_KEY, []));
  const [currencyCode, setCurrencyCodeState] = useState<string>(() =>
    readJSON<string>(CURRENCY_KEY, siteConfig.currencies[0].code),
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getCourses()
      .then((data) => {
        if (!alive) return;
        setCourses(data);
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // إزالة أي كورس محفوظ في السلة لم يعد موجوداً
  useEffect(() => {
    if (loading) return;
    setCartIds((ids) => {
      const valid = ids.filter((id) => courses.some((c) => c.id === id));
      return valid.length === ids.length ? ids : valid;
    });
  }, [loading, courses]);

  useEffect(() => {
    writeJSON(CART_KEY, cartIds);
  }, [cartIds]);

  const currency = siteConfig.currencies.find((c) => c.code === currencyCode) ?? siteConfig.currencies[0];

  const setCurrencyCode = useCallback((code: string) => {
    setCurrencyCodeState(code);
    writeJSON(CURRENCY_KEY, code);
  }, []);

  const addToCart = useCallback((id: string) => {
    setCartIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setQuickViewId(null);
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartIds((ids) => ids.filter((x) => x !== id));
  }, []);

  const clearCart = useCallback(() => setCartIds([]), []);
  const openQuickView = useCallback((id: string) => setQuickViewId(id), []);
  const closeQuickView = useCallback(() => setQuickViewId(null), []);

  const value = useMemo<StoreValue>(
    () => ({
      courses,
      loading,
      cartIds,
      cartCourses: cartIds.map((id) => courses.find((c) => c.id === id)).filter((c): c is Course => Boolean(c)),
      has: (id: string) => cartIds.includes(id),
      addToCart,
      removeFromCart,
      clearCart,
      currency,
      setCurrencyCode,
      cartOpen,
      setCartOpen,
      quickViewId,
      openQuickView,
      closeQuickView,
    }),
    [
      courses,
      loading,
      cartIds,
      addToCart,
      removeFromCart,
      clearCart,
      currency,
      setCurrencyCode,
      cartOpen,
      quickViewId,
      openQuickView,
      closeQuickView,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
