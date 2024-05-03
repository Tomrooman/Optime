// same variables values will be shared across all tabs

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

  console.log({ tab });
  const localStorageData = await chrome.storage.local.get(tab.id.toString());
  console.log("tabDiscarded:", localStorageData[tab.id.toString()]);
  //   setTimeout(async () => {
  //     const captureResult = await chrome.tabs.captureVisibleTab({ format: "png" });
  //     console.log({ captureResult });
  //   }, 500);
  if (localStorageData[tab.id.toString()]) {
    await chrome.tabs.discard(highlightInfo.tabIds[0]);
  }
});

chrome.tabs.onCreated.addListener(async (tab: chrome.tabs.Tab) => {
  console.log("onCreated", { tab });

  if (!tab.id) {
    return;
  }
  const { creationProcess } = await chrome.storage.local.get("creationProcess");

  if (!creationProcess) {
    await chrome.storage.local.set({ creationProcess: [tab.id] });
    return;
  }

  await chrome.storage.local.set({ creationProcess: [...creationProcess, tab.id] });
});

chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
  console.log("onUpdated", { tabId, changeInfo });

  if (changeInfo?.status === "complete") {
    const { creationProcess } = await chrome.storage.local.get("creationProcess");

    if (creationProcess?.includes(tabId)) {
      await chrome.storage.local.set({
        creationProcess: creationProcess.filter((creationTabId: number) => creationTabId !== tabId)
      });
      await chrome.storage.local.set({ [tabId]: true });
      await chrome.tabs.discard(tabId);
      return;
    }

    await chrome.storage.local.remove(tabId.toString());
  }
});

chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  console.log("onRemoved", { tabId });
  await chrome.storage.local.remove(tabId.toString());
});
