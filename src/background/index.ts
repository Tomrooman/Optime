import { LocalStorageManager } from "../manager/local.storage.manager";

// variables values will be shared across all tabs

const localStorageManager = new LocalStorageManager();

const getTabInfo = async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);
  return tab;
};

// Event on tab selection
chrome.tabs.onHighlighted.addListener(async (highlightInfo) => {
  console.log("onHighlighted", { highlightInfo });
  const tab = await getTabInfo(highlightInfo.tabIds[0]);

  if (!tab.url?.startsWith("http") || !tab.id) {
    return;
  }

  const discardedTabs = await localStorageManager.getDiscardedTabs();
  console.log("tabDiscarded:", discardedTabs);

  if (discardedTabs.includes(tab.url)) {
    await chrome.tabs.discard(tab.id);
  }
});

chrome.tabs.onCreated.addListener(async (tab: chrome.tabs.Tab) => {
  console.log("onCreated", { tab });

  if (!tab.id) {
    return;
  }

  await localStorageManager.addTabToCreationProcess(tab.id);
});

chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
  console.log("onUpdated", { tabId, changeInfo });

  if (changeInfo?.status === "complete") {
    const creationProcess = await localStorageManager.getCreationProcess();
    const tab = await getTabInfo(tabId);

    if (creationProcess?.includes(tabId)) {
      await localStorageManager.removeTabFromCreationProcess(tabId, creationProcess);

      if (tab.active || !tab.url) {
        return;
      }

      await localStorageManager.addTabToDiscardedTabs(tab.url);
      await chrome.tabs.discard(tabId);
      return;
    }

    await localStorageManager.removeTabFromDiscardedTabs(tab.url);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  console.log("onRemoved", { tabId });

  await localStorageManager.syncStoredDiscardedTabs();
});
