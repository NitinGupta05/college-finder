// Filtering and Sorting Engine

export function applyFilters(colleges, filters, sortBy) {
  let result = [...colleges];

  // 1. Search (Name)
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(term));
  }

  // 2. Category
  if (filters.category) {
    result = result.filter(c => c.category === filters.category);
  }

  // 3. Type (Govt/Private)
  if (filters.type) {
    result = result.filter(c => c.type === filters.type);
  }

  // 4. Location
  if (filters.location) {
    result = result.filter(c => c.location === filters.location);
  }

  // 5. Entrance Exam
  if (filters.entranceExam && filters.entranceExam.length > 0) {
    result = result.filter(c => filters.entranceExam.includes(c.entranceExam));
  }

  // 6. Accreditation
  if (filters.accreditation && filters.accreditation.length > 0) {
    result = result.filter(c => filters.accreditation.includes(c.accreditation));
  }

  // 7. Facilities (all selected facilities must be in college)
  if (filters.facilities && filters.facilities.length > 0) {
    result = result.filter(c =>
      filters.facilities.every(f => c.facilities && c.facilities.includes(f))
    );
  }

  // 8. Ranges
  result = result.filter(c => c.rating >= filters.minRating);
  result = result.filter(c => c.placement >= filters.minPlacement);
  result = result.filter(c => c.infrastructure >= filters.minInfrastructure);
  result = result.filter(c => c.fees >= filters.minFees);
  if (filters.maxFees) {
    result = result.filter(c => c.fees <= filters.maxFees);
  }

  // 9. Sorting
  if (sortBy === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'fees') {
    result.sort((a, b) => a.fees - b.fees);
  } else if (sortBy === 'placement') {
    result.sort((a, b) => b.placement - a.placement);
  }

  return result;
}