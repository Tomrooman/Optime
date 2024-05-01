chrome.runtime.onMessage.addListener(function ({ title }, sender, sendResponse) {
  document.body.innerHTML = "";
  // const dogImg: HTMLImageElement = document.createElement('img');
  // document.body.appendChild(dogImg);

  sendResponse(`response ok tom : ${title}`);
});
