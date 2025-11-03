document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('messageInput');
  const chatBox = document.getElementById('chatBox');

  function appendMessage(text, who='bot'){
    const div = document.createElement('div');
    div.className = who === 'user' ? 'user' : 'bot';
    div.innerHTML = `<div class="p-2"><strong>${who === 'user' ? 'You' : 'Shloka'}</strong>: ${text}</div>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    appendMessage(msg, 'user');
    input.value = '';
    appendMessage('...', 'bot');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      // remove the last placeholder
      const last = chatBox.querySelectorAll('.bot');
      if (last.length) last[last.length-1].remove();
      appendMessage(data.reply || data.error || 'No response', 'bot');
    } catch (err) {
      console.error(err);
      appendMessage('Network error', 'bot');
    }
  });
});
