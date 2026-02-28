'use strict';

// Enforce flow: must select template before upload
if (!sessionStorage.getItem('selectedTemplate')) {
  window.location.href = '/templates';
}

const uploadZone      = document.getElementById('upload-zone');
const fileInput       = document.getElementById('resume-file-input');
const progressWrap    = document.getElementById('upload-progress');
const progressFill    = document.getElementById('progress-fill');
const uploadStatus    = document.getElementById('upload-status');
const uploadContent   = document.getElementById('upload-content');
const uploadAttachment = document.getElementById('upload-attachment');
const attachmentFilename = document.getElementById('attachment-filename');
const attachmentSize  = document.getElementById('attachment-size');
const btnChangeFile   = document.getElementById('btn-change-file');
const btnRemoveFile   = document.getElementById('btn-remove-file');
const btnNext         = document.getElementById('btn-next');
const localSection    = document.getElementById('local-section');
const btnLocal        = document.getElementById('btn-local');
const cloudOptions    = document.getElementById('cloud-source-options');
const btnGoogleDrive  = document.getElementById('btn-google-drive');
const btnDropbox      = document.getElementById('btn-dropbox');

let selectedFile = null;

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];
const ALLOWED_EXT = /\.(pdf|docx|doc)$/i;
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function isValidFile(file) {
  if (!file || !file.name) return false;
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.test(file.name)) return false;
  if (file.size > MAX_SIZE) return false;
  return true;
}

function showAttachment(file) {
  selectedFile = file;
  if (uploadZone) uploadZone.style.display = 'none';
  if (uploadAttachment) {
    uploadAttachment.style.display = 'block';
    if (attachmentFilename) attachmentFilename.textContent = file.name;
    if (attachmentSize) attachmentSize.textContent = formatSize(file.size);
  }
  if (btnNext) {
    btnNext.classList.add('visible');
    btnNext.disabled = false;
  }
}

function hideAttachment() {
  selectedFile = null;
  if (fileInput) fileInput.value = '';
  if (uploadZone) uploadZone.style.display = '';
  if (uploadAttachment) uploadAttachment.style.display = 'none';
  if (btnNext) {
    btnNext.classList.remove('visible');
    btnNext.disabled = true;
  }
}

function setProgress(pct, msg) {
  if (progressFill) progressFill.style.width = pct + '%';
  if (uploadStatus) uploadStatus.textContent = msg;
}

function showProgress() {
  if (progressWrap) progressWrap.style.display = 'block';
}

function hideProgress() {
  if (progressWrap) progressWrap.style.display = 'none';
}

// Source selection
btnLocal?.addEventListener('click', () => {
  localSection?.classList.add('visible');
  if (cloudOptions) cloudOptions.style.display = 'none';
});

btnGoogleDrive?.addEventListener('click', () => {
  alert('Google Drive integration is coming soon. Please use "My Computer" to upload from your local drive for now.');
});

btnDropbox?.addEventListener('click', () => {
  alert('Dropbox integration is coming soon. Please use "My Computer" to upload from your local drive for now.');
});

// File upload (local)
uploadZone?.addEventListener('click', (e) => {
  if (e.target.closest('.attachment-btn')) return;
  fileInput?.click();
});

uploadZone?.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone?.classList.add('drag-over');
});

uploadZone?.addEventListener('dragleave', () => {
  uploadZone?.classList.remove('drag-over');
});

uploadZone?.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone?.classList.remove('drag-over');
  const file = e.dataTransfer?.files?.[0];
  if (file) onFileSelected(file);
});

fileInput?.addEventListener('change', () => {
  const file = fileInput?.files?.[0];
  if (file) onFileSelected(file);
});

btnChangeFile?.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput?.click();
});

btnRemoveFile?.addEventListener('click', (e) => {
  e.stopPropagation();
  hideAttachment();
});

function onFileSelected(file) {
  if (!isValidFile(file)) {
    if (!ALLOWED_TYPES.includes(file?.type) && !ALLOWED_EXT.test(file?.name)) {
      alert('Please upload a PDF or DOCX file.');
    } else if (file?.size > MAX_SIZE) {
      alert('File is too large. Max size is 10 MB.');
    }
    return;
  }
  showAttachment(file);
}

function submitFile() {
  if (!selectedFile) return;
  // Pass selected template to server so editor uses it
  const tplInput = document.getElementById('selected-template-input');
  if (tplInput) tplInput.value = sessionStorage.getItem('selectedTemplate') || '';
  // Ensure file is in the input (needed when file came from drag-drop)
  if (fileInput && (fileInput.files.length === 0 || fileInput.files[0] !== selectedFile)) {
    const dt = new DataTransfer();
    dt.items.add(selectedFile);
    fileInput.files = dt.files;
  }
  // Use form submit instead of fetch so the browser handles the redirect.
  // Fetch would follow the redirect and consume the session, then our
  // window.location.href would trigger a second request with empty session.
  btnNext.disabled = true;
  btnNext.innerHTML = 'Extracting…';
  showProgress();
  setProgress(30, `Extracting ${selectedFile.name}…`);
  const overlay = document.getElementById('upload-loading-overlay');
  if (overlay) overlay.classList.add('visible');
  const form = document.getElementById('upload-form');
  if (form) form.submit();
}

btnNext?.addEventListener('click', () => {
  if (selectedFile) submitFile();
});

// Allow drag-drop on attachment area
uploadAttachment?.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadAttachment?.classList.add('drag-over');
});
uploadAttachment?.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadAttachment?.classList.remove('drag-over');
});
uploadAttachment?.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  uploadAttachment?.classList.remove('drag-over');
  const file = e.dataTransfer?.files?.[0];
  if (file) onFileSelected(file);
});
