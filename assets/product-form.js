
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

            let formData;



            formData = new FormData(this.form);
            if(formData.get("id") === "49850516865366") {
              let sku = [ "dicke", "breite", "launge" ].map(d => document.getElementById('LineItemProperty-' + d).value).map(n => Number(n.match(/^[0-9,.]+/)?.[0]?.replaceAll(",", "."))).join(" - ")

              fetch("https://www.hanse-syntec.de/collections/deletable-products?filter.p.sku=" + Base64.encode(sku) + "&view=10064").then(d => d.text()).then(data => {
                if(data.length > 0) {
                  let variant = JSON.parse(data);
                  if(variant.available === true)
                    this.form.querySelector('[name="id"]').setAttribute('value', variant.id);
                }

              formData = new FormData(this.form);
              formData.append('sections', this.minicart.getSectionsToRender().map((section) => section.id));
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
    
                          this.handleErrorMessage(response.description);
                          this.minicart.updateSectionContents();
                          return;
                      }
    
                      this.minicart.renderContents(response);
    
                      if (window.themeSettings.redirectToCart) {
                          location.href = window.routes.cart_url;
                      } else {
                          this.minicart.open(submitButton);
                      }
    
                      const event = new CustomEvent('cart:item-add', {
                          detail: {
                              items: [response],
                              context: this.eventContext,
                          },
                      });
                      document.dispatchEvent(event);
    
                      publish(PUB_SUB_EVENTS.cartItemAdd, {
                          source: this.eventContext,
                          items: [response],
                      });
                  })
                  .catch((e) => {
                      console.error(e);
                  })
                  .finally(() => {
                      submitButton.classList.remove('loading');
                      submitButton.removeAttribute('aria-disabled');
                      this.querySelector('.button-overlay-spinner').classList.add('hidden');
                  });
              })

            } else {
              
              formData = new FormData(this.form);
              formData.append('sections', this.minicart.getSectionsToRender().map((section) => section.id));
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
    
                          this.handleErrorMessage(response.description);
                          this.minicart.updateSectionContents();
                          return;
                      }
    
                      this.minicart.renderContents(response);
    
                      if (window.themeSettings.redirectToCart) {
                          location.href = window.routes.cart_url;
                      } else {
                          this.minicart.open(submitButton);
                      }
    
                      const event = new CustomEvent('cart:item-add', {
                          detail: {
                              items: [response],
                              context: this.eventContext,
                          },
                      });
                      document.dispatchEvent(event);
    
                      publish(PUB_SUB_EVENTS.cartItemAdd, {
                          source: this.eventContext,
                          items: [response],
                      });
                  })
                  .catch((e) => {
                      console.error(e);
                  })
                  .finally(() => {
                      submitButton.classList.remove('loading');
                      submitButton.removeAttribute('aria-disabled');
                      this.querySelector('.button-overlay-spinner').classList.add('hidden');
                  });
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
