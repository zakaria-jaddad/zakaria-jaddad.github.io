import { marked } from "marked";
import projects from "../../data/projects.json";

export default async function project({ name }) {
  const app = document.getElementById("app");

  const proj = projects.find((p) => p.id === name);

  if (!proj) {
    app.innerHTML = `
      <div class="error">
        <p>Project not found.</p>
        <a href="/" class="back-link" style="display: inline;">Back to home</a>
      </div>
    `;
    return () => {};
  }

  app.innerHTML = `<div class="loading">Loading ${proj.name}</div>`;

  try {
    const resp = await fetch(`/projects/${proj.name}/README.md`);
    if (!resp.ok) throw new Error("Not found");

    const raw = await resp.text();
    const html = marked.parse(raw);

    app.innerHTML = `
      <a href="/" class="back-link">Back to home</a>
      <div class="project-header">
        <h1 class="project-title">${proj.name}</h1>
        <p class="project-subtitle">${proj.title} — ${proj.description}</p>
        <div class="project-tags">
          ${proj.technologies.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
      </div>
      <hr>
      <div class="markdown-body">${html}</div>
    `;
  } catch {
    app.innerHTML = `
      <a href="/" class="back-link">Back to home</a>
      <div class="project-header">
        <h1 class="project-title">${proj.name}</h1>
        <p class="project-subtitle">${proj.title} — ${proj.description}</p>
        <div class="project-tags">
          ${proj.technologies.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
      </div>
      <hr>
      <div class="error">
        <p>README not found. Add a <code>README.md</code> file at <code>public/projects/${proj.name}/README.md</code>.</p>
      </div>
    `;
  }

  return () => {};
}
