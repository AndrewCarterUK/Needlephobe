async function main() {
  tf.ENV.set("WEBGL_PACK", false);

  await tf.ready();

  model = await tf.loadGraphModel("resources/model.json");

  let cachedUrls = {};

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.url in cachedUrls) {
      sendResponse({ isNeedle: cachedUrls[request.url] });
    } else {
      let imageElement = new Image();

      imageElement.onload = () => {
        let image = tf.browser.fromPixels(imageElement);
        let resizedImage = tf.image
          .resizeBilinear(image, [224, 224])
          .toFloat()
          .div(tf.scalar(255))
          .reshape([224, 224, 3])
          .expandDims(0);

        let prediction = model.predict(resizedImage);
        let isNeedle = prediction.dataSync()[0] < -2;
        cachedUrls[request.url] = isNeedle;
        sendResponse({ isNeedle: isNeedle });
      };

      imageElement.src = request.url;
    }

    return true;
  });
}

main();
