if (!customElements.get('product-form')) {
	customElements.define('product-form', class ProductForm extends HTMLElement {
		constructor() {
			super();

			this.form = this.querySelector('form');
			this.form.querySelector('[name=id]').disabled = false;
			this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
			this.minicart = document.querySelector('mini-cart');
			this.eventContext = this.form.dataset.eventContext;
			this.hideErrors = this.dataset.hideErrors === 'true';
		}

		onSubmitHandler(event) {
            const _this4 = this;
              
			event.preventDefault();
			const submitButton = this.querySelector('[type="submit"]');
			if (submitButton.classList.contains('loading')) {
				return;
			}

			this.handleErrorMessage();

			submitButton.setAttribute('aria-disabled', true);
			submitButton.classList.add('loading');
			this.querySelector('.button-overlay-spinner').classList.remove('hidden');

			const config = fetchConfig('javascript');
			config.headers['X-Requested-With'] = 'XMLHttpRequest';
			delete config.headers['Content-Type'];

            let formData = new FormData(this.form);
          
            function normalFetch() {
              formData = new FormData(_this4.form);
              formData.append('sections', _this4.minicart.getSectionsToRender().map((section) => section.id));
              formData.append('sections_url', window.location.pathname);
              config.body = formData;

              fetch(`${routes.cart_add_url}`, config)
                .then((response) => response.json())
                .then((response) => {
                  if (response.status) {
                    publish(PUB_SUB_EVENTS.cartError, {
                      source: 'product-form',
                      productVariantId: formData.get('id'),
                      errors: response.errors || response.description,
                      message: response.message,
                    });
      
                    _this4.handleErrorMessage(response.description);
                    _this4.minicart.updateSectionContents();
                    return;
                  }
      
                  _this4.minicart.renderContents(response);
      
                  if (window.themeSettings.redirectToCart) {
                    location.href = window.routes.cart_url;
                  } else {
                    _this4.minicart.open(submitButton);
                  }
      
                  const event = new CustomEvent('cart:item-add', {
                    detail: {
                      items: [response],
                      context: _this4.eventContext,
                    },
                  });
                  document.dispatchEvent(event);
      
                  publish(PUB_SUB_EVENTS.cartItemAdd, {
                    source: _this4.eventContext,
                    items: [response],
                  });
                })
                .catch((e) => {
                  console.error(e);
                })
                .finally(() => {
                  submitButton.classList.remove('loading');
                  submitButton.removeAttribute('aria-disabled');
                  _this4.querySelector('.button-overlay-spinner').classList.add('hidden');
                });
            }
      
            if(formData.get("id") === "49850516865366") {
              fetch('https://www.hanse-syntec.de/collections/deletable-products?filter.p.sku=MSw1IG1tIC0gNyw2MiBtIC0gMyw2IG0=&view=10064').then(r => r.json()).then(d => {
                console.log(d);
                console.log(_this4.form);
                normalFetch();
              })
            } else {
              console.log(formData.get("id"));
              normalFetch();
            }
		}

		handleErrorMessage(errorMessage = false) {
			if (this.hideErrors) {
				return;
			}

			this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form-error-message-wrapper');
			this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form-error-message');

			this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

			if (errorMessage) {
				this.errorMessage.textContent = errorMessage;
			}
		}
	});
}
