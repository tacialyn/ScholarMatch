const gradeLevelSelect = document.getElementById("gradeLevel");
const strandSelect = document.getElementById("strand");
const categorySelect = document.getElementById("category");
const cardsContainer = document.getElementById("cardsContainer");
const resultsCount = document.getElementById("resultsCount");

const categoryIcons = {
  Academic: "&#127891;",
  Financial: "&#128176;",
  Athletic: "&#127942;",
  "Course-specific": "&#128218;",
  Underrepresented: "&#129309;"
};

function toList(val) {
  if (Array.isArray(val)) {
    return val.map(item => "&bull; " + item).join("<br>");
  }
  if (typeof val === "string" && val.trim() !== "") {
    return val;
  }
  return "N/A";
}

function getSource(scholarship) {
  return (scholarship.contact && scholarship.contact.source) || scholarship.source || null;
}

function safe(val) {
  return val === undefined || val === null || val === "" ? "N/A" : val;
}

function matchesFilter(scholarship) {
  const grade = gradeLevelSelect.value;
  const strand = strandSelect.value;
  const category = categorySelect.value;

  const gradeMatch = grade === "all" || scholarship.gradeLevel.includes(grade);
  const strandMatch =
    strand === "all" ||
    scholarship.strand.includes("any") ||
    scholarship.strand.includes(strand);
  const categoryMatch =
    category === "all" ||
    (Array.isArray(scholarship.category)
      ? scholarship.category.includes(category)
      : scholarship.category === category);

  return gradeMatch && strandMatch && categoryMatch;
}

function renderResults() {
  const filtered = scholarships.filter(matchesFilter);

  cardsContainer.innerHTML = "";
  resultsCount.textContent = filtered.length + " match" + (filtered.length === 1 ? "" : "es");

  if (filtered.length === 0) {
    cardsContainer.innerHTML =
      '<div class="empty-state">No scholarships match those choices yet. Try a different combination, or check back as more scholarships are added.</div>';
    return;
  }

  filtered.forEach((scholarship) => {
    const card = document.createElement("div");
    card.className = "card";

    const categoryList = Array.isArray(scholarship.category)
      ? scholarship.category
      : [scholarship.category];
    const primaryCategory = (categoryList[0] || "").trim();
    const categoryLabel = categoryList.join(", ");

    card.innerHTML = `
      <div class="card-visual">${categoryIcons[primaryCategory] || "&#127891;"}</div>
      <div class="card-body">
        <div class="card-name">${scholarship.name}</div>
        <div class="card-meta">${categoryLabel} &middot; Deadline: ${scholarship.deadline}</div>
        <span class="card-badge">${categoryLabel}</span>
      </div>
    `;

    card.addEventListener("click", () => openModal(scholarship));
    cardsContainer.appendChild(card);
  });
}

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

function openModal(scholarship) {
  modalTitle.textContent = scholarship.name;
  const modalCategoryLabel = Array.isArray(scholarship.category)
    ? scholarship.category.join(", ")
    : scholarship.category;
  modalMeta.textContent = modalCategoryLabel + " · Deadline: " + scholarship.deadline;

  const source = getSource(scholarship);
  const facebook = scholarship.contact && scholarship.contact.facebook;

  modalBody.innerHTML = `
    <div class="modal-row"><span>Provider</span><span>${safe(scholarship.provider)}</span></div>
    <div class="modal-row"><span>Eligibility</span><span>${toList(scholarship.eligibility)}</span></div>
    <div class="modal-row"><span>Deadline</span><span>${safe(scholarship.deadline)}</span></div>
    <div class="modal-row"><span>Amount / income</span><span>${safe(scholarship.amount)}</span></div>
    <div class="modal-row"><span>Benefits</span><span>${toList(scholarship.benefits)}</span></div>
    <div class="modal-row"><span>Requirements</span><span>${toList(scholarship.requirements)}</span></div>
    <div class="modal-row"><span>Renewable</span><span>${safe(scholarship.renewal)}</span></div>
    <div class="modal-row"><span>Testing venue</span><span>${safe(scholarship.testingVenue)}</span></div>
    <div class="modal-row"><span>Testing date</span><span>${safe(scholarship.testingDate)}</span></div>
    <div class="modal-row"><span>Examination</span><span>${safe(scholarship.examinationDate)}</span></div>
    <div class="modal-row"><span>Phone</span><span>${safe(scholarship.contact && scholarship.contact.phone)}</span></div>
    <div class="modal-row"><span>Email</span><span>${safe(scholarship.contact && scholarship.contact.email)}</span></div>
    ${facebook ? `<div class="modal-row"><span>Facebook</span><span><a href="${facebook.url}" target="_blank" style="color: var(--silver-2);">${facebook.name}</a></span></div>` : ""}
    ${source ? `<div class="modal-row"><span>Source</span><span><a href="${source.url}" target="_blank" style="color: var(--silver-2);">${source.name}</a></span></div>` : ""}
    `;

  modalBackdrop.classList.add("open");
}

if (modalClose) {
  modalClose.addEventListener("click", () => modalBackdrop.classList.remove("open"));
}
if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) modalBackdrop.classList.remove("open");
  });
}
document.addEventListener("keydown", (e) => {
  if (modalBackdrop) {
    if (e.key === "Escape") modalBackdrop.classList.remove("open");
  }
});

if (gradeLevelSelect) gradeLevelSelect.addEventListener("change", renderResults);
if (strandSelect) strandSelect.addEventListener("change", renderResults);
if (categorySelect) categorySelect.addEventListener("change", renderResults);

if (cardsContainer) renderResults();