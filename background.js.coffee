initializeURL = (tab) ->
  type = undefined
  type = "company"  if tab.url.match(/\bcompany\b/)
  type = "group"  if tab.url.match(/\groups\b/)
  console.log type
chrome.browserAction.onClicked.addListener initializeURL