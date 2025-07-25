function getTableData() {
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tbody tr');
  const data = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowData = {
      part: cells[0].textContent.trim(),
      details: cells[1].querySelector('input')?.value || '',
      unit: cells[2].querySelector('select')?.value || '',
      upgradeNote: cells[3].querySelector('input')?.value || ''
    };
    data.push(rowData);
  });

  const customerName = document.getElementById('customer-name')?.value || '';
  const finalPrice = document.getElementById('final-price')?.value || '';

  const platform = document.getElementById('slider').style.left === '0px' ? 'AMD' : 'INTEL';

  const date = new Date().toISOString();

  return { tableData: data, customerName, finalPrice, platform, date };
}
function debugTableData(data) {
  console.log('Table Data:', data);
}

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('.submit-btn');
  if (!submitButton) {
    console.error('Submit button not found in the DOM');
    return;
  }

  submitButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent form submission
    console.log('Submit button clicked'); // This should now print in the console

    // Show confirmation dialog
    const userConfirmed = confirm('Are you sure you want to submit the quotation?');
    if (!userConfirmed) {
      return; // Exit if user cancels
    }

    const tableData = getTableData();
    debugTableData(tableData);

    fetch('/quotation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tableData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save quotation');
        }
        return response.json();
      })
      .then(data => {
        console.log('Quotation saved:', data);

        // Provide feedback to the user
        const feedback = document.createElement('div');
        feedback.textContent = 'Quotation submitted successfully!';
        feedback.style.color = 'green';
        feedback.style.marginTop = '10px';
        document.querySelector('main').appendChild(feedback);

        // Remove feedback after 3 seconds
        setTimeout(() => feedback.remove(), 3000);
      })
      .catch(error => {
        console.error('Error:', error);

        // Provide error feedback to the user
        const feedback = document.createElement('div');
        feedback.textContent = 'Failed to submit quotation. Please try again.';
        feedback.style.color = 'red';
        feedback.style.marginTop = '10px';
        document.querySelector('main').appendChild(feedback);

        // Remove feedback after 3 seconds
        setTimeout(() => feedback.remove(), 3000);
      });
  });
});