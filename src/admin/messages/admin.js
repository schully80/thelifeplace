// admin.js
const app = document.getElementById("app");

const SAVE_URL = "/admin/messages/save"; // we will create this endpoint
const messages = JSON.parse(app.dataset.messages);
const PLACEHOLDER = app.dataset.placeholder;

function render() {
  app.innerHTML = "";

  messages.forEach((msg, idx) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${msg.title}</h3>

      <label>Title</label>
      <input value="${msg.title}" data-field="title" data-idx="${idx}" />

      <label>Speaker</label>
      <input value="${msg.speaker}" data-field="speaker" data-idx="${idx}" />

      <label>Series</label>
      <input value="${msg.series}" data-field="series" data-idx="${idx}" />

      <label>Date</label>
      <input type="date" value="${msg.date}" data-field="date" data-idx="${idx}" />

      <label>YouTube ID</label>
      <input value="${msg.youtubeId}" data-field="youtubeId" data-idx="${idx}" />

      <label>Audio URL</label>
      <input value="${msg.audioUrl || ""}" data-field="audioUrl" data-idx="${idx}" />

      <label>Thumbnail</label>
      <input value="${msg.thumbnail || PLACEHOLDER}" data-field="thumbnail" data-idx="${idx}" />

      <button data-delete="${idx}">Delete</button>
    `;

    app.appendChild(card);
  });

  // Add new message button
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add New Message";
  addBtn.onclick = () => {
    messages.push({
      id: "new-message",
      title: "New Message",
      speaker: "Schulter Etyang",
      series: "General",
      date: new Date().toISOString().slice(0, 10),
      youtubeId: "",
      audioUrl: null,
      thumbnail: PLACEHOLDER,
    });
    render();
  };
  app.appendChild(addBtn);

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.style.marginLeft = "15px";
  saveBtn.textContent = "Save Changes";
  saveBtn.onclick = saveChanges;
  app.appendChild(saveBtn);

  // Attach listeners
  app.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const idx = +e.target.dataset.idx;
      const field = e.target.dataset.field;
      messages[idx][field] = e.target.value;
    });
  });

  app.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.onclick = () => {
      const idx = +btn.dataset.delete;
      messages.splice(idx, 1);
      render();
    };
  });
}

async function saveChanges() {
  const res = await fetch(SAVE_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(messages),
  });

  alert(await res.text());
}

render();
