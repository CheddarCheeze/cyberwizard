/**
 * Recruiter Contact Form Handler
 * Handles form validation, submission, and user feedback
 */

(function() {
	'use strict';

	// Wait for DOM to be ready
	document.addEventListener('DOMContentLoaded', function() {
		const form = document.getElementById('recruiterForm');
		const submitBtn = document.getElementById('submitBtn');
		const formStatus = document.getElementById('formStatus');
		const descriptionTextarea = document.getElementById('recruiterDescription');
		const charCount = document.getElementById('charCount');
		const sourceDropdown = document.getElementById('recruiterSource');
		const referralSourceContainer = document.getElementById('referralSourceContainer');
		const referralSourceInput = document.getElementById('referralSource');
		const otherSourceContainer = document.getElementById('otherSourceContainer');
		const otherSourceInput = document.getElementById('otherSource');

		// Show/hide conditional fields based on dropdown selection
		if (sourceDropdown) {
			sourceDropdown.addEventListener('change', function() {
				// Hide all conditional fields first
				if (referralSourceContainer) {
					referralSourceContainer.style.display = 'none';
					referralSourceInput.value = '';
				}
				if (otherSourceContainer) {
					otherSourceContainer.style.display = 'none';
					otherSourceInput.value = '';
				}

				// Show appropriate field based on selection
				if (this.value === 'Referral' && referralSourceContainer) {
					referralSourceContainer.style.display = 'block';
					referralSourceInput.focus();
				} else if (this.value === 'Other' && otherSourceContainer) {
					otherSourceContainer.style.display = 'block';
					otherSourceInput.focus();
				}
			});
		}

		// Character counter for description field
		if (descriptionTextarea && charCount) {
			descriptionTextarea.addEventListener('input', function() {
				const currentLength = this.value.length;
				charCount.textContent = currentLength;

				// Visual feedback when approaching limit
				if (currentLength > 450) {
					charCount.style.color = '#ff6b6b';
				} else if (currentLength > 400) {
					charCount.style.color = '#ffa500';
				} else {
					charCount.style.color = '#22A39F';
				}
			});
		}

		// Reset form when modal is closed
		const modal = document.getElementById('recruiterModal');
		if (modal) {
			modal.addEventListener('hidden.bs.modal', function() {
				resetForm();
			});
		}

		// Form submission handler
		if (form) {
			form.addEventListener('submit', async function(e) {
				e.preventDefault();

				// Validate form
				if (!form.checkValidity()) {
					form.classList.add('was-validated');
					return;
				}

				// Disable submit button and show loading state
				submitBtn.disabled = true;
				submitBtn.classList.add('loading');
				const originalButtonText = submitBtn.innerHTML;
				submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending...';

				try {
					// Get form data
					const formData = new FormData(form);

					// Submit to Formspree
					const response = await fetch(form.action, {
						method: 'POST',
						body: formData,
						headers: {
							'Accept': 'application/json'
						}
					});

					if (response.ok) {
						// Success
						showStatus('success', '<i class="bi bi-check-circle-fill"></i>Thank you! Your message has been sent successfully. I\'ll review your opportunity and get back to you soon.');

						// Reset form after short delay
						setTimeout(function() {
							resetForm();
							// Close modal after successful submission
							const modalInstance = bootstrap.Modal.getInstance(modal);
							if (modalInstance) {
								modalInstance.hide();
							}
						}, 3000);
					} else {
						// Error from server
						const data = await response.json();
						const errorMessage = data.error || 'There was a problem submitting your form. Please try again.';
						throw new Error(errorMessage);
					}
				} catch (error) {
					// Show error message
					showStatus('error', '<i class="bi bi-exclamation-triangle-fill"></i>' + error.message);

					// Re-enable submit button
					submitBtn.disabled = false;
					submitBtn.classList.remove('loading');
					submitBtn.innerHTML = originalButtonText;
				}
			});
		}

		/**
		 * Show status message
		 * @param {string} type - 'success' or 'error'
		 * @param {string} message - The message to display
		 */
		function showStatus(type, message) {
			if (!formStatus) return;

			formStatus.className = 'form-status ' + type;
			formStatus.innerHTML = message;
			formStatus.style.display = 'block';

			// Auto-hide error messages after 5 seconds
			if (type === 'error') {
				setTimeout(function() {
					formStatus.style.display = 'none';
				}, 5000);
			}
		}

		/**
		 * Reset form to initial state
		 */
		function resetForm() {
			if (!form) return;

			form.reset();
			form.classList.remove('was-validated');

			if (submitBtn) {
				submitBtn.disabled = false;
				submitBtn.classList.remove('loading');
				submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i>Submit';
			}

			if (formStatus) {
				formStatus.style.display = 'none';
				formStatus.className = 'form-status';
			}

			if (charCount) {
				charCount.textContent = '0';
				charCount.style.color = '#22A39F';
			}

			// Hide conditional source fields
			if (referralSourceContainer) {
				referralSourceContainer.style.display = 'none';
			}
			if (referralSourceInput) {
				referralSourceInput.value = '';
			}
			if (otherSourceContainer) {
				otherSourceContainer.style.display = 'none';
			}
			if (otherSourceInput) {
				otherSourceInput.value = '';
			}
		}

		/**
		 * Additional validation for compensation field
		 * Ensures users provide meaningful compensation info
		 */
		const compensationInput = document.getElementById('recruiterCompensation');
		if (compensationInput) {
			compensationInput.addEventListener('blur', function() {
				const value = this.value.trim();

				// Check if the field contains meaningful content
				if (value.length > 0 && value.length < 5) {
					this.setCustomValidity('Please provide a specific compensation range (e.g., $120k-$150k)');
				} else {
					const lowerValue = value.toLowerCase();
					if (lowerValue === 'competitive' || lowerValue === 'negotiable') {
						this.setCustomValidity('Please provide a specific range rather than "competitive" or "negotiable"');
					} else {
						this.setCustomValidity('');
					}
				}
			});

			compensationInput.addEventListener('input', function() {
				// Clear custom validity on input to allow revalidation
				this.setCustomValidity('');
			});
		}

		// Email validation enhancement
		const emailInput = document.getElementById('recruiterEmail');
		if (emailInput) {
			emailInput.addEventListener('blur', function() {
				const value = this.value.trim();
				const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

				if (value && !emailPattern.test(value)) {
					this.setCustomValidity('Please enter a valid email address');
				} else {
					this.setCustomValidity('');
				}
			});

			emailInput.addEventListener('input', function() {
				this.setCustomValidity('');
			});
		}
	});
})();
