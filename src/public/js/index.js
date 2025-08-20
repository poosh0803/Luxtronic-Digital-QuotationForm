// Dark mode functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initializeDarkMode();
    
    // Update current date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load quotation history and setup selector
    loadQuotationHistory();
    
    // Setup quotation selector event listener
    setupQuotationSelector();
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
                <button type="button" class="print-btn no-print" onclick="printQuotation()">
                    <i class="fas fa-print"></i>
                    Print Quotation
                </button>
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

async function loadQuotationHistory() {
    const selector = document.getElementById('quotation-select');
    const container = document.getElementById('latest-quotation');
    
    try {
        // Show loading state
        container.innerHTML = '<div class="loading">Loading quotations...</div>';
        
        const response = await fetch('/api/quotations');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const quotations = await response.json();
        
        if (quotations.length === 0) {
            container.innerHTML = `
                <div class="no-quotation">
                    <i class="fas fa-inbox" style="font-size: 3em; margin-bottom: 15px; color: #ccc;"></i>
                    <p>No quotations found. <a href="/newQuotation">Create your first quotation</a></p>
                </div>
            `;
            return;
        }
        
        // Clear existing options except "Latest Quotation"
        selector.innerHTML = '<option value="latest">Latest Quotation</option>';
        
        // Add quotations to dropdown
        quotations.forEach((quotation, index) => {
            const date = new Date(quotation.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            const option = document.createElement('option');
            option.value = quotation.id;
            option.textContent = `${quotation.customer_name} - ${date} ($${parseFloat(quotation.final_price).toLocaleString()})`;
            
            selector.appendChild(option);
        });
        
        // Display the latest quotation by default
        displayQuotation(quotations[0]);
        
    } catch (error) {
        console.error('Error loading quotation history:', error);
        container.innerHTML = `
            <div class="no-quotation">
                <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 15px; color: #dc3545;"></i>
                <p>Error loading quotations. Please try again later.</p>
            </div>
        `;
    }
}

function setupQuotationSelector() {
    const selector = document.getElementById('quotation-select');
    
    selector.addEventListener('change', async function() {
        const selectedValue = this.value;
        const container = document.getElementById('latest-quotation');
        
        if (selectedValue === 'latest') {
            await loadLatestQuotation();
        } else {
            await loadQuotationById(selectedValue);
        }
    });
}

async function loadQuotationById(id) {
    const container = document.getElementById('latest-quotation');
    
    try {
        container.innerHTML = '<div class="loading">Loading quotation...</div>';
        
        const response = await fetch(`/api/quotation/${id}`);
        
        if (response.status === 404) {
            container.innerHTML = `
                <div class="no-quotation">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 15px; color: #dc3545;"></i>
                    <p>Quotation not found.</p>
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
        console.error('Error loading quotation:', error);
        container.innerHTML = `
            <div class="no-quotation">
                <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 15px; color: #dc3545;"></i>
                <p>Error loading quotation. Please try again later.</p>
            </div>
        `;
    }
}

// Print functionality
function printQuotation() {
    const quotationSelector = document.querySelector('.quotation-header-controls');
    // Hide quotation selector during print
    if (quotationSelector) {
        quotationSelector.classList.add('no-print');
    }
    
    // Add print header
    const printHeader = document.createElement('div');
    printHeader.className = 'print-only';
    printHeader.innerHTML = `
        <div class="form-header">
            <h1 style="color: #d4a44c;">LUXTRONIC - Digital Quotation Form</h1>
        </div>
    `;
    
    // Insert the print header at the beginning of main content
    const main = document.querySelector('main');
    main.insertBefore(printHeader, main.firstChild);
    
    // Add a page break class to ensure proper printing
    const quotationCard = document.querySelector('.quotation-card');
    if (quotationCard) {
        quotationCard.style.pageBreakInside = 'avoid';
    }
    
    // Add notes section at the bottom
    const notesSection = document.createElement('div');
    notesSection.className = 'print-only notes-section';
    notesSection.innerHTML = `
        <div style="margin-top: 15px; padding: 8px; border: 2px solid #d4a44c; border-radius: 6px; background-color: #fefefe;">
            <div style="font-weight: bold; color: #d4a44c; margin-bottom: 5px; font-size: 10px;">
                <i class="fas fa-sticky-note" style="margin-right: 4px;"></i>Notes:
            </div>
            <div style="min-height: 100px; border: 1px dashed #ccc; padding: 6px; background-color: #fcfcfc; border-radius: 3px;">
                <div style="color: #999; font-size: 8px; font-style: italic;"></div>
            </div>
        </div>
    `;
    
    // Insert notes section after the quotation content
    const mainElement = document.querySelector('main');
    mainElement.appendChild(notesSection);
    
    // Trigger print dialog
    window.print();
    
    // Remove the print header, notes section and restore quotation selector after printing
    setTimeout(() => {
        if (printHeader.parentNode) {
            printHeader.parentNode.removeChild(printHeader);
        }
        if (notesSection.parentNode) {
            notesSection.parentNode.removeChild(notesSection);
        }
        if (quotationSelector) {
            quotationSelector.classList.remove('no-print');
        }
        if (quotationCard) {
            quotationCard.style.pageBreakInside = '';
        }
    }, 1000);
}
