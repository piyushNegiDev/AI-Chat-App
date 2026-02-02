document.querySelector("#btn").addEventListener("click", () => {
  send();
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
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  addMessage(text, "user");

  messages.push({ role: "user", content: text });

  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const data = await res.json();
  addMessage(data.reply, "bot");

  messages.push({ role: "model", content: data.reply });
}
