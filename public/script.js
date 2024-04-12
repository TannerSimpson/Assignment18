const getCrafts = async () => {
    try {
        return (await fetch("/api/crafts")).json();
    } catch (error) {
        console.error(error);
    }
};

const showCrafts = async () => {
    const crafts = await getCrafts();
    const craftsContainer = document.getElementById("crafts-container");
    craftsContainer.innerHTML = "";

    crafts.forEach((craft) => {
        const craftDiv = document.createElement("div");
        craftDiv.classList.add("craft");
        
        const a = document.createElement("a");
        a.href = "#";
        craftDiv.appendChild(a);

        const craftImage = document.createElement("img");
        craftImage.src = "images/" + craft.image;
        craftImage.alt = craft.name;
        a.appendChild(craftImage);

        a.onclick = (e) => {
            e.preventDefault();
            displayCraftDetails(craft);
        };

        craftsContainer.appendChild(craftDiv);
    });
};

const displayCraftDetails = (craft) => {
    openDialog("dialog-details");

    const craftDetails = document.getElementById("dialog-details");
    craftDetails.innerHTML = "";

    const h3 = document.createElement("h3");
    h3.innerHTML = craft.name;
    craftDetails.appendChild(h3);

    const img = document.createElement("img");
    img.src = "images/" + craft.image;
    img.alt = craft.name;
    craftDetails.appendChild(img);

    const p = document.createElement("p");
    p.innerHTML = craft.description;
    craftDetails.appendChild(p);

    const ul = document.createElement("ul");
    craftDetails.appendChild(ul);

    craft.supplies.forEach((supply) => {
        const li = document.createElement("li");
        li.innerHTML = supply;
        ul.appendChild(li);
    });

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => showEditCraftForm(craft);
    craftDetails.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteCraft(craft._id);
    craftDetails.appendChild(deleteButton);

};

const openDialog = (id) => {
    document.getElementById("dialog").style.display = "block";
    document.querySelectorAll("#dialog-details > *").forEach((item) => {
        item.classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
};

const showCraftForm = (e) => {
    e.preventDefault();
    resetForm();
    openDialog("add-edit-craft-form");
};

const showEditCraftForm = (craft) => {
    resetForm();
    const form = document.getElementById("add-edit-craft-form");
    form.dataset.mode = "edit"; 
    form.dataset.craftId = craft._id; 

    document.getElementById("name").value = craft.name;
    document.getElementById("description").value = craft.description;
    document.getElementById("img-prev").src = "images/" + craft.image;

    const supplyBoxes = document.getElementById("supply-boxes");
    supplyBoxes.innerHTML = ""; 

    craft.supplies.forEach((supply) => {
        addSupply(null, supply);
    });

    openDialog("add-edit-craft-form");
};

/*const resetForm = () => {
    const form = document.getElementById("add-edit-craft-form");
    form.reset();
    document.getElementById("supply-boxes").innerHTML = "";
    document.getElementById("img-prev").src = "";
};*/

const resetForm = () => {
    const form = document.getElementById("add-edit-craft-form");
    if (form) {
        form.reset();
        const supplyBoxes = document.getElementById("supply-boxes");
        if (supplyBoxes) {
            supplyBoxes.innerHTML = "";
        }
        const imgPrev = document.getElementById("img-prev");
        if (imgPrev) {
            imgPrev.src = "";
        }
    } else {
        console.error("Form element not found.");
    }
};

const addSupply = (e, supply = "") => {
    if (e) e.preventDefault();
    const section = document.getElementById("supply-boxes");
    const input = document.createElement("input");
    input.type = "text";
    input.value = supply;
    section.appendChild(input);
};

const addCraft = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-edit-craft-form");
    const formData = new FormData(form);
    formData.append("supplies", getSupplies());

    let url = "/api/crafts";
    let method = "POST";

    if (form.dataset.mode === "edit") {
        url += `/${form.dataset.craftId}`;
        method = "PUT";
    }

    try {
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error adding/updating craft");
        }

        resetForm();
        document.getElementById("dialog").style.display = "none";
        showCrafts();
    } catch (error) {
        console.error(error);
    }
};

const getSupplies = () => {
    const inputs = document.querySelectorAll("#supply-boxes input");
    const supplies = [];

    inputs.forEach((input) => {
        supplies.push(input.value);
    });

    return supplies.join(",");
};

const deleteCraft = async (craftId) => {
    if (!confirm("Are you sure you want to delete this craft?")) {
        return;
    }

    try {
        const response = await fetch(`/api/crafts/${craftId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Error deleting craft");
        }

        document.getElementById("dialog").style.display = "none";
        showCrafts();
    } catch (error) {
        console.error(error);
    }
};

showCrafts();
document.getElementById("add-link").onclick = showCraftForm;
document.getElementById("add-supply").onclick = addSupply;

document.getElementById("img").onchange = (e) => {
    const prev = document.getElementById("img-prev");

    if (!e.target.files.length) {
        prev.src = "";
        return;
    }

    prev.src = URL.createObjectURL(e.target.files.item(0));
};