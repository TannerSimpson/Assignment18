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
    openDialog();
    document.getElementById("form-container").classList.add("hidden");
    document.getElementById("craft-detail-container").classList.remove("hidden");

    const craftDetails = document.getElementById("craft-detail-container");
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
    editButton.onclick = (e) => {
        e.preventDefault();
        showEditCraftForm(craft);
    };
    craftDetails.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteCraft(craft._id);
    craftDetails.appendChild(deleteButton);

};

const openDialog = () => {
    document.getElementById("dialog").style.display = "block";
};

const showCraftForm = (e) => {
    e.preventDefault();
    document.getElementById("add-edit-craft-form")._id.value = -1;
    resetForm();
    openDialog();
    document.getElementById("form-container").classList.remove("hidden");
    document.getElementById("craft-detail-container").classList.add("hidden");
};

const showEditCraftForm = (craft) => {
    resetForm();
    const formContainer = document.getElementById("form-container");
    const craftDetailContainer = document.getElementById("craft-detail-container");
    const form = document.getElementById("add-edit-craft-form");
    form._id.value = craft._id;

    formContainer.classList.remove("hidden");
    craftDetailContainer.classList.add("hidden");

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

const resetForm = () => {
    const form = document.getElementById("add-edit-craft-form");
    form.reset();
    const supplyBoxes = document.getElementById("supply-boxes");
    supplyBoxes.innerHTML = "";
    const imgPrev = document.getElementById("img-prev");
    imgPrev.src = "";
};

const addSupply = (e, supply = "") => {
    //if (e) e.preventDefault();
    e.preventDefault();
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
    let response;
    console.log(...formData);

    if(form._id.value == -1) {
        formData.delete("_id")
        response = await fetch("/api/crafts", {
            method: "POST",
            body: formData,
        });
    } else {
        response = await fetch(`/api/crafts/${form._id.value}`, {
            method: "PUT",
            body: formData,
        });
    };
    showCrafts();
    closeDialog();
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

const closeDialog = () => {
    document.getElementById("dialog").style.display="none";
}

document.getElementById("close-button").onclick = closeDialog;
document.getElementById("add-edit-craft-form").onsubmit = addCraft;