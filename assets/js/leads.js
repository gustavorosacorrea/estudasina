(function(){
	const form = document.getElementById('leadForm');
	const btn = document.getElementById('submitBtn');
	const ok = document.getElementById('ok');
	const fail = document.getElementById('fail');
	const iframe = document.getElementsByName('lead_iframe')[0];
	const w = document.getElementById('whatsapp');

	const params = new URLSearchParams(location.search);
	const set = (id,v)=>{const el=document.getElementById(id);if(el) el.value=v||'';};
	set('origem', location.pathname);
	set('referrer', document.referrer||'');
	set('utm_source', params.get('utm_source'));
	set('utm_medium', params.get('utm_medium'));
	set('utm_campaign', params.get('utm_campaign'));
	set('utm_content', params.get('utm_content'));
	set('utm_term', params.get('utm_term'));

	const onlyDigits = s=>(s||'').replace(/\D+/g,'');
	function countDigits(str){return (str.match(/\d/g)||[]).length;}
	function caretIndexForDigitCount(masked,n){
	  if(n<=0)return 0;let d=0;
	  for(let i=0;i<masked.length;i++){if(/\d/.test(masked[i])){d++;if(d===n)return i+1;}}
	  return masked.length;
	}
	function formatWhatsapp(val){
	  let v=onlyDigits(val);
	  let hasDDI=v.startsWith('55')&&v.length>11; if(hasDDI)v=v.slice(2);
	  const ddd=v.slice(0,2);const rest=v.slice(2);
	  let p1='',p2='';
	  if(rest.length>5){const split=rest.length>=9?5:4;p1=rest.slice(0,split);p2=rest.slice(split,split+4);} else{p1=rest;}
	  let out=''; if(hasDDI)out+='+55 '; if(ddd)out+=`(${ddd}) `; if(p1)out+=p1; if(p2)out+=`-${p2}`; return out.trim();
	}
	function maskPreservingCaret(el){
	  let start=el.selectionStart;const before=el.value;
	  const digitsBeforeCaret=countDigits(before.slice(0,start));
	  const masked=formatWhatsapp(before);el.value=masked;
	  const newCaret=caretIndexForDigitCount(masked,digitsBeforeCaret);
	  try{el.setSelectionRange(newCaret,newCaret);}catch(_){}
	}
	['input','keyup','paste','cut'].forEach(evt=>{w.addEventListener(evt,()=>maskPreservingCaret(w));});
	maskPreservingCaret(w);

	let submitted = false;

	form.addEventListener('submit',function(ev){
	  ok.style.display='none';fail.style.display='none';
	  const raw=onlyDigits(w.value);w.value=raw;
	  if(!form.checkValidity()){ev.preventDefault();form.reportValidity();w.value=formatWhatsapp(w.value);return;}
	  btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...';
	  submitted = true;
	});

	iframe.addEventListener('load',function(){
	  if(!submitted) return;
	  submitted = false;
	  btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-clipboard-list"></i> Enviar informações';
	  ok.classList.remove('hidden');ok.style.display='block';form.reset();maskPreservingCaret(w);
	  if (typeof fbq === 'function') {
	    fbq('track','Lead');
	  }
	});

	window.addEventListener('error',function(){
	  btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-clipboard-list"></i> Enviar informações';fail.classList.remove('hidden');fail.style.display='block';
	});
})();
