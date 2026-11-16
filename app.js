/**
 * DHRUV VASAVA — HUMAN PHOTOGRAPHER
 * Minimalist Black & White / Documentary Photography Portfolio Engine
 * Exact Franklin Yeep Architecture with Visual Masonry, Passe-Partout Lightbox,
 * Real-time Inline Editing, Drag-and-Drop Image Reordering & Resilient Storage.
 */

const DB_NAME = 'DhruvVasavaPortfolioDB_v5';
const DB_VERSION = 1;
const STORE_NAME = 'siteData';

// Resilient Storage: IndexedDB with automatic LocalStorage fallback and timeout protection
class Storage {
  constructor() {
    this.db = null;
    this.useLocalStorage = false;
  }

  async init() {
    return new Promise((resolve) => {
      try {
        if (!window.indexedDB) {
          this.useLocalStorage = true;
          return resolve(null);
        }

        let settled = false;
        const safetyTimer = setTimeout(() => {
          if (!settled) {
            settled = true;
            this.useLocalStorage = true;
            resolve(null);
          }
        }, 800);

        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = (e) => {
          if (!settled) {
            settled = true;
            clearTimeout(safetyTimer);
            this.db = e.target.result;
            resolve(this.db);
          }
        };
        req.onerror = () => {
          if (!settled) {
            settled = true;
            clearTimeout(safetyTimer);
            this.useLocalStorage = true;
            resolve(null);
          }
        };
        req.onblocked = () => {
          if (!settled) {
            settled = true;
            clearTimeout(safetyTimer);
            this.useLocalStorage = true;
            resolve(null);
          }
        };
      } catch (err) {
        this.useLocalStorage = true;
        resolve(null);
      }
    });
  }

  async get(key) {
    if (!this.db && !this.useLocalStorage) await this.init();
    if (this.useLocalStorage) {
      try {
        const item = localStorage.getItem(`${DB_NAME}_${key}`);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return null;
      }
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([STORE_NAME], 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async set(key, val) {
    if (!this.db && !this.useLocalStorage) await this.init();
    if (this.useLocalStorage) {
      try {
        localStorage.setItem(`${DB_NAME}_${key}`, JSON.stringify(val));
        return true;
      } catch (e) {
        return false;
      }
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        const req = tx.objectStore(STORE_NAME).put(val, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async clear() {
    if (!this.db && !this.useLocalStorage) await this.init();
    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(`${DB_NAME}_state`);
      } catch (e) {}
      return true;
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        const req = tx.objectStore(STORE_NAME).clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }
}

const storage = new Storage();

// Utility: Read dropped or selected files as base64 Data URLs
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e.target.error);
    reader.readAsDataURL(file);
  });
}

// Default Page Directory
const DEFAULT_PAGES = [
  { id: 'best', title: 'Best', type: 'gallery' },
  { id: 'wedding', title: 'Wedding', type: 'gallery' },
  { id: 'concerts', title: 'Concerts', type: 'gallery' },
  { id: 'people', title: 'People', type: 'gallery' },
  { id: 'places', title: 'Places', type: 'gallery' },
  { id: 'things', title: 'Things', type: 'gallery' },
  { id: 'newborn', title: 'Newborn', type: 'gallery' },
  { id: 'family', title: 'Family', type: 'gallery' },
  { id: 'kids', title: 'Kids', type: 'gallery' },
  { id: 'about-contact', title: 'About / Contact', type: 'about' }
];

// Pre-seeded galleries with Dhruv's actual high-resolution photography assets
const DEFAULT_GALLERIES = {
  best: [
    { id: 'img-b1', src: 'images/showcase-wedding.jpg', title: 'Bridal Euphoria' },
    { id: 'img-b2', src: 'images/showcase-concerts.jpg', title: 'Electric Symphony' },
    { id: 'img-b3', src: 'images/wedding-couple.jpg', title: 'The Vow' },
    { id: 'img-b4', src: 'images/concert-singer.jpg', title: 'Raw Frequency' },
    { id: 'img-b5', src: 'images/wedding-bride-portrait.jpg', title: 'Quiet Grace' },
    { id: 'img-b6', src: 'images/concert-drummer.jpg', title: 'Pulse & Cadence' },
    { id: 'img-b7', src: 'images/wedding-ceremony.jpg', title: 'Sacred Ritual' },
    { id: 'img-b8', src: 'images/concert-guitarist.jpg', title: 'Rhythm in Smoke' }
  ],
  wedding: [
    { id: 'img-w1', src: 'images/wedding-couple.jpg', title: 'The Vow' },
    { id: 'img-w2', src: 'images/wedding-bride-portrait.jpg', title: 'Quiet Grace' },
    { id: 'img-w3', src: 'images/wedding-ceremony.jpg', title: 'Sacred Ritual' },
    { id: 'img-w4', src: 'images/showcase-wedding.jpg', title: 'Bridal Euphoria' }
  ],
  concerts: [
    { id: 'img-c1', src: 'images/concert-singer.jpg', title: 'Raw Frequency' },
    { id: 'img-c2', src: 'images/concert-guitarist.jpg', title: 'Rhythm in Smoke' },
    { id: 'img-c3', src: 'images/concert-drummer.jpg', title: 'Pulse & Cadence' },
    { id: 'img-c4', src: 'images/concert-lights-laser.jpg', title: 'Laser Horizons' },
    { id: 'img-c5', src: 'images/concert-lights-blue.jpg', title: 'Nocturne Glow' },
    { id: 'img-c6', src: 'images/showcase-concerts.jpg', title: 'Electric Symphony' }
  ],
  people: [
    { id: 'img-p1', src: 'images/wedding-bride-portrait.jpg', title: 'Quiet Grace' },
    { id: 'img-p2', src: 'images/concert-singer.jpg', title: 'Raw Frequency' },
    { id: 'img-p3', src: 'images/wedding-couple.jpg', title: 'The Vow' }
  ],
  places: [
    { id: 'img-pl1', src: 'images/concert-lights-laser.jpg', title: 'Laser Horizons' },
    { id: 'img-pl2', src: 'images/concert-lights-blue.jpg', title: 'Nocturne Glow' }
  ],
  things: [
    { id: 'img-t1', src: 'images/concert-drummer.jpg', title: 'Pulse & Cadence' },
    { id: 'img-t2', src: 'images/concert-guitarist.jpg', title: 'Rhythm in Smoke' }
  ],
  newborn: [],
  family: [],
  kids: []
};

// Franklin Yeep About/Contact Editorial Data
const DEFAULT_ABOUT = {
  photos: [
    'images/wedding-bride-portrait.jpg',
    'images/concert-singer.jpg'
  ],
  bioParagraph1: `Dhruv Vasava is a human and documentary photographer capturing candid stillness, raw emotion, and genuine character through analog and digital mediums.`,
  bioParagraph2: `Everything from conceptualization to framing is approached with a deliberate, slow pace that gives subjects room to breathe and reveal their unguarded truth, whether in private celebrations or live performance environments.`,
  email: 'dhruv@vasavaphoto.com',
  instagram: '@dhruvkahanhai',
  location: 'Available Worldwide',
  awards: [
    'International Photography Awards (IPA) Portrait — Finalist',
    'Portrait of Humanity — Selected Work',
    'LensCulture Portrait Awards — Editor\'s Pick',
    'Fine Art Photography Awards — Honorable Mention'
  ],
  press: [
    'Vogue Culture, Rolling Stone, Leica Fotografie International, DEHAZED Magazine.'
  ],
  exhibitions: [
    'Group Showcase, Mumbai, 2024',
    'Timeless Monochrome, Paris, 2023'
  ]
};

// Application State
let state = {
  currentPage: 'best',
  isEditMode: false,
  pages: JSON.parse(JSON.stringify(DEFAULT_PAGES)),
  galleries: JSON.parse(JSON.stringify(DEFAULT_GALLERIES)),
  about: JSON.parse(JSON.stringify(DEFAULT_ABOUT)),
  lightboxIndex: 0
};

// Fast Synchronous Initialization: renders immediately so UI is 100% visible on load
function initApp() {
  // Handle URL hash routing
  const hash = window.location.hash.replace('#', '');
  if (hash && state.pages.some((p) => p.id === hash)) {
    state.currentPage = hash;
  }

  // RENDER IMMEDIATELY: zero wait, zero blank screen
  setupEventListeners();
  renderSidebar();
  renderCurrentView();
  setupGlobalDragAndDrop();

  // Load saved state in background
  loadSavedState();
}

async function loadSavedState() {
  try {
    const saved = await Promise.race([
      storage.get('state'),
      new Promise((res) => setTimeout(() => res(null), 1200))
    ]);

    if (saved && saved.galleries) {
      const hasAnyPhotos = Object.values(saved.galleries).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );
      if (hasAnyPhotos) {
        state.pages = saved.pages && saved.pages.length ? saved.pages : state.pages;
        state.galleries = saved.galleries;
        state.about = saved.about || state.about;
        renderSidebar();
        renderCurrentView();
      }
    }
  } catch (err) {
    console.warn('Could not load saved state:', err);
  }
}

async function persist() {
  try {
    await storage.set('state', {
      pages: state.pages,
      galleries: state.galleries,
      about: state.about
    });
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Render Left Navigation Sidebar
function renderSidebar() {
  const menuEl = document.getElementById('navMenu');
  if (!menuEl) return;
  menuEl.innerHTML = '';

  state.pages.forEach((page) => {
    const li = document.createElement('li');
    li.className = `nav-item ${page.id === state.currentPage ? 'selected' : ''}`;

    const a = document.createElement('a');
    a.href = `#${page.id}`;
    a.className = 'nav-link';
    a.textContent = page.title;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      switchPage(page.id);
    });

    li.appendChild(a);

    // Allow deleting custom or secondary pages in edit mode (keep Best & About/Contact permanent)
    if (page.id !== 'best' && page.id !== 'about-contact') {
      const del = document.createElement('button');
      del.className = 'nav-del-btn';
      del.innerHTML = '&times;';
      del.title = `Delete ${page.title}`;
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        deletePage(page.id, page.title);
      });
      li.appendChild(del);
    }

    menuEl.appendChild(li);
  });
}

// Switch Page View
function switchPage(pageId) {
  state.currentPage = pageId;
  if (window.location.hash !== `#${pageId}`) {
    window.location.hash = pageId;
  }
  renderSidebar();
  renderCurrentView();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const nav = document.getElementById('navWrapper');
  if (nav) nav.classList.remove('open');
}

// Render Main Viewport
function renderCurrentView() {
  const galleryWrap = document.getElementById('galleryContainer');
  const aboutWrap = document.getElementById('aboutContainer');

  const page = state.pages.find((p) => p.id === state.currentPage);
  if (page && page.type === 'about') {
    galleryWrap.style.display = 'none';
    aboutWrap.style.display = 'block';
    renderAboutView();
  } else {
    aboutWrap.style.display = 'none';
    galleryWrap.style.display = 'block';
    renderMasonryGallery();
  }
}

// 2-Column Uncropped Masonry Grid
function renderMasonryGallery() {
  const grid = document.getElementById('masonryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const photos = state.galleries[state.currentPage] || [];

  if (photos.length === 0) {
    grid.innerHTML = `
      <div class="empty-gallery-notice" onclick="document.getElementById('fileInput').click()">
        <h3>${state.currentPage.toUpperCase()}</h3>
        <p>This gallery is empty. Drag and drop photographs directly onto this screen.</p>
        <button class="upload-pill-btn" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Select Images to Upload
        </button>
      </div>
    `;
    return;
  }

  const col1 = document.createElement('div');
  col1.className = 'masonry-column';
  const col2 = document.createElement('div');
  col2.className = 'masonry-column';

  // Support column dragover/drop
  [col1, col2].forEach((col) => {
    col.addEventListener('dragover', (e) => {
      if (draggedIdx !== null) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    });
    col.addEventListener('drop', async (e) => {
      if (draggedIdx !== null && e.target === col) {
        e.preventDefault();
        e.stopPropagation();
        const galleryPhotos = state.galleries[state.currentPage];
        const [moved] = galleryPhotos.splice(draggedIdx, 1);
        galleryPhotos.push(moved);
        await persist();
        renderMasonryGallery();
        toast('Image repositioned');
      }
    });
  });

  grid.appendChild(col1);
  grid.appendChild(col2);

  photos.forEach((photo, idx) => {
    const card = createPhotoCard(photo, idx);
    if (idx % 2 === 0) col1.appendChild(card);
    else col2.appendChild(card);
  });
}

let isDraggingActive = false;
let draggedIdx = null;

// Create individual photo card
function createPhotoCard(photo, index) {
  const card = document.createElement('div');
  card.className = 'asset';
  card.dataset.index = index;
  card.setAttribute('draggable', state.isEditMode ? 'true' : 'false');

  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.title || 'Photograph by Dhruv Vasava';
  img.loading = 'lazy';
  card.appendChild(img);

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  card.appendChild(overlay);

  // Edit controls: only shown when Edit Mode is active
  if (state.isEditMode) {
    const actions = document.createElement('div');
    actions.className = 'asset-actions';

    const upBtn = document.createElement('button');
    upBtn.className = 'asset-action-btn';
    upBtn.innerHTML = '▲';
    upBtn.title = 'Move Up';
    upBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      movePhotoUp(index);
    });
    actions.appendChild(upBtn);

    const downBtn = document.createElement('button');
    downBtn.className = 'asset-action-btn';
    downBtn.innerHTML = '▼';
    downBtn.title = 'Move Down';
    downBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      movePhotoDown(index);
    });
    actions.appendChild(downBtn);

    const del = document.createElement('button');
    del.className = 'asset-action-btn delete';
    del.innerHTML = '&times;';
    del.title = 'Remove';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePhoto(index);
    });
    actions.appendChild(del);
    card.appendChild(actions);
  }

  // Click opens lightbox only in Visitor Mode (or when not dragging)
  card.addEventListener('click', () => {
    if (!isDraggingActive && !state.isEditMode) {
      openLightbox(index);
    }
  });

  setupReorder(card, index);
  return card;
}

// Lightbox: White Matted Frame (Passe-Partout)
function openLightbox(index) {
  const photos = state.galleries[state.currentPage] || [];
  if (photos.length === 0) return;

  state.lightboxIndex = (index + photos.length) % photos.length;
  const photo = photos[state.lightboxIndex];

  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');

  if (img && modal) {
    img.src = photo.src;
    img.alt = photo.title || 'Fine-art photograph';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function nextPhoto() {
  const photos = state.galleries[state.currentPage] || [];
  if (photos.length) openLightbox(state.lightboxIndex + 1);
}

function prevPhoto() {
  const photos = state.galleries[state.currentPage] || [];
  if (photos.length) openLightbox(state.lightboxIndex - 1);
}

// Drag & Drop Image Uploader
function setupGlobalDragAndDrop() {
  const overlay = document.getElementById('globalDragOverlay');
  let counter = 0;

  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    counter++;
    if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      if (overlay) overlay.classList.add('active');
    }
  });

  window.addEventListener('dragover', (e) => e.preventDefault());

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    counter--;
    if (counter <= 0) {
      counter = 0;
      if (overlay) overlay.classList.remove('active');
    }
  });

  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    counter = 0;
    if (overlay) overlay.classList.remove('active');

    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  });

  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files.length) {
        await uploadFiles(e.target.files);
        e.target.value = '';
      }
    });
  }
}

// Upload & Append Files
async function uploadFiles(files) {
  // If user dropped files while in visitor mode, smoothly enable edit mode
  if (!state.isEditMode) {
    toggleEditMode();
  }

  const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
  if (imageFiles.length === 0) {
    toast('Please drop valid images (.jpg, .png, .webp)');
    return;
  }

  // If on About/Contact page, upload to About photos
  if (state.currentPage === 'about-contact') {
    toast(`Adding ${imageFiles.length} photo${imageFiles.length > 1 ? 's' : ''} to About page...`);
    for (const file of imageFiles) {
      if (state.about.photos.length >= 3) {
        toast('Maximum 3 photos on About page reached');
        break;
      }
      const dataUrl = await readFile(file);
      state.about.photos.push(dataUrl);
    }
    await persist();
    renderAboutView();
    toast('About photos updated!');
    return;
  }

  const target = state.currentPage;
  toast(`Adding ${imageFiles.length} photo${imageFiles.length > 1 ? 's' : ''}...`);

  for (const file of imageFiles) {
    const dataUrl = await readFile(file);
    const item = {
      id: 'img-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      src: dataUrl,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    };
    if (!state.galleries[target]) state.galleries[target] = [];
    state.galleries[target].unshift(item);
  }

  await persist();
  renderMasonryGallery();
  toast(`Added ${imageFiles.length} photo(s) to ${target.toUpperCase()}`);
}

// Drag to Reorder Photos in Galleries
function setupReorder(card, idx) {
  card.addEventListener('dragstart', (e) => {
    draggedIdx = idx;
    isDraggingActive = true;
    card.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('is-dragging');
    document.querySelectorAll('.asset').forEach((el) => {
      el.classList.remove('drop-target-top', 'drop-target-bottom');
    });
    draggedIdx = null;
    setTimeout(() => {
      isDraggingActive = false;
    }, 120);
  });

  card.addEventListener('dragover', (e) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = card.getBoundingClientRect();
    const isTop = (e.clientY - rect.top) < (rect.height / 2);
    card.classList.toggle('drop-target-top', isTop);
    card.classList.toggle('drop-target-bottom', !isTop);
  });

  card.addEventListener('dragleave', () => {
    card.classList.remove('drop-target-top', 'drop-target-bottom');
  });

  card.addEventListener('drop', async (e) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    e.stopPropagation();
    card.classList.remove('drop-target-top', 'drop-target-bottom');

    if (draggedIdx === idx) return;

    const rect = card.getBoundingClientRect();
    const isTop = (e.clientY - rect.top) < (rect.height / 2);

    let targetIdx = isTop ? idx : idx + 1;

    const photos = state.galleries[state.currentPage];
    const [moved] = photos.splice(draggedIdx, 1);
    if (draggedIdx < targetIdx) targetIdx--;
    photos.splice(targetIdx, 0, moved);

    await persist();
    renderMasonryGallery();
    toast('Image placed');
  });
}

// Move Up / Down
window.movePhotoUp = async function(idx) {
  if (idx <= 0) return;
  const photos = state.galleries[state.currentPage];
  const [p] = photos.splice(idx, 1);
  photos.splice(idx - 1, 0, p);
  await persist();
  renderMasonryGallery();
  toast('Moved up');
};

window.movePhotoDown = async function(idx) {
  const photos = state.galleries[state.currentPage];
  if (idx >= photos.length - 1) return;
  const [p] = photos.splice(idx, 1);
  photos.splice(idx + 1, 0, p);
  await persist();
  renderMasonryGallery();
  toast('Moved down');
};

async function deletePhoto(index) {
  if (confirm('Remove this photograph?')) {
    state.galleries[state.currentPage].splice(index, 1);
    await persist();
    renderMasonryGallery();
    toast('Photo removed');
  }
}

// ==========================================
// FRANKLIN YEEP ABOUT / CONTACT VIEW
// ==========================================
function renderAboutView() {
  const container = document.getElementById('aboutContainer');
  if (!container) return;
  const a = state.about;

  // Build photo cards for 1, 2, or 3 pictures
  let photoHtml = '';
  a.photos.forEach((photoSrc, idx) => {
    const editActions = state.isEditMode ? `
      <div class="asset-actions" style="display: flex;">
        <button class="asset-action-btn" onclick="moveAboutPhotoUp(${idx})" title="Move Up">▲</button>
        <button class="asset-action-btn" onclick="moveAboutPhotoDown(${idx})" title="Move Down">▼</button>
        <button class="asset-action-btn delete" onclick="removeAboutPhoto(${idx})" title="Remove photo">&times;</button>
      </div>
    ` : '';

    photoHtml += `
      <div class="about-photo-card" draggable="${state.isEditMode ? 'true' : 'false'}" ondragstart="aboutPhotoDragStart(event, ${idx})" ondragover="aboutPhotoDragOver(event)" ondrop="aboutPhotoDrop(event, ${idx})">
        <img src="${photoSrc}" alt="Dhruv Vasava">
        ${editActions}
      </div>
    `;
  });

  // If in edit mode and fewer than 3 photos, show "+ Add Picture" dropzone
  let addZoneHtml = '';
  if (state.isEditMode && a.photos.length < 3) {
    addZoneHtml = `
      <div class="add-about-photo-zone" onclick="document.getElementById('aboutFileInput').click()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 6px; display: block; margin-inline: auto;">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <strong>+ Upload Picture of Yourself</strong>
        <div style="font-size: 11px; color: #666; margin-top: 3px;">Drop or click (${a.photos.length}/3 photos added)</div>
      </div>
    `;
  }

  const isEditable = state.isEditMode ? 'true' : 'false';

  container.innerHTML = `
    <div class="about-page-container">
      <!-- Hidden file input specifically for About photos -->
      <input type="file" id="aboutFileInput" accept="image/*" style="display: none;">

      <!-- SECTION 1: Photos & Biography -->
      <div class="about-bio-row">
        <div class="about-photos-container">
          ${photoHtml}
          ${addZoneHtml}
        </div>

        <div class="about-text-column">
          <p class="bio-paragraph" id="bioP1" contenteditable="${isEditable}" title="${state.isEditMode ? 'Click to edit text' : ''}">${a.bioParagraph1}</p>
          <p class="bio-paragraph" id="bioP2" contenteditable="${isEditable}" title="${state.isEditMode ? 'Click to edit text' : ''}">${a.bioParagraph2}</p>
        </div>
      </div>

      <!-- SECTION 2: Contact Module -->
      <div class="about-contact-row">
        <div class="contact-left-col">
          <h2>Get In Touch</h2>
          <div class="contact-info-list">
            <div>
              <span style="color: #777;">Instagram:</span> 
              <a href="https://instagram.com/${a.instagram.replace('@', '')}" target="_blank" rel="noopener" id="aboutInsta" contenteditable="${isEditable}">${a.instagram}</a>
            </div>
            <div>
              <span style="color: #777;">Email:</span> 
              <a href="mailto:${a.email}" id="aboutEmail" contenteditable="${isEditable}">${a.email}</a>
            </div>
            <div style="color: #777;" id="aboutLocation" contenteditable="${isEditable}">${a.location}</div>
          </div>
        </div>

        <div class="contact-right-col">
          <form class="contact-form" id="contactForm" onsubmit="handleContactSubmit(event)">
            <div class="form-group">
              <label for="contactName">Name</label>
              <input type="text" id="contactName" required autocomplete="name" placeholder="Your Name">
            </div>

            <div class="form-group">
              <label for="contactEmail">Email</label>
              <input type="email" id="contactEmail" required autocomplete="email" placeholder="your@email.com">
            </div>

            <div class="form-group">
              <label for="contactMessage">Message</label>
              <textarea id="contactMessage" rows="5" required placeholder="How can I help you?"></textarea>
            </div>

            <button type="submit" class="form-submit-btn">Send Message</button>
          </form>
        </div>
      </div>

      <!-- SECTION 3: Awards, Press & Exhibitions -->
      <div class="about-awards-row">
        <div class="awards-block">
          <h3>Awards & Recognition</h3>
          <ul class="awards-list" id="awardsList">
            ${a.awards.map((item, i) => `<li contenteditable="${isEditable}" onblur="saveAwardItem(${i}, this.innerText)">${item}</li>`).join('')}
          </ul>
        </div>

        <div class="awards-block">
          <h3>Featured In</h3>
          <ul class="awards-list">
            ${a.press.map((item, i) => `<li contenteditable="${isEditable}" onblur="savePressItem(${i}, this.innerText)">${item}</li>`).join('')}
          </ul>
        </div>

        <div class="awards-block">
          <h3>Exhibitions</h3>
          <ul class="awards-list">
            ${a.exhibitions.map((item, i) => `<li contenteditable="${isEditable}" onblur="saveExhibitionItem(${i}, this.innerText)">${item}</li>`).join('')}
          </ul>
        </div>
      </div>

    </div>
  `;

  // Bind About File Input
  const aboutInp = document.getElementById('aboutFileInput');
  if (aboutInp) {
    aboutInp.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files.length) {
        await uploadFiles(e.target.files);
        e.target.value = '';
      }
    });
  }

  // Bind inline text editing auto-save handlers
  if (state.isEditMode) {
    const bindSave = (id, prop) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('blur', () => {
          state.about[prop] = el.innerText.trim();
          persist();
          toast('Changes saved');
        });
      }
    };

    bindSave('bioP1', 'bioParagraph1');
    bindSave('bioP2', 'bioParagraph2');
    bindSave('aboutEmail', 'email');
    bindSave('aboutInsta', 'instagram');
    bindSave('aboutLocation', 'location');
  }
}

// Remove About photo
window.removeAboutPhoto = async function(index) {
  state.about.photos.splice(index, 1);
  await persist();
  renderAboutView();
  toast('Photo removed from About page');
};

let draggedAboutIdx = null;
window.aboutPhotoDragStart = function(e, idx) {
  if (!state.isEditMode) return;
  draggedAboutIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
};

window.aboutPhotoDragOver = function(e) {
  if (draggedAboutIdx !== null) e.preventDefault();
};

window.aboutPhotoDrop = async function(e, targetIdx) {
  if (draggedAboutIdx === null || draggedAboutIdx === targetIdx) return;
  e.preventDefault();
  const [p] = state.about.photos.splice(draggedAboutIdx, 1);
  state.about.photos.splice(targetIdx, 0, p);
  draggedAboutIdx = null;
  await persist();
  renderAboutView();
  toast('Photo repositioned');
};

window.moveAboutPhotoUp = async function(idx) {
  if (idx <= 0) return;
  const [p] = state.about.photos.splice(idx, 1);
  state.about.photos.splice(idx - 1, 0, p);
  await persist();
  renderAboutView();
  toast('Photo moved up');
};

window.moveAboutPhotoDown = async function(idx) {
  if (idx >= state.about.photos.length - 1) return;
  const [p] = state.about.photos.splice(idx, 1);
  state.about.photos.splice(idx + 1, 0, p);
  await persist();
  renderAboutView();
  toast('Photo moved down');
};

// Save award item
window.saveAwardItem = async function(idx, text) {
  state.about.awards[idx] = text.trim();
  await persist();
  toast('Award updated');
};

window.savePressItem = async function(idx, text) {
  state.about.press[idx] = text.trim();
  await persist();
  toast('Press updated');
};

window.saveExhibitionItem = async function(idx, text) {
  state.about.exhibitions[idx] = text.trim();
  await persist();
  toast('Exhibition updated');
};

// Handle Contact Form Submit
window.handleContactSubmit = function(e) {
  e.preventDefault();
  const nameEl = document.getElementById('contactName');
  const name = nameEl ? nameEl.value : 'friend';
  toast(`Thank you, ${name}! Your message has been sent.`);
  const form = document.getElementById('contactForm');
  if (form) form.reset();
};

// Create New Page Modal
function openNewPageModal() {
  const m = document.getElementById('newPageModal');
  const inp = document.getElementById('newPageInput');
  if (inp) inp.value = '';
  if (m) {
    m.classList.add('active');
    setTimeout(() => { if (inp) inp.focus(); }, 50);
  }
}

function closeNewPageModal() {
  const m = document.getElementById('newPageModal');
  if (m) m.classList.remove('active');
}

async function handleCreatePage() {
  const inp = document.getElementById('newPageInput');
  if (!inp) return;
  const title = inp.value.trim();
  if (!title) {
    alert('Please enter a title for the new page');
    return;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!slug) {
    alert('Invalid page title');
    return;
  }

  if (state.pages.some((p) => p.id === slug)) {
    alert('A page with this name already exists');
    return;
  }

  const newP = { id: slug, title: title, type: 'gallery' };
  const aboutIdx = state.pages.findIndex((p) => p.id === 'about-contact');
  if (aboutIdx !== -1) {
    state.pages.splice(aboutIdx, 0, newP);
  } else {
    state.pages.push(newP);
  }

  state.galleries[slug] = [];
  await persist();
  closeNewPageModal();
  switchPage(slug);
  toast(`Created page "${title}"`);
}

async function deletePage(id, title) {
  if (confirm(`Delete page "${title}"?`)) {
    state.pages = state.pages.filter((p) => p.id !== id);
    delete state.galleries[id];
    if (state.currentPage === id) switchPage('best');
    await persist();
    renderSidebar();
    renderCurrentView();
    toast(`Deleted "${title}"`);
  }
}

// Toggle Edit Mode
function toggleEditMode() {
  state.isEditMode = !state.isEditMode;
  document.body.classList.toggle('edit-mode', state.isEditMode);

  const btnText = document.getElementById('modeBtnText');
  if (btnText) {
    btnText.textContent = state.isEditMode ? 'Editor ON' : 'Editor OFF';
  }

  renderSidebar();
  renderCurrentView();
  toast(state.isEditMode ? 'Editor Mode ON' : 'Visitor Mode (Clean Portfolio View)');
}

// Export & Reset
function exportBackup() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dhruv-vasava-portfolio-backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Backup downloaded');
}

async function resetAll() {
  if (confirm('Clear custom changes and restore standard photography showcase?')) {
    await storage.clear();
    state.pages = JSON.parse(JSON.stringify(DEFAULT_PAGES));
    state.galleries = JSON.parse(JSON.stringify(DEFAULT_GALLERIES));
    state.about = JSON.parse(JSON.stringify(DEFAULT_ABOUT));
    state.currentPage = 'best';
    await persist();
    renderSidebar();
    renderCurrentView();
    toast('Showcase restored');
  }
}

function toast(msg) {
  let container = document.getElementById('toastBox');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastBox';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// Global Event Listeners
function setupEventListeners() {
  const modal = document.getElementById('lightboxModal');
  const close = document.getElementById('close');
  const next = document.getElementById('lightboxNext');
  const prev = document.getElementById('lightboxPrev');

  if (close) close.addEventListener('click', closeLightbox);
  if (next) next.addEventListener('click', nextPhoto);
  if (prev) prev.addEventListener('click', prevPhoto);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (modal && modal.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    }
    const newPageModal = document.getElementById('newPageModal');
    if (newPageModal && newPageModal.classList.contains('active')) {
      if (e.key === 'Escape') closeNewPageModal();
    }
    if (e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      toggleEditMode();
    }
  });

  // URL Hash change navigation (browser back/forward button support)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && state.pages.some((p) => p.id === hash) && state.currentPage !== hash) {
      switchPage(hash);
    }
  });

  // Brand and Mobile Header click returns to Best
  const brandLinks = document.querySelectorAll('.brand-text, .mobile-brand');
  brandLinks.forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      switchPage('best');
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navWrapper = document.getElementById('navWrapper');
  if (mobileToggle && navWrapper) {
    mobileToggle.addEventListener('click', () => {
      navWrapper.classList.toggle('open');
    });
  }

  // Admin Dock controls
  const modeBtn = document.getElementById('modeToggleBtn');
  if (modeBtn) modeBtn.addEventListener('click', toggleEditMode);

  const btnUpload = document.getElementById('btnUpload');
  if (btnUpload) {
    btnUpload.addEventListener('click', () => {
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.click();
    });
  }

  const btnNewPage = document.getElementById('btnNewPage');
  if (btnNewPage) btnNewPage.addEventListener('click', openNewPageModal);

  const btnSideAddPage = document.getElementById('btnSideAddPage');
  if (btnSideAddPage) btnSideAddPage.addEventListener('click', openNewPageModal);

  const btnExport = document.getElementById('btnExport');
  if (btnExport) btnExport.addEventListener('click', exportBackup);

  const btnReset = document.getElementById('btnReset');
  if (btnReset) btnReset.addEventListener('click', resetAll);

  // New Page Modal Actions
  const newPageModal = document.getElementById('newPageModal');
  if (newPageModal) {
    newPageModal.addEventListener('click', (e) => {
      if (e.target === newPageModal) closeNewPageModal();
    });
  }

  const newPageCancel = document.getElementById('newPageCancel');
  if (newPageCancel) newPageCancel.addEventListener('click', closeNewPageModal);

  const newPageSubmit = document.getElementById('newPageSubmit');
  if (newPageSubmit) newPageSubmit.addEventListener('click', handleCreatePage);

  const inp = document.getElementById('newPageInput');
  if (inp) {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCreatePage();
      if (e.key === 'Escape') closeNewPageModal();
    });
  }
}

// Launch on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
