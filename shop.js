import { firebaseConfig, FIRESTORE_URL } from "./firebase-config.js";
const user=JSON.parse(sessionStorage.getItem("shopEaseUser")||"null");
if(!user||user.role!=="user") location.replace("login.html");
document.getElementById("customerName").textContent=user?.name||"Customer";
const key=`key=${firebaseConfig.apiKey}`;
const msg=document.getElementById("shopMessage");
let products=[],cart=[];
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function encode(v){if(typeof v==="string")return{stringValue:v};if(typeof v==="number")return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};return{nullValue:null};}
function decode(v){if(!v)return"";if("stringValue"in v)return v.stringValue;if("integerValue"in v)return Number(v.integerValue);if("doubleValue"in v)return v.doubleValue;return"";}
function parse(d){return{id:d.name.split("/").pop(),...Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,decode(v)]))};}
async function call(collection,id="",method="GET",fields=null){
 const url=`${FIRESTORE_URL}/${collection}${id?"/"+encodeURIComponent(id):""}?${key}`;
 const res=await fetch(url,{method,headers:{"Content-Type":"application/json",Authorization:`Bearer ${user.idToken}`},...(fields?{body:JSON.stringify({fields:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,encode(v)]))})}:{})});
 const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error?.message||"Firestore request failed");return data;
}
async function list(collection){const d=await call(collection);return(d.documents||[]).map(parse);}
function renderProducts(items=products){
 document.getElementById("productGrid").innerHTML=items.map(p=>`<article class="product-card"><img src="${esc(p.image||"https://placehold.co/500x350?text=ShopEase")}" alt="${esc(p.name)}" onerror="this.src='https://placehold.co/500x350?text=Product'"><div class="product-info"><span class="category">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-bottom"><span class="price">₹${Number(p.price||0).toFixed(2)}</span><button class="add-btn" data-add="${esc(p.id)}" ${Number(p.stock)<=0?"disabled":""}>${Number(p.stock)<=0?"Out of stock":"Add to cart"}</button></div></div></article>`).join("")||'<p class="empty">No products available right now.</p>';
}
function renderCart(){
 document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.quantity,0);
 const total=cart.reduce((s,x)=>s+x.price*x.quantity,0);
 document.getElementById("subtotal").textContent=`₹${total.toFixed(2)}`;document.getElementById("total").textContent=`₹${total.toFixed(2)}`;
 document.getElementById("cartItems").innerHTML=cart.map(x=>`<div class="cart-row"><div><strong>${esc(x.productName)}</strong><small>₹${Number(x.price).toFixed(2)} each · Quantity ${x.quantity}</small></div><strong>₹${(x.price*x.quantity).toFixed(2)}</strong><button data-remove="${esc(x.id)}">Remove</button></div>`).join("")||'<p class="empty">Your cart is empty. Add a product to get started.</p>';
 document.getElementById("checkoutBtn").disabled=!cart.length;
}
async function load(){
 try{products=await list("products");renderProducts();cart=(await list("cart")).filter(x=>x.userId===user.uid);renderCart();}
 catch(e){msg.textContent=e.message;}
}
document.getElementById("searchBox").addEventListener("input",e=>{const q=e.target.value.toLowerCase();renderProducts(products.filter(p=>`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)));});
document.addEventListener("click",async e=>{
 const add=e.target.closest("[data-add]");const remove=e.target.closest("[data-remove]");
 try{
  if(add){const p=products.find(x=>x.id===add.dataset.add);if(!p)return;const existing=cart.find(x=>x.productId===p.id);
   if(existing){await call("cart",existing.id,"PATCH",{quantity:Number(existing.quantity)+1});}
   else{await call("cart","","POST",{userId:user.uid,productId:p.id,productName:p.name,price:Number(p.price),quantity:1});}
   msg.textContent=`${p.name} added to your cart.`;cart=(await list("cart")).filter(x=>x.userId===user.uid);renderCart();
  }
  if(remove){await call("cart",remove.dataset.remove,"DELETE");cart=cart.filter(x=>x.id!==remove.dataset.remove);renderCart();msg.textContent="Item removed from cart.";}
 }catch(err){msg.textContent=err.message;}
});
document.getElementById("checkoutBtn").addEventListener("click",async()=>{
 const btn=document.getElementById("checkoutBtn");btn.disabled=true;
 try{
  for(const item of cart){
   await call("orders","","POST",{userId:user.uid,customerName:user.name,productId:item.productId,productName:item.productName,quantity:Number(item.quantity),totalPrice:Number(item.price)*Number(item.quantity),status:"Pending",orderDate:new Date().toISOString()});
   await call("cart",item.id,"DELETE");
  }
  cart=[];renderCart();msg.textContent="Your order has been placed successfully!";
 }catch(e){msg.textContent=e.message;btn.disabled=false;}
});
document.getElementById("logoutBtn").addEventListener("click",()=>{sessionStorage.removeItem("shopEaseUser");location.href="login.html";});
load();
