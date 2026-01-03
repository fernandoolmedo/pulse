// public/js/reactions.js
(function () {
  const roots = document.querySelectorAll('.reactions');
  if (!roots.length) return;

  roots.forEach(root => {
    const postId = root.dataset.post;

    // local state per widget
    const btns = root.querySelectorAll('.reaction-btn');
    const counts = {};
    root.querySelectorAll('.count').forEach(c => counts[c.dataset.key] = Number(c.textContent || 0));
    let myEmoji = root.querySelector('.reaction-btn.selected')?.dataset.emoji || null;

    const setSelected = (emoji) => {
      btns.forEach(b => b.classList.toggle('selected', b.dataset.emoji === emoji));
    };

    const applyCounts = () => {
      for (const [k, v] of Object.entries(counts)) {
        const el = root.querySelector(`.count[data-key="${k}"]`);
        if (el) el.textContent = String(v);
      }
    };

    const optimistic = (oldEmoji, newEmoji) => {
      if (oldEmoji && oldEmoji !== newEmoji) counts[oldEmoji] = Math.max(0, (counts[oldEmoji] || 0) - 1);
      if (!oldEmoji || oldEmoji !== newEmoji) counts[newEmoji] = (counts[newEmoji] || 0) + 1;
      applyCounts();
    };

    btns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const emoji = btn.dataset.emoji;
        const prev = myEmoji;

        // optimistic update
        myEmoji = emoji;
        setSelected(emoji);
        optimistic(prev, emoji);

        try {
          const r = await fetch(`/post/${postId}/reaction`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emoji })
          });
          if (r.status === 401) {
            // revert and redirect to login
            myEmoji = prev;
            setSelected(prev);
            optimistic(emoji, prev);
            window.location.href = '/auth/login';
            return;
          }
          if (!r.ok) throw new Error('Failed');
        } catch (e) {
          // revert on error
          myEmoji = prev;
          setSelected(prev);
          optimistic(emoji, prev);
          console.error(e);
          alert('Could not set reaction.');
        }
      });
    });
  });
})();
