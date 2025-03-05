document.addEventListener("DOMContentLoaded", function() {
    var menuItems = document.querySelectorAll(".nav-main .navigation-menu .navigation-item.has-sub-menu > a");

    menuItems.forEach(item => {
        item.addEventListener("click", function(event) {
            event.preventDefault();
            if(window.innerWidth < 750) {
                return;
            }

            var items = this.closest(".navigation-sub-menu");
            console.log("menu-item", this.closest(".navigation-sub-menu"));

 
            if(this.closest(".has-sub-menu").classList.contains("open")) {
                this.closest(".has-sub-menu").classList.remove("open");
                return;
            }

            if(this.closest(".navigation-sub-menu") == null) {
                menuItems.forEach(itm => {
                    itm.closest(".has-sub-menu").classList.remove("open");
                });
            }else {
                document.querySelectorAll(".nav-main .navigation-menu .navigation-sub-menu .has-sub-menu").forEach(itm => {
                    itm.classList.remove("open");
                });
            }

            this.closest(".has-sub-menu").classList.add("open");
        });
    });

    window.addEventListener("click", function(event) {
        if(window.innerWidth < 750) {
            return;
        }

        if(!event.target.closest("nav.nav-main")) {
            menuItems.forEach(itm => {
                itm.closest(".has-sub-menu").classList.remove("open");
            });
        }
    });
});