// const API_BASE = "https://3ep9wc6pv4.execute-api.us-east-1.amazonaws.com/prod/v1";
// const API_KEY = "zp0No7LQ9W4pzlZm3lGSg9NqOdh5c3WVa8whcEHC";

// async function uploadPhoto() {
//     const fileInput = document.getElementById("fileInput");
//     if (!fileInput.files.length) {
//         alert("Please select a file first.");
//         return;
//     }

//     const file = fileInput.files[0];

//     const res = await fetch(`${API_BASE}/upload`, {
//         method: "PUT",
//         headers: {
//             "x-api-key": API_KEY,
//             "Content-Type": file.type
//         },
//         body: file
//     });

//     const data = await res.json();
//     document.getElementById("uploadResult").innerText =
//         `Uploaded key: ${data.key}`;
// }

// async function searchPhotos() {
//     const query = document.getElementById("searchQuery").value.trim();
//     if (!query) {
//         alert("Enter a search query.");
//         return;
//     }

//     const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
//         method: "GET",
//         headers: {
//             "x-api-key": API_KEY
//         }
//     });

//     const text = await res.text();
//     const container = document.getElementById("searchResults");
//     container.innerHTML = "";

//     // If Lambda returned plain text like: "No photos found for 'dog'"
//     if (!text.startsWith("{") && !text.startsWith("[")) {
//         container.innerHTML = `<p>${text}</p>`;
//         return;
//     }

//     const data = JSON.parse(text);

//     if (!data.results || data.results.length === 0) {
//         container.innerHTML = `<p>No results found.</p>`;
//         return;
//     }

//     data.results.forEach(photo => {
//         const img = document.createElement("img");
//         img.src = photo.url;
//         img.width = 200;

//         const p = document.createElement("p");
//         p.innerText = "Labels: " + photo.labels.join(", ");

//         container.appendChild(img);
//         container.appendChild(p);
//         container.appendChild(document.createElement("hr"));
//     });
// }
const API_KEY = "zp0No7LQ9W4pzlZm3lGSg9NqOdh5c3WVa8whcEHC";

// Create a new API client instance using API key auth
function makeClient() {
  if (typeof apigClientFactory === "undefined") {
    console.error("apigClientFactory is not defined. Check your <script> order.");
    alert("Client SDK not loaded – see console.");
    return null;
  }

  return apigClientFactory.newClient({
    apiKey: API_KEY
    // No IAM creds needed – we’re using API key auth only
  });
}

// --------------------------
// UPLOAD PHOTO  (PUT /v1/upload)
// --------------------------
async function uploadPhoto() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Please select a file first.");
    return;
  }

  const client = makeClient();
  if (!client) return;

  const file = fileInput.files[0];

  const params = {};           // no path or query params
  const body = file;           // raw file as body
  const additionalParams = {
    headers: {
      "Content-Type": file.type
      // x-api-key is added automatically by the SDK
    }
  };

  try {
    const result = await client.v1UploadPut(params, body, additionalParams);
    // Assuming Lambda returns { key: "..." }
    const key = result && result.data && result.data.key;
    document.getElementById("uploadResult").innerText =
      key ? `Uploaded key: ${key}` : "Upload succeeded.";
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed – see console for details.");
  }
}

// --------------------------
// SEARCH PHOTOS (GET /v1/search?q=...)
// --------------------------
async function searchPhotos() {
  const query = document.getElementById("searchQuery").value.trim();
  if (!query) {
    alert("Enter a search query.");
    return;
  }

  const client = makeClient();
  if (!client) return;

  const params = { q: query }; // becomes ?q=query
  const body = null;           // GET has no body
  const additionalParams = {
    headers: {
      // x-api-key is added automatically
    }
  };

  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  try {
    const result = await client.v1SearchGet(params, body, additionalParams);
    const data = result && result.data ? result.data : {};

    if (!data.results || data.results.length === 0) {
      container.innerHTML = "<p>No results found.</p>";
      return;
    }

    data.results.forEach(photo => {
      const img = document.createElement("img");
      img.src = photo.url;
      img.width = 200;

      const p = document.createElement("p");
      p.innerText = "Labels: " + (photo.labels || []).join(", ");

      container.appendChild(img);
      container.appendChild(p);
      container.appendChild(document.createElement("hr"));
    });
  } catch (err) {
    console.error("Search error:", err);

    const msg =
      (err.response && err.response.data && JSON.stringify(err.response.data)) ||
      err.message ||
      err.toString();

    container.innerHTML = `<p>Search failed: ${msg}</p>`;
  }
}
