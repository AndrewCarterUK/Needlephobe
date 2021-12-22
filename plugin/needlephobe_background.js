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
      sendResponse(cachedUrls[request.url]);
    } else {
      let imageElement = new Image();

      imageElement.onload = () => {
        tf.tidy(() => {
          let image = tf.browser.fromPixels(imageElement);
          let resizedImage = tf.image
            .resizeBilinear(image, [300, 300])
            .toFloat()
            .div(tf.scalar(255))
            .reshape([300, 300, 3])
            .expandDims(0);

          let prediction = model.predict(resizedImage).dataSync()[0];
          let result = { isNeedle: prediction < -1 };
          cachedUrls[request.url] = result;
          sendResponse(result);
        });
      };

      imageElement.src = request.url;
    }

    return true;
  });
}

main();
