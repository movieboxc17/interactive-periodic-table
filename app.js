// Fetch elements and render table
async function fetchElements() {
  const res = await fetch('elements.json');
  const elements = await res.json();
  return elements;
}

function createElementTile(element) {
  const tile = document.createElement('button');
  tile.className = 'element';
  tile.setAttribute('role', 'gridcell');
  tile.setAttribute('tabindex', '0');
  tile.innerHTML = `
    <span class="atomic-number">${element.number}</span>
    <span class="symbol">${element.symbol}</span>
    <span class="name">${element.name}</span>
  `;
  tile.addEventListener('click', () => showModal(element));
  tile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      showModal(element);
    }
  });
  return tile;
}

function renderTable(elements, filters = {}) {
  const table = document.getElementById('periodic-table');
  table.innerHTML = '';
  let maxPeriod = Math.max(...elements.map(e => e.period));
  let maxGroup = 18;
  // Create empty grid
  for (let i = 1; i <= maxPeriod; i++) {
    for (let j = 1; j <= maxGroup; j++) {
      const cell = document.createElement('div');
      cell.className = 'table-cell';
      cell.setAttribute('role', 'presentation');
      cell.style.gridColumn = j;
      cell.style.gridRow = i;
      table.appendChild(cell);
    }
  }
  // Place elements
  elements.forEach(element => {
    // Filtering
    if (filters.name) {
      const search = filters.name.toLowerCase();
      if (
        !element.name.toLowerCase().includes(search) &&
        !element.symbol.toLowerCase().includes(search)
      )
        return;
    }
    if (filters.group && element.group !== filters.group) return;
    if (filters.state && element.state.toLowerCase() !== filters.state) return;

    const tile = createElementTile(element);
    // Position in grid
    tile.style.gridColumn = element.group;
    tile.style.gridRow = element.period;
    table.appendChild(tile);
  });
}

function showModal(element) {
  const modal = document.getElementById('modal');
  const details = document.getElementById('element-details');
  details.innerHTML = `
    <h2>${element.name} (${element.symbol})</h2>
    <div class="particle-model">
      <svg class="particle-svg" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="40" fill="#23262f" stroke="#fbbf24" stroke-width="2"/>
        <circle cx="65" cy="65" r="5" fill="#3b82f6"/>
        ${Array(element.electrons).fill(0).map((_, i) => {
          const angle = (i / element.electrons) * 2 * Math.PI;
          const x = 65 + 36 * Math.cos(angle);
          const y = 65 + 36 * Math.sin(angle);
          return `<circle cx="${x}" cy="${y}" r="2" fill="#fbbf24" />`;
        }).join('')}
      </svg>
    </div>
    <dl class="details-grid">
      <dt>Atomic Number</dt><dd>${element.number}</dd>
      <dt>Symbol</dt><dd>${element.symbol}</dd>
      <dt>Name</dt><dd>${element.name}</dd>
      <dt>Group</dt><dd>${element.group}</dd>
      <dt>Period</dt><dd>${element.period}</dd>
      <dt>Category</dt><dd>${element.category}</dd>
      <dt>State</dt><dd>${element.state}</dd>
      <dt>Atomic Mass</dt><dd>${element.atomic_mass}</dd>
      <dt>Electrons</dt><dd>${element.electrons}</dd>
    </dl>
  `;
  modal.hidden = false;
  modal.focus();
}

function closeModal() {
  document.getElementById('modal').hidden = true;
}

function populateFilters(elements) {
  const groupSet = new Set(elements.map(e => e.group));
  const groupFilter = document.getElementById('group-filter');
  groupSet.forEach(group => {
    if (!group) return;
    const option = document.createElement('option');
    option.value = group;
    option.textContent = `Group ${group}`;
    groupFilter.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const elements = await fetchElements();
  let filters = {};

  populateFilters(elements);
  renderTable(elements);

  document.getElementById('search-input').addEventListener('input', e => {
    filters.name = e.target.value;
    renderTable(elements, filters);
  });
  document.getElementById('group-filter').addEventListener('change', e => {
    filters.group = e.target.value ? Number(e.target.value) : undefined;
    renderTable(elements, filters);
  });
  document.getElementById('state-filter').addEventListener('change', e => {
    filters.state = e.target.value;
    renderTable(elements, filters);
  });

  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
