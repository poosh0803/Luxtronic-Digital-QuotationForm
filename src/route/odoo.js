const express = require('express');

const router = express.Router();

const CACHE_TTL_MS = 60 * 1000;
const MAX_RESULTS = 20;

let cache = { products: null, fetchedAt: 0 };

const odooApiUrl = () => (process.env.ODOO_API_URL || '').replace(/\/+$/, '');

// Odoo returns `false` for unset text fields; normalise to ''.
const text = (v) => (typeof v === 'string' ? v : '');

async function loadProducts() {
  if (cache.products && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.products;
  }
  const res = await fetch(`${odooApiUrl()}/inventory/products/all`);
  if (!res.ok) throw new Error(`Odoo API responded ${res.status}`);
  const data = await res.json();
  cache = { products: data.products || [], fetchedAt: Date.now() };
  return cache.products;
}

function searchProducts(products, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return products
    .filter((p) => {
      const haystack = `${text(p.display_name)} ${text(p.default_code)} ${text(p.barcode)}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    })
    .sort((a, b) => (b.qty_available > 0) - (a.qty_available > 0))
    .slice(0, MAX_RESULTS)
    .map((p) => ({
      id: p.id,
      name: text(p.display_name),
      sku: text(p.default_code),
      price: p.list_price,
      stock: p.qty_available,
    }));
}

router.get('/products', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  if (!odooApiUrl()) {
    return res.status(503).json({ error: 'ODOO_API_URL is not configured' });
  }
  try {
    res.json({ products: searchProducts(await loadProducts(), q) });
  } catch (error) {
    console.error('Odoo lookup error:', error);
    res.status(502).json({ error: 'Failed to reach the Odoo API', message: error.message });
  }
});

module.exports = router;
module.exports.searchProducts = searchProducts;
