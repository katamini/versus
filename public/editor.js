// Database Editor JavaScript

class DatabaseEditor {
  constructor() {
    this.data = {
      facts: [],
      picks: []
    };
    
    this.currentEditingFactId = null;
    this.currentEditingPick = null;
    
    this.elements = {
      factsList: document.getElementById('facts-list'),
      picksList: document.getElementById('picks-list'),
      
      factModal: document.getElementById('fact-modal'),
      factId: document.getElementById('fact-id'),
      factDescription: document.getElementById('fact-description'),
      factCategory: document.getElementById('fact-category'),
      factImage: document.getElementById('fact-image'),
      
      pickModal: document.getElementById('pick-modal'),
      pickId: document.getElementById('pick-id'),
      pickName: document.getElementById('pick-name'),
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
    document.getElementById('add-fact-button').addEventListener('click', () => this.addFact());
    document.getElementById('add-pick-button').addEventListener('click', () => this.addPick());
    document.getElementById('export-button').addEventListener('click', () => this.exportJSON());
    document.getElementById('export-sqlite-button').addEventListener('click', () => this.exportSQLite());
    document.getElementById('import-button').addEventListener('click', () => this.showImportModal());
    
    document.getElementById('save-fact-button').addEventListener('click', () => this.saveFact());
    document.getElementById('cancel-fact-button').addEventListener('click', () => this.closeFactModal());
    
    document.getElementById('save-pick-button').addEventListener('click', () => this.savePick());
    document.getElementById('cancel-pick-button').addEventListener('click', () => this.closePickModal());
    
    document.getElementById('import-confirm-button').addEventListener('click', () => this.importData());
    document.getElementById('cancel-import-button').addEventListener('click', () => this.closeImportModal());
  }

  // Fact Management
  addFact() {
    this.currentEditingFactId = null;
    this.elements.factId.value = this.generateFactId();
    this.elements.factDescription.value = '';
    this.elements.factCategory.value = '';
    this.elements.factImage.value = '';
    this.elements.factModal.classList.add('active');
  }

  generateFactId() {
    return 'fact_' + Date.now();
  }

  editFact(id) {
    const fact = this.data.facts.find(f => f.id === id);
    if (!fact) return;

    this.currentEditingFactId = id;
    this.elements.factId.value = fact.id;
    this.elements.factDescription.value = fact.description;
    this.elements.factCategory.value = fact.category;
    this.elements.factImage.value = fact.image || '';
    this.elements.factModal.classList.add('active');
  }

  deleteFact(id) {
    const fact = this.data.facts.find(f => f.id === id);
    if (fact && confirm(`Delete fact "${fact.description}"?`)) {
      this.data.facts = this.data.facts.filter(f => f.id !== id);
      this.data.picks.forEach(pick => {
        if (pick.factIds) {
          pick.factIds = pick.factIds.filter(fid => fid !== id);
        }
      });
      this.saveToLocalStorage();
      this.render();
    }
  }

  saveFact() {
    const id = this.elements.factId.value.trim();
    const description = this.elements.factDescription.value.trim();
    const category = this.elements.factCategory.value.trim();
    const image = this.elements.factImage.value.trim();

    if (!id) {
      alert('Fact ID is required!');
      return;
    }

    if (!description) {
      alert('Fact description is required!');
      return;
    }

    if (!category) {
      alert('Fact category is required!');
      return;
    }

    const fact = {
      id,
      description,
      category,
      image: image || null
    };

    if (this.currentEditingFactId) {
      const index = this.data.facts.findIndex(f => f.id === this.currentEditingFactId);
      if (index !== -1) {
        this.data.facts[index] = fact;
        if (this.currentEditingFactId !== id) {
          this.data.picks.forEach(pick => {
            if (pick.factIds) {
              pick.factIds = pick.factIds.map(fid => fid === this.currentEditingFactId ? id : fid);
            }
          });
        }
      }
    } else {
      this.data.facts.push(fact);
    }

    this.saveToLocalStorage();
    this.closeFactModal();
    this.render();
  }

  closeFactModal() {
    this.elements.factModal.classList.remove('active');
  }

  // Pick Management
  addPick() {
    this.currentEditingPick = null;
    this.elements.pickId.value = 'pick_' + Date.now();
    this.elements.pickName.value = '';
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
    this.elements.pickImage.value = pick.image || '';
    this.renderFactsEditor(pick.factIds || []);
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
    const image = this.elements.pickImage.value.trim();

    if (!name) {
      alert('Pick name is required!');
      return;
    }

    const factIds = [];
    const checkboxes = this.elements.factsEditor.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
      factIds.push(cb.value);
    });

    if (factIds.length === 0) {
      alert('At least one fact must be selected!');
      return;
    }

    const pick = {
      id,
      name,
      factIds,
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

  renderFactsEditor(selectedFactIds) {
    this.elements.factsEditor.innerHTML = '';
    
    if (this.data.facts.length === 0) {
      this.elements.factsEditor.innerHTML = '<div class="pixel-text">No facts available. Please create facts first.</div>';
      return;
    }

    this.data.facts.forEach(fact => {
      const checkbox = document.createElement('div');
      checkbox.className = 'fact-checkbox-row';
      const isChecked = selectedFactIds.includes(fact.id);
      checkbox.innerHTML = `
        <label class="pixel-text">
          <input type="checkbox" value="${fact.id}" ${isChecked ? 'checked' : ''}>
          <span class="fact-category">[${fact.category}]</span> ${fact.description}
        </label>
      `;
      this.elements.factsEditor.appendChild(checkbox);
    });
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
      
      if (!jsonData.facts || !Array.isArray(jsonData.facts)) {
        throw new Error('Invalid data format: "facts" must be an array of fact objects');
      }
      
      this.data = {
        facts: jsonData.facts,
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

  exportSQLite() {
    // Generate SQL script for SQLite
    let sql = '-- VERSUS Game Database\n\n';
    
    sql += 'CREATE TABLE IF NOT EXISTS facts (\n';
    sql += '  id TEXT PRIMARY KEY,\n';
    sql += '  description TEXT NOT NULL,\n';
    sql += '  category TEXT NOT NULL,\n';
    sql += '  image TEXT\n';
    sql += ');\n\n';
    
    sql += 'CREATE TABLE IF NOT EXISTS picks (\n';
    sql += '  id TEXT PRIMARY KEY,\n';
    sql += '  name TEXT NOT NULL,\n';
    sql += '  image TEXT\n';
    sql += ');\n\n';
    
    sql += 'CREATE TABLE IF NOT EXISTS pick_facts (\n';
    sql += '  pick_id TEXT NOT NULL,\n';
    sql += '  fact_id TEXT NOT NULL,\n';
    sql += '  FOREIGN KEY (pick_id) REFERENCES picks(id),\n';
    sql += '  FOREIGN KEY (fact_id) REFERENCES facts(id)\n';
    sql += ');\n\n';
    
    // Insert facts
    for (const fact of this.data.facts) {
      const imageValue = fact.image ? `'${fact.image.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO facts (id, description, category, image) VALUES ('${fact.id.replace(/'/g, "''")}', '${fact.description.replace(/'/g, "''")}', '${fact.category.replace(/'/g, "''")}', ${imageValue});\n`;
    }
    sql += '\n';
    
    // Insert picks and pick_facts
    for (const pick of this.data.picks) {
      const imageValue = pick.image ? `'${pick.image.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO picks (id, name, image) VALUES ('${pick.id.replace(/'/g, "''")}', '${pick.name.replace(/'/g, "''")}', ${imageValue});\n`;
      
      if (pick.factIds) {
        for (const factId of pick.factIds) {
          sql += `INSERT INTO pick_facts (pick_id, fact_id) VALUES ('${pick.id.replace(/'/g, "''")}', '${factId.replace(/'/g, "''")}');\n`;
        }
      }
      sql += '\n';
    }
    
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'versus-data.sql';
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
    this.renderFacts();
    this.renderPicks();
  }

  renderFacts() {
    this.elements.factsList.innerHTML = '';
    
    for (const fact of this.data.facts) {
      const card = document.createElement('div');
      card.className = 'fact-card';
      
      let imagePreview = '<div class="fact-image-preview">No image</div>';
      if (fact.image) {
        imagePreview = `<div class="fact-image-preview"><img src="${fact.image}" alt="${fact.description}"></div>`;
      }
      
      card.innerHTML = `
        <div class="fact-card-header">
          <div class="fact-info">
            <div class="fact-category pixel-text">[${fact.category}]</div>
            <div class="fact-description pixel-text">${fact.description}</div>
          </div>
          <div class="card-actions">
            <button class="icon-button edit-btn">✎</button>
            <button class="icon-button danger delete-btn">×</button>
          </div>
        </div>
        ${imagePreview}
      `;
      
      card.querySelector('.edit-btn').addEventListener('click', () => this.editFact(fact.id));
      card.querySelector('.delete-btn').addEventListener('click', () => this.deleteFact(fact.id));
      
      this.elements.factsList.appendChild(card);
    }
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
      
      const factsHTML = (pick.factIds || [])
        .map(factId => {
          const fact = this.data.facts.find(f => f.id === factId);
          return fact ? `<div class="fact-item pixel-text">[${fact.category}] ${fact.description}</div>` : '';
        })
        .filter(html => html)
        .join('');
      
      card.innerHTML = `
        <div class="pick-card-header">
          <div class="pick-info">
            ${imagePreview}
            <div class="pick-name pixel-text">${pick.name}</div>
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
