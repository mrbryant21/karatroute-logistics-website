import { db } from './firebase.js';

// --- Download Results Button Handler ---
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('downloadResultsBtn');
  const resultDiv = document.getElementById('result');

  if (downloadBtn && resultDiv) {
    downloadBtn.addEventListener('click', async () => {
      if (!resultDiv.innerHTML.trim()) {
        alert("No tracking information to download.");
        return;
      }

      const { jsPDF } = window.jspdf;

      // Use html2canvas to render the styled div as an image
      const canvas = await html2canvas(resultDiv);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('tracking_result.pdf');
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
    const trackBtn = document.getElementById('trackBtn');
    const trackingInput = document.getElementById('trackingInput');
    const resultDiv = document.getElementById('result');

    trackBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const trackingNumber = trackingInput.value.trim();
        
        if (!trackingNumber) {
            resultDiv.innerHTML = `<div class="alert alert-danger">Please enter a tracking number.</div>`;
            return;
        }

        resultDiv.innerHTML = `<div class="text-center"><div class="spinner-border text-primary"></div> Loading...</div>`;

        try {
            const doc = await db.collection("tracking").doc(trackingNumber).get();

            if (doc.exists) {
                const data = doc.data();
                resultDiv.innerHTML = `
                    <div class="card mt-4">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title">Tracking #${trackingNumber}</h5>
                            <span class="badge bg-${getStatusColor(data.status)}">${data.status}</span>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <!-- Shipping Progress -->
                                <div class="col-md-6">
                                    <h6><i class="bi bi-truck"></i> Shipping Progress</h6>
                                    <div class="progress mb-3" style="height: 20px;">
                                        <div class="progress-bar" style="width: ${getProgressPercent(data.status)}%"></div>
                                    </div>
                                    <p><strong>Current Location:</strong> ${data.location || 'N/A'}</p>
                                    <p><strong>Estimated Delivery:</strong> ${formatDate(data.estimatedDelivery) || 'N/A'}</p>
                                    <p><strong>Days in Transit:</strong> ${data.deliveryDays || 'N/A'}</p>
                                </div>
                                
                                <!-- Package Details -->
                                <div class="col-md-6">
                                    <h6><i class="bi bi-box-seam"></i> Package Details</h6>
                                    <p><strong>Description:</strong> ${data.itemDescription || 'N/A'}</p>
                                    <p><strong>Quantity:</strong> ${data.itemQuantity || 'N/A'}</p>
                                    <p><strong>Weight:</strong> ${data.itemWeight || 'N/A'} lbs</p>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <div class="row mt-3">
                                <!-- Receiver Information -->
                                <div class="col-md-6">
                                    <h6><i class="bi bi-person-circle"></i> Receiver Information</h6>
                                    <p><strong>Name:</strong> ${data.receiverName || 'N/A'}</p>
                                    <p><strong>Address:</strong> ${data.receiverAddress || 'N/A'}</p>
                                    <p><strong>Country:</strong> ${data.receiverCountry || 'N/A'}</p>
                                    <p><strong>Email:</strong> ${data.receiverEmail || 'N/A'}</p>
                                </div>
                                
                                <!-- Sender Information -->
                                <div class="col-md-6">
                                    <h6><i class="bi bi-shop"></i> Sender Information</h6>
                                    <p><strong>Name:</strong> ${data.senderName || 'N/A'}</p>
                                    <p><strong>Address:</strong> ${data.senderStreet || 'N/A'}, ${data.senderState || ''}, ${data.senderZip || ''}</p>
                                    <p><strong>Country:</strong> ${data.senderCountry || 'N/A'}</p>
                                    <p><strong>Contact:</strong> ${data.senderPhone || 'N/A'} | ${data.senderEmail || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-muted">
                            Last updated: ${formatTimestamp(data.timestamp)}
                        </div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `<div class="alert alert-warning">No record found for tracking number: ${trackingNumber}</div>`;
            }
        } catch (error) {
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
            console.error("Tracking error:", error);
        }
    });

    // Helper functions
    function getStatusColor(status) {
        const colors = {
            'Processing': 'info',
            'In Transit': 'primary',
            'Delivered': 'success',
            'Delayed': 'warning',
            'Cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    function getProgressPercent(status) {
        const progress = {
            'Processing': 25,
            'In Transit': 65,
            'Delivered': 100,
            'Delayed': 50,
            'Cancelled': 0
        };
        return progress[status] || 10;
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleString();
    }
});document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const trackBtn = document.getElementById('trackBtn');
    const trackingInput = document.getElementById('trackingInput');
    const resultDiv = document.getElementById('result');
    
    // Check if elements exist
    if (!trackBtn || !trackingInput || !resultDiv) {
        console.error('Required elements not found!');
        return;
    }

    trackBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const trackingNumber = trackingInput.value.trim();
        
        if (!trackingNumber) {
            showError('Please enter a tracking number');
            return;
        }

        // Show loading state
        resultDiv.innerHTML = `
            <div class="text-center my-4">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
                <p class="mt-2">Searching for shipment ${trackingNumber}...</p>
            </div>
        `;

        try {
            const doc = await db.collection("tracking").doc(trackingNumber).get();
            
            if (doc.exists) {
                const data = doc.data();
                displayTrackingResults(trackingNumber, data);
            } else {
                showError(`No shipment found with ID: ${trackingNumber}`);
            }
        } catch (error) {
            console.error("Tracking error:", error);
            showError(`Error: ${error.message}`);
        }
    });

    // Display tracking results
    function displayTrackingResults(trackingId, data) {
        resultDiv.innerHTML = `
            <div class="card shadow-lg mt-4">
                <div class="card-header bg-primary text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">Shipment #${escapeHtml(trackingId)}</h4>
                        <span class="badge bg-${getStatusColor(data.status)} fs-6">
                            ${escapeHtml(data.status || 'N/A')}
                        </span>
                    </div>
                </div>
                
                <div class="card-body">
                    <!-- Shipping Progress -->
                    <div class="mb-4">
                        <h5><i class="bi bi-truck"></i> Shipping Progress</h5>
                        <div class="progress mb-3" style="height: 25px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-${getStatusColor(data.status)}" 
                                 style="width: ${getProgressPercent(data.status)}%">
                                ${getProgressPercent(data.status)}% Complete
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4">
                                <p><strong>Current Location:</strong><br>${escapeHtml(data.location || 'N/A')}</p>
                            </div>
                            <div class="col-md-4">
                                <p><strong>Est. Delivery:</strong><br>${formatDate(data.estimatedDelivery) || 'N/A'}</p>
                            </div>
                            <div class="col-md-4">
                                <p><strong>Days in Transit:</strong><br>${data.deliveryDays || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <hr>
                    
                    <!-- Package Information -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h5><i class="bi bi-box-seam"></i> Package Details</h5>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <th>Description</th>
                                            <td>${escapeHtml(data.itemDescription || 'N/A')}</td>
                                        </tr>
                                        <tr>
                                            <th>Quantity</th>
                                            <td>${data.itemQuantity || '0'}</td>
                                        </tr>
                                        <tr>
                                            <th>Weight</th>
                                            <td>${data.itemWeight || '0'} lbs</td>
                                        </tr>
                                        <tr>
                                            <th>Payment Status</th>
                                            <td>
                                                <span class="badge bg-${getPaymentStatusColor(data.payment?.status)}">
                                                    ${formatPaymentStatus(data.payment?.status)}
                                                </span>
                                                ${data.payment?.amount ? `($${data.payment.amount.toFixed(2)})` : ''}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Receiver Information -->
                        <div class="col-md-6">
                            <h5><i class="bi bi-person-circle"></i> Receiver Information</h5>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <th>Name</th>
                                            <td>${escapeHtml(data.receiverName || 'N/A')}</td>
                                        </tr>
                                        <tr>
                                            <th>Address</th>
                                            <td>${escapeHtml(data.receiverAddress || 'N/A')}<br>
                                                ${escapeHtml(data.receiverCountry || '')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Email</th>
                                            <td>${escapeHtml(data.receiverEmail || 'N/A')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sender Information -->
                    <div class="row">
                        <div class="col-12">
                            <h5><i class="bi bi-shop"></i> Sender Information</h5>
                            <div class="table-responsive">
                                <table class="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <th>Name</th>
                                            <td>${escapeHtml(data.senderName || 'N/A')}</td>
                                        </tr>
                                        <tr>
                                            <th>Address</th>
                                            <td>
                                                ${escapeHtml(data.senderStreet || 'N/A')}<br>
                                                ${escapeHtml(data.senderState || '')}, ${escapeHtml(data.senderZip || '')}<br>
                                                ${escapeHtml(data.senderCountry || '')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Contact</th>
                                            <td>
                                                ${escapeHtml(data.senderPhone || 'N/A')}<br>
                                                ${escapeHtml(data.senderEmail || 'N/A')}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer text-muted">
                    <small>Last updated: ${formatTimestamp(data.timestamp || data.lastUpdated)}</small>
                </div>
            </div>
        `;
    }
    

    // Helper Functions
    function getStatusColor(status) {
        const colors = {
            'Processing': 'info',
            'In Transit': 'primary',
            'Delivered': 'success',
            'Delayed': 'warning',
            'Cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    function getPaymentStatusColor(status) {
        const colors = {
            'paid': 'success',
            'unpaid': 'danger',
            'partial': 'warning',
            'refunded': 'info'
        };
        return colors[status] || 'secondary';
    }

    function getProgressPercent(status) {
        const progress = {
            'Processing': 25,
            'Sailing/In Transit': 40,
            'Delivered': 100,
            'Delayed': 50,
            'Draft': 10,
            'Booked': 5,
            'Notice of Readiness (NOR) Tendered': 10,
            'Loaded': 20,
            'Arrived at Port Discharge': 55,
            'Discharged': 65,
            'Picked Up by Shipping Agent': 70,
            'Gate Out': 75,
            'Customs Clearance': 80,
            'Held at Customs': 82,
            'Customs Duty': 85,
            'Customs Duty/Additional Payment requested': 87,
            'On Hold': 10,
            'Reviewed by Shipping Agent': 90,
            'Billed': 92,
            'Cancelled': 0
        };
        return progress[status] || 10;
    }

    function formatPaymentStatus(status) {
        const statusMap = {
            'paid': 'Payment Received',
            'unpaid': 'Awaiting Payment',
            'partial': 'Partial Payment received',
        };
        return statusMap[status] || (status || 'N/A');
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showError(message) {
        resultDiv.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <strong>Error:</strong> ${escapeHtml(message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
});
