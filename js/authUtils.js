export default class Utils {
    static checkAuth(tokenEndpoint) {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || !role || role !== "teacher") {
            console.log('No token or role found, redirecting to index.html');
            window.location.href = "index.html";
            return;
        }
        fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, role })
        })
            .then(response => {
                if (!response.ok) {
                    console.error('Error: Response not OK');
                    window.location.href = "index.html";
                    return;
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                window.location.href = "index.html";
            });
    }
}