const logoutBtn = document.getElementById('logout');

logoutBtn.addEventListener('click', async function() {
    try {

        let response = await fetch('http://localhost:4001/api/user/logout');

        console.log(response);

    } catch(err) {
        console.log(err);
    }
})