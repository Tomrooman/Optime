let activeTabId: number, lastUrl: string, lastTitle: string;

const getTabInfo = async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);
  console.log("before", { activeTabId, lastUrl, lastTitle });
  activeTabId = tabId;
  lastUrl = tab.url || "";
  lastTitle = tab.title || "";
  console.log("after", { activeTabId, lastUrl, lastTitle });
  return tab;
};

// Event on tab selection
chrome.tabs.onHighlighted.addListener(async (highlightInfo) => {
  console.log("onHighlighted", { highlightInfo });
  const tab = await getTabInfo(highlightInfo.tabIds[0]);
  if (!tab.url?.startsWith("http")) {
    return;
  }
  await chrome.tabs.discard(highlightInfo.tabIds[0]);
});
