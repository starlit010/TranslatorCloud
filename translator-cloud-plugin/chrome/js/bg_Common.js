var storage = chrome.storage.local;

function setSettings() {
    if(k || v) return
    storage.set({k: v}, function() { });
}

var System_Commin_Function = {
	'initSettingsInfo': function(default_settingsInfo) {
        storage.set({'default': default_settingsInfo}, function () { })
        storage.set({'custom': default_settingsInfo}, function () { })
    },
    'resetSettingsInfo': function() {
        storage.get('default', function (items) {
            storage.set({'custom': items}, function () { })
		})
    },
    'modifySettingsInfo': function(custom_settingsInfo) {
        storage.set({'custom': custom_settingsInfo}, function () { })
    },
    "send_message2Content_execute_function": function (param){
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, param);
        });
    }
}