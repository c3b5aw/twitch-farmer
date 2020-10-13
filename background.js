function main() {
	// Reseting Chrome Storage on Start
	chrome.storage.sync.set({'accumulatedPoints': 0}, function() {
		chrome.browserAction.setBadgeText({text: '0'})
	})

	setInterval(function() {
		chrome.tabs.query({
			url: '*://*.twitch.tv/*'
		}, function(tabs) {
			tabs.forEach(function(tab) {
				chrome.tabs.sendMessage(tab.id, { text: 'check' }, function(msg) {
					if (chrome.runtime.lastError)
						msg = {};
					else
						msg = msg || {};

					if (msg.status !== 'confirmed') {
						chrome.tabs.executeScript(tab.id, { file: 'auto.js' });
					} else if (msg.status === 'confirmed') {
						let additionalChannelPoints = msg.earned
						chrome.storage.sync.get(['accumulatedPoints'], function(result) {
							let totalPoint = result.accumulatedPoints + additionalChannelPoints;
							if (isNaN(totalPoint)) {
								totalPoint = additionalChannelPoints
							}
							chrome.storage.sync.set({'accumulatedPoints': totalPoint}, function() {
								chrome.browserAction.setBadgeText({text: totalPoint.toString()})
							})
						});
					}
				})
			});
		})
	}, 10000);
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(request)

		if (request.status === 'confirmed') {
			let additionalChannelPoints = request.earned
			chrome.storage.sync.get(['accumulatedPoints'], function(result) {
				let totalPoint = result.accumulatedPoints + additionalChannelPoints;

				chrome.storage.sync.set({'accumulatedPoints': totalPoint}, function() {
					chrome.browserAction.setBadgeText({text: totalPoint.toString()})
				})
			});
		}
	}
)

chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
	if(!('url' in changeInfo)) {
		return
	}
	if(!(changeInfo.url.toUpperCase().indexOf('twitch.tv'.toUpperCase()) !== -1)) {
		return
	}

	chrome.tabs.sendMessage(tab.id, {
		urlChanged: changeInfo
	}, function (msg) {
		if (chrome.runtime.lastError) { msg = {}; } else { msg = msg || {}; }
	});

});

main();

