// Dark mode functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initializeDarkMode();
    
    // Update current date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load latest quotation
    loadLatestQuotation();
});

function initializeDarkMode() {
    const themeIcon = document.getElementById('theme-icon');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    
    themeIcon.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isNowDark = document.body.classList.contains('dark-mode');
        
        localStorage.setItem('darkMode', isNowDark);
        
        if (isNowDark) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

async function loadLatestQuotation() {
    const container = document.getElementById('latest-quotation');
    
    try {
        const response = await fetch('/api/quotation/latest');
        
        if (response.status === 404) {
            container.innerHTML = `
                <div class="no-quotation">
                    <i class="fas fa-inbox" style="font-size: 3em; margin-bottom: 15px; color: #ccc;"></i>
                    <p>No quotations found. <a href="/newQuotation">Create your first quotation</a></p>
                </div>
            `;
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const quotation = await response.json();
        displayQuotation(quotation);
        
    } catch (error) {
        console.error('Error loading latest quotation:', error);
        container.innerHTML = `
            <div class="no-quotation">
                <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 15px; color: #dc3545;"></i>
                <p>Error loading quotation. Please try again later.</p>
            </div>
        `;
    }
}

function displayQuotation(quotation) {
    const container = document.getElementById('latest-quotation');
    const createdDate = new Date(quotation.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Define all component types with their display names
    const components = [
        { key: 'cpu', name: 'CPU/Processor', icon: 'fas fa-microchip' },
        { key: 'cpu_cooling', name: 'CPU Cooling', icon: 'fas fa-fan' },
        { key: 'motherboard', name: 'Motherboard', icon: 'fas fa-memory' },
        { key: 'ram', name: 'RAM/Memory', icon: 'fas fa-memory' },
        { key: 'storage1', name: 'Primary Storage', icon: 'fas fa-hdd' },
        { key: 'storage2', name: 'Secondary Storage', icon: 'fas fa-hdd' },
        { key: 'gpu', name: 'Graphics Card', icon: 'fas fa-display' },
        { key: 'case', name: 'PC Case', icon: 'fas fa-cube' },
        { key: 'psu', name: 'Power Supply', icon: 'fas fa-bolt' },
        { key: 'sys_fan', name: 'System Fans', icon: 'fas fa-fan' },
        { key: 'os', name: 'Operating System', icon: 'fas fa-desktop' },
        { key: 'monitor', name: 'Monitor', icon: 'fas fa-desktop' },
        { key: 'others', name: 'Other Components', icon: 'fas fa-plus' }
    ];
    
    // Build components HTML
    let componentsHtml = '';
    components.forEach(component => {
        const details = quotation[`${component.key}_details`];
        const unit = quotation[`${component.key}_unit`];
        const note = quotation[`${component.key}_upgrade_note`];
        
        // Show all components, even if they don't have details
        const hasDetails = details && details.trim();
        const displayDetails = hasDetails ? details : 'No details specified';
        const itemClass = hasDetails ? 'component-item' : 'component-item component-empty';
        
        componentsHtml += `
            <div class="${itemClass}">
                <div class="component-title">
                    <i class="${component.icon}"></i> ${component.name}
                </div>
                <div class="component-details ${!hasDetails ? 'empty-details' : ''}">${displayDetails}</div>
                <div class="component-unit">Quantity: ${unit || 0}</div>
                ${note && note.trim() ? `<div class="component-note">Note: ${note}</div>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = `
        <div class="quotation-header">
            <div class="customer-info">
                <h3>${quotation.customer_name}</h3>
                <div class="quotation-date">
                    <i class="fas fa-calendar"></i> ${createdDate}
                </div>
                <div style="margin-top: 8px;">
                    <span class="platform-badge ${quotation.platform.toLowerCase()}">${quotation.platform}</span>
                </div>
            </div>
            <div class="price-info">
                <div class="final-price">$${parseFloat(quotation.final_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>
        </div>
        
        <div class="components-section">
            <h4 style="margin-bottom: 15px; color: #333;">
                <i class="fas fa-cogs"></i> Components & Specifications
            </h4>
            <div class="components-grid">
                ${componentsHtml}
            </div>
        </div>
    `;
}
