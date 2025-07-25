document.getElementById('add-component').addEventListener('click', () => {
  const componentsDiv = document.getElementById('components');
  const newComponent = document.createElement('div');
  newComponent.classList.add('component');

  newComponent.innerHTML = `
    <label for="componentName">Component Name:</label>
    <input type="text" name="components[][name]" required>

    <label for="componentPrice">Price:</label>
    <input type="number" name="components[][price]" required>
  `;

  componentsDiv.appendChild(newComponent);
});
