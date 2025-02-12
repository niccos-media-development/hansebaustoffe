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
            this.base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
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

            function doFetch() {
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

            formData = new FormData(this.form);
            if(formData.get("id") === "49850516865366") {
              fetch("https://www.hanse-syntec.de/collections/deletable-products?filter.p.sku=" + this.base64("1,5 mm - 7,62 m - 3,6 m") + "&view=10064").then(d => d.text()).then(data => {
                if(data.length > 0) {
                  let variant = JSON.parse(data);
                  this.form.querySelector('[name="id"]').setAttribute('value', variant.id);
                }
              })
              doFetch();
            } else {
              doFetch();
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
