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
    'gpu', 'case', 'psu', 'sys_fan', 'os', 'monitor', 'others'
  ];
  
  components.forEach(component => {
    formData.append(`${component}_details`, '');
    formData.append(`${component}_unit`, '');
    formData.append(`${component}_upgrade_note`, '');
  });

  // Extract data from table rows
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    const part = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '_');
    
    console.log(`Row ${index}: Part text = "${cells[0].textContent.trim()}", Normalized = "${part}"`);
    
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
      'others': 'others'
    };
    
    const mappedComponent = partMapping[part];
    
    if (mappedComponent) {
      const details = cells[1].querySelector('input')?.value || '';
      const unit = cells[2].querySelector('select')?.value || '';
      const upgradeNote = cells[3].querySelector('input')?.value || '';
        
      console.log(`Setting ${mappedComponent}: details="${details}", unit="${unit}", upgradeNote="${upgradeNote}"`);
      
      formData.set(`${mappedComponent}_details`, details);
      formData.set(`${mappedComponent}_unit`, unit);
      formData.set(`${mappedComponent}_upgrade_note`, upgradeNote);
    } else {
      console.warn(`No mapping found for part: "${part}"`);
    }
  });

  return formData;
}
function debugTableData(formData) {
  console.log('Table Data (FormData):');
  for (let [key, value] of formData.entries()) {
    console.log(key + ':', value);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('.submit-btn');
  if (!submitButton) {
    console.error('Submit button not found in the DOM');
    return;
  }

  submitButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent form submission
    console.log('Submit button clicked'); // This should now print in the console

    // Show confirmation dialog
    const userConfirmed = confirm('Are you sure you want to submit the quotation?');
    if (!userConfirmed) {
      return; // Exit if user cancels
    }

    try {
      const tableData = getTableData();
      debugTableData(tableData);

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