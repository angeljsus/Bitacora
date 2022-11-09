function modalCascade(){
	const modales = document.getElementById('modales');
	let html = '';
	modales.classList.add('modulo-modal-1');
	// modales.style = 'background: red;';

	// modales.style = 'pointer-events: none;';

	html = `
		<div class="content-csc">
			<div class="csc-header" id="cscHeader">header</div>
			<div class="csc-content" id="cscContent">
			</div>
			<div class="csc-options" id="cscOption">
				
			</div>
		</div>
	`;
	modales.innerHTML = html;
}