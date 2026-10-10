(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const price = params.get("price");
    const imagePath = params.get("image");
    const category = params.get("category");
    const image = document.querySelector("#product-image");
    const unitSelect = document.querySelector("#product-unit");
    const imageUrl = imagePath && new URL(imagePath, document.baseURI);
    const imageDirectory = new URL("../css/images/", document.baseURI);

    if (!name || !price || !imageUrl
        || imageUrl.origin !== imageDirectory.origin
        || !imageUrl.pathname.startsWith(imageDirectory.pathname)) {
        document.querySelector(".product-details").hidden = true;
        document.querySelector("#product-error").hidden = false;
        return;
    }

    document.title = `JumoStore | ${name}`;
    document.querySelector("#product-name").textContent = name;
    document.querySelector("#product-price").textContent = price;
    image.src = imageUrl.href;
    image.alt = name;

    const originalPrice = params.get("originalPrice");
    if (originalPrice) {
        const originalPriceElement = document.querySelector("#product-original-price");
        originalPriceElement.textContent = `Precio regular: ${originalPrice}`;
        originalPriceElement.hidden = false;
    }

    document.querySelector("#product-description").textContent = name;
    document.querySelector("#product-tax-note").textContent =
        "Taxes included. Shipping costs are calculated at checkout.";

    if (category?.toLocaleUpperCase() === "CERVEZA") {
        const sixPackOption = document.createElement("option");
        sixPackOption.value = "6";
        sixPackOption.textContent = "6 units";
        unitSelect.append(sixPackOption);
    }

    const cartLink = document.querySelector(".cart-link");
    const cartCount = document.querySelector(".cart-count");
    const cartMessage = document.querySelector("#cart-message");
    const addToCartButton = document.querySelector("#add-to-cart");

    function readCart() {
        const savedCart = localStorage.getItem("jumostore-cart");
        return savedCart ? JSON.parse(savedCart) : [];
    }

    function updateCartCount() {
        const cart = readCart();
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    cartLink.href = "cart.html";
    try {
        updateCartCount();
    } catch {
        cartMessage.textContent = "Your cart could not be loaded. Please check your browser storage settings.";
        cartMessage.hidden = false;
    }

    addToCartButton.addEventListener("click", () => {
        const quantityInput = document.querySelector("#product-quantity");
        const quantity = quantityInput.valueAsNumber;

        if (!Number.isInteger(quantity) || quantity < 1) {
            quantityInput.setCustomValidity("Enter a whole number of 1 or more.");
            quantityInput.reportValidity();
            return;
        }

        quantityInput.setCustomValidity("");
        const priceValue = Number(price.replace(/[^\d.]/g, ""));
        if (!Number.isFinite(priceValue)) {
            cartMessage.textContent = "This product has an invalid price and could not be added.";
            cartMessage.hidden = false;
            return;
        }

        try {
            const cart = readCart();
            const unitCount = Number(unitSelect.value);
            const unit = unitCount === 6 ? "6 units" : "Unit";
            const existingItem = cart.find(item => item.name === name && item.unit === unit);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    name,
                    image: imagePath,
                    price: priceValue,
                    priceLabel: price,
                    quantity,
                    unit,
                    unitCount
                });
            }

            localStorage.setItem("jumostore-cart", JSON.stringify(cart));
            window.location.href = "cart.html";
        } catch {
            cartMessage.textContent = "The product could not be added to your cart. Please check your browser storage settings.";
            cartMessage.hidden = false;
        }
    });
})();
