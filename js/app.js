const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso",
  "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const countrySelect = document.getElementById("countrySelect");

countries.forEach(country => {
  const option = document.createElement("option");
  option.value = country;
  option.textContent = country;
  countrySelect.appendChild(option);
});

const countrySelectTo = document.getElementById("countrySelectTo");

countries.forEach(country => {
  const option = document.createElement("option");
  option.value = country;
  option.textContent = country;
  countrySelectTo.appendChild(option);
});


document.getElementById('calculatorForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const weight = parseFloat(document.getElementById('weight').value);
  const packageType = document.getElementById('packageType').value;
  let baseRate = 5; // base rate per kg

  // Adjust base rate depending on package type
  if (packageType === 'express') {
    baseRate = 8;
  } else if (packageType === 'fragile') {
    baseRate = 10;
  }

  const estimatedCost = (weight * baseRate).toFixed(2);

  document.getElementById('result').innerHTML = `Contact info@karatroute-logistics.com with details for estimated shipping cost`;
});



const stats = document.querySelectorAll('.stat');
  let hasCounted = false;

  const runCounters = () => {
    stats.forEach(stat => {
      const target = +stat.getAttribute('data-target');
      const format = stat.getAttribute('data-format');
      let count = 0;

      const updateCount = () => {
        const increment = target / 200;
        count += increment;

        if (count < target) {
          let displayVal;
          if (format === 'k') displayVal = (count / 1000).toFixed(1) + 'k+';
          else if (format === 'M') displayVal = (count / 1000000).toFixed(1) + 'M+';
          else displayVal = Math.floor(count) + '+';

          stat.innerText = displayVal;
          requestAnimationFrame(updateCount);
        } else {
          if (format === 'k') stat.innerText = (target / 1000).toFixed(1) + 'k+';
          else if (format === 'M') stat.innerText = (target / 1000000).toFixed(1) + 'M+';
          else stat.innerText = target + '+';
        }
      };

      updateCount();
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasCounted) {
        hasCounted = true;
        runCounters();
      }
    });
  }, {
    threshold: 0.6
  });

  const statsSection = document.querySelector('.stats-section');
  observer.observe(statsSection);




