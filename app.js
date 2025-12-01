const API_BASE = "https://3ep9wc6pv4.execute-api.us-east-1.amazonaws.com/prod/v1";
const API_KEY = "zp0No7LQ9W4pzlZm3lGSg9NqOdh5c3WVa8whcEHC";

async function uploadPhoto() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        alert("Please select a file first.");
        return;
    }

    const file = fileInput.files[0];

    const res = await fetch(`${API_BASE}/upload`, {
        method: "PUT",
        headers: {
            "x-api-key": API_KEY,
            "Content-Type": file.type
        },
        body: file
    });

    const data = await res.json();
    document.getElementById("uploadResult").innerText =
        `Uploaded key: ${data.key}`;
}

async function searchPhotos() {
    const query = document.getElementById("searchQuery").value.trim();
    if (!query) {
        alert("Enter a search query.");
        return;
    }

    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
            "x-api-key": API_KEY
        }
    });

    const text = await res.text();
    const container = document.getElementById("searchResults");
    container.innerHTML = "";

    // If Lambda returned plain text like: "No photos found for 'dog'"
    if (!text.startsWith("{") && !text.startsWith("[")) {
        container.innerHTML = `<p>${text}</p>`;
        return;
    }

    const data = JSON.parse(text);

    if (!data.results || data.results.length === 0) {
        container.innerHTML = `<p>No results found.</p>`;
        return;
    }

    data.results.forEach(photo => {
        const img = document.createElement("img");
        img.src = photo.url;
        img.width = 200;

        const p = document.createElement("p");
        p.innerText = "Labels: " + photo.labels.join(", ");

        container.appendChild(img);
        container.appendChild(p);
        container.appendChild(document.createElement("hr"));
    });
}