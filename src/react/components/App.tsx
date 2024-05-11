import { LocalStorageManager, Tab } from "../../manager/local.storage.manager";
import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

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
    <Box className={styles.mainContainer} sx={{ flexGrow: 1 }} width={300} textAlign="center">
      <Grid container spacing={2}>
        <Grid xs={12}>
          <h1 className={styles.mainTitle}>Optime</h1>
        </Grid>
        <Grid xs={4}>
          <p>xs=4</p>
        </Grid>
        <Grid xs={4}>
          <p>xs=4</p>
        </Grid>
        <Grid xs={8}>
          <p>xs=8</p>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
