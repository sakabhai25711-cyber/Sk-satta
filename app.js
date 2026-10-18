const STORAGE_KEY = "skSattaDemoRecordsV1";
const $ = (id) => document.getElementById(id);
const today = new Date();
$("todayDate").textContent = new Intl.DateTimeFormat("hi-IN", {day:"numeric", month:"long", year:"numeric"}).format(today);
$("year").textContent = today.getFullYear();
$("recordDate").value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

function loadRecords(){
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
function saveRecords(records){ localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
function safeText(value){ return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function formatDate(value){
  if(!value) return "—";
  const [y,m,d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("hi-IN",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(y,m-1,d));
}
function render(){
  const query = $("searchInput").value.trim().toLocaleLowerCase("hi-IN");
  const records = loadRecords().sort((a,b) => b.date.localeCompare(a.date));
  const filtered = records.filter(r => [r.date,r.title,r.value,r.note].join(" ").toLocaleLowerCase("hi-IN").includes(query));
  const body = $("recordsBody");
  if(!filtered.length){
    body.innerHTML = `<tr><td colspan="4" class="empty">${records.length ? "आपकी खोज से कोई रिकॉर्ड नहीं मिला।" : "अभी कोई सार्वजनिक रिकॉर्ड नहीं है।"}</td></tr>`;
  } else {
    body.innerHTML = filtered.map(r => `<tr><td>${safeText(formatDate(r.date))}</td><td>${safeText(r.title)}</td><td><strong>${safeText(r.value)}</strong></td><td>${safeText(r.note || "—")}</td></tr>`).join("");
  }
  const latest = records[0];
  $("latestCard").innerHTML = latest
    ? `<div><span class="muted-label">नवीनतम रिकॉर्ड · ${safeText(formatDate(latest.date))}</span><h3>${safeText(latest.title)}</h3><p>${safeText(latest.note || "सार्वजनिक जानकारी")}</p></div><span class="result-badge">${safeText(latest.value)}</span>`
    : `<div><span class="muted-label">नवीनतम रिकॉर्ड</span><h3>अभी कोई रिकॉर्ड उपलब्ध नहीं</h3><p>प्रकाशित रिकॉर्ड यहाँ दिखाई देंगे।</p></div><span class="result-badge">—</span>`;
}
$("demoForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const record = {
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    date: $("recordDate").value,
    title: $("recordTitle").value.trim(),
    value: $("recordValue").value.trim(),
    note: $("recordNote").value.trim()
  };
  if(!record.date || !record.title || !record.value) return;
  const records = loadRecords();
  records.push(record);
  saveRecords(records);
  $("recordTitle").value = "";
  $("recordValue").value = "";
  $("recordNote").value = "";
  $("formMessage").textContent = "डेमो रिकॉर्ड इसी ब्राउज़र में जोड़ दिया गया।";
  render();
});
$("searchInput").addEventListener("input", render);
$("clearSearch").addEventListener("click", () => { $("searchInput").value = ""; render(); $("searchInput").focus(); });
render();
