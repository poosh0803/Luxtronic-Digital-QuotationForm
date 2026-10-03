// Odoo product lookup, shared by the New Quotation page and the Records edit
// modal. When the toggle is on, typing in a part's Details field suggests
// products from Odoo (via /api/odoo/products) restricted to the categories
// that make sense for that row; picking one fills in the name and price.

// Each part row only searches the Odoo categories that make sense for it
// (a category includes its sub-categories; "=Name" matches that exact
// category only). Keyed by row, written with hyphens ("cpu-cooling"). OS,
// Others and Assembly are not listed, so they search every product.
// Deliberately left out: CASE / LCD, PSU / Cable, SSD / Heatsink,
// FAN / HUB, Display / Stand, Cooler / ThermalPaste.
const ODOO_ROW_CATEGORIES = {
  'cpu': ['CPU'],
  'cpu-cooling': ['Cooler / AirCool', 'Cooler / WaterCool'],
  'motherboard': ['MB'],
  'ram': ['DRAM'],
  'storage1': ['SSD / NVME', 'SSD / SATA', 'SSD / mSATA', 'HDD'],
  'storage2': ['SSD / NVME', 'SSD / SATA', 'SSD / mSATA', 'HDD'],
  'gpu': ['GPU'],
  'case': ['CASE / ATX', 'CASE / E-ATX', 'CASE / mATX'],
  'psu': ['PSU / Modular', 'PSU / Non-Modular'],
  'sys-fan': ['FAN / 120mm', 'FAN / 140mm', 'FAN / 160mm'],
  'monitor': ['=Display', 'Display / 24"', 'Display / 27"', 'Display / 32"'],
};

// Options:
//   container       element whose inputs are watched (event delegation)
//   toggle          the on/off button; stateLabel shows "On"/"Off"
//   detailsRowKey   (input) => row key such as "cpu-cooling" if the input is a
//                   Details field, otherwise null
//   priceInputFor   (tr) => that row's price input
function setupOdooLookup({ container, toggle, stateLabel, detailsRowKey, priceInputFor }) {
  if (!container || !toggle) return;

  const menu = document.createElement('div');
  menu.className = 'odoo-menu';
  menu.hidden = true;
  document.body.appendChild(menu);

  let enabled = false;
  let activeInput = null;
  let debounceTimer = null;
  let requestSeq = 0;

  const rowKeyOf = (el) => (el && el.tagName === 'INPUT' ? detailsRowKey(el) : null);
  const categoriesFor = (input) => ODOO_ROW_CATEGORIES[rowKeyOf(input)] || [];

  const closeMenu = () => {
    clearTimeout(debounceTimer);
    requestSeq++; // drop any search still in flight
    menu.hidden = true;
    menu.innerHTML = '';
  };

  const setEnabled = (on) => {
    enabled = on;
    toggle.classList.toggle('active', on);
    toggle.setAttribute('aria-pressed', String(on));
    if (stateLabel) stateLabel.textContent = on ? 'On' : 'Off';
    try { localStorage.setItem('odooLookup', on ? 'on' : 'off'); } catch (e) { /* ignore */ }
    if (!on) closeMenu();
  };

  const positionMenu = () => {
    if (!activeInput) return;
    const rect = activeInput.getBoundingClientRect();
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.top = `${rect.bottom + window.scrollY + 2}px`;
    menu.style.width = `${Math.max(rect.width, 360)}px`;
  };

  const renderMessage = (message) => {
    menu.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'odoo-menu-message';
    div.textContent = message;
    menu.appendChild(div);
    positionMenu();
    menu.hidden = false;
  };

  const selectProduct = (product) => {
    if (!activeInput) return;
    activeInput.value = product.name;
    const priceInput = priceInputFor(activeInput.closest('tr'));
    if (priceInput && typeof product.price === 'number') {
      priceInput.value = product.price.toFixed(2);
      // Lets each page recalculate its total.
      priceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    closeMenu();
  };

  const renderResults = (products) => {
    if (!products.length) {
      return renderMessage(categoriesFor(activeInput).length
        ? 'No matching products in the right Odoo category for this row'
        : 'No matching products in Odoo');
    }
    menu.innerHTML = '';
    products.forEach((product) => {
      const item = document.createElement('div');
      item.className = 'odoo-menu-item';

      const name = document.createElement('div');
      name.className = 'odoo-menu-name';
      name.textContent = product.name;

      const meta = document.createElement('div');
      meta.className = 'odoo-menu-meta';
      const sku = document.createElement('span');
      sku.textContent = product.sku || 'no SKU';
      const cat = document.createElement('span');
      cat.textContent = product.category;
      const price = document.createElement('span');
      price.textContent = typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : '-';
      const stock = document.createElement('span');
      stock.className = product.stock > 0 ? 'in-stock' : 'out-of-stock';
      stock.textContent = `${product.stock} in stock`;
      meta.append(sku, cat, price, stock);

      item.append(name, meta);
      // mousedown fires before the input blurs, so the selection is not lost.
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectProduct(product);
      });
      menu.appendChild(item);
    });
    positionMenu();
    menu.hidden = false;
  };

  const search = async (query, categories) => {
    const seq = ++requestSeq;
    renderMessage('Searching Odoo...');
    try {
      const params = new URLSearchParams({ q: query });
      categories.forEach((c) => params.append('category', c));
      const res = await fetch(`/api/odoo/products?${params}`);
      const data = await res.json();
      if (seq !== requestSeq) return; // a newer search superseded this one
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      renderResults(data.products);
    } catch (error) {
      if (seq !== requestSeq) return;
      console.error('Odoo lookup failed:', error);
      renderMessage('Could not reach Odoo. Is the Odoo API running?');
    }
  };

  toggle.addEventListener('click', () => setEnabled(!enabled));

  container.addEventListener('input', (event) => {
    if (!enabled || !rowKeyOf(event.target)) return;
    activeInput = event.target;
    clearTimeout(debounceTimer);
    const query = activeInput.value.trim();
    if (query.length < 2) return closeMenu();
    const categories = categoriesFor(activeInput);
    debounceTimer = setTimeout(() => search(query, categories), 250);
  });

  container.addEventListener('focusout', (event) => {
    if (rowKeyOf(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', positionMenu);
  // The edit modal scrolls inside itself, so the dropdown would drift away
  // from its input. Scrolling the dropdown's own list must not close it.
  window.addEventListener('scroll', (event) => {
    if (!menu.hidden && !menu.contains(event.target)) closeMenu();
  }, true);

  try { setEnabled(localStorage.getItem('odooLookup') === 'on'); } catch (e) { setEnabled(false); }
}
