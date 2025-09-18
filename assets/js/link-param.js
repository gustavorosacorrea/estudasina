(function () {
  // nada a fazer se a URL atual não tem UTM
  if (!location.search) return;

  // quais parâmetros queremos propagar
  const PROP_KEYS = new Set(['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid']);
  const srcParams = new URLSearchParams(location.search);

  // mescla UTMs da página atual no URL de destino (sem duplicar)
  function mergeUtmsInto(urlStr) {
	const url = new URL(urlStr, location.href);
	const base = new URLSearchParams(url.search);

	// adiciona somente os que não existem no link
	srcParams.forEach((v, k) => {
	  if (PROP_KEYS.has(k) && !base.has(k)) base.set(k, v);
	});

	url.search = base.toString();
	return url.toString();
  }

  // Reescreve hrefs existentes (bom pra hover/SEO, opcional)
  document.querySelectorAll('a[href]').forEach(a => {
	const href = a.getAttribute('href');
	if (!href) return;
	// ignora âncoras, externos e esquemas especiais
	if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

	const u = new URL(a.href, location.href);
	if (u.hostname !== location.hostname) return; // só internos

	a.href = mergeUtmsInto(u.href);
  });

  // Garantia extra: propaga no clique (mesmo que o href tenha sido trocado depois)
  document.addEventListener('click', function (e) {
	const a = e.target.closest('a');
	if (!a) return;

	const href = a.getAttribute('href');
	if (!href) return;
	if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

	const u = new URL(a.href, location.href);
	if (u.hostname !== location.hostname) return; // só internos

	// evita conflito com smoothscroll do menu (que é só para href^="#")
	const finalUrl = mergeUtmsInto(u.href);

	// Se já está igual, deixa seguir normal
	if (finalUrl === u.href) return;

	// Navega manualmente com os UTM mesclados
	e.preventDefault();
	if (a.target && a.target !== '_self') {
	  window.open(finalUrl, a.target, 'noopener');
	} else {
	  location.href = finalUrl;
	}
  }, true);
})();