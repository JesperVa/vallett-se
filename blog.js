/* blog.js — client-side blog engine
 *
 * Posts are stored as .md files under /posts/.
 * Add a new entry to /posts/index.json whenever you create a new post.
 *
 * URL scheme:
 *   /          → shows post list in the right panel (desktop)
 *   /#slug     → loads that post in the right panel (desktop)
 *   /blog.html → standalone post list (mobile)
 *   /blog.html#slug → standalone post view (mobile)
 */

const POSTS_INDEX = 'posts/index.json';

/* ── Helpers ─────────────────────────────────────────────── */

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function isStandalone() {
    return location.pathname.includes('blog.html');
}

function backTarget() {
    return isStandalone() ? '/blog.html' : '/';
}

/* ── Rendering ───────────────────────────────────────────── */

function renderPostList(posts, container) {
    if (!posts.length) {
        container.innerHTML = '<p class="blog-empty">No posts yet — check back soon.</p>';
        return;
    }

    const items = posts
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(p => `
            <a class="post-item" href="${backTarget()}#${p.slug}">
                <span class="post-item-title">${escapeHtml(p.title)}</span>
                <time class="post-item-date" datetime="${p.date}">${formatDate(p.date)}</time>
            </a>
        `)
        .join('');

    container.innerHTML = `
        <p class="post-list-heading">Writing</p>
        <div class="post-list">${items}</div>
    `;
}

async function renderPost(slug, posts, container) {
    const post = posts.find(p => p.slug === slug);

    try {
        const res = await fetch(`posts/${slug}.md`);
        if (!res.ok) throw new Error(`${res.status}`);
        const md = await res.text();

        container.innerHTML = `
            <article class="prose">
                <a class="back-link" href="${backTarget()}">← All posts</a>
                <time class="post-date" datetime="${post?.date || ''}">${formatDate(post?.date)}</time>
                ${marked.parse(md)}
            </article>
        `;
    } catch (err) {
        container.innerHTML = `
            <div class="prose">
                <a class="back-link" href="${backTarget()}">← All posts</a>
                <p>Could not load post.</p>
            </div>
        `;
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ── Router ──────────────────────────────────────────────── */

async function route(posts, container) {
    const slug = location.hash.slice(1);
    if (slug && posts.find(p => p.slug === slug)) {
        await renderPost(slug, posts, container);
    } else {
        renderPostList(posts, container);
    }
    // Scroll to top of blog panel whenever route changes
    container.scrollTop = 0;
}

/* ── Init ────────────────────────────────────────────────── */

async function init() {
    const container = document.getElementById('blog-content');
    if (!container) return;

    let posts = [];
    try {
        const res = await fetch(POSTS_INDEX);
        if (!res.ok) throw new Error(`${res.status}`);
        posts = await res.json();
    } catch {
        container.innerHTML = '<p class="blog-empty">Could not load posts.</p>';
        return;
    }

    await route(posts, container);

    window.addEventListener('hashchange', () => route(posts, container));
}

init();



