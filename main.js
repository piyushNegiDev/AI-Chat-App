const btn = document.getElementById("btn");
const input = document.getElementById("promptInput");
const chat = document.querySelector(".chat");
const messages = [];

input.focus();

btn.addEventListener("click", send);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

function addMessage(text, role) {
  let div = document.createElement("div");
  div.classList.add(role);

  if (text === "Typing...") {
    div.innerText = "Typing...";
  } else {
    div.innerHTML = role === "bot" ? marked.parse(text) : text;
  }

  chat.append(div);
  chat.scrollTop = chat.scrollHeight;

  return div;
}

async function send() {
  if (btn.disabled) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  addMessage(text, "user");
  messages.push({ role: "user", content: text });
  if (messages.length > 50) messages.shift();

  const typingBubble = addMessage("Typing...", "bot");

  btn.disabled = true;
  input.disabled = true;

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages.slice(-10) }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    typingBubble.innerText =
      data?.reply?.trim() || "⚠️ AI sent an empty response";

    if (data?.reply?.trim()) {
      messages.push({ role: "model", content: data.reply });
      if (messages.length > 50) messages.shift();
    }
  } catch (err) {
    typingBubble.innerText = "❌ Server error";
  } finally {
    btn.disabled = false;
    input.disabled = false;
    input.focus();
  }
}
