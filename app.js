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
// const API_KEY = "zp0No7LQ9W4pzlZm3lGSg9NqOdh5c3WVa8whcEHC";

// function makeClient() {
//   return apigClientFactory.newClient({
//     apiKey: API_KEY,
//   });
// }

// // helper: convert a File to base64 (without the data:... prefix)
// function fileToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const result = reader.result; // "data:image/jpeg;base64,AAAA..."
//       const base64 = String(result).split(",")[1]; // drop the prefix
//       resolve(base64);
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }

// // --------------------------
// // UPLOAD PHOTO (PUT /v1/upload) – now sends JSON {image_data, content_type}
// // --------------------------
// async function uploadPhoto() {
//   const fileInput = document.getElementById("fileInput");
//   if (!fileInput.files.length) {
//     alert("Please select a file first.");
//     return;
//   }

//   const file = fileInput.files[0];
//   const client = makeClient();

//   try {
//     // 1) convert file to base64 string
//     const base64Data = await fileToBase64(file);

//     // 2) JSON payload for Lambda
//     const body = JSON.stringify({
//       image_data: base64Data,
//       content_type: file.type || "application/octet-stream",
//     });

//     const params = {}; // no path/query params
//     const additionalParams = {
//       headers: {
//         "Content-Type": "application/json",
//         // x-api-key is handled by the SDK via apiKey
//       },
//     };

//     const result = await client.v1UploadPut(params, body, additionalParams);

//     document.getElementById("uploadResult").innerText =
//       `Uploaded key: ${result.data.key}`;
//   } catch (err) {
//     console.error("Upload error:", err);
//     alert("Upload failed – see console for details.");
//   }
// }

// // --------------------------
// // SEARCH PHOTOS (GET /v1/search?q=...)
// // --------------------------
// async function searchPhotos() {
//   const query = document.getElementById("searchQuery").value.trim();
//   if (!query) {
//     alert("Enter a search query.");
//     return;
//   }

//   const container = document.getElementById("searchResults");
//   if (!container) {
//     console.error("searchResults div not found in DOM");
//     return;
//   }
//   container.innerHTML = "";

//   const client = makeClient();
//   const params = { q: query };
//   const body = {};
//   const additionalParams = { headers: {} };

//   try {
//     const result = await client.v1SearchGet(params, body, additionalParams);
//     const data = result.data;

//     if (!data.results || data.results.length === 0) {
//       container.innerHTML = "<p>No results found.</p>";
//       return;
//     }

//     data.results.forEach(photo => {
//       const img = document.createElement("img");
//       img.src = photo.url;
//       img.width = 200;

//       const p = document.createElement("p");
//       p.innerText = "Labels: " + photo.labels.join(", ");

//       container.appendChild(img);
//       container.appendChild(p);
//       container.appendChild(document.createElement("hr"));
//     });
//   } catch (err) {
//     console.error("Search error:", err);
//     const msg =
//       (err.response && err.response.data && JSON.stringify(err.response.data)) ||
//       err.toString();
//     container.innerHTML = `<p>Search failed: ${msg}</p>`;
//   }
// }

const API_KEY = "zp0No7LQ9W4pzlZm3lGSg9NqOdh5c3WVa8whcEHC";

function makeClient() {
  return apigClientFactory.newClient({
    apiKey: API_KEY,
  });
}

// helper: convert a File to base64 (without the data:... prefix)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result; // "data:image/jpeg;base64,AAAA..."
      const base64 = String(result).split(",")[1]; // drop the prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --------------------------
// UPLOAD PHOTO (PUT /v1/upload) – sends JSON {image_data, content_type, custom_labels}
// --------------------------
async function uploadPhoto() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Please select a file first.");
    return;
  }

  const file = fileInput.files[0];

  // NEW: read custom labels from the text field
  const customLabels = document.getElementById("customLabels").value.trim();

  const client = makeClient();

  try {
    // 1) convert file to base64 string
    const base64Data = await fileToBase64(file);

    // 2) JSON payload for Lambda
    const payload = {
      image_data: base64Data,
      content_type: file.type || "application/octet-stream",
    };

    // add custom_labels only if user gave something
    if (customLabels) {
      payload.custom_labels = customLabels; // e.g. "Sam, Sally"
    }

    const body = JSON.stringify(payload);

    const params = {}; // no path/query params
    const additionalParams = {
      headers: {
        "Content-Type": "application/json",
        // x-api-key is handled by the SDK via apiKey
      },
    };

    const result = await client.v1UploadPut(params, body, additionalParams);

    document.getElementById("uploadResult").innerText =
      `Uploaded key: ${result.data.key}`;
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

  const container = document.getElementById("searchResults");
  if (!container) {
    console.error("searchResults div not found in DOM");
    return;
  }
  container.innerHTML = "";

  const client = makeClient();
  const params = { q: query };
  const body = {};
  const additionalParams = { headers: {} };

  try {
    const result = await client.v1SearchGet(params, body, additionalParams);
    const data = result.data;

    if (!data.results || data.results.length === 0) {
      container.innerHTML = "<p>No results found.</p>";
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
  } catch (err) {
    console.error("Search error:", err);
    const msg =
      (err.response && err.response.data && JSON.stringify(err.response.data)) ||
      err.toString();
    container.innerHTML = `<p>Search failed: ${msg}</p>`;
  }
}
