import { firebaseConfig, FIRESTORE_URL } from "./firebase-config.js";

const session = JSON.parse(sessionStorage.getItem("shopEaseUser") || "null");
if (!session || session.role !== "admin") window.location.replace("login.html");
document.getElementById("adminName").textContent = session?.name || "Administrator";
const key = `key=${firebaseConfig.apiKey}`;
const notice = document.getElementById("notice");
const cache = { products: [], categories: [], customers: [], orders: [] };

function say(text, error=false) { notice.textContent = text; notice.className = error ? "notice error" : "notice"; }
function esc(v="") { return String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function encode(v) {
  if (v === null || v === undefined) return {nullValue:null};
  if (typeof v === "string") return {stringValue:v};
  if (typeof v === "boolean") return {booleanValue:v};
  if (typeof v === "number") return Number.isInteger(v) ? {integerValue:String(v)} : {doubleValue:v};
  return {stringValue:String(v)};
}
function decode(v) {
  if (!v) return "";
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  return "";
}
function parse(doc) { return {id:doc.name.split("/").pop(), ...Object.fromEntries(Object.entries(doc.fields||{}).map(([k,v])=>[k,decode(v)]))}; }
async function request(collection, id="", options={}) {
  const url = `${FIRESTORE_URL}/${collection}${id?"/"+encodeURIComponent(id):""}?${key}${options.mask||""}`;
  const res = await fetch(url,{method:options.method||"GET",headers:{Authorization:`Bearer ${session.idToken}`,"Content-Type":"application/json"},...(options.body?{body:JSON.stringify(options.body)}:{})});
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error?.message || `Firestore request failed (${res.status})`);
  return data;
}
async function list(collection) { const d=await request(collection); return (d.documents||[]).map(parse); }
async function save(collection,id,obj) {
  const fields=Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,encode(v)]));
  return request(collection,id,{method:id?"PATCH":"POST",body:{fields},...(id?{mask:"&"+Object.keys(obj).map(k=>`updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&")}:{})});
}
async function remove(collection,id) { return request(collection,id,{method:"DELETE"}); }

function switchSection(id) {
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===id));
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
  document.getElementById("pageTitle").textContent = ({overview:"Overview",products:"Products",categories:"Categories",customers:"Customers",orders:"Orders"})[id];
  if(id!=="overview") loadSection(id);
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>switchSection(b.dataset.section)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>switchSection(b.dataset.go)));
document.getElementById("logoutBtn").addEventListener("click",()=>{sessionStorage.removeItem("shopEaseUser");location.href="login.html";});

async function loadSection(section) {
  try {
    if(section==="products") await loadProducts();
    if(section==="categories") await loadCategories();
    if(section==="customers") await loadCustomers();
    if(section==="orders") await loadOrders();
  } catch(e){say(e.message,true);}
}
async function loadProducts(){
  cache.products=await list("products");
  document.getElementById("productRows").innerHTML=cache.products.map(p=>`<tr><td><strong>${esc(p.name)}</strong><br><span class="muted">${esc(p.description)}</span></td><td>₹${Number(p.price||0).toFixed(2)}</td><td>${esc(p.category)}</td><td>${esc(p.stock)}</td><td><div class="actions"><button data-edit-product="${esc(p.id)}">Edit</button><button class="danger" data-delete-product="${esc(p.id)}">Delete</button></div></td></tr>`).join("")||'<tr><td colspan="5">No products found.</td></tr>';
  document.getElementById("productCount").textContent=cache.products.length;
}
async function loadCategories(){
  cache.categories=await list("categories");
  document.getElementById("categoryRows").innerHTML=cache.categories.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.description)}</td><td><div class="actions"><button data-edit-category="${esc(c.id)}">Edit</button><button class="danger" data-delete-category="${esc(c.id)}">Delete</button></div></td></tr>`).join("")||'<tr><td colspan="3">No categories found.</td></tr>';
  document.getElementById("categoryCount").textContent=cache.categories.length;
}
async function loadCustomers(){
  cache.customers=await list("users");
  document.getElementById("customerRows").innerHTML=cache.customers.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${esc(c.phone)}</td><td>${esc(c.address)}</td></tr>`).join("")||'<tr><td colspan="4">No customer records found.</td></tr>';
  document.getElementById("customerCount").textContent=cache.customers.length;
}
async function loadOrders(){
  cache.orders=await list("orders");
  const statuses=["Pending","Processing","Shipped","Delivered","Cancelled"];
  document.getElementById("orderRows").innerHTML=cache.orders.map(o=>`<tr><td>${esc(o.customerName)}</td><td>${esc(o.productName)}</td><td>${esc(o.quantity)}</td><td>₹${Number(o.totalPrice||0).toFixed(2)}</td><td>${esc(o.status)}</td><td><select class="status-select" data-order-status="${esc(o.id)}">${statuses.map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("")||'<tr><td colspan="6">No orders found.</td></tr>';
  document.getElementById("orderCount").textContent=cache.orders.length;
}
document.getElementById("productForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f));const id=d.id;delete d.id;d.price=Number(d.price);d.stock=Number(d.stock);
  try{await save("products",id,d);f.reset();say("Product saved.");await loadProducts();}catch(err){say(err.message,true);}
});
document.getElementById("categoryForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.currentTarget,d=Object.fromEntries(new FormData(f));const id=d.id;delete d.id;
  try{await save("categories",id,d);f.reset();say("Category saved.");await loadCategories();}catch(err){say(err.message,true);}
});
document.addEventListener("click",async e=>{
  const b=e.target.closest("button");if(!b)return;
  try{
    if(b.dataset.editProduct){const p=cache.products.find(x=>x.id===b.dataset.editProduct);const f=document.getElementById("productForm");Object.entries(p).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v;});}
    if(b.dataset.deleteProduct&&confirm("Delete this product?")){await remove("products",b.dataset.deleteProduct);say("Product deleted.");await loadProducts();}
    if(b.dataset.editCategory){const c=cache.categories.find(x=>x.id===b.dataset.editCategory);const f=document.getElementById("categoryForm");Object.entries(c).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v;});}
    if(b.dataset.deleteCategory&&confirm("Delete this category?")){await remove("categories",b.dataset.deleteCategory);say("Category deleted.");await loadCategories();}
  }catch(err){say(err.message,true);}
});
document.addEventListener("change",async e=>{
  if(e.target.matches("[data-order-status]"))try{await save("orders",e.target.dataset.orderStatus,{status:e.target.value});say("Order status updated.");}catch(err){say(err.message,true);}
});
document.querySelectorAll("[data-refresh]").forEach(b=>b.addEventListener("click",()=>loadSection(b.dataset.refresh)));
(async()=>{try{await Promise.all([loadProducts(),loadCategories(),loadCustomers(),loadOrders()]);}catch(e){say(e.message,true);}})();
