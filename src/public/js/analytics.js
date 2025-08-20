// Analytics Page JavaScript

// Global variables
let currentSearchTerm = '';
let currentPricingData = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init();

  // Initialize date/time display
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // Initialize dark mode
  initializeDarkMode();

  // Initialize search functionality
  initializeSearch();

  // Pre-populate with RTX 5080 as example
  document.getElementById('searchInput').value = 'RTX 5080';
});

// Current date/time display
function updateDateTime() {
  const now = new Date();
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
}

// Dark mode functionality
function initializeDarkMode() {
  const themeIcon = document.getElementById('theme-icon');
  const body = document.body;

  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.className = savedTheme;
  themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

  themeIcon.addEventListener('click', () => {
    const currentTheme = body.className;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.className = newTheme;
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    localStorage.setItem('theme', newTheme);
  });
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const retryBtn = document.getElementById('retryBtn');

  // Search button click
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      searchStaticICE(query);
    }
  });

  // Enter key press
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        searchStaticICE(query);
      }
    }
  });

  // Retry button
  retryBtn.addEventListener('click', () => {
    if (currentSearchTerm) {
      searchStaticICE(currentSearchTerm);
    }
  });

  // Export CSV button (header)
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportToCsv);
  }

  // Refresh button (header)
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshSearch);
  }

  // Store filter dropdown functionality
  setupStoreFilter();
}

// Store filter functionality
function setupStoreFilter() {
  const filterBtn = document.getElementById('storeFilterBtn');
  const filterMenu = document.getElementById('storeFilterMenu');
  const selectAllBtn = document.getElementById('selectAllStores');
  const clearAllBtn = document.getElementById('clearAllStores');

  if (!filterBtn || !filterMenu) return;

  // Toggle dropdown
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    filterMenu.classList.toggle('show');
    filterBtn.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!filterBtn.contains(e.target) && !filterMenu.contains(e.target)) {
      filterMenu.classList.remove('show');
      filterBtn.classList.remove('active');
    }
  });

  // Select all stores
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = true);
      applyStoreFilter();
    });
  }

  // Clear all stores
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = false);
      applyStoreFilter();
    });
  }

  // Default stores selection
  const defaultBtn = document.getElementById('defaultStores');
  if (defaultBtn) {
    defaultBtn.addEventListener('click', () => {
      const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
      const defaultStores = ['Mwave Australia', 'Scorptec', 'UMart'];
      
      checkboxes.forEach(cb => {
        cb.checked = defaultStores.includes(cb.value);
      });
      
      applyStoreFilter();
    });
  }

  // Apply filter when checkboxes change
  const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyStoreFilter);
  });
}

// Apply store filter to current results
function applyStoreFilter() {
  // Use currentPricingData as the source of truth for all data
  const allData = currentPricingData || window.currentPricingData;
  if (!allData) return;

  const filterMenu = document.getElementById('storeFilterMenu');
  if (!filterMenu) {
    // If filter menu doesn't exist yet, show all data
    displayFilteredResults(allData);
    return;
  }

  const checkedStores = Array.from(filterMenu.querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.value);

  // If no stores selected, show all
  if (checkedStores.length === 0) {
    displayFilteredResults(allData);
    return;
  }

  // Filter data based on selected stores
  const filteredData = allData.filter(item => {
    if (checkedStores.includes('Others')) {
      // Include items from stores not in our main list
      const mainStores = ['Mwave Australia', 'Scorptec', 'UMart', 'PC Case Gear', 'PLE Computers', 
                         'CCPU Computers', 'Computer Alliance', 'JW Computers', 'SkyComp Technology', 'I-Tech'];
      return checkedStores.some(store => 
        store === 'Others' ? !mainStores.includes(item.store) : item.store.includes(store)
      );
    }
    return checkedStores.some(store => item.store.includes(store));
  });

  displayFilteredResults(filteredData);
}

// Display filtered results
function displayFilteredResults(data) {
  const staticiceContent = document.getElementById('staticiceContent');
  if (!staticiceContent) return;

  staticiceContent.innerHTML = `
    <div class="pricing-summary">
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Products Found:</span>
          <span class="stat-value">${data.length}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Price Range:</span>
          <span class="stat-value">${getPriceRange(data)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Avg Price:</span>
          <span class="stat-value">${getAveragePrice(data)}</span>
        </div>
      </div>
    </div>
    <div class="content-body">
      ${data.length > 0 ? generatePricingTable(data) : '<div class="no-results">No products match the selected store filters.</div>'}
    </div>
  `;

  // Store filtered data for export (but keep original data intact)
  window.currentFilteredData = data;
}

// UI state management
function showLoading() {
  document.getElementById('loadingSection').style.display = 'block';
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('errorSection').style.display = 'none';
}

function showResults() {
  document.getElementById('loadingSection').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('errorSection').style.display = 'none';
}

function showError(message) {
  document.getElementById('loadingSection').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('errorSection').style.display = 'block';
  document.getElementById('errorMessage').textContent = message;
}

// Fetch multiple pages from StaticICE
async function fetchMultiplePages(query, maxPages = 2) {
  const allResults = [];
  const baseUrl = 'https://www.staticice.com.au/cgi-bin/search.cgi';
  
  console.log(`Starting multi-page fetch for query: "${query}", maxPages: ${maxPages}`);
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      // Update loading message with progress
      updateLoadingMessage(`Fetching page ${page} of ${maxPages} from StaticICE...`);
      
      const start = (page - 1) * 20 + 1; // Page 1: start=1, Page 2: start=21, etc.
      const pageUrl = `${baseUrl}?q=${encodeURIComponent(query)}&start=${start}&links=20&showadres=1&pos=1`;
      
      console.log(`Fetching page ${page}: ${pageUrl}`);
      
      // Use our server-side proxy to fetch this page
      const proxyUrl = `/api/staticice-proxy-multipage?url=${encodeURIComponent(pageUrl)}`;
      console.log(`Proxy URL: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        console.warn(`Failed to fetch page ${page}: HTTP ${response.status}`);
        const errorText = await response.text();
        console.warn(`Error response:`, errorText);
        continue;
      }
      
      const data = await response.json();
      console.log(`Page ${page} response:`, { success: data.success, hasContent: !!data.content });
      
      if (data.success && data.content) {
        const pageResults = parseStaticICEData(data.content);
        console.log(`Page ${page} returned ${pageResults.length} results`);
        
        if (pageResults.length === 0) {
          console.log(`No more results found on page ${page}, stopping fetch`);
          break; // No more results, stop fetching
        }
        
        allResults.push(...pageResults);
        
        // Update loading message with current results count
        updateLoadingMessage(`Found ${allResults.length} products so far... (Page ${page} of ${maxPages})`);
      } else {
        console.warn(`Page ${page} fetch failed:`, data.error || 'Unknown error');
      }
      
      // Add a small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
    }
  }
  
  updateLoadingMessage(`Processing ${allResults.length} products...`);
  console.log(`Total results fetched: ${allResults.length}`);
  return allResults;
}

// Update loading message
function updateLoadingMessage(message) {
  const loadingMessage = document.getElementById('loadingMessage');
  if (loadingMessage) {
    loadingMessage.textContent = message;
  }
}

// Display results from multiple pages
function displayMultiPageResults(allData, query) {
  // Store the combined data globally
  currentPricingData = allData;
  window.currentPricingData = allData;
  
  // Update StaticICE link with the first page URL
  const firstPageUrl = `https://www.staticice.com.au/cgi-bin/search.cgi?q=${encodeURIComponent(query)}&start=1&links=20&showadres=1&pos=1`;
  const staticiceLink = document.querySelector('.staticice-link');
  if (staticiceLink) {
    staticiceLink.href = firstPageUrl;
  }
  
  // Apply current store filter
  applyStoreFilter();
}

// Main search function
async function searchStaticICE(query) {
  currentSearchTerm = query;
  
  showLoading();
  document.getElementById('searchQuery').textContent = `Results for: "${query}"`;

  // Get the number of pages to fetch from dropdown
  const pagesToFetch = parseInt(document.getElementById('pagesToFetch').value) || 2;
  console.log(`User selected to fetch ${pagesToFetch} pages`);

  try {
    // Try to fetch multiple pages to get the requested number of listings
    updateLoadingMessage(`Attempting to fetch ${pagesToFetch} pages from StaticICE...`);
    const allData = await fetchMultiplePages(query, pagesToFetch);
    
    if (allData.length > 0) {
      // Combine all data and display
      displayMultiPageResults(allData, query);
      showResults();
      return;
    }
    
    // If multi-page fails, fallback to single page
    console.log('Multi-page fetch failed, trying single page fallback...');
    updateLoadingMessage('Trying single page fallback...');
    
    const response = await fetch(`/api/staticice-proxy?q=${encodeURIComponent(query)}&spos=3`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Parse and display the pricing data as a table
      displayPricingTable(data.content, data.url, query);
      showResults();
      return;
    } else {
      throw new Error(data.error || 'Failed to fetch data');
    }
    
  } catch (error) {
    console.error('Error fetching StaticICE data:', error);
    
    // Fallback: Show direct link and iframe attempt
    const directUrl = `https://www.staticice.com.au/cgi-bin/search.cgi?q=${encodeURIComponent(query)}&spos=3`;
    document.getElementById('staticiceContent').innerHTML = `
      <div class="fallback-content">
        <h3>Direct StaticICE Link</h3>
        <p>Unable to fetch content through proxy. You can:</p>
        <div class="link-options">
          <a href="${directUrl}" target="_blank" class="staticice-link">
            <i class="fas fa-external-link-alt"></i>
            Open StaticICE Search in New Tab
          </a>
          <button onclick="tryIframeEmbed('${directUrl}')" class="embed-btn">
            <i class="fas fa-window-restore"></i>
            Try Embed View
          </button>
        </div>
        <div class="search-info">
          <strong>Search URL:</strong><br>
          <code>${directUrl}</code>
        </div>
        <div class="error-details">
          <strong>Error:</strong> ${error.message}
        </div>
      </div>
    `;
    showResults();
  }
}

// Display pricing table
function displayPricingTable(htmlContent, originalUrl, searchQuery) {
  const pricingData = parseStaticICEData(htmlContent);
  currentPricingData = pricingData; // Store globally for export
  window.currentPricingData = pricingData; // Also store on window for access
  
  // Update StaticICE link with the actual search URL
  const staticiceLink = document.querySelector('.staticice-link');
  if (staticiceLink && originalUrl) {
    staticiceLink.href = originalUrl;
  }
  
  // Apply current store filter
  applyStoreFilter();
}

// Parse StaticICE HTML data
function parseStaticICEData(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pricingData = [];

  // Find all table rows with 2 cells (price and description)
  const rows = doc.querySelectorAll('tr[valign="top"]');

  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length !== 2) return;

    try {
      // Extract price from first cell
      const priceCell = cells[0];
      const priceLink = priceCell.querySelector('a');
      if (!priceLink) return;
      
      const priceText = priceLink.textContent.trim();
      const priceMatch = priceText.match(/\$[\d,]+\.?\d*/);
      if (!priceMatch) return;
      
      const price = priceMatch[0];
      const rawPrice = parseFloat(price.replace(/[$,]/g, ''));
      
      // Get the product URL from price link
      const productUrl = priceLink.getAttribute('href');
      const fullProductUrl = productUrl ? 'https://www.staticice.com.au' + productUrl : null;

      // Extract product and store info from second cell
      const descCell = cells[1];
      const descText = descCell.textContent.trim();
      
      // Split description by newlines and clean up
      const lines = descText.split('\n').filter(line => line.trim());
      
      // Product name is usually the first line
      const productName = lines[0] ? lines[0].trim() : 'Unknown Product';
      
      // Extract store name from the store link
      const storeLink = descCell.querySelector('a[title*="Click to visit"]');
      let storeName = 'Unknown Store';
      let storeLocation = '';
      
      if (storeLink) {
        const storeLinkText = storeLink.textContent.trim();
        const storeMatch = storeLinkText.match(/([^\(]+)/);
        if (storeMatch) {
          storeName = storeMatch[1].trim();
        }
        
        // Extract location from parentheses
        const locationMatch = storeLinkText.match(/\(([^\)]+)\)/);
        if (locationMatch) {
          storeLocation = locationMatch[1].trim();
        }
      }

      // Extract availability info
      let availability = 'Unknown';
      const availText = descText.toLowerCase();
      if (availText.includes('in stock')) {
        availability = 'In Stock';
      } else if (availText.includes('out of stock')) {
        availability = 'Out of Stock';
      } else if (availText.includes('backorder')) {
        availability = 'Backorder';
      } else if (availText.includes('pre-order')) {
        availability = 'Pre-order';
      } else if (availText.includes('updated:')) {
        // If we find an update date, assume it's available
        availability = 'Available';
      }

      // Extract update date
      const updateMatch = descText.match(/updated:\s*(\d{2}-\d{2}-\d{4})/);
      const updateDate = updateMatch ? updateMatch[1] : null;

      if (productName && price && storeName) {
        pricingData.push({
          productName: cleanProductName(productName),
          price: price,
          rawPrice: rawPrice,
          store: storeName,
          storeLocation: storeLocation,
          availability: availability,
          updateDate: updateDate,
          url: fullProductUrl,
          description: descText // Keep full description for debugging
        });
      }
    } catch (error) {
      console.warn('Error parsing row:', error, row);
    }
  });

  // Sort by price (lowest first)
  return pricingData.sort((a, b) => a.rawPrice - b.rawPrice);
}

// Clean product names
function cleanProductName(name) {
  // Remove common prefixes and clean up product names
  let cleaned = name
    .replace(/^\[.*?\]\s*/, '') // Remove [product codes]
    .replace(/^PCI-E\s+/i, '') // Remove PCI-E prefix
    .replace(/^Nvidia\s+/i, '') // Remove Nvidia prefix
    .replace(/\s+pick up only[^,]*$/i, '') // Remove pickup only suffixes
    .replace(/,\s*\*[^,]*$/, '') // Remove bonus offer suffixes
    .replace(/\s*\[Avail:.*?\]$/, '') // Remove availability brackets
    .trim();
  
  // Limit length for display
  if (cleaned.length > 80) {
    cleaned = cleaned.substring(0, 77) + '...';
  }
  
  return cleaned;
}

// Generate pricing table HTML
function generatePricingTable(data) {
  if (data.length === 0) {
    return '<div class="no-results">No pricing data found.</div>';
  }

  let tableHTML = `
    <div class="pricing-table-container">
      <table class="pricing-table">
        <thead>
          <tr>
            <th class="rank-column">#</th>
            <th class="product-column">Product</th>
            <th class="price-column">Price</th>
            <th class="store-column">Store</th>
            <th class="availability-column">Status</th>
            <th class="action-column">View</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach((item, index) => {
    const rankClass = index < 3 ? `rank-${index + 1}` : '';
    tableHTML += `
      <tr class="pricing-row ${rankClass}">
        <td class="rank-cell">
          ${index < 3 ? `<span class="rank-badge">${index + 1}</span>` : index + 1}
        </td>
        <td class="product-cell">
          <div class="product-name" title="${item.productName}">${item.productName}</div>
        </td>
        <td class="price-cell">
          <span class="price-value">${item.price || 'N/A'}</span>
        </td>
        <td class="store-cell">${item.store}</td>
        <td class="availability-cell">
          <span class="availability-status ${getAvailabilityClass(item.availability)}">${item.availability}</span>
          ${item.updateDate ? `<div class="update-date">Updated: ${item.updateDate}</div>` : ''}
        </td>
        <td class="action-cell">
          ${item.url ? `<a href="${item.url}" target="_blank" class="view-btn" title="View on ${item.store}"><i class="fas fa-external-link-alt"></i></a>` : ''}
        </td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  return tableHTML;
}

// Get availability CSS class
function getAvailabilityClass(availability) {
  const status = availability.toLowerCase();
  if (status.includes('in stock')) return 'in-stock';
  if (status.includes('out of stock')) return 'out-of-stock';
  if (status.includes('backorder')) return 'backorder';
  if (status.includes('pre-order')) return 'pre-order';
  return 'unknown';
}

// Generate no results message
function generateNoResultsMessage(searchQuery) {
  return `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <h3>No Results Found</h3>
      <p>No pricing data found for "${searchQuery}". This could be because:</p>
      <ul>
        <li>The product is not available on StaticICE</li>
        <li>The search term needs to be more specific</li>
        <li>The website structure has changed</li>
      </ul>
      <p>Try searching with different keywords or check the direct link.</p>
    </div>
  `;
}

// Get price range
function getPriceRange(data) {
  if (data.length === 0) return 'N/A';
  const prices = data.filter(item => item.rawPrice < 999999).map(item => item.rawPrice);
  if (prices.length === 0) return 'N/A';
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
}

// Get average price
function getAveragePrice(data) {
  if (data.length === 0) return 'N/A';
  const prices = data.filter(item => item.rawPrice < 999999).map(item => item.rawPrice);
  if (prices.length === 0) return 'N/A';
  
  const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  return `$${avg.toFixed(2)}`;
}

// Export to CSV
function exportToCsv() {
  const data = getCurrentPricingData();
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const csvContent = [
    ['Rank', 'Product Name', 'Price', 'Store', 'Availability', 'Updated'],
    ...data.map((item, index) => [
      index + 1,
      item.productName,
      item.price || 'N/A',
      item.store,
      item.availability,
      item.updateDate || '-'
    ])
  ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `staticice-prices-${currentSearchTerm.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Get current pricing data
function getCurrentPricingData() {
  // Return filtered data if available, otherwise return all data
  return window.currentFilteredData || window.currentPricingData || [];
}

// Try iframe embed
function tryIframeEmbed(url) {
  document.getElementById('staticiceContent').innerHTML = `
    <div class="iframe-container">
      <div class="iframe-warning">
        <i class="fas fa-info-circle"></i>
        Note: Some sites may block embedding. If the content doesn't load, use the direct link above.
      </div>
      <iframe src="${url}" class="staticice-iframe" title="StaticICE Search Results"></iframe>
    </div>
  `;
}

// Refresh search
function refreshSearch() {
  if (currentSearchTerm) {
    searchStaticICE(currentSearchTerm);
  }
}