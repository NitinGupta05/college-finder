// Advanced Compare Logic
let selectedColleges = [];

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
      row.innerHTML = `
        <td>
          <div>
            <img src="${college.image}" alt="${college.name}" style="width: 40px; height: 30px; border-radius: 4px; object-fit: cover;">
            ${college.name}
          </div>
        </td>
        <td>${college.location}</td>
        <td>₹${college.fees.toLocaleString()}</td>
        <td class="${college.rating > 4.5 ? 'highlight-best' : ''}">${college.rating}</td>
        <td>${college.type}</td>
        <td><button onclick="Compare.removeItem(${college.id})" class="btn btn-danger btn-sm">Remove</button></td>
      `;
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
    this.renderTable(document.getElementById('compare-table-body'));
  }
};

window.Compare = Compare;  // Global access
