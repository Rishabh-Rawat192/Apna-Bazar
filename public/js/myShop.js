/*eslint-disable*/
const buttonRemove = document.querySelectorAll(".button-remove");
if (buttonRemove) {
    buttonRemove.forEach(button => {
        button.addEventListener("click", function() {
            const id = this.dataset.id;
            if (confirm("Do you really want to delete this product?")) {
                deleteRequest(id);
            }
        });
    });
}
async function deleteRequest(shopId) {
    try {
        const res = await axios({
            method: "DELETE",
            url: `/api/v1/shops/${shopId}`
        });
        if (res.status === 204) {
            alert(`Successfully removed!`);
            return location.assign("/products");
        }
        console.log(res);
        alert("OOps something went wrong");
    } catch (err) {
        alert(err.response.data.message);
    }
}
