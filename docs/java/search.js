(() => {
    const searchForm = document.querySelector(".search-form");
    const searchInput = searchForm.querySelector(".search-input");
    const status = document.querySelector("#search-status");
    const results = document.querySelector("#search-results");
    const query = new URLSearchParams(window.location.search).get("q")?.trim() || "";
    const catalogPages = ["Cerveza.html", "Vines.html", "ron.html", "whisky.html", "Sales.html"];

    searchInput.value = query;

    function normalize(value) {
        return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
    }

    function createProductHref(product) {
        const params = new URLSearchParams({
            name: product.name,
            image: product.image,
            category: product.category
        });
        if (product.price) params.set("price", product.price);
        if (product.originalPrice) params.set("originalPrice", product.originalPrice);
        return `product.html?${params.toString()}`;
    }

    async function loadProducts() {
        const pages = await Promise.all(catalogPages.map(async page => {
            const response = await fetch(page);
            if (!response.ok) {
                throw new Error(`Could not load the ${page} product list.`);
            }
            return { page, html: await response.text() };
        }));
        const products = [];
        const productIndexes = new Map();

        pages.forEach(({ page, html }) => {
            const pageDocument = new DOMParser().parseFromString(html, "text/html");
            const category = pageDocument.querySelector("#topsell")?.textContent.trim() || "";

            pageDocument.querySelectorAll(".products a").forEach(link => {
                const image = link.querySelector("img");
                const nameHeading = Array.from(link.querySelectorAll("h3, .letters"))
                    .find(heading => !/^RD\s?\$/i.test(heading.textContent.trim()));
                const name = nameHeading?.textContent.trim();
                const key = name && normalize(name);

                if (!image || !name) return;

                const currentPrice = link.querySelector(".current-price")?.textContent.trim()
                    || Array.from(link.querySelectorAll("h3"))
                        .map(heading => heading.textContent.trim())
                        .find(text => /^RD\s?\$/i.test(text))
                    || "";
                const originalPrice = link.querySelector(".original-price")?.textContent.trim();
                const imageUrl = new URL(image.getAttribute("src"), new URL(page, document.baseURI)).href;
                const existingIndex = productIndexes.get(key);
                if (existingIndex !== undefined) {
                    if (page === "Sales.html") {
                        const product = products[existingIndex];
                        product.price = currentPrice || product.price;
                        product.originalPrice = originalPrice;
                        product.href = createProductHref(product);
                    }
                    return;
                }

                const product = {
                    name,
                    category,
                    price: currentPrice,
                    originalPrice,
                    image: imageUrl
                };
                product.href = createProductHref(product);
                productIndexes.set(key, products.length);
                products.push(product);
            });
        });

        return products;
    }

    function renderProduct(product) {
        const link = document.createElement("a");
        link.className = "search-result";
        link.href = product.href;

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;

        const name = document.createElement("h2");
        name.textContent = product.name;

        const category = document.createElement("p");
        category.textContent = product.category;

        link.append(image, name, category);

        if (product.originalPrice) {
            const originalPrice = document.createElement("p");
            originalPrice.className = "search-original-price";
            originalPrice.textContent = product.originalPrice;
            link.append(originalPrice);
        }

        if (product.price) {
            const price = document.createElement("p");
            price.textContent = product.price;
            link.append(price);
        }

        return link;
    }

    async function searchProducts() {
        if (!query) {
            status.textContent = "Enter a product name to search.";
            searchInput.focus();
            return;
        }

        status.textContent = "Searching products...";
        try {
            const products = await loadProducts();
            const terms = normalize(query).split(/\s+/).filter(Boolean);
            const matches = products.filter(product => {
                const searchableText = normalize(`${product.name} ${product.category} ${product.price}`);
                return terms.every(term => searchableText.includes(term));
            });

            results.replaceChildren(...matches.map(renderProduct));
            status.textContent = matches.length
                ? `${matches.length} product${matches.length === 1 ? "" : "s"} found.`
                : `No products found for "${query}".`;
        } catch (error) {
            status.textContent = `Search could not be completed: ${error.message}`;
            status.setAttribute("role", "alert");
        }
    }

    searchForm.addEventListener("submit", event => {
        if (!searchInput.value.trim()) {
            event.preventDefault();
            status.textContent = "Enter a product name to search.";
            searchInput.focus();
        }
    });

    searchProducts();
})();
