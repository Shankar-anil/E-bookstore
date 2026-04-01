// Search functionality for E-BookStore
// Handles search on both home and products pages

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.querySelector('.search-btn');

  if (!searchInput) return;

  // Handle search on Enter key
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Handle search button click
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  // Live filtering on products page while typing
  searchInput.addEventListener('input', function() {
    if (isProductsPage()) {
      filterProductsOnPage(searchInput.value);
    }
  });
});

function isProductsPage() {
  return globalThis.location.pathname.toLowerCase().includes('products');
}

function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchQuery = searchInput.value.trim().toLowerCase();

  if (isProductsPage()) {
    if (!searchQuery) {
      filterProductsOnPage('');
      return;
    }

    // Filter products on the products page
    filterProductsOnPage(searchQuery);
  } else {
    if (!searchQuery) {
      alert('Please enter a search term');
      return;
    }

    // Redirect to products page with search query
    globalThis.location.href = `products.html?search=${encodeURIComponent(searchQuery)}`;
  }
}

function getProductSearchText(item) {
  const title = item.querySelector('.book-title, .product-title')?.textContent || '';
  const desc = item.querySelector('.desc, .price')?.textContent || '';
  const imgAlt = item.querySelector('img')?.alt || '';
  const sectionTitle = item.closest('section')?.querySelector('h2')?.textContent || '';
  return `${title} ${desc} ${imgAlt} ${sectionTitle}`.toLowerCase();
}

function toggleEmptyStateMessage(container, searchQuery, matchCount) {
  let noResultsMsg = document.getElementById('search-no-results');

  if (matchCount === 0 && searchQuery) {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.id = 'search-no-results';
      noResultsMsg.style.cssText = 'text-align:center;padding:40px;color:#dbeeff;font-size:18px;';
      container.appendChild(noResultsMsg);
    }
    noResultsMsg.textContent = `No books found matching "${searchQuery}". Try a different search term.`;
    noResultsMsg.style.display = 'block';
  } else if (noResultsMsg) {
    noResultsMsg.style.display = 'none';
  }
}

function filterProductsOnPage(searchQuery) {
  const normalizedQuery = (searchQuery || '').trim().toLowerCase();
  const galleryItems = Array.from(document.querySelectorAll('.image-holder'));
  const sections = Array.from(document.querySelectorAll('.gallery-main section'));
  const mainGallery = document.querySelector('.gallery-main');

  if (!galleryItems.length || !mainGallery) {
    return;
  }

  let matchCount = 0;

  galleryItems.forEach(item => {
    const searchableText = getProductSearchText(item);
    const isMatch = !normalizedQuery || searchableText.includes(normalizedQuery);

    if (isMatch) {
      item.style.display = '';
      matchCount++;
    } else {
      item.style.display = 'none';
    }
  });

  // Hide categories that do not contain any visible cards
  sections.forEach(section => {
    const sectionItems = Array.from(section.querySelectorAll('.image-holder'));
    const hasVisibleItems = sectionItems.some(item => item.style.display !== 'none');
    if (sectionItems.length > 0 && !hasVisibleItems) {
      section.style.display = 'none';
    } else {
      section.style.display = '';
    }
  });

  toggleEmptyStateMessage(mainGallery, normalizedQuery, matchCount);

  if (normalizedQuery) {
    setTimeout(() => {
      document.querySelector('.gallery-main')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}

// Handle search query from URL parameters (when redirected from home page)
function handleSearchFromUrl() {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const searchQuery = urlParams.get('search');

  if (searchQuery && isProductsPage()) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = searchQuery;
      setTimeout(() => filterProductsOnPage(searchQuery), 150);
    }
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', handleSearchFromUrl);
