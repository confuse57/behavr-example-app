const customerInput = document.getElementById("customer-id");
const fileInput = document.getElementById("file");
const preview = document.getElementById("preview");
const fileLabel = document.getElementById("file-label");
const askCustomer = document.getElementById("ask-customer");

// Section 2 reuses the customer ID from section 1.
function currentCustomer() {
  return customerInput.value.trim();
}

customerInput.addEventListener("input", () => {
  askCustomer.textContent = currentCustomer() || "—";
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  fileLabel.textContent = file.name;
});

function setLoading(button, loading) {
  button.disabled = loading;
  button.querySelector(".spinner").hidden = !loading;
}

function showResult(el, kind, title, body, meta) {
  el.className = `result ${kind}`;
  el.replaceChildren();

  const titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.textContent = title;
  el.append(titleEl);

  if (body) {
    const bodyEl = document.createElement("div");
    bodyEl.className = "body";
    bodyEl.textContent = body;
    el.append(bodyEl);
  }
  if (meta) {
    const metaEl = document.createElement("div");
    metaEl.className = "meta";
    metaEl.textContent = meta;
    el.append(metaEl);
  }
  el.hidden = false;
}

async function postJson(url, options) {
  const res = await fetch(url, { method: "POST", ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = document.getElementById("upload-btn");
  const resultEl = document.getElementById("upload-result");

  const form = new FormData();
  form.append("customerId", currentCustomer());
  form.append("file", fileInput.files[0]);

  setLoading(button, true);
  resultEl.hidden = true;
  try {
    const data = await postJson("/api/remember", { body: form });
    showResult(
      resultEl,
      "success",
      "Memory saved! Processing...",
      "BEHAVR is analysing the image — give it ~15 seconds before asking.",
      `memory_id: ${data.memory_id}`
    );
  } catch (err) {
    showResult(resultEl, "error", "Upload failed", err.message);
  } finally {
    setLoading(button, false);
  }
});

document.getElementById("ask-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = document.getElementById("ask-btn");
  const resultEl = document.getElementById("ask-result");
  const customerId = currentCustomer();

  if (!customerId) {
    showResult(resultEl, "error", "Enter a Customer ID in section 1 first.");
    return;
  }

  setLoading(button, true);
  resultEl.hidden = true;
  try {
    const data = await postJson("/api/ask", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, question: document.getElementById("question").value }),
    });
    showResult(resultEl, "answer", "Answer", data.answer, `Customer: ${customerId}`);
  } catch (err) {
    showResult(resultEl, "error", "Couldn't get an answer", err.message);
  } finally {
    setLoading(button, false);
  }
});
