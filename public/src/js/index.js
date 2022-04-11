const logoutBtn = document.getElementById('logout');

logoutBtn.addEventListener('click', async function() {
    try {

        let response = await fetch('http://localhost:4001/api/user/logout');

        if (!response.ok) {
            throw new Error('Ooops! Something went wrong!')
        }

    } catch(err) {
        console.log(err);
    }
});