let foods = [];
let selectedFood = null;


// =============================
// LOAD FOOD DATA
// =============================

async function loadFoods() {
    try {
        const response = await fetch("/api/foods");
        foods = await response.json();

        displayFoods();
        updateStatistics();

    } catch (error) {
        console.error("Error loading foods:", error);
    }
}


// =============================
// OPEN FRIDGE
// =============================

const openFridgeBtn =
    document.getElementById("openFridgeBtn");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const mainApp =
    document.getElementById("mainApp");


openFridgeBtn.addEventListener("click", () => {

    const fridgeDoor =
        document.querySelector(".fridge-door");

    fridgeDoor.classList.add("open");

    setTimeout(() => {

        welcomeScreen.classList.add("hidden");
        mainApp.classList.remove("hidden");

        loadFoods();

    }, 900);
});


// =============================
// CLOSE FRIDGE
// =============================

document
    .getElementById("closeFridgeBtn")
    .addEventListener("click", () => {

        mainApp.classList.add("hidden");
        welcomeScreen.classList.remove("hidden");

        document
            .querySelector(".fridge-door")
            .classList.remove("open");
    });


// =============================
// GET FOOD EMOJI
// =============================

function getFoodEmoji(name) {

    const food = name.toLowerCase();

    if (food.includes("milk")) return "🥛";
    if (food.includes("cheese")) return "🧀";
    if (food.includes("apple")) return "🍎";
    if (food.includes("banana")) return "🍌";
    if (food.includes("orange")) return "🍊";
    if (food.includes("broccoli")) return "🥦";
    if (food.includes("carrot")) return "🥕";
    if (food.includes("tomato")) return "🍅";
    if (food.includes("egg")) return "🥚";
    if (food.includes("chocolate")) return "🍫";
    if (food.includes("juice")) return "🧃";
    if (food.includes("bread")) return "🍞";
    if (food.includes("chicken")) return "🍗";
    if (food.includes("fish")) return "🐟";

    return "🍱";
}


// =============================
// CALCULATE EXPIRY STATUS
// =============================

function getExpiryStatus(expiryDate) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const difference =
        expiry - today;

    const days =
        Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );

    if (days < 0) {

        return {
            text: `Expired ${Math.abs(days)} day(s) ago`,
            className: "expired",
            days: days
        };

    }

    if (days <= 3) {

        return {
            text: `Expires in ${days} day(s)`,
            className: "soon",
            days: days
        };

    }

    return {
        text: `Expires in ${days} day(s)`,
        className: "fresh",
        days: days
    };
}


// =============================
// FORMAT DATE
// =============================

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =============================
// DISPLAY FOOD ITEMS
// =============================

function displayFoods() {

    const dairyContainer =
        document.getElementById("dairyContainer");

    const fruitsContainer =
        document.getElementById("fruitsContainer");

    const otherContainer =
        document.getElementById("otherContainer");


    dairyContainer.innerHTML = "";
    fruitsContainer.innerHTML = "";
    otherContainer.innerHTML = "";


    foods.forEach(food => {

        const status =
            getExpiryStatus(food.expiry_date);


        const card =
            document.createElement("div");

        card.className = "food-card";


        card.innerHTML = `

            <div class="food-emoji">
                ${getFoodEmoji(food.name)}
            </div>

            <h4>${food.name}</h4>

            <p class="expiry-text">
                Expires: ${formatDate(food.expiry_date)}
            </p>

            <span class="status ${status.className}">
                ${status.text}
            </span>
        `;


        card.addEventListener(
            "click",
            () => showFoodDetails(food)
        );


        if (food.category === "Dairy & Drinks") {

            dairyContainer.appendChild(card);

        } else if (
            food.category === "Fruits & Vegetables"
        ) {

            fruitsContainer.appendChild(card);

        } else {

            otherContainer.appendChild(card);
        }

    });


    showEmptyMessage(
        dairyContainer,
        "No dairy or drinks"
    );

    showEmptyMessage(
        fruitsContainer,
        "No fruits or vegetables"
    );

    showEmptyMessage(
        otherContainer,
        "No other items"
    );
}


// =============================
// EMPTY CATEGORY MESSAGE
// =============================

function showEmptyMessage(
    container,
    message
) {

    if (container.children.length === 0) {

        const empty =
            document.createElement("p");

        empty.textContent = message;

        empty.style.color = "#89979b";

        container.appendChild(empty);
    }
}


// =============================
// UPDATE STATISTICS
// =============================

function updateStatistics() {

    const total =
        foods.length;

    let expired = 0;
    let expiringSoon = 0;


    foods.forEach(food => {

        const status =
            getExpiryStatus(food.expiry_date);


        if (status.days < 0) {

            expired++;

        } else if (status.days <= 3) {

            expiringSoon++;
        }

    });


    document.getElementById(
        "totalItems"
    ).textContent = total;


    document.getElementById(
        "expiringSoon"
    ).textContent = expiringSoon;


    document.getElementById(
        "expiredItems"
    ).textContent = expired;
}


// =============================
// SHOW FOOD DETAILS
// =============================

function showFoodDetails(food) {

    selectedFood = food;

    const status =
        getExpiryStatus(food.expiry_date);


    const details =
        document.getElementById("foodDetails");


    details.innerHTML = `

        <div style="
            text-align:center;
            font-size:60px;
            margin-bottom:15px;
        ">
            ${getFoodEmoji(food.name)}
        </div>

        <h2 style="text-align:center;">
            ${food.name}
        </h2>

        <div class="detail-item">

            <span>Category</span>

            <strong>
                ${food.category}
            </strong>

        </div>


        <div class="detail-item">

            <span>Bought Date</span>

            <strong>
                ${formatDate(food.bought_date)}
            </strong>

        </div>


        <div class="detail-item">

            <span>Expiry Date</span>

            <strong>
                ${formatDate(food.expiry_date)}
            </strong>

        </div>


        <div class="detail-item">

            <span>Current Status</span>

            <strong>
                ${status.text}
            </strong>

        </div>


        <button
            class="used-btn"
            onclick="markAsUsed(${food.id})"
        >
            ✓ Mark as Used
        </button>

    `;


    document
        .getElementById("detailsModal")
        .classList.remove("hidden");
}


// =============================
// MARK FOOD AS USED
// =============================

async function markAsUsed(foodId) {

    const confirmed =
        confirm(
            "Are you sure you want to mark this food as used?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/foods/${foodId}`,
                {
                    method: "DELETE"
                }
            );


        if (response.ok) {

            document
                .getElementById("detailsModal")
                .classList.add("hidden");

            await loadFoods();

            alert("Food marked as used!");

        } else {

            alert("Unable to remove food.");
        }

    } catch (error) {

        console.error(error);

        alert("Something went wrong.");
    }
}


// =============================
// ADD FOOD MODAL
// =============================

document
    .getElementById("addFoodBtn")
    .addEventListener("click", () => {

        document
            .getElementById("addFoodModal")
            .classList.remove("hidden");
    });


document
    .getElementById("closeAddModal")
    .addEventListener("click", () => {

        document
            .getElementById("addFoodModal")
            .classList.add("hidden");
    });


// =============================
// ADD FOOD FORM
// =============================

document
    .getElementById("foodForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();


        const name =
            document
                .getElementById("foodName")
                .value
                .trim();


        const category =
            document
                .getElementById("foodCategory")
                .value;


        const boughtDate =
            document
                .getElementById("boughtDate")
                .value;


        const expiryDate =
            document
                .getElementById("expiryDate")
                .value;


        try {

            const response =
                await fetch(
                    "/api/foods",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            category: category,
                            bought_date: boughtDate,
                            expiry_date: expiryDate
                        })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.error ||
                    "Unable to add food."
                );

                return;
            }


            document
                .getElementById("foodForm")
                .reset();


            document
                .getElementById("addFoodModal")
                .classList.add("hidden");


            await loadFoods();


            alert(
                `${name} added to your fridge!`
            );


        } catch (error) {

            console.error(error);

            alert(
                "Something went wrong."
            );
        }

    });


// =============================
// FOOD DETAILS MODAL CLOSE
// =============================

document
    .getElementById("closeDetailsModal")
    .addEventListener("click", () => {

        document
            .getElementById("detailsModal")
            .classList.add("hidden");
    });


// =============================
// PRIORITY QUEUE
// =============================

document
    .getElementById("priorityBtn")
    .addEventListener("click", async () => {

        const response =
            await fetch("/api/priority");

        const priorityFoods =
            await response.json();


        const priorityList =
            document.getElementById(
                "priorityList"
            );


        priorityList.innerHTML = "";


        if (priorityFoods.length === 0) {

            priorityList.innerHTML =
                "<p>No food items available.</p>";

        } else {

            priorityFoods.forEach(
                (food, index) => {

                    const status =
                        getExpiryStatus(
                            food.expiry_date
                        );


                    const item =
                        document.createElement("div");

                    item.className =
                        "priority-item";


                    item.innerHTML = `

                        <div class="priority-number">
                            ${index + 1}
                        </div>

                        <div class="priority-info">

                            <h4>
                                ${getFoodEmoji(food.name)}
                                ${food.name}
                            </h4>

                            <p>
                                Expiry:
                                ${formatDate(food.expiry_date)}
                            </p>

                            <p>
                                ${status.text}
                            </p>

                        </div>
                    `;


                    priorityList.appendChild(item);

                }
            );
        }


        document
            .getElementById("priorityModal")
            .classList.remove("hidden");

    });


// =============================
// PRIORITY MODAL CLOSE
// =============================

document
    .getElementById("closePriorityModal")
    .addEventListener("click", () => {

        document
            .getElementById("priorityModal")
            .classList.add("hidden");
    });


// =============================
// CLOSE MODAL WHEN CLICKING
// OUTSIDE THE BOX
// =============================

document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );
                }

            }
        );

    });