// Global variables for the carousel
let autoSlideInterval;
let currentSlideIndex = 0;

// === CAROUSEL FUNCTIONS ===
function showSlide(container, index) {
    const slides = container.selectAll(".slide");
    currentSlideIndex = index;
    slides.classed("active", false);
    slides.filter((d, i) => i === index).classed("active", true);
}

function nextSlide(container) {
    const slides = container.selectAll(".slide");
    const newIndex = (currentSlideIndex + 1) % slides.size();
    showSlide(container, newIndex);
}

function prevSlide(container) {
    const slides = container.selectAll(".slide");
    const newIndex = (currentSlideIndex - 1 + slides.size()) % slides.size();
    showSlide(container, newIndex);
}

function createCarousel(info) {
    const popupContent = d3.select("#popup-content");
    
    const carouselHTML = `
        <h3>${info.state}</h3>
        <div class="carousel-container">
            <div class="slide active">
                <p><strong>Capital:</strong> ${info.capital}</p>
            </div>
            <div class="slide">
                <p>${info.info}</p>
            </div>
            <button class="prev">&#10094;</button>
            <button class="next">&#10095;</button>
        </div>
    `;
    popupContent.html(carouselHTML);

    const carouselContainer = popupContent.select(".carousel-container");

    // Carousel button event listeners
    carouselContainer.select(".prev").on("click", () => {
        prevSlide(carouselContainer);
        clearInterval(autoSlideInterval); // Stop auto-slide on manual navigation
    });

    carouselContainer.select(".next").on("click", () => {
        nextSlide(carouselContainer);
        clearInterval(autoSlideInterval); // Stop auto-slide on manual navigation
    });

    // Start auto-sliding
    showSlide(carouselContainer, 0); // Reset to first slide
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => nextSlide(carouselContainer), 3000);

    d3.select("#popup").classed("hidden", false);
}

// === MAP DRAWING LOGIC ===

// Get dimensions from the window for responsiveness
const width = window.innerWidth;
const height = window.innerHeight * 0.8; // 80vh

// Create the SVG container
const svg = d3.select("#map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Setup popup close button
d3.select(".close-btn").on("click", () => {
    d3.select("#popup").classed("hidden", true);
    clearInterval(autoSlideInterval);
});

// Load data and draw the map
Promise.all([
    d3.json("india_state_geo.json"),
    d3.json("state_data.json")
]).then(([geojsonData, stateData]) => {
    
    // Create a geographic projection and path generator
    const projection = d3.geoMercator().fitSize([width, height], geojsonData);
    const pathGenerator = d3.geoPath().projection(projection);

    // Create a Map for quick lookup of state data
    const dataMap = new Map(stateData.map(d => [d.state, d]));

    // Bind GeoJSON data and draw states
    svg.selectAll("path")
        .data(geojsonData.features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", pathGenerator)
        .attr("fill", d => {
            const stateName = d.properties.NAME_1;
            const info = dataMap.get(stateName);
            return info ? info.mapColor : "#e8e8e8"; // Use custom color or default gray
        })
        .on("click", (event, d) => {
            const stateName = d.properties.NAME_1;
            const info = dataMap.get(stateName);
            if (info) {
                createCarousel(info);
            }
        });
}).catch(error => {
    console.error("Error loading data:", error);
    // You could display an error message to the user here
});
