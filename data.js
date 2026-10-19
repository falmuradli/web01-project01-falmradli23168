const TICKET_CATEGORIES = {
    vip:      { name: "VIP Box",   price: 120, color: "#c0392b" },
    premium:  { name: "Premium",   price: 90,  color: "#e2b04a" },
    standard: { name: "Standard",  price: 60,  color: "#3a8fd9" },
    balcony:  { name: "Balcony",   price: 35,  color: "#4fb286" }
};


const VENUE  = {
    name: "Grand Meridian Theatre",
    width: 1000,
    height: 700,
    seatSize: 22,
    seatGap: 6,

    sections: [
        {
            id:"BOXL", name: "Box left", category:"VIP",
            origin: {x:12, y:200}, firstRow: "A", rows: 4, seatsPerRow: 2,
            unavailable: ["A-1"]
        },

        {
            id: "BOXr", name: "Box right", category:"VIP",
            origin: {x:932, y:200}, firstRow:"A", rows:4, seatsPerRow:2,
            unavailable: ["B-2"]
        },

        {
            id: "ORL", name: "Orchestra left", category:"standard",
            origin: {x:100, y:200}, firstRow:"A", rows:10, seatsPerRow:6,
            unavailable:["C-1", "C-2", "F-5", "F-6"]
        },

        {
            id: "ORF", name: "Orchestra Front", category: "premium",
            origin: { x: 304, y: 200 }, firstRow: "A", rows: 4, seatsPerRow: 14,
            unavailable: ["A-6", "A-7", "A-8", "B-3", "B-4", "D-10"]
        },

        {
            id: "ORR", name: "Orchestra Rear", category: "standard",
            origin: { x: 304, y: 312 }, firstRow: "E", rows: 6, seatsPerRow: 14,
            unavailable: ["E-1", "G-7", "G-8", "J-12", "J-13"]
        },

        {
            id: "ORRT", name: "Orchestra Right", category: "standard",
            origin: { x: 732, y: 200 }, firstRow: "A", rows: 10, seatsPerRow: 6,
            unavailable: ["B-4", "H-1", "H-2"]
        },

        {
            id: "BAL", name: "Balcony", category: "balcony",
            origin: { x: 164, y: 540 }, firstRow: "K", rows: 4, seatsPerRow: 24,
            unavailable: ["K-11", "K-12", "L-12", "L-13", "N-1"]
        }
    ]
};

function makeSeatId(sectionId, row, number) {
    return `${sectionId}-${row}-${String(number).padStart(2, "0")}`;
}

function countSeats(venue) {
    return venue.sections.reduce((sum, s) => sum + s.rows * s.seatsPerRow, 0);
}