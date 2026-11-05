const seatsById = {};     
let inspectedId = null;
let cart = [];   
const view = { scale: 1, x: 0, y: 0};
const ZOOM_STEP = 0.2;
const MIN_SCALE = 0.3;
const MAX_SCALE = 2.5;
const MOVE_STEP = 60;
let lastViewportWidth = 0;
const STORAGE_KEY = "meridian-cart";

function renderLegend() {
    const legend = document.getElementById("legend");
    const priceList = document.getElementById("price-list");

    Object.values(TICKET_CATEGORIES).forEach(cat => {
        const swatch = `<span class="swatch" style="background:${cat.color}"></span>`;

        legend.insertAdjacentHTML("beforeend", `<li>${swatch}${cat.name}</li>`);
        priceList.insertAdjacentHTML("beforeend", `<li>${swatch}${cat.name}: <strong>$${cat.price}</strong></li>`);
    });
}


function renderVenue() {
    const canvas = document.getElementById("map-canvas");
    const pitch = VENUE.seatSize + VENUE.seatGap;

    VENUE.sections.forEach(section => {
        const color = TICKET_CATEGORIES[section.category].color;

        for (let r = 0; r < section.rows; r++) {
            const rowLetter = String.fromCharCode(section.firstRow.charCodeAt(0) + r);

            for (let n = 1; n <= section.seatsPerRow; n++) {
                const seat = document.createElement("button");
                seat.type = "button";
                seat.className = "seat";
                seat.dataset.id = makeSeatId(section.id, rowLetter, n);
                seat.style.left = section.origin.x + (n - 1) * pitch + "px";
                seat.style.top = section.origin.y + r * pitch + "px";
                seat.style.setProperty("--seat-color", color);   

                const label = `${rowLetter}-${n}`;                
                seat.setAttribute("aria-label", `${section.name}, row ${rowLetter}, seat ${n}`);

                const isUnavailable = section.unavailable.includes(label);
                if (isUnavailable) {                              
                    seat.disabled = true;
                    seat.classList.add("unavailable");
                }

                seatsById[seat.dataset.id] = {                    
                    id: seat.dataset.id,
                    sectionName: section.name,
                    row: rowLetter,
                    number: n,
                    category: section.category,
                    unavailable: isUnavailable
                };

                canvas.appendChild(seat);
            }
        }
    });

    canvas.addEventListener("click", event => {                   
        const seat = event.target.closest(".seat");
        if (!seat) return;
        inspectSeat(seat.dataset.id);
    });
}

function updateAddButton() {
    const button = document.getElementById("add-to-cart");

    if(inspectedId === null) {
        button.disabled = true;
        button.textContent = "ADD TO CART";
    } else if(cart.includes(inspectedId)) {
        button.disabled = true;
        button.textContent = "ALREADY IN CART";
    } else {
        button.disabled = false;
        button.textContent = "ADD TO CART";
    }
}

function inspectSeat(id) {
    const info = seatsById[id];
    const cat = TICKET_CATEGORIES[info.category];

    const previous = document.querySelector(".seat.inspected");
    if (previous) previous.classList.remove("inspected");

    document.querySelector(`.seat[data-id="${id}"]`).classList.add("inspected");
    inspectedId = id;

    document.getElementById("seat-details").innerHTML = `
        <p><strong>${info.sectionName}</strong></p>
        <p>Row ${info.row}, Seat ${info.number}</p>
        <p>${cat.name}: <strong>$${cat.price}</strong></p>
    `;
    updateAddButton();
}

function fitView() {
    const viewport = document.getElementById("map-viewport");
    const scale = Math.min(
        viewport.clientWidth / VENUE.width,
        viewport.clientHeight / VENUE.height
    );

    view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
    view.x = (viewport.clientWidth - VENUE.width * view.scale) / 2;
    view.y = (viewport.clientHeight - VENUE.height * view.scale) / 2;
}

function applyView() {
    const canvas = document.getElementById("map-canvas");
    canvas.style.transform = 
        `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
}

function setupControls() {
    document.querySelector(".map-controls").addEventListener("click", event => {
        const button = event.target.closest("button");
        if(!button) return;

        const action = button.dataset.action;

        switch (action) {
            case "zoom-in":
                view.scale = Math.min(MAX_SCALE, view.scale + ZOOM_STEP);
                break;
            case "zoom-out":
                view.scale = Math.max(MIN_SCALE, view.scale - ZOOM_STEP);
                break;
            case "move-up":
                view.y += MOVE_STEP;
                break;
            case "move-down":
                view.y -= MOVE_STEP;
                break;
            case "move-left":
                view.x += MOVE_STEP;
                break;
            case "move-right":
                view.x -= MOVE_STEP;
                break;
            case "reset":
                fitView();
                break;
        }

        applyView();
    });
}

function addToCart() {
    if (inspectedId === null) return;
    if (cart.includes(inspectedId)) return;

    cart.push(inspectedId);
    document.querySelector(`.seat[data-id="${inspectedId}"]`).classList.add("in-cart");
    saveCart();
    renderCart();
    updateAddButton();
}

function renderCart() {
    const list = document.getElementById("cart-list");
    list.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        list.innerHTML = '<li class="muted">Your cart is empty.</li>';
    }

    cart.forEach(id => {
        const info = seatsById[id];
        const price = TICKET_CATEGORIES[info.category].price;
        total += price;
        list.insertAdjacentHTML("beforeend",
            `<li>
                ${info.sectionName}, Row ${info.row}, Seat ${info.number} - $${price}
                <button type="button" class="remove-btn" data-id="${id}">Remove</button>
            </li>`);
    });

    document.getElementById("cart-total").textContent = "$" + total;
}

function removeFromCart(id) {
    cart = cart.filter(item => item !== id);
    document.querySelector(`.seat[data-id="${id}"]`).classList.remove("in-cart");
    saveCart();
    renderCart();
    updateAddButton();
}


function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
    let saved = [];
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        saved = [];
    }

    cart = saved.filter(id => seatsById[id] && !seatsById[id].unavailable);
    cart = [...new Set(cart)];

    cart.forEach(id => {
        document.querySelector(`.seat[data-id="${id}"]`).classList.add("in-cart");
    });
    renderCart();
}

function setupResize() {
    const viewport = document.getElementById("map-viewport");
    lastViewportWidth = viewport.clientWidth;

    window.addEventListener("resize", () => {
        if(viewport.clientWidth === lastViewportWidth) return;
        lastViewportWidth = viewport.clientWidth;
        fitView();
        applyView();
    });
}

function setupWheelZoom() {
    const viewport = document.getElementById("map-viewport");

    viewport.addEventListener("wheel", event => {
        event.preventDefault();

        const rect = viewport.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const mapX = (mouseX - view.x) / view.scale;
        const mapY = (mouseY - view.y) / view.scale;

        const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
        view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));

        view.x = mouseX - mapX * view.scale;
        view.y = mouseY - mapY * view.scale;

        applyView();

    }, {passive: false});
}

function setupDragPan() {
    const viewport = document.getElementById("map-viewport");
    const DRAG_THRESHOLD = 5;

    let pressed = false;
    let dragging = false;
    let suppressClick = false;
    let startX = 0, startY = 0;
    let startViewX = 0, startViewY = 0;

    viewport.addEventListener("pointerdown", event => {
        if(event.button !== 0) return;
        pressed = true;
        dragging = false;
        startX = event.clientX;
        startY = event.clientY;
        startViewX = view.x;
        startViewY = view.y;
    });

    viewport.addEventListener("pointermove", event => {
        if(!pressed) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if(!dragging) {
            if(Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
            dragging = true;
            viewport.setPointerCapture(event.pointerId);
            viewport.classList.add("dragging");
        }

        view.x = startViewX + dx;
        view.y = startViewY + dy;
        applyView();
    });

    function endDrag() {
        if (!pressed) return;
            pressed = false;
        if (dragging) {
            viewport.classList.remove("dragging");
            suppressClick = true;
            setTimeout(() => { suppressClick = false; }, 0);
        }
        dragging = false;
    }

    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    // runs before the seat click handler, and blocks it after a drag
    viewport.addEventListener("click", event => {
        if (suppressClick) {
            event.stopPropagation();
            event.preventDefault();
        }
    }, true);
}

// LOAD EVERYTHING
function initialize() {
    renderLegend();
    renderVenue();
    loadCart();
    setupControls();
    fitView();
    applyView();
    setupResize();
    setupWheelZoom();
    setupDragPan();
    console.log(`${VENUE.name}: ${VENUE.sections.length} sections, ${countSeats(VENUE)} seats`);
    document.getElementById("add-to-cart").addEventListener("click", addToCart);
    document.getElementById("cart-list").addEventListener("click", event => {
        const button = event.target.closest(".remove-btn");
        if (!button) return;
        removeFromCart(button.dataset.id);
    });
}

initialize();