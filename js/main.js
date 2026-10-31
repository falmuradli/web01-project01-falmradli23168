function renderLegend() {
    const legend = document.getElementById("legend");
    const priceList = document.getElementById("price-list");

    Object.values(TICKET_CATEGORIES).forEach(cat => {
        const swatch = `<span class="swatch" style="background:${cat.color}"></span>`;
        
        legend.insertAdjacentHTML("beforeend", `<li>${swatch}${cat.name}</li>`);
        priceList.insertAdjacentHTML("beforeend", `<li>${swatch}${cat.name}: <strong>$${cat.price}</strong></li>`);
    });
}

function initialize() {
    renderLegend();
    renderVenue();
    console.log(`${VENUE.name}: ${VENUE.sections.length} sections, ${countSeats(VENUE)} seats`);

}

initialize();

function renderVenue() {
    const canvas = document.getElementById("map-canvas");
    const pitch = VENUE.seatSize + VENUE.seatGap;

    VENUE.sections.forEach(section => {
        const color = TICKET_CATEGORIES[section.category].color;

        for(let r = 0; r < section.rows; r++) {
            const rowLetter = String.fromCharCode(section.firstRow.charCodeAt(0) + r);

            for(let n = 1; n <= section.seatsPerRow; n++) {
                const seat = document.createElement("button");
                seat.type = "button";
                seat.className = "seat";
                seat.dataset.id = makeSeatId(section.id, rowLetter, n);
                seat.style.left = section.origin.x + (n - 1) * pitch + "px";
                seat.style.top = section.origin.y + r * pitch + "px";
                seat.style.background = color;
                canvas.appendChild(seat);
            }
        }
        
    });
}