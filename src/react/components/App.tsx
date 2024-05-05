import { LocalStorageManager, Tab } from "../../manager/local.storage.manager";

import * as styles from "./app.module.scss";

const localStorageManager = new LocalStorageManager();

const generateDogGif = async () => {
  const tabs = (await chrome.tabs.query({})) as Tab[];
  console.log({ tabs });

  for (const tab of tabs) {
    if (tab.active || !tab.url?.startsWith("http")) {
      continue;
    }

    await localStorageManager.addTabToDiscardedTabs(tab.url);
    await localStorageManager.injectAndDiscard(tab);
  }
};

const App = () => {
  return (
    <div className={styles.test}>
      <h1>Optime</h1>
      <button onClick={generateDogGif}>Generate Dog Gif</button>
    </div>
  );
};
export default App;
