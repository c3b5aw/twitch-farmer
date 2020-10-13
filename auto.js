function clickPoints() {
	let els = document.getElementsByClassName('tw-button tw-button--success tw-interactive')

	if (els.length > 0) {
		els[0].click()
		return 1
	}
	return 0
}

chrome.runtime.onMessage.addListener(function( msg, sender, sendResponse ) {
	if (msg.text === 'check') {
		let tryClick = clickPoints();
		sendResponse({
			status: 'confirmed',
			earned: tryClick
		})
	}
});
