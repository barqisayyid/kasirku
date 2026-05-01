// types/index.ts
export type Category = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Product = {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  barcode: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category;
};

export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  customer_id: string | null;
  payment_method: "tunai" | "utang";
  total_price: number;
  amount_paid: number;
  change_amount: number;
  created_at: string;
  transaction_items?: TransactionItem[];
  customers?: Customer;
};

export type TransactionItem = {
  id: string;
  transaction_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type Debt = {
  id: string;
  user_id: string;
  customer_id: string;
  transaction_id: string;
  total_debt: number;
  remaining_debt: number;
  status: "belum_lunas" | "lunas";
  created_at: string;
  customers?: Customer;
  transactions?: Transaction;
};

export type DebtPayment = {
  id: string;
  debt_id: string;
  amount: number;
  paid_at: string;
};

// Tipe untuk keranjang belanja (state lokal)
export type CartItem = {
  product: Product;
  quantity: number;
};
