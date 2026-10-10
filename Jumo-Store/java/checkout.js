(() => {
    const itemsContainer = document.querySelector("#checkout-items");
    const cartCount = document.querySelector(".cart-count");
    const emptyMessage = document.querySelector("#checkout-empty");
    const errorMessage = document.querySelector("#checkout-error");
    const totalElement = document.querySelector("#checkout-total");
    const note = document.querySelector("#checkout-note");
    const currency = amount => `RD$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

    try {
        const savedCart = localStorage.getItem("jumostore-cart");
        const cart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(cart) || cart.some(item =>
            !item || typeof item.name !== "string" || typeof item.image !== "string"
            || typeof item.price !== "number" || !Number.isFinite(item.price)
            || !Number.isInteger(item.quantity) || item.quantity < 1
            || typeof item.unit !== "string")) {
            throw new Error("The saved cart has an invalid format.");
        }

        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        if (cart.length === 0) {
            emptyMessage.hidden = false;
        } else {
            let total = 0;
            cart.forEach(item => {
                const unitCount = Number.isSafeInteger(item.unitCount) && item.unitCount > 0
                    ? item.unitCount
                    : 1;
                const row = document.createElement("article");
                row.className = "checkout-item";

                const image = document.createElement("img");
                image.src = item.image;
                image.alt = item.name;

                const details = document.createElement("div");
                const name = document.createElement("h2");
                name.textContent = item.name;
                const quantity = document.createElement("p");
                quantity.textContent = `${item.quantity} × ${item.unit}`;
                const price = document.createElement("p");
                price.textContent = unitCount === 1
                    ? `${item.priceLabel || currency(item.price)} each`
                    : `${currency(item.price * unitCount)} per pack (${unitCount} units)`;
                const lineTotal = document.createElement("strong");
                lineTotal.textContent = currency(item.price * item.quantity * unitCount);

                details.append(name, quantity, price, lineTotal);
                row.append(image, details);
                itemsContainer.append(row);
                total += item.price * item.quantity * unitCount;
            });

            totalElement.textContent = `Subtotal: ${currency(total)}`;
            totalElement.hidden = false;
            note.hidden = false;
        }
    } catch {
        errorMessage.textContent =
            "Your order could not be loaded. Please check your browser storage settings.";
        errorMessage.hidden = false;
    }
})();
