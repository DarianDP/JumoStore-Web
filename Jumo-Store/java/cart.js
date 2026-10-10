(() => {
    const cartItems = document.querySelector("#cart-items");
    const cartCount = document.querySelector(".cart-count");
    const emptyMessage = document.querySelector("#cart-empty");
    const errorMessage = document.querySelector("#cart-error");
    const totalElement = document.querySelector("#cart-total");
    const checkoutButton = document.querySelector("#checkout-button");
    const currency = amount => `RD$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    let cart = [];

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.hidden = false;
        emptyMessage.hidden = true;
        totalElement.hidden = true;
    }

    function saveCart(rollback) {
        try {
            localStorage.setItem("jumostore-cart", JSON.stringify(cart));
            renderCart();
        } catch {
            rollback();
            showError("Your cart could not be updated. Please check your browser storage settings.");
        }
    }

    function renderCart() {
        cartItems.replaceChildren();
        errorMessage.hidden = true;
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);

        if (cart.length === 0) {
            emptyMessage.hidden = false;
            totalElement.hidden = true;
            checkoutButton.hidden = true;
            return;
        }

        emptyMessage.hidden = true;
        checkoutButton.hidden = false;
        let total = 0;
        cart.forEach((item, index) => {
            const row = document.createElement("article");
            row.className = "cart-item";

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.name;

            const details = document.createElement("div");
            details.className = "cart-item-details";
            const name = document.createElement("h2");
            name.textContent = item.name;
            const unitAndQuantity = document.createElement("p");
            unitAndQuantity.textContent = item.unit;
            const unitCount = Number.isSafeInteger(item.unitCount) && item.unitCount > 0
                ? item.unitCount
                : 1;
            const quantityControls = document.createElement("div");
            quantityControls.className = "cart-quantity";
            const decreaseButton = document.createElement("button");
            decreaseButton.className = "cart-quantity-button";
            decreaseButton.type = "button";
            decreaseButton.textContent = "−";
            decreaseButton.disabled = item.quantity === 1;
            decreaseButton.setAttribute("aria-label", `Decrease ${item.name} quantity`);
            decreaseButton.addEventListener("click", () => {
                item.quantity -= 1;
                saveCart(() => { item.quantity += 1; });
            });
            const quantityValue = document.createElement("span");
            quantityValue.textContent = item.quantity;
            quantityValue.setAttribute("aria-label", `Quantity: ${item.quantity}`);
            const increaseButton = document.createElement("button");
            increaseButton.className = "cart-quantity-button";
            increaseButton.type = "button";
            increaseButton.textContent = "+";
            increaseButton.setAttribute("aria-label", `Increase ${item.name} quantity`);
            increaseButton.addEventListener("click", () => {
                if (!Number.isSafeInteger(item.quantity + 1)) return;
                item.quantity += 1;
                saveCart(() => { item.quantity -= 1; });
            });
            quantityControls.append(decreaseButton, quantityValue, increaseButton);
            const price = document.createElement("p");
            price.textContent = unitCount === 1
                ? `${item.priceLabel || currency(item.price)} each`
                : `${currency(item.price * unitCount)} per pack (${unitCount} units)`;
            const lineTotal = document.createElement("strong");
            lineTotal.textContent = currency(item.price * item.quantity * unitCount);
            const purchaseDetails = document.createElement("div");
            purchaseDetails.className = "cart-item-purchase";
            purchaseDetails.append(price, lineTotal);
            const removeButton = document.createElement("button");
            removeButton.className = "remove-cart-item";
            removeButton.type = "button";
            removeButton.textContent = "Remove";
            removeButton.setAttribute("aria-label", `Remove ${item.name} from cart`);
            removeButton.addEventListener("click", () => {
                const [removedItem] = cart.splice(index, 1);
                saveCart(() => { cart.splice(index, 0, removedItem); });
            });

            details.append(name, unitAndQuantity, purchaseDetails, quantityControls);
            row.append(image, details, removeButton);
            cartItems.append(row);
            total += item.price * item.quantity * unitCount;
        });

        totalElement.textContent = `Subtotal: ${currency(total)}`;
        totalElement.hidden = false;
    }

    try {
        const savedCart = localStorage.getItem("jumostore-cart");
        cart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(cart) || cart.some(item =>
            !item || typeof item.name !== "string" || typeof item.image !== "string"
            || typeof item.price !== "number" || !Number.isFinite(item.price)
            || !Number.isInteger(item.quantity) || item.quantity < 1
            || typeof item.unit !== "string")) {
            throw new Error("The saved cart has an invalid format.");
        }

        renderCart();
    } catch {
        showError("Your cart could not be loaded. Please check your browser storage settings.");
    }
})();
