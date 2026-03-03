'use strict';

// Enforce flow: must select template before upload
if (!sessionStorage.getItem('selectedTemplate')) {
  window.location.href = '/templates';
}

// Validation modals
const modalUpload = document.getElementById('modal-upload');
const modalBlank = document.getElementById('modal-blank');
const btnUploadResume = document.getElementById('btn-upload-resume');
const btnStartBlank = document.getElementById('btn-start-blank');
const confirmUpload = document.getElementById('confirm-upload');
const confirmBlank = document.getElementById('confirm-blank');

function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

btnUploadResume?.addEventListener('click', () => openModal('modal-upload'));
btnStartBlank?.addEventListener('click', () => openModal('modal-blank'));

confirmUpload?.addEventListener('click', () => {
  closeModal('modal-upload');
  window.location.href = '/upload/select-source';
});

confirmBlank?.addEventListener('click', () => {
  closeModal('modal-blank');
  sessionStorage.setItem('startBlank', '1');
  sessionStorage.removeItem('parsedResume');
  window.location.href = '/editor';
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

modalUpload?.addEventListener('click', e => {
  if (e.target === modalUpload) closeModal('modal-upload');
});
modalBlank?.addEventListener('click', e => {
  if (e.target === modalBlank) closeModal('modal-blank');
});
