function checkImage(image) {
  chrome.runtime.sendMessage({ url: image.src }, function (response) {
    if (response.isNeedle) {
      image.style.filter = "brightness(0)";
    }
  });
}

function scanForImages() {
  var images = document.getElementsByTagName("img");

  for (var image of images) {
    if (image.dataset.needlephobe) {
      continue;
    }

    image.dataset.needlephobe = true;

    checkImage(image);
  }

  setTimeout(scanForImages, 1000);
}

window.onload = function () {
  scanForImages();
};
