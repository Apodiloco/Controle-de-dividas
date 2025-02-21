document.addEventListener('DOMContentLoaded', function () {
  const debtsTable = document.getElementById('debts-table').getElementsByTagName('tbody')[0];
  const addDebtButton = document.getElementById('add-debt-button');
  const totalValueElement = document.getElementById('total-value');
  let totalValue = 0;

  // Load saved debts from localStorage
  let debts = JSON.parse(localStorage.getItem('debts')) || [];

  function updateTotal() {
    totalValue = 0;
    debts.forEach(debt => {
      totalValue += debt.value;
    });
    totalValueElement.textContent = 'R$ ' + totalValue.toFixed(2);
  }

  function saveDebts() {
    localStorage.setItem('debts', JSON.stringify(debts));
  }

  function createDebtRow(debt = {
    checked: false,
    debtName: '',
    dueDate: '',
    value: 0
  }, index) {
    const newRow = document.createElement('tr');
    newRow.draggable = true;
    newRow.classList.add('debt-row');
    newRow.dataset.index = index;

    let dragHandleCell = newRow.insertCell();
    dragHandleCell.classList.add('drag-handle');
    dragHandleCell.textContent = '☰';
    dragHandleCell.addEventListener('mousedown', (e) => {
      dragStart(e, newRow);
    });
    dragHandleCell.addEventListener('touchstart', (e) => {
      dragStart(e, newRow);
    });

    let checkboxCell = newRow.insertCell();
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = debt.checked;
    checkbox.addEventListener('change', () => {
      debt.checked = checkbox.checked;
      updateRowStyle(newRow);
      saveDebts();
      updateTotal();
    });
    checkboxCell.appendChild(checkbox);

    let debtNameCell = newRow.insertCell();
    let debtNameInput = document.createElement('input');
    debtNameInput.type = 'text';
    debtNameInput.value = debt.debtName;
    debtNameInput.addEventListener('input', () => {
      debt.debtName = debtNameInput.value;
      saveDebts();
    });
    debtNameCell.appendChild(debtNameInput);

    let dueDateCell = newRow.insertCell();
    let dueDateInput = document.createElement('input');
    dueDateInput.type = 'date';
    dueDateInput.value = debt.dueDate;
    dueDateInput.addEventListener('input', () => {
      debt.dueDate = dueDateInput.value;
      saveDebts();
    });
    dueDateCell.appendChild(dueDateInput);

    let valueCell = newRow.insertCell();
    let valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.classList.add('debt-value');
    valueInput.value = debt.value;
    valueInput.addEventListener('input', () => {
      // Validate value input to ensure it's a valid number
      const value = parseFloat(valueInput.value);
      debt.value = isNaN(value) ? 0 : value;
      updateTotal();
      saveDebts();
    });
    valueCell.appendChild(valueInput);

    let deleteCell = newRow.insertCell();
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => {
      if (confirm('Tem certeza de que deseja excluir essa dívida?')) {
        deleteDebtRow(index);
      }
    });
    deleteCell.appendChild(deleteButton);

    newRow.addEventListener('dragover', dragOver);
    newRow.addEventListener('drop', drop);
    newRow.addEventListener('dragenter', dragEnter);
    newRow.addEventListener('dragleave', dragLeave);

    updateRowStyle(newRow);
    return newRow;
  }

  function addDebtRow(debt = {
    checked: false,
    debtName: '',
    dueDate: '',
    value: 0
  }) {
    debts.push(debt);
    const newRow = createDebtRow(debt, debts.length - 1);
    debtsTable.appendChild(newRow);
    updateTotal();
    saveDebts();
  }

  function deleteDebtRow(index) {
    debts.splice(index, 1);

    // Rebuild the table after deletion
    debtsTable.innerHTML = '';
    debts.forEach((debt, i) => {
      const row = createDebtRow(debt, i);
      debtsTable.appendChild(row);
    });

    updateTotal();
    saveDebts();
  }

  function updateRowStyle(row) {
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
      row.classList.add('completed');
    } else {
      row.classList.remove('completed');
    }
  }

  addDebtButton.addEventListener('click', () => {
    addDebtRow();
  });

  let draggedRow = null;

  function dragStart(event, row) {
    draggedRow = row;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', null);
    row.classList.add('dragging');
  }

  function dragOver(event) {
    event.preventDefault();
  }

  function dragEnter(event) {
    event.preventDefault();
    const row = event.target.closest('tr');
    if (row && row !== draggedRow) {
      row.classList.add('drag-over');
    }
  }

  function dragLeave(event) {
    const row = event.target.closest('tr');
    if (row && row !== draggedRow) {
      row.classList.remove('drag-over');
    }
  }

  function drop(event) {
    event.preventDefault();
    const dropRow = event.target.closest('tr');

    if (dropRow && dropRow !== draggedRow) {
      const draggedIndex = parseInt(draggedRow.dataset.index);
      const dropIndex = parseInt(dropRow.dataset.index);

      // Reorder the debts array
      const [removed] = debts.splice(draggedIndex, 1);
      debts.splice(dropIndex, 0, removed);

      // Clear and rebuild the table
      debtsTable.innerHTML = '';
      debts.forEach((debt, index) => {
        const row = createDebtRow(debt, index);
        debtsTable.appendChild(row);
      });

      dropRow.classList.remove('drag-over');
      draggedRow.classList.remove('dragging');
      draggedRow = null;

      updateTotal();
      saveDebts();
    }
  }

  // Load existing debts on page load
  debts.forEach((debt, index) => {
    const row = createDebtRow(debt, index);
    debtsTable.appendChild(row);
  });
  updateTotal();
});
