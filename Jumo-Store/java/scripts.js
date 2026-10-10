
(() => {
    document.querySelectorAll(".products a").forEach(link => {
        const image = link.querySelector("img");
        const name = link.querySelector("h3, .letters")?.textContent.trim();
        const category = document.querySelector("#topsell")?.textContent.trim();

        if (!image || !name) return;

        const params = new URLSearchParams({
            name,
            image: image.getAttribute("src"),
            category: category || ""
        });
        const salePrice = link.querySelector(".current-price")?.textContent.trim();
        const originalPrice = link.querySelector(".original-price")?.textContent.trim();
        const regularPrice = Array.from(link.querySelectorAll("h3"))
            .map(heading => heading.textContent.trim())
            .find(text => /^RD\$/.test(text));
        const price = salePrice || regularPrice;

        if (price) params.set("price", price);
        if (originalPrice) params.set("originalPrice", originalPrice);

        link.href = `product.html?${params.toString()}`;
    });

    document.querySelectorAll(".cart-link").forEach(link => {
        link.href = "cart.html";
        try {
            const savedCart = localStorage.getItem("jumostore-cart");
            const cart = savedCart ? JSON.parse(savedCart) : [];
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            const countElement = link.querySelector(".cart-count");
            if (countElement) countElement.textContent = count;
        } catch {
            const countElement = link.querySelector(".cart-count");
            if (countElement) countElement.textContent = "!";
        }
    });

    const carousel = document.querySelector(".home-banner");
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".banner-slide"));
    const dots = Array.from(carousel.querySelectorAll(".banner-dot"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeIndex = 0;
    let timer;

    function showSlide(index) {
        slides[activeIndex].classList.remove("is-active");
        slides[activeIndex].setAttribute("aria-hidden", "true");
        slides[activeIndex].inert = true;
        dots[activeIndex].classList.remove("is-active");
        dots[activeIndex].setAttribute("aria-pressed", "false");

        activeIndex = (index + slides.length) % slides.length;

        slides[activeIndex].classList.add("is-active");
        slides[activeIndex].setAttribute("aria-hidden", "false");
        slides[activeIndex].inert = false;
        dots[activeIndex].classList.add("is-active");
        dots[activeIndex].setAttribute("aria-pressed", "true");
    }

    function stopAutoplay() {
        clearInterval(timer);
        timer = undefined;
    }

    function startAutoplay() {
        if (reduceMotion.matches || timer) return;
        timer = setInterval(() => showSlide(activeIndex + 1), 6000);
    }

    function changeSlide(index) {
        showSlide(index);
        stopAutoplay();
        startAutoplay();
    }

    carousel.querySelector(".banner-previous")
        .addEventListener("click", () => changeSlide(activeIndex - 1));
    carousel.querySelector(".banner-next")
        .addEventListener("click", () => changeSlide(activeIndex + 1));

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => changeSlide(index));
    });

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", event => {
        if (!carousel.contains(event.relatedTarget)) startAutoplay();
    });

    startAutoplay();
})();
