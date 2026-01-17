// Database Editor JavaScript

class DatabaseEditor {
  constructor() {
    this.data = {
      propertyCategories: {},
      picks: []
    };
    
    this.currentEditingCategory = null;
    this.currentEditingPick = null;
    
    this.elements = {
      categoriesList: document.getElementById('categories-list'),
      picksList: document.getElementById('picks-list'),
      
      categoryModal: document.getElementById('category-modal'),
      categoryName: document.getElementById('category-name'),
      categoryImage: document.getElementById('category-image'),
      
      pickModal: document.getElementById('pick-modal'),
      pickId: document.getElementById('pick-id'),
      pickName: document.getElementById('pick-name'),
      pickImage: document.getElementById('pick-image'),
      propertiesEditor: document.getElementById('properties-editor'),
      
      importModal: document.getElementById('import-modal'),
      importData: document.getElementById('import-data')
    };
    
    this.setupEventListeners();
    this.loadFromLocalStorage();
    this.render();
  }

  setupEventListeners() {
    document.getElementById('add-category-button').addEventListener('click', () => this.addCategory());
    document.getElementById('add-pick-button').addEventListener('click', () => this.addPick());
    document.getElementById('export-button').addEventListener('click', () => this.exportJSON());
    document.getElementById('export-sqlite-button').addEventListener('click', () => this.exportSQLite());
    document.getElementById('import-button').addEventListener('click', () => this.showImportModal());
    
    document.getElementById('save-category-button').addEventListener('click', () => this.saveCategory());
    document.getElementById('cancel-category-button').addEventListener('click', () => this.closeCategoryModal());
    
    document.getElementById('save-pick-button').addEventListener('click', () => this.savePick());
    document.getElementById('cancel-pick-button').addEventListener('click', () => this.closePickModal());
    document.getElementById('add-property-button').addEventListener('click', () => this.addPropertyRow());
    
    document.getElementById('import-confirm-button').addEventListener('click', () => this.importData());
    document.getElementById('cancel-import-button').addEventListener('click', () => this.closeImportModal());
  }

  // Category Management
  addCategory() {
    this.currentEditingCategory = null;
    this.elements.categoryName.value = '';
    this.elements.categoryImage.value = '';
    this.elements.categoryModal.classList.add('active');
  }

  editCategory(name) {
    this.currentEditingCategory = name;
    const category = this.data.propertyCategories[name];
    this.elements.categoryName.value = name;
    this.elements.categoryImage.value = category.image || '';
    this.elements.categoryModal.classList.add('active');
  }

  deleteCategory(name) {
    if (confirm(`Delete category "${name}"?`)) {
      delete this.data.propertyCategories[name];
      this.saveToLocalStorage();
      this.render();
    }
  }

  saveCategory() {
    const name = this.elements.categoryName.value.trim();
    if (!name) {
      alert('Category name is required!');
      return;
    }

    if (this.currentEditingCategory && this.currentEditingCategory !== name) {
      delete this.data.propertyCategories[this.currentEditingCategory];
    }

    this.data.propertyCategories[name] = {
      image: this.elements.categoryImage.value.trim() || null
    };

    this.saveToLocalStorage();
    this.closeCategoryModal();
    this.render();
  }

  closeCategoryModal() {
    this.elements.categoryModal.classList.remove('active');
  }

  // Pick Management
  addPick() {
    this.currentEditingPick = null;
    this.elements.pickId.value = 'pick_' + Date.now();
    this.elements.pickName.value = '';
    this.elements.pickImage.value = '';
    this.elements.propertiesEditor.innerHTML = '';
    this.addPropertyRow();
    this.elements.pickModal.classList.add('active');
  }

  editPick(id) {
    const pick = this.data.picks.find(p => p.id === id);
    if (!pick) return;

    this.currentEditingPick = id;
    this.elements.pickId.value = pick.id;
    this.elements.pickName.value = pick.name;
    this.elements.pickImage.value = pick.image || '';
    
    this.elements.propertiesEditor.innerHTML = '';
    for (const [prop, value] of Object.entries(pick.properties)) {
      this.addPropertyRow(prop, value, pick.propertyImages?.[prop] || '');
    }
    
    if (Object.keys(pick.properties).length === 0) {
      this.addPropertyRow();
    }
    
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

    const properties = {};
    const propertyImages = {};
    
    const propertyRows = this.elements.propertiesEditor.querySelectorAll('.property-row');
    propertyRows.forEach(row => {
      const propName = row.querySelector('.property-name').value.trim();
      const propValue = parseFloat(row.querySelector('.property-value').value);
      const propImage = row.querySelector('.property-image').value.trim();
      
      if (propName && !isNaN(propValue)) {
        properties[propName] = propValue;
        if (propImage) {
          propertyImages[propName] = propImage;
        }
      }
    });

    if (Object.keys(properties).length === 0) {
      alert('At least one property is required!');
      return;
    }

    const pick = {
      id,
      name,
      properties,
      image: image || null,
      propertyImages: Object.keys(propertyImages).length > 0 ? propertyImages : {}
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

  addPropertyRow(name = '', value = '', image = '') {
    const row = document.createElement('div');
    row.className = 'property-row';
    row.innerHTML = `
      <input type="text" class="pixel-input property-name" placeholder="Property name" value="${name}">
      <input type="number" class="pixel-input property-value" placeholder="Value" value="${value}">
      <input type="text" class="pixel-input property-image" placeholder="Image URL" value="${image}">
      <button class="delete-property-button" type="button">×</button>
    `;
    
    row.querySelector('.delete-property-button').addEventListener('click', () => {
      row.remove();
    });
    
    this.elements.propertiesEditor.appendChild(row);
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
        throw new Error('Invalid data format: "picks" array is required');
      }
      
      this.data = {
        propertyCategories: jsonData.propertyCategories || {},
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
    
    sql += 'CREATE TABLE IF NOT EXISTS picks (\n';
    sql += '  id TEXT PRIMARY KEY,\n';
    sql += '  name TEXT NOT NULL,\n';
    sql += '  image TEXT\n';
    sql += ');\n\n';
    
    sql += 'CREATE TABLE IF NOT EXISTS properties (\n';
    sql += '  pick_id TEXT NOT NULL,\n';
    sql += '  property_name TEXT NOT NULL,\n';
    sql += '  value REAL NOT NULL,\n';
    sql += '  image TEXT,\n';
    sql += '  FOREIGN KEY (pick_id) REFERENCES picks(id)\n';
    sql += ');\n\n';
    
    sql += 'CREATE TABLE IF NOT EXISTS property_categories (\n';
    sql += '  name TEXT PRIMARY KEY,\n';
    sql += '  image TEXT\n';
    sql += ');\n\n';
    
    // Insert categories
    for (const [name, category] of Object.entries(this.data.propertyCategories)) {
      const imageValue = category.image ? `'${category.image.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO property_categories (name, image) VALUES ('${name.replace(/'/g, "''")}', ${imageValue});\n`;
    }
    sql += '\n';
    
    // Insert picks and properties
    for (const pick of this.data.picks) {
      const imageValue = pick.image ? `'${pick.image.replace(/'/g, "''")}'` : 'NULL';
      sql += `INSERT INTO picks (id, name, image) VALUES ('${pick.id.replace(/'/g, "''")}', '${pick.name.replace(/'/g, "''")}', ${imageValue});\n`;
      
      for (const [prop, value] of Object.entries(pick.properties)) {
        const propImageValue = pick.propertyImages?.[prop] ? `'${pick.propertyImages[prop].replace(/'/g, "''")}'` : 'NULL';
        sql += `INSERT INTO properties (pick_id, property_name, value, image) VALUES ('${pick.id.replace(/'/g, "''")}', '${prop.replace(/'/g, "''")}', ${value}, ${propImageValue});\n`;
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
    this.renderCategories();
    this.renderPicks();
  }

  renderCategories() {
    this.elements.categoriesList.innerHTML = '';
    
    for (const [name, category] of Object.entries(this.data.propertyCategories)) {
      const card = document.createElement('div');
      card.className = 'category-card';
      
      let imagePreview = '<div class="category-image-preview">No image</div>';
      if (category.image) {
        imagePreview = `<div class="category-image-preview"><img src="${category.image}" alt="${name}"></div>`;
      }
      
      card.innerHTML = `
        <div class="category-card-header">
          <div class="category-name pixel-text">${name}</div>
          <div class="card-actions">
            <button class="icon-button edit-btn">✎</button>
            <button class="icon-button danger delete-btn">×</button>
          </div>
        </div>
        ${imagePreview}
      `;
      
      card.querySelector('.edit-btn').addEventListener('click', () => this.editCategory(name));
      card.querySelector('.delete-btn').addEventListener('click', () => this.deleteCategory(name));
      
      this.elements.categoriesList.appendChild(card);
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
      
      const propertiesHTML = Object.entries(pick.properties)
        .map(([prop, value]) => `<div class="property-item pixel-text">${prop}: ${value}</div>`)
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
        <div class="pick-properties">
          ${propertiesHTML}
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
