function openStatus(title){
	modalCascade();
	const cscHeader = document.getElementById('cscHeader') 
	cscHeader.innerHTML = title;

}
// agregarStatus('Faltan un chingo de cosas')
function agregarStatus(mensaje, status){
	const cscContent = document.getElementById('cscContent') 
	cscContent.insertAdjacentHTML('beforeend',`
		<div class="csc-row"><div class="csc-col">${mensaje}</div></div>
	`)
	if (status) {
		setTimeout(function(){
			closeModal()
		}, 2000)
	}
}