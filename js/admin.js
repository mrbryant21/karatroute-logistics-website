// Global variables
let editModal = null;
let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const db = firebase.firestore();
    
    // Initialize Bootstrap Modal
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    
    // DOM Elements
    const trackingIdInput = document.getElementById('trackingId');
    const generateIdBtn = document.getElementById('generateIdBtn');
    const trackingForm = document.getElementById('trackingForm');
    const saveRecordBtn = document.getElementById('saveRecordBtn');
    const recordsTable = document.getElementById('recordsTable');
    const saveEditBtn = document.getElementById('saveEditBtn');

    // Generate numeric tracking ID (KRT-123456)
    function generateTrackingId() {
        const prefix = "KRT-";
        const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
        trackingIdInput.value = prefix + randomNum;
        return prefix + randomNum;
    }

    // Load existing records
    async function loadExistingRecords() {
        recordsTable.innerHTML = `<table class="table table-striped">
            <thead><tr><th>ID</th><th>Status</th><th>Location</th><th>Actions</th></tr></thead>
            <tbody id="recordsBody"></tbody>
        </table>`;

        try {
            const querySnapshot = await db.collection("tracking").orderBy("timestamp", "desc").limit(50).get();
            const recordsBody = document.getElementById('recordsBody');

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                recordsBody.innerHTML += `
                    <tr>
                        <td>${doc.id}</td>
                        <td>${data.status}</td>
                        <td>${data.location}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-btn" data-id="${doc.id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${doc.id}">Delete</button>
                        </td>
                    </tr>
                `;
            });

            // Add event listeners to action buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    editRecord(this.dataset.id);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    deleteRecord(this.dataset.id);
                });
            });

        } catch (error) {
            console.error("Error loading records:", error);
            recordsTable.innerHTML = `<div class="alert alert-danger">Error loading records: ${error.message}</div>`;
        }
    }

    // Save new record
    async function saveRecord(e) {
        e.preventDefault();
        saveRecordBtn.disabled = true;
        saveRecordBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

        const trackingId = trackingIdInput.value;
        const status = document.getElementById('status').value;
        const location = document.getElementById('location').value;
        const deliveryDate = document.getElementById('deliveryDate').value;

        try {
            await db.collection("tracking").doc(trackingId).set({
                status,
                location,
                estimatedDelivery: deliveryDate,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Record saved successfully!");
            trackingForm.reset();
            generateTrackingId();
            await loadExistingRecords();
        } catch (error) {
            console.error("Error saving record:", error);
            alert(`Error saving record: ${error.message}`);
        } finally {
            saveRecordBtn.disabled = false;
            saveRecordBtn.innerHTML = 'Save Record';
        }
    }

    // Edit record - opens modal
    async function editRecord(id) {
        currentEditId = id;
        console.log("Editing record:", id);

        try {
            const doc = await db.collection("tracking").doc(id).get();
            
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('editTrackingId').value = id;
                document.getElementById('editStatus').value = data.status || 'Processing';
                document.getElementById('editLocation').value = data.location || '';
                document.getElementById('editDeliveryDate').value = data.estimatedDelivery || '';
                editModal.show();
            } else {
                alert("Record not found!");
            }
        } catch (error) {
            console.error("Error fetching record:", error);
            alert(`Error: ${error.message}`);
        }
    }

    // Save edited record
    async function saveEditedRecord() {
        saveEditBtn.disabled = true;
        saveEditBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

        try {
            const id = currentEditId;
            const status = document.getElementById('editStatus').value;
            const location = document.getElementById('editLocation').value;
            const deliveryDate = document.getElementById('editDeliveryDate').value;
            
            await db.collection("tracking").doc(id).update({
                status,
                location,
                estimatedDelivery: deliveryDate,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            editModal.hide();
            await loadExistingRecords();
            alert("Record updated successfully!");
        } catch (error) {
            console.error("Error updating record:", error);
            alert(`Error updating record: ${error.message}`);
        } finally {
            saveEditBtn.disabled = false;
            saveEditBtn.innerHTML = 'Save Changes';
        }
    }

    // Delete record
    async function deleteRecord(id) {
        if (confirm(`Are you sure you want to delete record ${id}?`)) {
            try {
                await db.collection("tracking").doc(id).delete();
                await loadExistingRecords();
            } catch (error) {
                console.error("Error deleting record:", error);
                alert(`Error deleting record: ${error.message}`);
            }
        }
    }

    // Event Listeners
    generateIdBtn.addEventListener('click', generateTrackingId);
    trackingForm.addEventListener('submit', saveRecord);
    saveEditBtn.addEventListener('click', saveEditedRecord);

    // Initialize
    generateTrackingId();
    loadExistingRecords();
});