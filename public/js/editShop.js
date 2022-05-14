/*eslint-disable */
const form = document.querySelector(".container");

form.addEventListener("submit", async e => {
    e.preventDefault();
    const id = form.dataset.id;
    const formData = new FormData(form);
    try {
        const res = await axios({
            url: `/api/v1/shops/${id}`,
            method: "PATCH",
            data: formData
        });
        if (res.data.status === "success") {
            alert("Successfully created!");
            return location.assign("/myshop");
        }
        alert("OOps something went wrong...");
    } catch (err) {
        alert(err.response.data);
        console.log(err.response.data.message);
    }
});
