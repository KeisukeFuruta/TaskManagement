'use strict';

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
const PRIORITY_LABEL = { urgent: '緊急', high: '高', medium: '中', low: '低', none: '' };

// ===== モーダル =====
const overlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalMemo = document.getElementById('modal-memo');
const modalDue = document.getElementById('modal-due');

let currentCard = null;

function openModal(card) {
  currentCard = card;
  modalTitle.value = card.querySelector('.card-title').textContent;
  modalMemo.value = '';
  const due = card.querySelector('.card-due').textContent.replace('📅 ', '').trim();
  modalDue.value = due ? due.replace(/\//g, '-') : '';

  const priority = card.dataset.priority || 'none';
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.priority === priority);
  });

  overlay.classList.remove('hidden');
  modalTitle.focus();
}

function closeModal() {
  if (!currentCard) return;

  const newTitle = modalTitle.value.trim();
  if (newTitle) currentCard.querySelector('.card-title').textContent = newTitle;

  const dueEl = currentCard.querySelector('.card-due');
  const dueVal = modalDue.value;
  if (dueVal) {
    dueEl.textContent = '📅 ' + dueVal.replace(/-/g, '/');
    dueEl.className = 'card-due ' + getDueClass(dueVal);
  } else {
    dueEl.textContent = '';
    dueEl.className = 'card-due';
  }

  const selectedBtn = document.querySelector('.priority-btn.selected');
  const priority = selectedBtn ? selectedBtn.dataset.priority : 'none';
  setPriority(currentCard, priority);

  overlay.classList.add('hidden');
  currentCard = null;
}

function setPriority(card, priority) {
  card.dataset.priority = priority;
  const badge = card.querySelector('.card-priority');
  badge.className = 'card-priority ' + priority;
  badge.textContent = PRIORITY_LABEL[priority] || '';
}

function getDueClass(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dateStr); due.setHours(0,0,0,0);
  if (due < today) return 'overdue';
  if (due.getTime() === today.getTime()) return 'today';
  return '';
}

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.closest('.card-menu-btn') || e.target.closest('.card-menu')) return;
    openModal(card);
  });
});

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

// 優先度ボタン（単一選択）
document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});


// ===== カード ⋮ メニュー =====
function initCardMenu(card) {
  const menuBtn = card.querySelector('.card-menu-btn');
  const menu = card.querySelector('.card-menu');

  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    closeAllMenus();
    menu.classList.toggle('hidden');
  });

  card.querySelector('.card-move-up-btn').addEventListener('click', e => {
    e.stopPropagation();
    const prev = card.previousElementSibling;
    if (prev && prev.classList.contains('card')) card.parentElement.insertBefore(card, prev);
    menu.classList.add('hidden');
  });

  card.querySelector('.card-move-down-btn').addEventListener('click', e => {
    e.stopPropagation();
    const next = card.nextElementSibling;
    if (next && next.classList.contains('card')) card.parentElement.insertBefore(next, card);
    menu.classList.add('hidden');
  });

  card.querySelector('.card-delete-btn').addEventListener('click', e => {
    e.stopPropagation();
    card.remove();
  });
}

document.querySelectorAll('.card').forEach(card => {
  initCardMenu(card);
  initCardDrag(card);
});


// ===== ソートバー =====
document.querySelectorAll('.list-header .sort-bar').forEach(bar => {
  bar.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.sort;
      const cardsEl = bar.closest('.list').querySelector('.cards');
      const cards = [...cardsEl.querySelectorAll('.card')];

      cards.sort((a, b) => {
        if (type === 'due') {
          const da = parseDue(a.querySelector('.card-due').textContent);
          const db = parseDue(b.querySelector('.card-due').textContent);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return da - db;
        }
        if (type === 'priority') {
          const pa = PRIORITY_ORDER[a.dataset.priority] ?? 4;
          const pb = PRIORITY_ORDER[b.dataset.priority] ?? 4;
          return pa - pb;
        }
        return 0;
      });

      cards.forEach(card => cardsEl.appendChild(card));
    });
  });
});

function parseDue(text) {
  const m = text.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  return m ? new Date(m[1], m[2] - 1, m[3]) : null;
}


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
        card.dataset.priority = 'none';
        card.innerHTML = `
          <div class="card-priority none"></div>
          <div class="card-title">${escapeHtml(title)}</div>
          <div class="card-due"></div>
          <button class="card-menu-btn">⋮</button>
          <div class="card-menu hidden">
            <button class="card-move-up-btn">↑ 上に移動</button>
            <button class="card-move-down-btn">↓ 下に移動</button>
            <button class="card-delete-btn">削除</button>
          </div>
        `;
        card.addEventListener('click', e => {
          if (e.target.closest('.card-menu-btn') || e.target.closest('.card-menu')) return;
          openModal(card);
        });
        initCardMenu(card);
        initCardDrag(card);
        list.querySelector('.cards').appendChild(card);
      }
      cancelAdd();
    }

    function cancelAdd() { wrap.remove(); btn.style.display = ''; }

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
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
  title.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); title.blur(); }
    if (e.key === 'Escape') { title.contentEditable = 'false'; title.blur(); }
  });
  title.addEventListener('blur', () => {
    title.contentEditable = 'false';
    if (!title.textContent.trim()) title.textContent = 'リスト名なし';
  });
});


// ===== リストメニュー =====
const confirmOverlay = document.getElementById('confirm-overlay');
const confirmOk = document.getElementById('confirm-ok');
const confirmCancel = document.getElementById('confirm-cancel');
let listToDelete = null;

document.querySelectorAll('.list-menu-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const menu = btn.nextElementSibling;
    closeAllMenus();
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
  if (e.target === confirmOverlay) { confirmOverlay.classList.add('hidden'); listToDelete = null; }
});


// ===== リスト追加 =====
document.querySelector('.add-list-btn').addEventListener('click', () => {
  const board = document.querySelector('.board');
  const addBtn = document.querySelector('.add-list-btn');

  const wrap = document.createElement('div');
  wrap.className = 'list new-list-input-wrap';
  wrap.innerHTML = `
    <input type="text" class="inline-input new-list-input" placeholder="リスト名を入力..." />
    <div class="inline-actions">
      <button class="btn-primary">追加</button>
      <button class="btn-cancel">✕</button>
    </div>
  `;
  board.insertBefore(wrap, addBtn);
  const input = wrap.querySelector('.new-list-input');
  input.focus();

  function addList() {
    const title = input.value.trim();
    if (title) {
      const list = document.createElement('div');
      list.className = 'list';
      list.innerHTML = `
        <div class="list-header">
          <span class="list-title" contenteditable="false">${escapeHtml(title)}</span>
          <div class="sort-bar">
            <button class="sort-btn" data-sort="due">📅 日付</button>
            <button class="sort-btn" data-sort="priority">🔥 優先度</button>
          </div>
          <button class="list-menu-btn">⋮</button>
          <div class="list-menu hidden">
            <button class="list-delete-btn">削除</button>
          </div>
        </div>
        <div class="cards"></div>
        <button class="add-card-btn">＋ カードを追加</button>
      `;
      board.insertBefore(list, wrap);

      // イベント初期化
      const titleEl = list.querySelector('.list-title');
      titleEl.addEventListener('click', () => {
        titleEl.contentEditable = 'true';
        titleEl.focus();
        const range = document.createRange();
        range.selectNodeContents(titleEl);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      });
      titleEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
        if (e.key === 'Escape') { titleEl.contentEditable = 'false'; titleEl.blur(); }
      });
      titleEl.addEventListener('blur', () => {
        titleEl.contentEditable = 'false';
        if (!titleEl.textContent.trim()) titleEl.textContent = 'リスト名なし';
      });

      list.querySelector('.list-menu-btn').addEventListener('click', e => {
        e.stopPropagation();
        const menu = list.querySelector('.list-menu');
        closeAllMenus();
        menu.classList.toggle('hidden');
      });

      list.querySelector('.list-delete-btn').addEventListener('click', e => {
        e.stopPropagation();
        listToDelete = list;
        list.querySelector('.list-menu').classList.add('hidden');
        confirmOverlay.classList.remove('hidden');
      });

      list.querySelector('.add-card-btn').addEventListener('click', () => {
        const cardBtn = list.querySelector('.add-card-btn');
        if (list.querySelector('.inline-input-wrap')) return;
        cardBtn.style.display = 'none';

        const cardWrap = document.createElement('div');
        cardWrap.className = 'inline-input-wrap';
        cardWrap.innerHTML = `
          <textarea class="inline-input" placeholder="タイトルを入力..." rows="2"></textarea>
          <div class="inline-actions">
            <button class="btn-primary">追加</button>
            <button class="btn-cancel">✕</button>
          </div>
        `;
        list.insertBefore(cardWrap, cardBtn);
        const cardInput = cardWrap.querySelector('.inline-input');
        cardInput.focus();

        function addCard() {
          const cardTitle = cardInput.value.trim();
          if (cardTitle) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.priority = 'none';
            card.innerHTML = `
              <div class="card-priority none"></div>
              <div class="card-title">${escapeHtml(cardTitle)}</div>
              <div class="card-due"></div>
              <button class="card-menu-btn">⋮</button>
              <div class="card-menu hidden">
                <button class="card-move-up-btn">↑ 上に移動</button>
                <button class="card-move-down-btn">↓ 下に移動</button>
                <button class="card-delete-btn">削除</button>
              </div>
            `;
            card.addEventListener('click', e => {
              if (e.target.closest('.card-menu-btn') || e.target.closest('.card-menu')) return;
              openModal(card);
            });
            initCardMenu(card);
            initCardDrag(card);
            list.querySelector('.cards').appendChild(card);
          }
          cardWrap.remove();
          cardBtn.style.display = '';
        }

        cardWrap.querySelector('.btn-primary').addEventListener('click', addCard);
        cardWrap.querySelector('.btn-cancel').addEventListener('click', () => { cardWrap.remove(); cardBtn.style.display = ''; });
        cardInput.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCard(); }
          if (e.key === 'Escape') { cardWrap.remove(); cardBtn.style.display = ''; }
        });
      });

      initCardsArea(list.querySelector('.cards'));
      initListDrag(list);

      list.querySelectorAll('.list-header .sort-bar .sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          list.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const type = btn.dataset.sort;
          const cardsEl = list.querySelector('.cards');
          const cards = [...cardsEl.querySelectorAll('.card')];
          cards.sort((a, b) => {
            if (type === 'due') {
              const da = parseDue(a.querySelector('.card-due').textContent);
              const db = parseDue(b.querySelector('.card-due').textContent);
              if (!da && !db) return 0;
              if (!da) return 1;
              if (!db) return -1;
              return da - db;
            }
            if (type === 'priority') {
              return (PRIORITY_ORDER[a.dataset.priority] ?? 4) - (PRIORITY_ORDER[b.dataset.priority] ?? 4);
            }
            return 0;
          });
          cards.forEach(card => cardsEl.appendChild(card));
        });
      });
    }
    wrap.remove();
  }

  wrap.querySelector('.btn-primary').addEventListener('click', addList);
  wrap.querySelector('.btn-cancel').addEventListener('click', () => wrap.remove());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addList(); }
    if (e.key === 'Escape') wrap.remove();
  });
});

// ===== ドラッグ&ドロップ =====
let dragCard = null;
let dragList = null;

function initCardDrag(card) {
  card.setAttribute('draggable', 'true');

  card.addEventListener('dragstart', e => {
    dragCard = card;
    dragList = null;
    setTimeout(() => card.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    dragCard = null;
  });
}

// カードのドロップ先：cards エリア
document.querySelectorAll('.cards').forEach(initCardsArea);

function initCardsArea(cardsEl) {
  cardsEl.addEventListener('dragover', e => {
    if (!dragCard) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

    const afterCard = getDragAfterCard(cardsEl, e.clientY);
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    if (afterCard) {
      cardsEl.insertBefore(indicator, afterCard);
    } else {
      cardsEl.appendChild(indicator);
    }
  });

  cardsEl.addEventListener('dragleave', e => {
    if (!cardsEl.contains(e.relatedTarget)) {
      document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    }
  });

  cardsEl.addEventListener('drop', e => {
    if (!dragCard) return;
    e.preventDefault();
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    const afterCard = getDragAfterCard(cardsEl, e.clientY);
    if (afterCard) {
      cardsEl.insertBefore(dragCard, afterCard);
    } else {
      cardsEl.appendChild(dragCard);
    }
  });
}

function getDragAfterCard(container, y) {
  const cards = [...container.querySelectorAll('.card:not(.dragging)')];
  return cards.reduce((closest, card) => {
    const box = card.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: card };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// リスト自体のD&D
document.querySelectorAll('.list').forEach(initListDrag);

function initListDrag(list) {
  const header = list.querySelector('.list-header');
  header.setAttribute('draggable', 'true');

  header.addEventListener('dragstart', e => {
    if (e.target.closest('.list-title[contenteditable="true"]')) {
      e.preventDefault();
      return;
    }
    dragList = list;
    dragCard = null;
    setTimeout(() => list.classList.add('dragging-list'), 0);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  });

  header.addEventListener('dragend', () => {
    list.classList.remove('dragging-list');
    document.querySelectorAll('.list-drop-indicator').forEach(el => el.remove());
    dragList = null;
  });
}

const board = document.querySelector('.board');
board.addEventListener('dragover', e => {
  if (!dragList) return;
  e.preventDefault();

  document.querySelectorAll('.list-drop-indicator').forEach(el => el.remove());
  const afterList = getDragAfterList(e.clientX);
  const indicator = document.createElement('div');
  indicator.className = 'list-drop-indicator';
  const addBtn = document.querySelector('.add-list-btn');
  if (afterList) {
    board.insertBefore(indicator, afterList);
  } else {
    board.insertBefore(indicator, addBtn);
  }
});

board.addEventListener('drop', e => {
  if (!dragList) return;
  e.preventDefault();
  document.querySelectorAll('.list-drop-indicator').forEach(el => el.remove());
  const afterList = getDragAfterList(e.clientX);
  const addBtn = document.querySelector('.add-list-btn');
  if (afterList) {
    board.insertBefore(dragList, afterList);
  } else {
    board.insertBefore(dragList, addBtn);
  }
});

function getDragAfterList(x) {
  const lists = [...board.querySelectorAll('.list:not(.dragging-list)')];
  return lists.reduce((closest, list) => {
    const box = list.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: list };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ===== 共通 =====
function closeAllMenus() {
  document.querySelectorAll('.list-menu, .card-menu').forEach(m => m.classList.add('hidden'));
}
document.addEventListener('click', closeAllMenus);

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
