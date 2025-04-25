
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("mainNavbar");
  if(this.window,scrollY > 10) {
    navbar.classList.add("scrolled");
  } else{
    navbar.classList.remove("scrolled");
  }
});