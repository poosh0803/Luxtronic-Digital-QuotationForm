document.addEventListener('DOMContentLoaded', async () => {
  console.log('=== Records.js loaded ===');
  console.log('DOM Content Loaded');
  console.log('Current URL:', window.location.href);
  
  const recordsTableBody = document.getElementById('records-table-body');
  console.log('Table body element found:', !!recordsTableBody);

  try {
    console.log('=== Starting fetch request ===');
    console.log('Fetching records from /api/records');
    console.log('Fetch URL:', window.location.origin + '/api/records');
    
    const response = await fetch('/api/records');
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
function viewRecord(recordId) {
  console.log('Viewing record with ID:', recordId);
  // TODO: Implement view functionality
  // This could open a modal, navigate to a detail page, etc.
  alert(`View record ${recordId} - Functionality to be implemented`);
}

// Function to edit a record
function editRecord(recordId) {
  console.log('Editing record with ID:', recordId);
  // TODO: Implement edit functionality
  // This could navigate to an edit form, open a modal, etc.
  alert(`Edit record ${recordId} - Functionality to be implemented`);
}