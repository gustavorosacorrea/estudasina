(function(){
  const form   = document.getElementById('leadForm');
  const btn    = document.getElementById('submitBtn');
  const ok     = document.getElementById('ok');
  const fail   = document.getElementById('fail');
  const iframe = document.getElementsByName('lead_iframe')[0];
  const w      = document.getElementById('whatsapp');

  // --------- Estado inicial: alerts SEMPRE ocultos ---------
  if (ok)   { ok.hidden = true;   ok.style.display = 'none'; }
  if (fail) { fail.hidden = true; fail.style.display = 'none'; }

  // --------- Preenche UTM/referrer/origem ---------
  const params = new URLSearchParams(location.search);
  const set = (id,v)=>{ const el=document.getElementById(id); if(el) el.value=v||''; };
  set('origem',   location.pathname + location.search);
  set('referrer', document.referrer || '');
  set('utm_source',   params.get('utm_source'));
  set('utm_medium',   params.get('utm_medium'));
  set('utm_campaign', params.get('utm_campaign'));
  set('utm_content',  params.get('utm_content'));
  set('utm_term',     params.get('utm_term'));

  // --------- Máscara/validação WhatsApp (mantendo teu comportamento) ---------
  const onlyDigits = s => (s||'').replace(/\D+/g,'');
  function countDigits(str){ return (str.match(/\d/g)||[]).length; }
  function caretIndexForDigitCount(masked,n){
	if(n<=0) return 0; let d=0;
	for(let i=0;i<masked.length;i++){
	  if(/\d/.test(masked[i])){ d++; if(d===n) return i+1; }
	}
	return masked.length;
  }
  function formatWhatsapp(val){
	let v = onlyDigits(val);
	let hasDDI = v.startsWith('55') && v.length>11; if (hasDDI) v = v.slice(2);
	const ddd  = v.slice(0,2);
	const rest = v.slice(2);
	let p1='', p2='';
	if (rest.length>5) {
	  const split = rest.length>=9 ? 5 : 4;
	  p1 = rest.slice(0,split); p2 = rest.slice(split, split+4);
	} else {
	  p1 = rest;
	}
	let out=''; if (hasDDI) out+='+55 '; if (ddd) out+=`(${ddd}) `; if (p1) out+=p1; if (p2) out+=`-${p2}`;
	return out.trim();
  }
  function maskPreservingCaret(el){
	let start = el.selectionStart; const before = el.value;
	const digitsBeforeCaret = countDigits(before.slice(0,start));
	const masked = formatWhatsapp(before);
	el.value = masked;
	const newCaret = caretIndexForDigitCount(masked, digitsBeforeCaret);
	try { el.setSelectionRange(newCaret, newCaret); } catch(_){}
  }
  ['input','keyup','paste','cut'].forEach(evt=>{
	if (w) w.addEventListener(evt, ()=>maskPreservingCaret(w));
  });
  if (w) maskPreservingCaret(w);

  // --------- Fluxo de envio com guarda e timeout ---------
  let submitted = false;
  let timerId = null;

  form.addEventListener('submit', function(ev){
	// Esconde mensagens
	if (ok)   { ok.hidden = true;   ok.style.display = 'none'; }
	if (fail) { fail.hidden = true; fail.style.display = 'none'; }

	// Normaliza telefone para dígitos puros antes do submit
	if (w) w.value = onlyDigits(w.value);

	// Usa validação nativa; se falhar, re-mascara e interrompe
	if (!form.checkValidity()) {
	  ev.preventDefault();
	  form.reportValidity();
	  if (w) w.value = formatWhatsapp(w.value);
	  return;
	}

	// Trava botão + feedback
	if (btn) {
	  btn.disabled = true;
	  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...';
	}

	submitted = true;

	// Timeout de segurança (ex.: webview bloqueia o iframe)
	clearTimeout(timerId);
	timerId = setTimeout(()=>{
	  if (!submitted) return; // já recebeu retorno
	  submitted = false;
	  if (btn) {
		btn.disabled = false;
		btn.innerHTML = '<i class="fa-solid fa-clipboard-list"></i> Enviar informações';
	  }
	  if (fail) { fail.hidden = false; fail.style.display = 'block'; }
	}, 12000);
  });

  // Sucesso: load do iframe APÓS submit
  if (iframe) {
	iframe.addEventListener('load', function(){
	  if (!submitted) return;  // ignora loads "fantasma" no IG
	  submitted = false;
	  clearTimeout(timerId);
	  if (btn) {
		btn.disabled = false;
		btn.innerHTML = '<i class="fa-solid fa-clipboard-list"></i> Enviar informações';
	  }
	  if (ok)   { ok.hidden = false;   ok.style.display = 'block'; }
	  if (fail) { fail.hidden = true;  fail.style.display = 'none'; }
	  form.reset();
	  if (w) maskPreservingCaret(w);

	  // Pixel (mantido do teu código)
	  if (typeof fbq === 'function') {
		try { fbq('track','Lead'); } catch(_) {}
	  }
	});
  }

  // Erros globais: **só** mostram falha se houve submit
  window.addEventListener('error', function(){
	if (!submitted) return;
	submitted = false;
	clearTimeout(timerId);
	if (btn) {
	  btn.disabled = false;
	  btn.innerHTML = '<i class="fa-solid fa-clipboard-list"></i> Enviar informações';
	}
	if (fail) { fail.hidden = false; fail.style.display = 'block'; }
  });

  window.addEventListener('unhandledrejection', function(){
	if (!submitted) return;
	submitted = false;
	clearTimeout(timerId);
	if (btn) {
	  btn.disabled = false;
	  btn.innerHTML = '<i class="fa-solid fa-clipboard-list"></i> Enviar informações';
	}
	if (fail) { fail.hidden = false; fail.style.display = 'block'; }
  });
})();
