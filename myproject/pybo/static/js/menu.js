document.addEventListener("DOMContentLoaded", function () {
    const mainMenu = document.getElementById("main-menu");
    const subMenu = document.getElementById("sub-menu");
    const content = document.getElementById("content");

    // Load main menu
    fetch("main-menu.html")
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            mainMenu.innerHTML = data;
            initializeMainMenu();
        })
        .catch(function (error) {
            console.error("Error loading main-menu.html:", error);
        });

    function initializeMainMenu() {
        const menuItems = document.querySelectorAll("#main-menu a");
        menuItems.forEach(function (menuItem) {
            menuItem.addEventListener("click", function (event) {
                event.preventDefault();
                const submenuUrl = this.getAttribute("data-submenu");
                loadSubMenu(submenuUrl);
            });
        });
    }

    function loadSubMenu(url) {
        fetch(url)
            .then(function (response) {
                return response.text();
            })
            .then(function (data) {
                subMenu.innerHTML = data;
                initializeSubMenu();
            })
            .catch(function (error) {
                console.error("Error loading sub-menu:", error);
            });
    }

    function initializeSubMenu() {
        const subMenuItems = document.querySelectorAll("#sub-menu a");
        subMenuItems.forEach(function (subMenuItem) {
            subMenuItem.addEventListener("click", function (event) {
                event.preventDefault();
                const contentUrl = this.getAttribute("data-content");
                loadContent(contentUrl);
            });
        });
    }

    function loadContent(url) {
        fetch(url)
            .then(function (response) {
                return response.text();
            })
            .then(function (data) {
                content.innerHTML = data;
            })
            .catch(function (error) {
                console.error("Error loading content:", error);
            });
    }
});
