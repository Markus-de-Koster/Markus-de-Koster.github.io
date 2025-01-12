function loadHTML(selector, file) {
    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load ${file}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        document.querySelector(selector).innerHTML = data;
      })
      .catch(error => console.error(error));
  }
  
  // Load header and footer
  document.addEventListener("DOMContentLoaded", () => {
    loadHTML("#header", "header.html");
    loadHTML("#footer", "footer.html");
  });
  