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
          <button class="btn-delete" onclick="deleteRecord(${record.id})" title="Delete Record">
            <i class="fas fa-trash"></i>
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
  
  // Show edit modal with loading state
  document.getElementById('editModal').style.display = 'block';
  document.getElementById('edit-modal-id').textContent = 'Loading...';
  document.getElementById('edit-modal-platform').value = '';
  document.getElementById('edit-modal-customer').value = 'Loading...';
  document.getElementById('edit-modal-date').textContent = 'Loading...';
  document.getElementById('edit-modal-price').value = '';
  document.getElementById('edit-modal-components-table').innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading component details...</td></tr>';
  
  // Store the record ID for saving later
  window.currentEditingRecordId = recordId;
  window.originalRecordData = null; // Store original record data
  
  fetchRecordForEdit(recordId);
}

// Function to fetch and populate record data for editing
async function fetchRecordForEdit(recordId) {
  try {
    console.log('Fetching record details for editing from /api/quotation/' + recordId);
    const response = await fetch(`/api/quotation/${recordId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch record details:', errorText);
      throw new Error(`Failed to fetch record: ${response.status}`);
    }
    
    const record = await response.json();
    console.log('Record details fetched for editing:', record);
    
    // Store the original record data to preserve timestamps
    window.originalRecordData = record;
    
    // Populate modal with editable record data
    document.getElementById('edit-modal-id').textContent = record.id;
    const platformValue = record.platform === 'AMD' || record.platform === 'INTEL' ? record.platform : 'AMD';
    document.getElementById('edit-modal-platform').value = platformValue;
    document.getElementById('edit-modal-customer').value = record.customer_name || '';
    document.getElementById('edit-modal-date').textContent = new Date(record.created_at).toLocaleDateString();
    document.getElementById('edit-modal-price').value = record.final_price || '0.00';
    
    // Populate components table with editable fields
    const componentsTable = document.getElementById('edit-modal-components-table');
    componentsTable.innerHTML = ''; // Clear existing content
    
    // Define ALL component mappings (same order as new quotation form)
    const components = [
      { name: 'CPU', details: record.cpu_details, unit: record.cpu_unit, note: record.cpu_upgrade_note, field: 'cpu' },
      { name: 'CPU Cooling', details: record.cpu_cooling_details, unit: record.cpu_cooling_unit, note: record.cpu_cooling_upgrade_note, field: 'cpu_cooling' },
      { name: 'Motherboard', details: record.motherboard_details, unit: record.motherboard_unit, note: record.motherboard_upgrade_note, field: 'motherboard' },
      { name: 'RAM', details: record.ram_details, unit: record.ram_unit, note: record.ram_upgrade_note, field: 'ram' },
      { name: 'Storage 1', details: record.storage1_details, unit: record.storage1_unit, note: record.storage1_upgrade_note, field: 'storage1' },
      { name: 'Storage 2', details: record.storage2_details, unit: record.storage2_unit, note: record.storage2_upgrade_note, field: 'storage2' },
      { name: 'GPU', details: record.gpu_details, unit: record.gpu_unit, note: record.gpu_upgrade_note, field: 'gpu' },
      { name: 'Case', details: record.case_details, unit: record.case_unit, note: record.case_upgrade_note, field: 'case' },
      { name: 'PSU', details: record.psu_details, unit: record.psu_unit, note: record.psu_upgrade_note, field: 'psu' },
      { name: 'System Fan', details: record.sys_fan_details, unit: record.sys_fan_unit, note: record.sys_fan_upgrade_note, field: 'sys_fan' },
      { name: 'OS', details: record.os_details, unit: record.os_unit, note: record.os_upgrade_note, field: 'os' },
      { name: 'Monitor', details: record.monitor_details, unit: record.monitor_unit, note: record.monitor_upgrade_note, field: 'monitor' },
      { name: 'Others', details: record.others_details, unit: record.others_unit, note: record.others_upgrade_note, field: 'others' }
    ];
    
    // Create editable rows for all components
    components.forEach(component => {
      const row = document.createElement('tr');
      
      // Part name (read-only)
      const partCell = document.createElement('td');
      partCell.textContent = component.name;
      partCell.style.fontWeight = 'bold';
      row.appendChild(partCell);
      
      // Details (editable)
      const detailsCell = document.createElement('td');
      const detailsInput = document.createElement('input');
      detailsInput.type = 'text';
      detailsInput.value = component.details || '';
      detailsInput.placeholder = `Enter ${component.name.toLowerCase()} details`;
      detailsInput.setAttribute('data-field', `${component.field}_details`);
      detailsCell.appendChild(detailsInput);
      row.appendChild(detailsCell);
      
      // Unit (editable)
      const unitCell = document.createElement('td');
      const unitInput = document.createElement('input');
      unitInput.type = 'number';
      unitInput.value = component.unit || '0';
      unitInput.min = '0';
      unitInput.step = '1';
      unitInput.className = 'unit-input';
      unitInput.setAttribute('data-field', `${component.field}_unit`);
      unitCell.appendChild(unitInput);
      row.appendChild(unitCell);
      
      // Upgrade Note (editable)
      const noteCell = document.createElement('td');
      const noteInput = document.createElement('input');
      noteInput.type = 'text';
      noteInput.value = component.note || '';
      noteInput.placeholder = 'Enter upgrade notes';
      noteInput.setAttribute('data-field', `${component.field}_upgrade_note`);
      noteCell.appendChild(noteInput);
      row.appendChild(noteCell);
      
      componentsTable.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error fetching record details for editing:', error);
    
    // Show error in modal
    document.getElementById('edit-modal-id').textContent = 'Error';
    document.getElementById('edit-modal-platform').value = '';
    document.getElementById('edit-modal-customer').value = 'Failed to load';
    document.getElementById('edit-modal-date').textContent = 'Failed to load';
    document.getElementById('edit-modal-price').value = '';
    document.getElementById('edit-modal-components-table').innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #dc3545; font-weight: bold;">
          <i class="fas fa-exclamation-triangle"></i> 
          Failed to load record details: ${error.message}
        </td>
      </tr>
    `;
  }
}

// Function to save the edited record
async function saveRecord() {
  const recordId = window.currentEditingRecordId;
  
  if (!recordId) {
    alert('Error: No record ID found for saving');
    return;
  }
  
  try {
    // Collect form data
    const formData = {
      platform: document.getElementById('edit-modal-platform').value,
      customer_name: document.getElementById('edit-modal-customer').value,
      final_price: parseFloat(document.getElementById('edit-modal-price').value) || 0
    };
    
    // Preserve the original creation date if available
    if (window.originalRecordData && window.originalRecordData.created_at) {
      formData.created_at = window.originalRecordData.created_at;
    }
    
    // Collect component data from the table
    const componentInputs = document.querySelectorAll('#edit-modal-components-table input[data-field]');
    componentInputs.forEach(input => {
      const fieldName = input.getAttribute('data-field');
      formData[fieldName] = input.value || '';
    });
    
    console.log('Saving record with data:', formData);
    
    // Send update request to server
    const response = await fetch(`/api/quotation/${recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update record:', errorText);
      throw new Error(`Failed to update record: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Record updated successfully:', result);
    
    // Close modal and refresh the records table
    closeEditModal();
    alert('Record updated successfully!');
    
    // Reload the page to reflect changes
    window.location.reload();
    
  } catch (error) {
    console.error('Error saving record:', error);
    alert(`Error saving record: ${error.message}`);
  }
}

// Function to close the edit modal
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  window.currentEditingRecordId = null;
  window.originalRecordData = null; // Clear stored original data
}

// Function to delete a record
async function deleteRecord(recordId) {
  // Show confirmation dialog
  const confirmDelete = confirm(`Are you sure you want to delete record #${recordId}? This action cannot be undone.`);
  
  if (!confirmDelete) {
    return; // User cancelled deletion
  }
  
  try {
    console.log('Deleting record with ID:', recordId);
    
    // Send delete request to server
    const response = await fetch(`/api/quotation/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete record:', errorText);
      throw new Error(`Failed to delete record: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Record deleted successfully:', result);
    
    alert('Record deleted successfully!');
    
    // Reload the page to reflect changes
    window.location.reload();
    
  } catch (error) {
    console.error('Error deleting record:', error);
    alert(`Error deleting record: ${error.message}`);
  }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
  const viewModal = document.getElementById('viewModal');
  const editModal = document.getElementById('editModal');
  
  if (event.target === viewModal) {
    closeViewModal();
  } else if (event.target === editModal) {
    closeEditModal();
  }
}

// Close modal when pressing Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const viewModal = document.getElementById('viewModal');
    const editModal = document.getElementById('editModal');
    
    if (viewModal.style.display === 'block') {
      closeViewModal();
    } else if (editModal.style.display === 'block') {
      closeEditModal();
    }
  }
});