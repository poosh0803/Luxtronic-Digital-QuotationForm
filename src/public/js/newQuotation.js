function getTableData() {
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tbody tr');
  const formData = new FormData();
  
  // Add basic form fields
  formData.append('customer_name', document.getElementById('customer-name')?.value || '');
  formData.append('final_price', document.getElementById('final-price')?.value || '');
  formData.append('platform', document.getElementById('slider').style.left === '0px' ? 'AMD' : 'INTEL');
  formData.append('created_at', new Date().toISOString());

  // Initialize all component fields as empty strings
  const components = [
    'cpu', 'cpu_cooling', 'motherboard', 'ram', 'storage1', 'storage2',
    'gpu', 'case', 'psu', 'sys_fan', 'os', 'monitor', 'others', 'assembly'
  ];
  
  components.forEach(component => {
    formData.append(`${component}_details`, '');
    formData.append(`${component}_price`, '');
    formData.append(`${component}_unit`, '');
    formData.append(`${component}_upgrade_note`, '');
  });

  // Extract data from table rows
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    const part = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '_');

    // Map the table row text to our component names
    const partMapping = {
      'cpu': 'cpu',
      'cpu_cooling': 'cpu_cooling', 
      'motherboard': 'motherboard',
      'ram': 'ram',
      'storage_1': 'storage1',
      'storage_2': 'storage2', 
      'gpu': 'gpu',
      'case': 'case',
      'psu': 'psu',
      'system_fan': 'sys_fan',
      'os': 'os',
      'monitor': 'monitor',
      'others': 'others',
      'assembly': 'assembly'
    };
    
    const mappedComponent = partMapping[part];
    
    if (mappedComponent) {
      const details = cells[1].querySelector('input')?.value || '';
      const price = cells[2].querySelector('input')?.value || '';
      const unit = cells[3].querySelector('select')?.value || '';
      const upgradeNote = cells[4].querySelector('input')?.value || '';

      formData.set(`${mappedComponent}_details`, details);
      formData.set(`${mappedComponent}_price`, price);
      formData.set(`${mappedComponent}_unit`, unit);
      formData.set(`${mappedComponent}_upgrade_note`, upgradeNote);
    } else {
      console.warn(`No mapping found for part: "${part}"`);
    }
  });

  return formData;
}
function updateCalculatedPrice() {
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tbody tr');
  let calculatedPrice = 0;

  rows.forEach(row => {
    const priceInput = row.querySelector('input[type="number"]');
    const unitSelect = row.querySelector('select');

    if (priceInput && unitSelect) {
      const price = parseFloat(priceInput.value) || 0;
      const unit = parseInt(unitSelect.value) || 0;
      calculatedPrice += price * unit;
    }
  });

  document.getElementById('calculated-price').value = calculatedPrice.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('table');
  table.addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
      updateCalculatedPrice();
    }
  });
  const submitButton = document.querySelector('.submit-btn');
  if (!submitButton) {
    console.error('Submit button not found in the DOM');
    return;
  }

  submitButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent form submission

    // Show confirmation dialog
    const userConfirmed = confirm('Are you sure you want to submit the quotation?');
    if (!userConfirmed) {
      return; // Exit if user cancels
    }

    try {
      const tableData = getTableData();

      const response = await fetch('/api/quotation', {
        method: 'POST',
        body: tableData, // FormData object is sent directly
      });

      const result = await response.json();
      if (response.ok) {
        alert('Quotation form submitted successfully!');

        // Reset the form after successful submission
        // resetForm();
      } else {
        throw new Error(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  });
});

// Odoo product lookup: when toggled on, typing in a Details cell suggests
// products from Odoo (via /api/odoo/products) and fills in details + price.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('odoo-toggle');
  const stateLabel = document.getElementById('odoo-toggle-state');
  const table = document.querySelector('table');
  if (!toggle || !table) return;

  const menu = document.createElement('div');
  menu.className = 'odoo-menu';
  menu.hidden = true;
  document.body.appendChild(menu);

  let enabled = false;
  let activeInput = null;
  let debounceTimer = null;
  let requestSeq = 0;
  let selecting = false;

  // Each part row only searches the Odoo categories that make sense for it
  // (a category includes its sub-categories; "=Name" matches that exact
  // category only). Keyed by the row's input name prefix. OS, Others and
  // Assembly are not listed, so they search every product.
  // Deliberately left out: CASE / LCD, PSU / Cable, SSD / Heatsink,
  // FAN / HUB, Display / Stand, Cooler / ThermalPaste.
  const ROW_CATEGORIES = {
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

  const categoriesFor = (input) => ROW_CATEGORIES[input.name.replace(/-details$/, '')] || [];

  const isDetailsInput = (el) =>
    el && el.tagName === 'INPUT' && /-details$/.test(el.name || '');

  const closeMenu = () => {
    menu.hidden = true;
    menu.innerHTML = '';
  };

  const setEnabled = (on) => {
    enabled = on;
    toggle.classList.toggle('active', on);
    toggle.setAttribute('aria-pressed', String(on));
    stateLabel.textContent = on ? 'On' : 'Off';
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
    const row = activeInput.closest('tr');
    activeInput.value = product.name;
    const priceInput = row.querySelector('input[type="number"]');
    if (priceInput && typeof product.price === 'number') {
      priceInput.value = product.price.toFixed(2);
    }
    closeMenu();
    // Bubble an input event so the calculated price updates; skip our own
    // listener so the filled-in name does not trigger another search.
    selecting = true;
    activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    selecting = false;
  };

  const renderResults = (products) => {
    if (!products.length) return renderMessage(activeInput && categoriesFor(activeInput).length ? 'No matching products in the right Odoo category for this row' : 'No matching products in Odoo');
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
      const price = document.createElement('span');
      price.textContent = typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : '-';
      const stock = document.createElement('span');
      stock.className = product.stock > 0 ? 'in-stock' : 'out-of-stock';
      stock.textContent = `${product.stock} in stock`;
      const cat = document.createElement('span');
      cat.textContent = product.category;
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

  table.addEventListener('input', (event) => {
    if (!enabled || selecting || !isDetailsInput(event.target)) return;
    activeInput = event.target;
    clearTimeout(debounceTimer);
    const query = activeInput.value.trim();
    if (query.length < 2) return closeMenu();
    const categories = categoriesFor(activeInput);
    debounceTimer = setTimeout(() => search(query, categories), 250);
  });

  table.addEventListener('focusout', (event) => {
    if (isDetailsInput(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', positionMenu);

  try { setEnabled(localStorage.getItem('odooLookup') === 'on'); } catch (e) { setEnabled(false); }
});