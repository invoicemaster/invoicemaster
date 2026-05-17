import { getAll, put, remove } from './db.js?v=1779039163817';

export async function loadClients() {
  return await getAll('clients');
}

export async function saveClient(data) {
  return await put('clients', data);
}

export async function deleteClient(id) {
  await remove('clients', id);
}

export function initClientsTab(onChange) {
  const form = document.getElementById('client-form');
  const list = document.getElementById('client-list');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = form.id.value ? Number(form.id.value) : undefined;
    const data = {
      name: form.name.value.trim(),
      address: form.address.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
    };
    if (id) data.id = id;
    await saveClient(data);
    form.reset();
    form.id.value = '';
    await render(list, form, onChange);
    if (onChange) onChange();
  });

  form.addEventListener('reset', () => {
    form.id.value = '';
  });

  render(list, form, onChange);
}

async function render(list, form, onChange) {
  const clients = await loadClients();
  list.innerHTML = '';
  if (clients.length === 0) {
    list.innerHTML = '<li class="meta">No clients yet.</li>';
    return;
  }
  for (const c of clients) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <div><strong></strong></div>
        <div class="meta"></div>
      </div>
      <div class="row-actions">
        <button class="btn-ghost" data-edit>Edit</button>
        <button class="btn-ghost" data-del>Delete</button>
      </div>
    `;
    li.querySelector('strong').textContent = c.name;
    li.querySelector('.meta').textContent = [c.email, c.phone, c.address].filter(Boolean).join(' · ');
    li.querySelector('[data-edit]').addEventListener('click', () => {
      form.id.value = c.id;
      form.name.value = c.name || '';
      form.address.value = c.address || '';
      form.email.value = c.email || '';
      form.phone.value = c.phone || '';
      form.name.focus();
    });
    li.querySelector('[data-del]').addEventListener('click', async () => {
      if (!confirm(`Delete client "${c.name}"?`)) return;
      await deleteClient(c.id);
      await render(list, form, onChange);
      if (onChange) onChange();
    });
    list.appendChild(li);
  }
}
