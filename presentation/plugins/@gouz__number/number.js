const windowSlideskPluginNumberFormat =
  window.slidesk.env.PLUGIN_NUMBER_FORMAT || "%n";

window.slidesk.plugin_number = () => {
  document.getElementById("numslide").innerText =
    windowSlideskPluginNumberFormat
      .replace("%n", window.slidesk.currentSlide + 1)
      .replace("%t", window.slidesk.slides.length);
};
