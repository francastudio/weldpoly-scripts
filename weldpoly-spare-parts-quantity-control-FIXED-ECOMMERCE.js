/**
 * Weldpoly Spare Parts — Add spare parts to quote
 * Load AFTER weldpoly-quote-system.js
 * Uses same cart; quote system renders modal. Triggers: [spare-part-add], .spare-part-qty-plus, checkbox in [spare-part-item]
 */
(function(){
'use strict';
const CART_KEY='quoteCart',CART_SAVED_AT_KEY='quoteCartSavedAt',CART_TTL_MS=36e5;

function getCart(){
  try{
    const raw=localStorage.getItem(CART_KEY);
    const savedAtRaw=localStorage.getItem(CART_SAVED_AT_KEY);
    const savedAt=savedAtRaw?Number(savedAtRaw):0;
    if(savedAt&&(Date.now()-savedAt>CART_TTL_MS)){
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(CART_SAVED_AT_KEY);
      try{document.dispatchEvent(new CustomEvent('quoteCartExpired'));}catch(_){}
      return [];
    }
    if(raw){
      if(!savedAt)localStorage.setItem(CART_SAVED_AT_KEY,String(Date.now()));
      const cart=JSON.parse(raw);
      return Array.isArray(cart)?cart:[];
    }
    return [];
  }catch{return [];}
}

function setCart(cart){
  localStorage.setItem(CART_KEY,JSON.stringify(cart));
  localStorage.setItem(CART_SAVED_AT_KEY,String(Date.now()));
  try{document.dispatchEvent(new CustomEvent('quoteCartUpdated'));}catch(_){}
}

function mergeDuplicateSpareParts(cart){
  const norm=s=>(s||'').trim().toLowerCase();
  const seen=[],result=[];
  for(let i=0;i<cart.length;i++){
    const item=cart[i];
    if(!item.isSparePart){result.push(item);continue;}
    const key=norm(item.title)+'\n'+norm(item.parentProductTitle||'');
    const idx=seen.indexOf(key);
    if(idx>=0)result[idx].qty=(result[idx].qty||1)+(item.qty||1);
    else{seen.push(key);result.push({...item,qty:item.qty||1});}
  }
  return result;
}

function getSparePartTitle(container){
  for(const sel of ['.spare-part-name','[spare-part-content]','.spare-part-code']){
    const el=container.querySelector(sel);
    if(el){const t=(el.textContent||'').trim();if(t&&t.length>0)return t;}
  }
  const txt=(container.textContent||'').trim().replace(/\s+/g,' ');
  const parts=txt.split(/[•|·]/).map(s=>s.trim()).filter(Boolean);
  if(parts[0])return parts[0];
  if(parts[1])return parts[1];
  const two=txt.split(/\s+/).slice(0,3).join(' ').trim();
  return two&&two.length>0?two:'Spare part';
}

function getSparePartDescription(container){
  for(const sel of ['.card_description','[data-quote-description]','.spare-part-description']){
    const el=container.querySelector(sel);
    if(el){const t=(el.textContent||'').trim();if(t&&t.length>1)return t;}
  }
  return '';
}

function getParentProductTitle(){
  const byAttr=document.querySelector('[data-quote-product-title]');
  if(byAttr){const t=(byAttr.getAttribute('data-quote-product-title')||byAttr.textContent||'').trim();if(t)return t;}
  const btn=document.querySelector('[data-add-quote][data-quote-title]');
  if(btn){const t=(btn.getAttribute('data-quote-title')||'').trim();if(t)return t;}
  return '';
}

function getParentProductDescription(){
  const byAttr=document.querySelector('[data-quote-product-description]');
  if(byAttr){const t=(byAttr.getAttribute('data-quote-product-description')||byAttr.textContent||'').trim();if(t)return t;}
  const btn=document.querySelector('[data-add-quote][data-quote-description]');
  if(btn){const t=(btn.getAttribute('data-quote-description')||'').trim();if(t)return t;}
  const titleEl=document.querySelector('[data-quote-product-title]');
  if(titleEl){
    const sibling=titleEl.nextElementSibling||titleEl.parentElement?.querySelector('[data-quote-description]');
    if(sibling){const t=(sibling.textContent||'').trim();if(t)return t;}
  }
  return '';
}

function openQuoteModal(){
  const g=document.querySelector('[data-modal-group-status]');
  const m=document.querySelector('[data-modal-name="quote-modal"]');
  if(g)g.setAttribute('data-modal-group-status','active');
  if(m)m.setAttribute('data-modal-status','active');
}

const norm=s=>(s||'').trim().toLowerCase();

function isSparePartInCart(container){
  const title=getSparePartTitle(container);
  const parentTitle=getParentProductTitle();
  const cart=getCart();
  const idx=cart.findIndex(i=>i.isSparePart&&norm(i.title)===norm(title)&&norm(i.parentProductTitle)===norm(parentTitle));
  return{inCart:idx>=0,index:idx>=0?idx:-1};
}

function updateSparePartButtonsState(){
  const sel='[spare-part-item], .spare-part-item, .collection_spare-part-item, .list-spare_parts .w-dyn-item';
  document.querySelectorAll(sel).forEach(container=>{
    const trigger=container.querySelector('[spare-part-add]')||container.querySelector('.spare-part-qty-plus')||container.querySelector('.spare-part-checkbox input[type="checkbox"]')||container.querySelector('input[type="checkbox"]');
    if(!trigger)return;
    const{inCart}=isSparePartInCart(container);
    if(trigger.type==='checkbox'){
      trigger.checked=inCart;
      trigger.setAttribute('aria-checked',inCart?'true':'false');
    }else{
      trigger.setAttribute('data-in-quote',inCart?'true':'false');
      trigger.classList.toggle('spare-part-in-quote',inCart);
      const t=(trigger.textContent||'').trim();
      if(t==='+'||t==='')trigger.textContent=inCart?'\u2713':'+';
    }
  });
}
window.updateSparePartButtonsState=updateSparePartButtonsState;

function getSparePartContainerFromTrigger(trigger){
  let c=trigger.closest('[spare-part-item]')||trigger.closest('.spare-part-item')||trigger.closest('.collection_spare-part-item');
  if(!c){const d=trigger.closest('.w-dyn-item'); if(d&&(d.closest('.list-spare_parts')||d.closest('.spare-part-form')))c=d;}
  return c;
}

function toggleSparePartInQuote(trigger){
  const container=getSparePartContainerFromTrigger(trigger);
  if(!container)return;
  const title=getSparePartTitle(container);
  const description=getSparePartDescription(container);
  const parentTitle=getParentProductTitle();
  const cart=getCart();
  const merged=mergeDuplicateSpareParts(cart);
  const same=merged.findIndex(i=>i.isSparePart&&norm(i.title)===norm(title)&&norm(i.parentProductTitle)===norm(parentTitle));
  if(same>=0){
    merged.splice(same,1);
    setCart(merged);
    updateSparePartButtonsState();
    if(typeof window.updateNavQty==='function')window.updateNavQty();
  }else{
    const hasParent=parentTitle&&merged.some(i=>!i.isSparePart&&norm(i.title)===norm(parentTitle));
    if(!hasParent&&parentTitle){
      const parentDesc=getParentProductDescription();
      merged.push({title:parentTitle,description:parentDesc||'',qty:1});
    }
    merged.push({title,description,qty:1,isSparePart:true,parentProductTitle:parentTitle||''});
    setCart(merged);
    updateSparePartButtonsState();
    if(typeof window.updateNavQty==='function')window.updateNavQty();
    openQuoteModal();
  }
}

function getCheckboxFromClickTarget(target){
  if(target&&target.type==='checkbox')return target;
  if(target&&target.tagName==='LABEL'){
    const cb=target.control||(target.htmlFor?document.getElementById(target.htmlFor):null)||target.querySelector('input[type="checkbox"]');
    if(cb)return cb;
  }
  const wrapper=target?.closest?.('.w-checkbox, .spare-part-checkbox, .fs-checkbox-5_wrapper, .checkbox_field, .form_checkbox');
  if(wrapper){
    const cb=wrapper.querySelector('input[type="checkbox"]');
    if(cb)return cb;
  }
  return null;
}

function init(){
  document.addEventListener('click',e=>{
    let trigger=e.target.closest('[spare-part-add]')||e.target.closest('.spare-part-qty-plus');
    if(!trigger){
      const cb=getCheckboxFromClickTarget(e.target);
      if(cb&&getSparePartContainerFromTrigger(cb))trigger=cb;
    }
    if(!trigger)return;
    e.preventDefault();
    e.stopPropagation();
    toggleSparePartInQuote(trigger);
  },{capture:true});

  const modal=document.querySelector('[data-modal-name="quote-modal"]');
  if(modal){
    const obs=new MutationObserver(()=>{
      if(modal.getAttribute('data-modal-status')==='active'){}else updateSparePartButtonsState();
    });
    obs.observe(modal,{attributes:true,attributeFilter:['data-modal-status']});
  }

  document.addEventListener('quoteCartUpdated',()=>updateSparePartButtonsState());
  updateSparePartButtonsState();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,100));
else setTimeout(init,100);
})();
