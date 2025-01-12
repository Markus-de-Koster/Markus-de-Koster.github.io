function loadHTML(selector, file, callback) {
    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load ${file}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        document.querySelector(selector).innerHTML = data;
        if (callback) callback(); // Execute the callback after loading
      })
      .catch(error => console.error(error));
  }(error => console.error(error));

// Load header and attach the navbar burger functionality
document.addEventListener("DOMContentLoaded", () => {
    loadHTML("#header", "header.html", () => {
      // Attach navbar burger event listeners after the header is loaded
      const $navbarBurgers = Array.from(document.querySelectorAll('.navbar-burger'));
      console.log("Navbar burgers found after header load:", $navbarBurgers);
  
      $navbarBurgers.forEach(el => {
        el.addEventListener('click', () => {
          const target = el.dataset.target;
          const $target = document.getElementById(target);
  
          el.classList.toggle('is-active');
          $target.classList.toggle('is-active');
        });
      });
    });
  
    loadHTML("#footer", "footer.html");
  });