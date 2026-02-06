const maxTabs = 10;
const homeURL = "lan://pw.home.fun";

let tabs = [];
let activeTabIndex = 0;
let currentURL = "";

// --- INITIALIZE ---
function loadTabs() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("tabsData")); } catch(e){ saved=null; }
  if(!saved || !saved.tabs || saved.tabs.length===0) {
    tabs = [{ name: "Home", url: homeURL, history: [] }];
    activeTabIndex = 0;
  } else {
    tabs = saved.tabs;
    activeTabIndex = saved.activeTabIndex || 0;
    if(activeTabIndex >= tabs.length) activeTabIndex = 0;
  }
  renderTabs();
  switchTab(activeTabIndex, false);
}

function saveTabs() { localStorage.setItem("tabsData", JSON.stringify({ tabs, activeTabIndex })); }

// --- TAB FUNCTIONS ---
function renderTabs() {
  const tabBar = document.getElementById("tabBar");
  tabBar.innerHTML = "";
  tabs.forEach((tab,i)=>{
    const el = document.createElement("div");
    el.className = "tab" + (i===activeTabIndex ? " active" : "");
    el.textContent = tab.name;

    const closeBtn = document.createElement("button");
    closeBtn.className = "closeTab";
    closeBtn.textContent = "×";
    closeBtn.onclick = (e)=>{ e.stopPropagation(); closeTab(i); };
    el.appendChild(closeBtn);

    el.onclick = ()=>switchTab(i);
    tabBar.appendChild(el);
  });
  saveTabs();
}

function switchTab(index, save=true) {
  activeTabIndex = index;
  const tab = tabs[index];
  document.getElementById("address").value = tab.url;
  loadURL(mapURL(tab.url));
  renderTabs();
  if(save) saveTabs();
}

function createNewTab() { addTab("New Tab", homeURL); }

function addTab(name,url) {
  if(tabs.length >= maxTabs){ alert("Maximum 10 tabs reached!"); return; }
  tabs.push({ name,url,history:[] });
  switchTab(tabs.length-1);
}

function closeTab(index){
  if(tabs.length===1) return;
  tabs.splice(index,1);
  if(activeTabIndex>=index) activeTabIndex = Math.max(0,activeTabIndex-1);
  switchTab(activeTabIndex);
}

// --- URL MAPPING ---
function mapURL(url){
  if(url.startsWith("lan://pw.")){
    const page = url.replace("lan://pw.","").replace(".fun","");
    return "pages/"+page+".html";
  }
  return url;
}

// --- IFRAME FUNCTIONS ---
function loadURL(url){ currentURL=url; document.getElementById("contentFrame").src=url; }

function goToURL(){
  const raw = document.getElementById("address").value.trim();
  if(!raw) return;
  tabs[activeTabIndex].url = raw;
  renderTabs();
  const mapped = mapURL(raw);
  tabs[activeTabIndex].history.push(currentURL);
  loadURL(mapped);
  saveTabs();
}

function goBack(){
  const hist = tabs[activeTabIndex].history;
  if(hist.length>0){
    const lastURL = hist.pop();
    tabs[activeTabIndex].url = lastURL;
    document.getElementById("address").value = lastURL;
    loadURL(mapURL(lastURL));
    renderTabs();
    saveTabs();
  }
}

function refreshPage(){ loadURL(mapURL(tabs[activeTabIndex].url)); }

function goHome(){
  tabs[activeTabIndex].url = homeURL;
  document.getElementById("address").value = homeURL;
  renderTabs();
  loadURL(mapURL(homeURL));
  saveTabs();
}

// --- INITIAL LOAD ---
loadTabs();
