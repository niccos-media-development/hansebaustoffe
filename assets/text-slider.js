if (!customElements.get("text-slider")) {
  customElements.define(
    "text-slider",
    class TextSlider extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.slideshowSelector = this.dataset.slideshowSelector;
        this.carousel = this.slideshowSelector
          ? this.querySelector(this.slideshowSelector)
          : this.querySelector(".media-icon-items-grid");
        this.initialize();
      }

      initialize() {
        const autoplayEnabled = this.getAttribute("data-autoplay") === "true";
        const autoPlaySpeed =
          parseInt(this.getAttribute("data-speed"), 10) * 1000;
        this.animationType =
          this.getAttribute("data-animation-type") ?? "slide";
        this.autoPlayEnabled = autoplayEnabled && autoPlaySpeed > 0;

        const cellSelector = this.dataset.cellSelector ?? ".media-icon-item";

        if (this.dataset.setDisplay === "true") {
          this.carousel.style.display = "block";
        }

        this.flickity = new Flickity(this.carousel, {
          autoPlay: autoplayEnabled ? autoPlaySpeed : false,
          cellAlign: "center",
          groupCells: false,
          contain: true,
          resize: true,
          draggable: true,
          prevNextButtons: false,
          cellSelector: cellSelector,
          initialIndex: 0,
          pageDots: false,
          wrapAround: true,
          accessibility: false,
          watchCSS: true,
        });
      }
    }
  );
}
