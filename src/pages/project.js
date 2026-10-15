import { marked } from "marked";
import projects from "../../data/projects.json";

// Mermaid is heavy — load it lazily, only when a page contains diagrams.
let mermaidPromise = null;

function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: {
          background: "#161b22",
          primaryColor: "#1c2333",
          primaryBorderColor: "#30363d",
          primaryTextColor: "#e6edf3",
          secondaryColor: "#21283b",
          tertiaryColor: "#0d1117",
          lineColor: "#58a6ff",
          textColor: "#e6edf3",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: "14px",
          edgeLabelBackground: "#161b22",
          clusterBkg: "rgba(88, 166, 255, 0.04)",
          clusterBorder: "#30363d",
          // sequence diagrams
          actorBkg: "#1c2333",
          actorBorder: "#30363d",
          actorTextColor: "#e6edf3",
          signalColor: "#8b949e",
          signalTextColor: "#e6edf3",
          labelBoxBkgColor: "#1c2333",
          labelTextColor: "#e6edf3",
          loopTextColor: "#8b949e",
          noteBkg: "#21283b",
          noteBorderColor: "#30363d",
          noteTextColor: "#e6edf3",
          activationBorderColor: "#58a6ff",
          activationBkgColor: "#21283b",
          sequenceNumberColor: "#e6edf3",
        },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

let mermaidId = 0;

async function renderMermaid(root) {
  const blocks = root.querySelectorAll("pre > code.language-mermaid");
  if (!blocks.length) return;

  blocks.forEach((block) => {
    const pre = block.parentElement;
    const div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = block.textContent;
    pre.replaceWith(div);
  });

  const mermaid = await getMermaid();

  for (const el of root.querySelectorAll(".mermaid")) {
    try {
      const { svg } = await mermaid.render(
        `mermaid-${++mermaidId}`,
        el.textContent,
      );
      el.innerHTML = svg;
    } catch (err) {
      // keep the raw source visible if a diagram fails to render
      el.classList.add("mermaid-error");
      console.error("Mermaid render failed:", err);
    }
  }
}

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

    await renderMermaid(app);
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
