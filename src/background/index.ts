let activeTabId: number, lastUrl: string, lastTitle: string;

function getTabInfo(tabId: number) {
    chrome.tabs.get(tabId, function (tab) {
        console.log("getTabInfo", { tab })
        if (!tab.url || !tab.title) {
            lastUrl = '';
            lastTitle = '';
            return;
        }
        if (lastUrl != tab.url || lastTitle != tab.title) {
            lastUrl = tab.url;
            lastTitle = tab.title;
        }
    });
}

// Event on tab selection
chrome.tabs.onHighlighted.addListener(async (highlightInfo) => {
    // await chrome.tabs.discard(highlightInfo.tabIds[0]);
    console.log("onHighlighted", { highlightInfo })
    getTabInfo(highlightInfo.tabIds[0]);
});