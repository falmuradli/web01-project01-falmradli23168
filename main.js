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
    console.log(`${VENUE.name}: ${VENUE.sections.length} sections, ${countSeats(VENUE)} seats`);

}

initialize();