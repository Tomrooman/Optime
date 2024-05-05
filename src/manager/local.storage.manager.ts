export type Tab = chrome.tabs.Tab & {
  active: boolean;
  audible: boolean;
  autoDiscardable: boolean;
  discarded: boolean;
  favIconUrl?: string;
  groupId: number;
  height: number;
  highlighted: boolean;
  id: number;
  incognito: boolean;
  index: number;
  lastAccessed: number;
  mutedInfo: { muted: boolean };
  pinned: boolean;
  selected: boolean;
  status: string;
  title?: string;
  url?: string;
  width: number;
  windowId: number;
};

export enum LocalStorageManagerKeys {
  DISCARDED_TABS = "discardedTabs",
  CREATION_PROCESS = "creationProcess"
}

export class LocalStorageManager {
  async getDiscardedTabs() {
    const { discardedTabs } = await chrome.storage.local.get(LocalStorageManagerKeys.DISCARDED_TABS);
    return discardedTabs || [];
  }

  async getCreationProcess() {
    const { creationProcess } = await chrome.storage.local.get(LocalStorageManagerKeys.CREATION_PROCESS);
    return creationProcess || [];
  }

  async addTabToCreationProcess(tabId: number) {
    const creationProcess = await this.getCreationProcess();

    if (!creationProcess.includes(tabId)) {
      creationProcess.push(tabId);
    }

    await chrome.storage.local.set({ [LocalStorageManagerKeys.CREATION_PROCESS]: creationProcess });
  }

  async addTabToDiscardedTabs(tabUrl: string) {
    const discardedTabs = await this.getDiscardedTabs();

    if (!discardedTabs.includes(tabUrl)) {
      discardedTabs.push(tabUrl);
    }

    await chrome.storage.local.set({ [LocalStorageManagerKeys.DISCARDED_TABS]: discardedTabs });
    console.log(`local storage discoarded set ${tabUrl}`, discardedTabs);
  }

  async syncStoredDiscardedTabs() {
    const tabs = await chrome.tabs.query({ discarded: true });

    await chrome.storage.local.set({
      [LocalStorageManagerKeys.DISCARDED_TABS]: tabs.map((tab) => tab.url).filter(Boolean)
    });
  }

  async removeTabFromCreationProcess(tabId: number, _creationProcess: number[]) {
    const creationProcess = _creationProcess || (await this.getCreationProcess());

    await chrome.storage.local.set({
      [LocalStorageManagerKeys.CREATION_PROCESS]: creationProcess.filter(
        (creationTabId: number) => creationTabId !== tabId
      )
    });
  }

  async removeTabFromDiscardedTabs(tabUrl?: string) {
    if (!tabUrl?.length) {
      return;
    }

    const discardedTabs = await this.getDiscardedTabs();
    console.log("removing tabUrl from storage", tabUrl);
    await chrome.storage.local.set({
      discardedTabs: discardedTabs.filter((discardedTabUrl: string) => discardedTabUrl !== tabUrl)
    });
  }

  private async injectIfNotAsync(tabId: number) {
    let injected = false;

    try {
      await chrome.tabs.sendMessage(tabId, "ping");
      injected = true;
    } catch {
      injected = false;
    }

    if (injected) {
      return tabId;
    }

    await chrome.scripting.executeScript({
      target: {
        tabId
      },
      files: ["contentScript.js"]
    });

    return tabId;
  }

  async injectAndDiscard(tab: Tab) {
    if (tab.discarded) {
      return;
    }

    try {
      await this.injectIfNotAsync(tab.id || 0);
    } catch (e) {
      console.log("failed to inject script on tab:", tab);
      return;
    }

    console.log(`tab ${tab.id} injected and discarded`);
    await chrome.tabs.discard(tab.id);
  }
}
