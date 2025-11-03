document.addEventListener('DOMContentLoaded', () => {
  const qInput = document.getElementById('q');
  const results = document.getElementById('results');

  async function search(q){
    const url = '/api/ancient/search?q=' + encodeURIComponent(q);
    const res = await fetch(url);
    const data = await res.json();
    render(data.results || []);
  }

  function render(list){
    results.innerHTML = '';
    if (!list.length) {
      results.innerHTML = '<p class="text-muted">No results</p>';
      return;
    }
    list.forEach(item => {
      const div = document.createElement('div');
      div.className = 'wisdom-entry';
      div.innerHTML = `<h5>${item.title || 'Untitled'}</h5>
        <p><em>${item.verse || ''}</em></p>
        <p>${item.meaning || ''}</p>`;
      results.appendChild(div);
    });
  }

  qInput.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    search(q);
  });

  // initial load
  search('');
});
