import projects from "../../data/projects.json";
import { navigate } from "../router";

const aboutHTML = `
  <h1><strong>Personal home page where I showcase my programming projects.</strong></h1>
  <hr>

  <h2>Personal Information</h2>
  <table>
    <thead>
      <tr><th>Field</th><th>Information</th></tr>
    </thead>
    <tbody>
      <tr><td>Name</td><td>Zakaria Jaddad</td></tr>
      <tr><td>Email</td><td><a href="mailto:zakaria.jaddad@proton.me">zakaria.jaddad@proton.me</a></td></tr>
      <tr><td>Github</td><td><a   target="_blank" href="https://github.com/zakaria-jaddad">https://github.com/zakaria-jaddad</a></td></tr>
      <tr><td>LinkedIn</td><td><a target="_blank" href="https://www.linkedin.com/in/zakaria-jaddad-4a59a3245/">http://linkedin.com/in/zakaria-jaddad</a></td></tr>
    </tbody>
  </table>
  <hr>

  <h2>Education</h2>
  <h3>1337 FIL (42 Network)</h3>
  <ul>
    <li><strong>Period</strong>: September 2024 – August 2026</li>
    <li><strong>Common Core</strong>: 100% Complete</li>
    <li><strong>Advanced Part</strong>: Currently enrolled</li>
  </ul>
  <h3>OFPPT (Full Stack Web Development)</h3>
  <ul>
    <li><strong>Period</strong>: September 2022 – July 2024</li>
  </ul>
  <hr>

  <h2>Technical Skills</h2>
  <table>
    <thead>
      <tr><th>Category</th><th>Technologies</th></tr>
    </thead>
    <tbody>
      <tr><td>Programming Languages</td><td>C, C++, TypeScript, Go</td></tr>
      <tr><td>System Programming</td><td>Unix/Linux, System Calls, Process Management, Inter-process Communication</td></tr>
      <tr><td>Network Programming</td><td>TCP/UDP Sockets, HTTP Protocol and ICMP</td></tr>
      <tr><td>Tools &amp; Platforms</td><td>Docker, git, Kubernetes</td></tr>
    </tbody>
  </table>
`;

export default async function home() {
  const app = document.getElementById("app");

  const projectsGrid = projects
    .map(
      (p) => `
      <a class="project-card" data-project="${p.id}">
        <div class="project-card-header">
          <span class="project-card-name">${p.name}</span>
          <span class="project-card-title">${p.title}</span>
        </div>
        <p class="project-card-desc">${p.description}</p>
        <div class="project-card-tags">
          ${p.technologies.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
      </a>
    `,
    )
    .join("");

  app.innerHTML = `
    <div class="markdown-body">${aboutHTML}</div>
    <h2 style="margin-top: 2.5rem; margin-bottom: 0;">Projects</h2>
    <div class="projects-grid">${projectsGrid}</div>
  `;

  app.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(`#/project/${card.dataset.project}`);
    });
  });

  return () => {};
}
