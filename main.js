document.querySelector("#btn").addEventListener("click", () => {
  send();
});

document.getElementById("promptInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

const messages = [];

function addMessage(text, role) {
  let div = document.createElement("div");
  div.innerText = text;
  div.classList.add(role);

  let chat = document.querySelector(".chat");
  chat.append(div);

  chat.scrollTop = chat.scrollHeight;
}

async function send() {
  const input = document.getElementById("promptInput");
  const chat = document.querySelector(".chat");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  addMessage(text, "user");
  messages.push({ role: "user", content: text });
  addMessage("Typing...", "bot");

  btn.disabled = true;
  input.disabled = true;

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    chat.lastChild.innerText = data.reply;
    messages.push({ role: "model", content: data.reply });
  } catch (err) {
    chat.lastChild.innerText = "❌ Server error";
  } finally {
    btn.disabled = false;
    input.disabled = false;
  }
}
