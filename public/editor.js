// Database Editor JavaScript

class DatabaseEditor {
  constructor() {
    this.data = {
      picks: []
    };
    
    this.currentEditingPick = null;
    this.currentEditingFactIndex = null;
    
    this.elements = {
      picksList: document.getElementById('picks-list'),
      
      pickModal: document.getElementById('pick-modal'),
      pickId: document.getElementById('pick-id'),
      pickName: document.getElementById('pick-name'),
      pickDescription: document.getElementById('pick-description'),
      pickImage: document.getElementById('pick-image'),
      factsEditor: document.getElementById('facts-editor'),
      
      importModal: document.getElementById('import-modal'),
      importData: document.getElementById('import-data')
    };
    
    this.setupEventListeners();
    this.loadFromLocalStorage();
    this.render();
  }

  setupEventListeners() {
    document.getElementById('add-pick-button').addEventListener('click', () => this.addPick());
    document.getElementById('export-button').addEventListener('click', () => this.exportJSON());
    document.getElementById('import-button').addEventListener('click', () => this.showImportModal());
    
    document.getElementById('save-pick-button').addEventListener('click', () => this.savePick());
    document.getElementById('cancel-pick-button').addEventListener('click', () => this.closePickModal());
    
    document.getElementById('import-confirm-button').addEventListener('click', () => this.importData());
    document.getElementById('cancel-import-button').addEventListener('click', () => this.closeImportModal());
  }

  // Pick Management
  addPick() {
    this.currentEditingPick = null;
    this.elements.pickId.value = 'pick_' + Date.now();
    this.elements.pickName.value = '';
    this.elements.pickDescription.value = '';
    this.elements.pickImage.value = '';
    this.renderFactsEditor([]);
    this.elements.pickModal.classList.add('active');
  }

  editPick(id) {
    const pick = this.data.picks.find(p => p.id === id);
    if (!pick) return;

    this.currentEditingPick = id;
    this.elements.pickId.value = pick.id;
    this.elements.pickName.value = pick.name;
    this.elements.pickDescription.value = pick.description || '';
    this.elements.pickImage.value = pick.image || '';
    this.renderFactsEditor(pick.facts || []);
    this.elements.pickModal.classList.add('active');
  }

  deletePick(id) {
    const pick = this.data.picks.find(p => p.id === id);
    if (pick && confirm(`Delete pick "${pick.name}"?`)) {
      this.data.picks = this.data.picks.filter(p => p.id !== id);
      this.saveToLocalStorage();
      this.render();
    }
  }

  savePick() {
    const id = this.elements.pickId.value.trim();
    const name = this.elements.pickName.value.trim();
    const description = this.elements.pickDescription.value.trim();
    const image = this.elements.pickImage.value.trim();

    if (!name) {
      alert('Pick name is required!');
      return;
    }

    // Collect facts from the editor
    const facts = [];
    const factRows = this.elements.factsEditor.querySelectorAll('.fact-row');
    factRows.forEach(row => {
      const desc = row.querySelector('.fact-desc').value.trim();
      const cat = row.querySelector('.fact-cat').value.trim();
      const qty = row.querySelector('.fact-qty').value.trim();
      const img = row.querySelector('.fact-img').value.trim();
      
      if (desc && cat) {
        // Parse and validate quantity
        let quantity = null;
        if (qty) {
          const parsedQty = parseInt(qty, 10);
          if (!isNaN(parsedQty) && parsedQty > 0) {
            quantity = parsedQty;
          }
        }
        
        facts.push({
          description: desc,
          category: cat,
          quantity: quantity,
          image: img || null
        });
      }
    });

    if (facts.length === 0) {
      alert('At least one fact must be added!');
      return;
    }

    const pick = {
      id,
      name,
      description: description || null,
      facts,
      image: image || null
    };

    if (this.currentEditingPick) {
      const index = this.data.picks.findIndex(p => p.id === this.currentEditingPick);
      if (index !== -1) {
        this.data.picks[index] = pick;
      }
    } else {
      this.data.picks.push(pick);
    }

    this.saveToLocalStorage();
    this.closePickModal();
    this.render();
  }

  closePickModal() {
    this.elements.pickModal.classList.remove('active');
  }

  renderFactsEditor(existingFacts) {
    this.elements.factsEditor.innerHTML = `
      <div class="pixel-text" style="margin-bottom: 10px;">Add Facts to this Pick:</div>
      <div id="facts-list-container"></div>
      <button type="button" class="pixel-button" id="add-fact-row">Add Fact</button>
    `;
    
    const container = this.elements.factsEditor.querySelector('#facts-list-container');
    
    // Add existing facts
    existingFacts.forEach(fact => {
      this.addFactRow(container, fact);
    });
    
    // Add one empty row if no existing facts
    if (existingFacts.length === 0) {
      this.addFactRow(container);
    }
    
    // Set up add button
    this.elements.factsEditor.querySelector('#add-fact-row').addEventListener('click', () => {
      this.addFactRow(container);
    });
  }
  
  addFactRow(container, fact = null) {
    const row = document.createElement('div');
    row.className = 'fact-row';
    row.innerHTML = `
      <input type="text" class="fact-desc pixel-input" placeholder="Description (e.g., WON THE NOBEL PRIZE)" value="${fact ? fact.description : ''}" style="width: 100%; margin-bottom: 5px;">
      <div style="display: flex; gap: 5px; margin-bottom: 5px;">
        <input type="text" class="fact-cat pixel-input" placeholder="Category" value="${fact ? fact.category : ''}" style="flex: 1;">
        <input type="number" class="fact-qty pixel-input" placeholder="Quantity (optional)" value="${fact && fact.quantity ? fact.quantity : ''}" style="width: 120px;">
      </div>
      <div style="display: flex; gap: 5px;">
        <input type="text" class="fact-img pixel-input" placeholder="Image URL (optional)" value="${fact && fact.image ? fact.image : ''}" style="flex: 1;">
        <button type="button" class="icon-button danger remove-fact-btn">×</button>
      </div>
    `;
    
    row.querySelector('.remove-fact-btn').addEventListener('click', () => {
      row.remove();
    });
    
    container.appendChild(row);
  }

  // Import/Export
  showImportModal() {
    this.elements.importData.value = '';
    this.elements.importModal.classList.add('active');
  }

  closeImportModal() {
    this.elements.importModal.classList.remove('active');
  }

  importData() {
    try {
      const jsonData = JSON.parse(this.elements.importData.value);
      
      if (!jsonData.picks || !Array.isArray(jsonData.picks)) {
        throw new Error('Invalid data format: "picks" must be an array of pick objects');
      }
      
      this.data = {
        picks: jsonData.picks
      };
      
      this.saveToLocalStorage();
      this.closeImportModal();
      this.render();
      alert('Data imported successfully!');
    } catch (error) {
      alert('Import failed: ' + error.message);
    }
  }

  exportJSON() {
    const jsonString = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'versus-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Local Storage
  saveToLocalStorage() {
    localStorage.setItem('versus-editor-data', JSON.stringify(this.data));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('versus-editor-data');
    if (saved) {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
      }
    }
  }

  // Rendering
  render() {
    this.renderPicks();
  }

  renderPicks() {
    this.elements.picksList.innerHTML = '';
    
    for (const pick of this.data.picks) {
      const card = document.createElement('div');
      card.className = 'pick-card';
      
      let imagePreview = '<div class="pick-image-preview">👤</div>';
      if (pick.image) {
        imagePreview = `<div class="pick-image-preview"><img src="${pick.image}" alt="${pick.name}"></div>`;
      }
      
      const factsHTML = (pick.facts || [])
        .map(fact => {
          const quantityText = fact.quantity ? ` (${fact.quantity})` : '';
          return `<div class="fact-item pixel-text">[${fact.category}] ${fact.description}${quantityText}</div>`;
        })
        .join('');
      
      const descriptionHTML = pick.description ? `<div class="pick-description pixel-text">${pick.description}</div>` : '';
      
      card.innerHTML = `
        <div class="pick-card-header">
          <div class="pick-info">
            ${imagePreview}
            <div class="pick-name pixel-text">${pick.name}</div>
            ${descriptionHTML}
          </div>
          <div class="card-actions">
            <button class="icon-button edit-btn">✎</button>
            <button class="icon-button danger delete-btn">×</button>
          </div>
        </div>
        <div class="pick-facts">
          ${factsHTML}
        </div>
      `;
      
      card.querySelector('.edit-btn').addEventListener('click', () => this.editPick(pick.id));
      card.querySelector('.delete-btn').addEventListener('click', () => this.deletePick(pick.id));
      
      this.elements.picksList.appendChild(card);
    }
  }
}

// Initialize editor
document.addEventListener('DOMContentLoaded', () => {
  new DatabaseEditor();
});
