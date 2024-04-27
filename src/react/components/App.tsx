const dogSrc: string = 'https://media.tenor.com/fej4_qoxdHYAAAAM/cute-puppy.gif';

type Tab = chrome.tabs.Tab & {
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
  mutedInfo: { muted: boolean }
  pinned: boolean;
  selected: boolean;
  status: string;
  title?: string;
  url?: string;
  width: number;
  windowId: number;
}

const generateDogGif = async () => {
  const tabs = await chrome.tabs.query({}) as Tab[];
  console.log({ tabs })

  for (const tab of tabs) {

    if (!tab.url?.startsWith('http') || tab.status !== 'complete') {
      continue;
    }

    await injectIfNotAsync(tab.id || 0);

    const response = await chrome.tabs.sendMessage(tab.id || 0, dogSrc);
    console.log({ response })
  }
};

const injectIfNotAsync = async (tabId: number) => {
  let injected = false;
  try {
    await chrome.tabs.sendMessage(tabId, 'ping');
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

const App = () => {
  return (
    <main>
      <h1>Add a Dog Gif to Webpage</h1>
      <img src={dogSrc} />
      <button onClick={generateDogGif}>Generate Dog Gif</button>
    </main>
  );
};
export default App;