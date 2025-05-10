// Initialize global variables
let editModal = null;
let currentEditId = null;

// admin.js - Complete Admin Panel Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const db = firebase.firestore();
    
    // Initialize Bootstrap Components
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const successToast = new bootstrap.Toast(document.getElementById('successToast'));
    const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
    
    // DOM Elements with null checks
    const trackingIdInput = getElement('trackingId');
    const generateIdBtn = getElement('generateIdBtn');
    const trackingForm = getElement('trackingForm');
    const saveRecordBtn = getElement('saveRecordBtn');
    const recordsTable = getElement('recordsTable');
    const saveEditBtn = getElement('saveEditBtn');
    
    // Safe element getter with error reporting
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with ID '${id}' not found!`);
            showError(`Required element '${id}' not found. Please check your HTML.`);
        }
        return element;
    }
    
    // Generate numeric tracking ID (KRT-123456)
    function generateTrackingId() {
        if (!trackingIdInput) return;
        const prefix = "KRT-";
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        trackingIdInput.value = prefix + randomNum;
        return prefix + randomNum;
    }
    
    // ========================
    // CRUD Operations
    // ========================
    
    // Load existing records
    async function loadExistingRecords() {
        if (!recordsTable) return;
        
        recordsTable.innerHTML = `
            <div class="text-center my-4">
                <div class="spinner-border text-primary"></div>
                <p>Loading records...</p>
            </div>
        `;
        
        try {
            const querySnapshot = await db.collection("tracking").orderBy("timestamp", "desc").limit(50).get();
            
            recordsTable.innerHTML = `
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Tracking ID</th>
                            <th>Receiver</th>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="recordsBody"></tbody>
                </table>
            `;
            
            const recordsBody = getElement('recordsBody');
            if (!recordsBody) return;
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                recordsBody.innerHTML += `
                    <tr>
                        <td><strong>${doc.id}</strong></td>
                        <td>${escapeHtml(data.receiverName) || 'N/A'}</td>
                        <td>${escapeHtml(data.itemDescription) || 'N/A'}</td>
                        <td><span class="badge bg-${getStatusColor(data.status)}">${escapeHtml(data.status) || 'N/A'}</span></td>
                        <td>
                            <span class="badge bg-${getPaymentStatusColor(data.payment?.status)}">
                                ${formatPaymentStatus(data.payment?.status)}
                            </span>
                            ${data.payment?.amount ? `<br><small>$${data.payment.amount.toFixed(2)}</small>` : ''}
                        </td>
                        <td>
                            <div class="btn-group btn-group-sm" role="group">
                                <button class="btn btn-warning edit-btn" data-id="${doc.id}">
                                    <i class="bi bi-pencil"></i> Edit
                                </button>
                                <button class="btn btn-danger delete-btn" data-id="${doc.id}">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editRecord(btn.dataset.id));
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteRecord(btn.dataset.id));
            });
            
        } catch (error) {
            console.error("Error loading records:", error);
            showError(`Error loading records: ${error.message}`);
        }
    }
    
    // Save new record
    async function saveRecord(e) {
        if (!e || !trackingForm || !saveRecordBtn) return;
        e.preventDefault();
        
        saveRecordBtn.disabled = true;
        saveRecordBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
        
        const trackingData = {
            // Tracking info
            status: getValue('status'),
            location: getValue('location'),
            estimatedDelivery: getValue('deliveryDate'),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            
            // Receiver info
            receiverName: getValue('receiverName'),
            receiverEmail: getValue('receiverEmail'),
            receiverCountry: getValue('receiverCountry'),
            receiverAddress: getValue('receiverAddress'),
            
            // Item info
            itemDescription: getValue('itemDescription'),
            itemQuantity: parseInt(getValue('itemQuantity')) || 0,
            deliveryDays: parseInt(getValue('deliveryDays')) || 0,
            itemWeight: parseFloat(getValue('itemWeight')) || 0,
            
            // Sender info
            senderName: getValue('senderName'),
            senderCountry: getValue('senderCountry'),
            senderState: getValue('senderState'),
            senderStreet: getValue('senderStreet'),
            senderEmail: getValue('senderEmail'),
            senderPhone: getValue('senderPhone'),
            senderZip: getValue('senderZip'),
            
            // Payment info
            payment: {
                status: getValue('paymentStatus'),
                method: getValue('paymentMethod'),
                amount: parseFloat(getValue('paymentAmount')) || 0,
                dueDate: getValue('paymentDueDate') || null
            }
        };
        
        try {
            await db.collection("tracking").doc(trackingIdInput.value).set(trackingData);
            showSuccess(`Record ${trackingIdInput.value} saved successfully!`);
            trackingForm.reset();
            generateTrackingId();
            await loadExistingRecords();
        } catch (error) {
            console.error("Error saving record:", error);
            showError(`Error saving record: ${error.message}`);
        } finally {
            saveRecordBtn.disabled = false;
            saveRecordBtn.innerHTML = '<i class="bi bi-save"></i> Save Record';
        }
    }
    
    // Edit record
    async function editRecord(id) {
        if (!id || !editModal) return;
        
        try {
            const doc = await db.collection("tracking").doc(id).get();
            
            if (doc.exists) {
                const data = doc.data();
                
                // Populate all fields
                setValue('editTrackingId', id);
                setValue('editStatus', data.status || 'Processing');
                setValue('editLocation', data.location || '');
                setValue('editDeliveryDate', data.estimatedDelivery || '');
                
                // Receiver fields
                setValue('editReceiverName', data.receiverName || '');
                setValue('editReceiverEmail', data.receiverEmail || '');
                setValue('editReceiverCountry', data.receiverCountry || '');
                setValue('editReceiverAddress', data.receiverAddress || '');
                
                // Item fields
                setValue('editItemDescription', data.itemDescription || '');
                setValue('editItemQuantity', data.itemQuantity || '');
                setValue('editDeliveryDays', data.deliveryDays || '');
                setValue('editItemWeight', data.itemWeight || '');
                
                // Sender fields
                setValue('editSenderName', data.senderName || '');
                setValue('editSenderCountry', data.senderCountry || '');
                setValue('editSenderState', data.senderState || '');
                setValue('editSenderStreet', data.senderStreet || '');
                setValue('editSenderEmail', data.senderEmail || '');
                setValue('editSenderPhone', data.senderPhone || '');
                setValue('editSenderZip', data.senderZip || '');
                
                // Payment fields
                const payment = data.payment || {};
                setValue('editPaymentStatus', payment.status || 'unpaid');
                setValue('editPaymentMethod', payment.method || '');
                setValue('editPaymentAmount', payment.amount || '');
                setValue('editPaymentDueDate', payment.dueDate ? formatDateForInput(payment.dueDate) : '');
                
                editModal.show();
            } else {
                showError("Record not found!");
            }
        } catch (error) {
            console.error("Error fetching record:", error);
            showError(`Error loading record: ${error.message}`);
        }
    }
    
    // Save edited record
    async function saveEditedRecord() {
        if (!saveEditBtn) return;
        
        saveEditBtn.disabled = true;
        saveEditBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
        
        try {
            const updatedData = {
                // Tracking info
                status: getValue('editStatus'),
                location: getValue('editLocation'),
                estimatedDelivery: getValue('editDeliveryDate'),
                
                // Receiver info
                receiverName: getValue('editReceiverName'),
                receiverEmail: getValue('editReceiverEmail'),
                receiverCountry: getValue('editReceiverCountry'),
                receiverAddress: getValue('editReceiverAddress'),
                
                // Item info
                itemDescription: getValue('editItemDescription'),
                itemQuantity: parseInt(getValue('editItemQuantity')) || 0,
                deliveryDays: parseInt(getValue('editDeliveryDays')) || 0,
                itemWeight: parseFloat(getValue('editItemWeight')) || 0,
                
                // Sender info
                senderName: getValue('editSenderName'),
                senderCountry: getValue('editSenderCountry'),
                senderState: getValue('editSenderState'),
                senderStreet: getValue('editSenderStreet'),
                senderEmail: getValue('editSenderEmail'),
                senderPhone: getValue('editSenderPhone'),
                senderZip: getValue('editSenderZip'),
                
                // Payment info
                payment: {
                    status: getValue('editPaymentStatus'),
                    method: getValue('editPaymentMethod'),
                    amount: parseFloat(getValue('editPaymentAmount')) || 0,
                    dueDate: getValue('editPaymentDueDate') || null
                },
                
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection("tracking").doc(getValue('editTrackingId')).update(updatedData);
            showSuccess('Record updated successfully!');
            editModal.hide();
            await loadExistingRecords();
        } catch (error) {
            console.error("Error updating record:", error);
            showError(`Error updating record: ${error.message}`);
        } finally {
            saveEditBtn.disabled = false;
            saveEditBtn.innerHTML = '<i class="bi bi-save"></i> Save Changes';
        }
    }
    
    // Delete record
    async function deleteRecord(id) {
    if (!id) return;
    
    // Native browser confirmation
    if (!confirm(`Are you sure you want to delete tracking #${id}? This cannot be undone.`)) {
        return;
    }

    try {
        // Show loading state (simple version)
        const originalText = document.querySelector(`button.delete-btn[data-id="${id}"]`).innerHTML;
        document.querySelector(`button.delete-btn[data-id="${id}"]`).innerHTML = 
            '<span class="spinner-border spinner-border-sm"></span> Deleting...';
        
        await db.collection("tracking").doc(id).delete();
        
        // Show success message
        showSuccess('Record deleted successfully!');
        await loadExistingRecords();
    } catch (error) {
        console.error("Error deleting record:", error);
        showError(`Failed to delete record: ${error.message}`);
    } finally {
        // Reset button text if still exists
        const btn = document.querySelector(`button.delete-btn[data-id="${id}"]`);
        if (btn) btn.innerHTML = '<i class="bi bi-trash"></i>';
    }
    }
    
    // ========================
    // Helper Functions
    // ========================
    
    function getValue(id) {
        const element = getElement(id);
        return element ? element.value : null;
    }
    
    function setValue(id, value) {
        const element = getElement(id);
        if (element) element.value = value || '';
    }
    
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
    
    function formatPaymentStatus(status) {
        const statusMap = {
            'paid': 'Paid',
            'unpaid': 'Unpaid',
            'partial': 'Partial',
            'refunded': 'Refunded'
        };
        return statusMap[status] || (status || 'N/A');
    }
    
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
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
    
    function showSuccess(message) {
        if (!successToast) return;
        document.getElementById('toastMessage').textContent = message;
        successToast.show();
    }
    
    function showError(message) {
        if (!errorToast) return;
        document.getElementById('errorToastMessage').textContent = message;
        errorToast.show();
    }
    
    // ========================
    // Event Listeners
    // ========================
    if (generateIdBtn) {
        generateIdBtn.addEventListener('click', generateTrackingId);
    }
    
    if (trackingForm) {
        trackingForm.addEventListener('submit', saveRecord);
    }
    
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditedRecord);
    }
    
    // ========================
    // Initialization
    // ========================
    generateTrackingId();
    loadExistingRecords();
});