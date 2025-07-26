document.addEventListener('DOMContentLoaded', async () => {
  console.log('=== Records.js loaded ===');
  console.log('DOM Content Loaded');
  console.log('Current URL:', window.location.href);
  
  const recordsTableBody = document.getElementById('records-table-body');
  console.log('Table body element found:', !!recordsTableBody);

  try {
    console.log('=== Starting fetch request ===');
    console.log('Fetching records from /api/quotations');
    console.log('Fetch URL:', window.location.origin + '/api/quotations');
    
    const response = await fetch('/api/quotations');
    console.log('=== Fetch response received ===');
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response not ok. Error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
    }
    
    const records = await response.json();
    console.log('=== Records parsed ===');
    console.log('Records type:', typeof records);
    console.log('Records length:', records.length);
    console.log('Records data:', records);

    if (records.length === 0) {
      console.log('No records found in database');
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" style="text-align: center;">No records found</td>';
      recordsTableBody.appendChild(row);
      return;
    }

    console.log('=== Processing records ===');
    records.forEach((record, index) => {
      console.log(`Processing record ${index + 1}:`, record);
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${record.id}</td>
        <td>${record.platform}</td>
        <td>${record.customer_name}</td>
        <td>${new Date(record.created_at).toLocaleDateString()}</td>
        <td>$${record.final_price}</td>
        <td>
          <button class="btn-view" onclick="viewRecord(${record.id})" title="View Record">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-edit" onclick="editRecord(${record.id})" title="Edit Record">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      `;

      recordsTableBody.appendChild(row);
      console.log(`Row ${index + 1} added to table`);
    });
    
    console.log('=== All records processed successfully ===');
  } catch (error) {
    console.error('=== ERROR OCCURRED ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" style="text-align: center;">Error loading records: ' + error.message + '</td>';
    recordsTableBody.appendChild(row);
  }
});

// Function to view a record
async function viewRecord(recordId) {
  console.log('Viewing record with ID:', recordId);
  
  // Show modal with loading state
  document.getElementById('viewModal').style.display = 'block';
  document.getElementById('modal-id').textContent = 'Loading...';
  document.getElementById('modal-platform').textContent = 'Loading...';
  document.getElementById('modal-customer').textContent = 'Loading...';
  document.getElementById('modal-date').textContent = 'Loading...';
  document.getElementById('modal-price').textContent = 'Loading...';
  document.getElementById('modal-components-table').innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading component details...</td></tr>';
  
  try {
    // Fetch detailed record data from API
    console.log('Fetching record details from /api/quotation/' + recordId);
    const response = await fetch(`/api/quotation/${recordId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch record details:', errorText);
      throw new Error(`Failed to fetch record: ${response.status}`);
    }
    
    const record = await response.json();
    console.log('Record details fetched:', record);
    
    // Populate modal with detailed record data
    document.getElementById('modal-id').textContent = record.id;
    document.getElementById('modal-platform').textContent = record.platform || 'N/A';
    document.getElementById('modal-customer').textContent = record.customer_name || 'N/A';
    document.getElementById('modal-date').textContent = new Date(record.created_at).toLocaleDateString();
    document.getElementById('modal-price').textContent = `$${record.final_price || '0.00'} AUD`;
    
    // Populate components table (show ALL components like in new quotation form)
    const componentsTable = document.getElementById('modal-components-table');
    componentsTable.innerHTML = ''; // Clear existing content
    
    // Define ALL component mappings (same order as new quotation form)
    const components = [
      { name: 'CPU', details: record.cpu_details, unit: record.cpu_unit, note: record.cpu_upgrade_note },
      { name: 'CPU Cooling', details: record.cpu_cooling_details, unit: record.cpu_cooling_unit, note: record.cpu_cooling_upgrade_note },
      { name: 'Motherboard', details: record.motherboard_details, unit: record.motherboard_unit, note: record.motherboard_upgrade_note },
      { name: 'RAM', details: record.ram_details, unit: record.ram_unit, note: record.ram_upgrade_note },
      { name: 'Storage 1', details: record.storage1_details, unit: record.storage1_unit, note: record.storage1_upgrade_note },
      { name: 'Storage 2', details: record.storage2_details, unit: record.storage2_unit, note: record.storage2_upgrade_note },
      { name: 'GPU', details: record.gpu_details, unit: record.gpu_unit, note: record.gpu_upgrade_note },
      { name: 'Case', details: record.case_details, unit: record.case_unit, note: record.case_upgrade_note },
      { name: 'PSU', details: record.psu_details, unit: record.psu_unit, note: record.psu_upgrade_note },
      { name: 'System Fan', details: record.sys_fan_details, unit: record.sys_fan_unit, note: record.sys_fan_upgrade_note },
      { name: 'OS', details: record.os_details, unit: record.os_unit, note: record.os_upgrade_note },
      { name: 'Monitor', details: record.monitor_details, unit: record.monitor_unit, note: record.monitor_upgrade_note },
      { name: 'Others', details: record.others_details, unit: record.others_unit, note: record.others_upgrade_note }
    ];
    
    // Show ALL components (not just active ones) - same as new quotation form
    components.forEach(component => {
      const row = document.createElement('tr');
      
      // Part name
      const partCell = document.createElement('td');
      partCell.textContent = component.name;
      row.appendChild(partCell);
      
      // Details
      const detailsCell = document.createElement('td');
      detailsCell.textContent = component.details || '';
      if (!component.details || component.details.trim() === '') {
        detailsCell.classList.add('component-empty');
        detailsCell.textContent = '-';
      }
      row.appendChild(detailsCell);
      
      // Unit
      const unitCell = document.createElement('td');
      unitCell.textContent = component.unit || '0';
      unitCell.style.textAlign = 'center';
      row.appendChild(unitCell);
      
      // Upgrade Note
      const noteCell = document.createElement('td');
      noteCell.textContent = component.note || '';
      if (!component.note || component.note.trim() === '') {
        noteCell.classList.add('component-empty');
        noteCell.textContent = '-';
      }
      row.appendChild(noteCell);
      
      componentsTable.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error fetching record details:', error);
    
    // Show error in modal
    document.getElementById('modal-id').textContent = 'Error';
    document.getElementById('modal-platform').textContent = 'Failed to load';
    document.getElementById('modal-customer').textContent = 'Failed to load';
    document.getElementById('modal-date').textContent = 'Failed to load';
    document.getElementById('modal-price').textContent = 'Failed to load';
    document.getElementById('modal-components-table').innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #dc3545; font-weight: bold;">
          <i class="fas fa-exclamation-triangle"></i> 
          Failed to load record details: ${error.message}
        </td>
      </tr>
      <tr>
        <td colspan="4" style="text-align: center; color: #6c757d; font-size: 0.9em;">
          Please try again or contact support if the problem persists.
        </td>
      </tr>
    `;
  }
}

// Function to close the view modal
function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
}

// Function to edit a record
function editRecord(recordId) {
  console.log('Editing record with ID:', recordId);
  // TODO: Implement edit functionality
  // This could navigate to an edit form, open a modal, etc.
  alert(`Edit record ${recordId} - Functionality to be implemented`);
}

// Close modal when clicking outside of it
window.onclick = function(event) {
  const modal = document.getElementById('viewModal');
  if (event.target === modal) {
    closeViewModal();
  }
}

// Close modal when pressing Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeViewModal();
  }
});