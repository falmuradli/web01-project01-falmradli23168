// ---- State (top of file) ----
const seatsById = {};     // "ORF-A-07" -> info about that seat
let inspectedId = null;   // which seat is currently inspected

// ---- Legend ----
function renderLegend() {
    const legend = document.getElementById("legend");
    const priceList = document.getElementById("price-list");

    Object.values(TICKET_CATEGORIES).forEach(cat => {
        const swatch = `<span class="swatch" style="background:${cat.color}"></span>`;

        legend.insertAdjacentHTML("beforeend", `<li>${swatch}${cat.name}</li>`);
        priceList.insertAdjacentHTML("beforeend", `<li>${swatch}${cat.name}: <strong>$${cat.price}</strong></li>`);
    });
}

// ---- Venue ----
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
                seat.style.setProperty("--seat-color", color);   // Step 2

                const label = `${rowLetter}-${n}`;                // Step 2
                seat.setAttribute("aria-label", `${section.name}, row ${rowLetter}, seat ${n}`);

                const isUnavailable = section.unavailable.includes(label);
                if (isUnavailable) {                              // Step 2
                    seat.disabled = true;
                    seat.classList.add("unavailable");
                }

                seatsById[seat.dataset.id] = {                    // Step 3a
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

    canvas.addEventListener("click", event => {                   // Step 3c
        const seat = event.target.closest(".seat");
        if (!seat) return;
        inspectSeat(seat.dataset.id);
    });
}

// ---- Inspection (Step 3b) ----
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
    document.getElementById("add-to-cart").disabled = false;
}

// ---- Start ----
function initialize() {
    renderLegend();
    renderVenue();
    console.log(`${VENUE.name}: ${VENUE.sections.length} sections, ${countSeats(VENUE)} seats`);
}

initialize();