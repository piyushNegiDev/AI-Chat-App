const btn = document.getElementById("btn");
const input = document.getElementById("promptInput");
const chat = document.querySelector(".chat");
const messages = [];

input.focus();

btn.addEventListener("click", send);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

function addMessage(text, role, isTyping = false) {
  const div = document.createElement("div");
  div.classList.add(role);

  if (isTyping) {
    div.innerText = "Typing...";
  } else if (role === "bot") {
    div.innerHTML = marked.parse(text);
  } else {
    div.innerText = text;
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

  const typingBubble = addMessage("", "bot", true);

  const lower = text.toLowerCase();

  if (lower.includes("time") && lower.includes("india")) {
    const reply = getIndiaTimeReply();
    typingBubble.innerHTML = marked.parse(reply);
    messages.push({ role: "model", content: reply });
    return;
  }

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

    const reply = data?.reply?.trim() || "⚠️ AI sent an empty response";
    typingBubble.innerHTML = marked.parse(reply);

    if (data?.reply?.trim()) {
      messages.push({ role: "model", content: data.reply });
    }
  } catch (err) {
    typingBubble.innerText = "❌ Server error";
  } finally {
    btn.disabled = false;
    input.disabled = false;
    input.focus();
  }
}

function getIndiaTimeReply() {
  const now = new Date();

  const time = now.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `The current time in India is **${time}** on **${date}**.
  
  India observes Indian Standard Time (IST), which is UTC+5:30.`;
}
