
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("mainNavbar");
  if(this.window,scrollY > 10) {
    navbar.classList.add("scrolled");
  } else{
    navbar.classList.remove("scrolled");
  }
});




  let currentSlide = 0;
  const testimonials = document.querySelectorAll('.testimonial-item');
  const dots = document.querySelectorAll('.dot');

  function showSlide(index) {
    testimonials.forEach((item, i) => {
      item.classList.remove('active');
      dots[i].classList.remove('active');
    });
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  function goToSlide(index) {
    showSlide(index);
  }

  function autoPlay() {
    const nextSlide = (currentSlide + 1) % testimonials.length;
    showSlide(nextSlide);
  }

  // Start auto-play
  setInterval(autoPlay, 10000);

  // Initialize first slide
  showSlide(currentSlide);

