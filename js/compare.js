// Advanced Compare Logic with XSS protection

let selectedColleges = [];

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

export const Compare = {
  add(collegeId, colleges) {
    const college = colleges.find(c => c.id === collegeId);
    if (college && selectedColleges.length < 3 && !selectedColleges.find(c => c.id === collegeId)) {
      selectedColleges.push(college);
      return true;
    }
    return false;
  },

  remove(collegeId) {
    selectedColleges = selectedColleges.filter(c => c.id !== collegeId);
  },

  getSelected() {
    return selectedColleges;
  },

  clear() {
    selectedColleges = [];
  },

  renderTable(container) {
    container.innerHTML = '';

    selectedColleges.forEach(college => {
      const row = document.createElement('tr');

      // Build cells safely using DOM methods
      const tdName = document.createElement('td');
      const nameWrapper = document.createElement('div');
      nameWrapper.style.cssText = 'display:flex;align-items:center;gap:8px;';
      const img = document.createElement('img');
      img.src = college.image;
      img.alt = college.name;
      img.style.cssText = 'width:40px;height:30px;border-radius:4px;object-fit:cover;';
      const nameText = document.createTextNode(college.name);
      nameWrapper.appendChild(img);
      nameWrapper.appendChild(nameText);
      tdName.appendChild(nameWrapper);

      const tdLocation = document.createElement('td');
      tdLocation.textContent = college.location;

      const tdFees = document.createElement('td');
      tdFees.textContent = `₹${college.fees.toLocaleString()}`;

      const tdRating = document.createElement('td');
      tdRating.textContent = college.rating;
      if (college.rating > 4.5) tdRating.classList.add('highlight-best');

      const tdType = document.createElement('td');
      tdType.textContent = college.type;

      const tdAction = document.createElement('td');
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-danger btn-sm';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        Compare.remove(college.id);
        Compare.renderTable(container);
      });
      tdAction.appendChild(removeBtn);

      row.appendChild(tdName);
      row.appendChild(tdLocation);
      row.appendChild(tdFees);
      row.appendChild(tdRating);
      row.appendChild(tdType);
      row.appendChild(tdAction);
      container.appendChild(row);
    });
  },

  hasBestRating() {
    const maxRating = Math.max(...selectedColleges.map(c => c.rating));
    return selectedColleges.find(c => c.rating === maxRating);
  },

  hasLowestFees() {
    const minFees = Math.min(...selectedColleges.map(c => c.fees));
    return selectedColleges.find(c => c.fees === minFees);
  },

  removeItem(id) {
    this.remove(id);
    const tbody = document.getElementById('compare-table-body');
    if (tbody) this.renderTable(tbody);
  }
};

window.Compare = Compare;
