import { db } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const trackBtn = document.getElementById('trackBtn');
  const trackingInput = document.getElementById('trackingInput');
  const resultDiv = document.getElementById('result');

  trackBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form submission reload
    const trackingNumber = trackingInput.value.trim();

    if (!trackingNumber) {
      resultDiv.innerHTML = `<div class="alert alert-danger">Please enter a tracking number.</div>`;
      return;
    }

    resultDiv.innerHTML = `<p> Checking tracking info...</p>`; 

    try {
      const doc = await db.collection("tracking").doc(trackingNumber).get();

      if (doc.exists) {
        const data = doc.data();
        resultDiv.innerHTML = `
          <div class="card mt-4">
            <div class="card-body">
              <h5 class="card-title">Order #${trackingNumber}</h5>
              <p class="card-text"><strong>Status:</strong> ${data.status || 'N/A'}</p>
              <p class="card-text"><strong>Location:</strong> ${data.location || 'N/A'}</p>
              <p class="card-text"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery || 'N/A'}</p>
            </div>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `<div class="alert alert-warning mt-4">No order found with ID: ${trackingNumber}</div>`;
      }
    } catch (error) {
      resultDiv.innerHTML = `<div class="alert alert-danger mt-4">Error: ${error.message}</div>`;
      console.error("Firebase error:", error);
    }
  });
});
