'use strict';

// ===== モーダル =====
const overlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalMemo = document.getElementById('modal-memo');
const modalDue = document.getElementById('modal-due');
const modalDelete = document.getElementById('modal-delete');

let currentCard = null;

function openModal(card) {
  currentCard = card;
  const title = card.querySelector('.card-title').textContent;
  const due = card.querySelector('.card-due').textContent.replace('📅 ', '').trim();

  modalTitle.value = title;
  modalMemo.value = '';
  modalDue.value = due ? due.replace(/\//g, '-') : '';

  // ラベル選択状態を復元
  const chips = card.querySelectorAll('.label-chip');
  const activeColors = new Set();
  chips.forEach(chip => {
    const color = colorFromBg(chip.style.background);
    if (color) activeColors.add(color);
  });
  document.querySelectorAll('.label-btn').forEach(btn => {
    btn.classList.toggle('selected', activeColors.has(btn.dataset.color));
  });

  overlay.classList.remove('hidden');
  modalTitle.focus();
}

function closeModal() {
  if (!currentCard) return;

  // タイトルを反映
  const newTitle = modalTitle.value.trim();
  if (newTitle) currentCard.querySelector('.card-title').textContent = newTitle;

  // 期限日を反映
  const dueEl = currentCard.querySelector('.card-due');
  const dueVal = modalDue.value;
  if (dueVal) {
    const formatted = dueVal.replace(/-/g, '/');
    dueEl.textContent = '📅 ' + formatted;
    dueEl.className = 'card-due ' + getDueClass(dueVal);
  } else {
    dueEl.textContent = '';
    dueEl.className = 'card-due';
  }

  // ラベルを反映
  const labelsEl = currentCard.querySelector('.card-labels');
  labelsEl.innerHTML = '';
  document.querySelectorAll('.label-btn.selected').forEach(btn => {
    const chip = document.createElement('span');
    chip.className = 'label-chip';
    chip.style.background = btn.style.background;
    labelsEl.appendChild(chip);
  });

  overlay.classList.add('hidden');
  currentCard = null;
}

function getDueClass(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  if (due < today) return 'overdue';
  if (due.getTime() === today.getTime()) return 'today';
  return '';
}

const colorMap = {
  'rgb(248, 113, 113)': 'red',
  'rgb(251, 191, 36)': 'yellow',
  'rgb(52, 211, 153)': 'green',
  'rgb(96, 165, 250)': 'blue',
  'rgb(167, 139, 250)': 'purple',
};
function colorFromBg(bg) { return colorMap[bg] || null; }

// カードクリックでモーダルを開く
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => openModal(card));
});

// ✕ボタン・オーバーレイクリックで閉じる
modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

// カード削除
modalDelete.addEventListener('click', () => {
  if (currentCard) currentCard.remove();
  overlay.classList.add('hidden');
  currentCard = null;
});

// ラベルトグル
document.querySelectorAll('.label-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('selected'));
});


// ===== カード追加 =====
document.querySelectorAll('.add-card-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const list = btn.closest('.list');
    if (list.querySelector('.inline-input-wrap')) return;

    btn.style.display = 'none';

    const wrap = document.createElement('div');
    wrap.className = 'inline-input-wrap';
    wrap.innerHTML = `
      <textarea class="inline-input" placeholder="タイトルを入力..." rows="2"></textarea>
      <div class="inline-actions">
        <button class="btn-primary">追加</button>
        <button class="btn-cancel">✕</button>
      </div>
    `;

    list.insertBefore(wrap, btn);
    const input = wrap.querySelector('.inline-input');
    input.focus();

    function addCard() {
      const title = input.value.trim();
      if (title) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-labels"></div>
          <div class="card-title">${escapeHtml(title)}</div>
          <div class="card-due"></div>
        `;
        card.addEventListener('click', () => openModal(card));
        list.querySelector('.cards').appendChild(card);
      }
      cancelAdd();
    }

    function cancelAdd() {
      wrap.remove();
      btn.style.display = '';
    }

    wrap.querySelector('.btn-primary').addEventListener('click', addCard);
    wrap.querySelector('.btn-cancel').addEventListener('click', cancelAdd);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCard(); }
      if (e.key === 'Escape') cancelAdd();
    });
  });
});


// ===== リスト名インライン編集 =====
document.querySelectorAll('.list-title').forEach(title => {
  title.addEventListener('click', () => {
    title.contentEditable = 'true';
    title.focus();

    const range = document.createRange();
    range.selectNodeContents(title);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });

  title.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); title.blur(); }
    if (e.key === 'Escape') {
      title.contentEditable = 'false';
      title.blur();
    }
  });

  title.addEventListener('blur', () => {
    title.contentEditable = 'false';
    if (!title.textContent.trim()) title.textContent = 'リスト名なし';
  });
});


// ===== リストメニュー（⋮）=====
const confirmOverlay = document.getElementById('confirm-overlay');
const confirmOk = document.getElementById('confirm-ok');
const confirmCancel = document.getElementById('confirm-cancel');
let listToDelete = null;

document.querySelectorAll('.list-menu-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const menu = btn.nextElementSibling;
    document.querySelectorAll('.list-menu').forEach(m => {
      if (m !== menu) m.classList.add('hidden');
    });
    menu.classList.toggle('hidden');
  });
});

document.querySelectorAll('.list-delete-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    listToDelete = btn.closest('.list');
    btn.closest('.list-menu').classList.add('hidden');
    confirmOverlay.classList.remove('hidden');
  });
});

confirmOk.addEventListener('click', () => {
  if (listToDelete) listToDelete.remove();
  confirmOverlay.classList.add('hidden');
  listToDelete = null;
});

confirmCancel.addEventListener('click', () => {
  confirmOverlay.classList.add('hidden');
  listToDelete = null;
});

confirmOverlay.addEventListener('click', e => {
  if (e.target === confirmOverlay) {
    confirmOverlay.classList.add('hidden');
    listToDelete = null;
  }
});

// メニュー以外クリックで閉じる
document.addEventListener('click', () => {
  document.querySelectorAll('.list-menu').forEach(m => m.classList.add('hidden'));
});


// ===== ユーティリティ =====
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
