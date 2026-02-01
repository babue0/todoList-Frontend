// ===============================
// CONFIG
// ===============================
const API_URL = "http://localhost:8080/todos";

// ===============================
// USER (anônimo)
// ===============================
function getUserId() {
  let userId = localStorage.getItem("userId");

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("userId", userId);
  }

  return userId;
}

function authHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "X-USER-ID": getUserId(),
    ...extra,
  };
}

// ===============================
// ELEMENTOS DO DOM
// ===============================
const inputTarefa = document.querySelector(".campo-texto");
const botaoAdicionar = document.querySelector(".botao-texto");

// ===============================
// ESTADO
// ===============================
let tarefas = [];

// ===============================
// BACKEND (API)
// ===============================
async function carregarTarefasBackend() {
  const response = await fetch(API_URL, {
    headers: authHeaders(),
  });

  tarefas = await response.json();
}

async function criarTarefaBackend(texto) {
  await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title: texto }),
  });
}

async function atualizarTarefaBackend(id, done) {
  await fetch(`${API_URL}/${id}/done?done=${done}`, {
    method: "PUT",
    headers: authHeaders(),
  });
}

async function removerTarefaBackend(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

// ===============================
// UI
// ===============================
function criarElementoTarefa(tarefa) {
  const divTarefa = document.createElement("div");
  divTarefa.className = "tarefa";

  divTarefa.innerHTML = `
    <span class="texto-tarefa ${tarefa.done ? "concluida" : ""}">
      ${tarefa.title}
    </span>
    <div class="botoes-tarefa">
      <button 
        class="botao-concluir" 
        onclick="toggleTarefa(${tarefa.id}, ${tarefa.done})"
      >
        ${tarefa.done ? "↩️" : "✅"}
      </button>
      <button 
        class="botao-remover" 
        onclick="removerTarefa(${tarefa.id})"
      >
        🗑️
      </button>
    </div>
  `;

  return divTarefa;
}

// ===============================
// AÇÕES
// ===============================
async function adicionarTarefa() {
  const texto = inputTarefa.value.trim();

  if (texto === "") {
    alert("Por favor, digite uma tarefa!");
    return;
  }

  await criarTarefaBackend(texto);

  inputTarefa.value = "";
  inputTarefa.focus();

  await renderizarTarefas();
}

async function toggleTarefa(id, estadoAtual) {
  await atualizarTarefaBackend(id, !estadoAtual);
  await renderizarTarefas();
}

async function removerTarefa(id) {
  await removerTarefaBackend(id);
  await renderizarTarefas();
}

// ===============================
// RENDER
// ===============================
async function renderizarTarefas() {
  await carregarTarefasBackend();

  const lista = document.querySelector(".lista-tarefas");
  lista.innerHTML = "";

  // abertas em cima
  tarefas
    .filter((t) => !t.done)
    .forEach((tarefa) => {
      lista.appendChild(criarElementoTarefa(tarefa));
    });

  // concluídas embaixo
  tarefas
    .filter((t) => t.done)
    .forEach((tarefa) => {
      lista.appendChild(criarElementoTarefa(tarefa));
    });
}

// ===============================
// EVENTOS
// ===============================
botaoAdicionar.addEventListener("click", adicionarTarefa);

inputTarefa.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    adicionarTarefa();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await renderizarTarefas();
});
