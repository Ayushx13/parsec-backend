import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define email options
    const mailOptions = {
        from: `Parsec Team <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // Send email
    await transporter.sendMail(mailOptions);
};




export const sendOrderUnderReviewEmail = async (userEmail, orderId, paymentUTR, amount) => {
    await sendEmail({
        email: userEmail,
        subject: `Your Parsec Order (ID: ${orderId}) is Under Review`,
        message: `Hello ${userEmail},\n\nWe have received your order and it is currently under review.\n\nPayment UTR: ${paymentUTR}\nAmount: ₹${amount}\n\nYou will receive a confirmation email once the payment is verified by our team.\n\nThank you for your patience!`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${userEmail},</h2>
                    <p>We have received your order (ID: ${orderId}) and it is currently under review.</p>
                    <p><strong>Payment UTR:</strong> ${paymentUTR}<br>
                    <strong>Amount:</strong> ₹${amount}</p>
                    <p>You will receive a confirmation email once the payment is verified by our team.</p>
                    <p>Thank you for your patience!</p>
                </div>
            `
    });
};




export const sendPaymentVerifiedEmail = async (userEmail, orderId, paymentUTR, amount) => {
    await sendEmail({
        email: userEmail,
        subject: `Your Parsec Order (ID: ${orderId}) Payment is Verified`,
        message: `Hello ${userEmail},\n\nGreat news! Your payment has been verified successfully.\n\nPayment UTR: ${paymentUTR}\nAmount: ₹${amount}\nStatus: Verified\n\nYour order will now be processed and shipped soon.\n\nThank you for your purchase!`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${userEmail},</h2>
                    <p><strong>Great news!</strong> Your payment has been verified successfully.</p>
                    <p><strong>Order ID:</strong> ${orderId}<br>
                    <strong>Payment UTR:</strong> ${paymentUTR}<br>
                    <strong>Amount:</strong> ₹${amount}<br>
                    <strong>Status:</strong> <span style="color: green;">✓ Verified</span></p>
                    <p>Your order will now be processed and shipped soon.</p>
                    <p>Thank you for your purchase!</p>
                </div>
            `
    });
};

export const sendOrderRejectedEmail = async (userEmail, orderId, paymentUTR, amount) => {
    await sendEmail({
        email: userEmail,
        subject: `Your Parsec Order (ID: ${orderId}) Payment Was Not Verified`,
        message: `Hello ${userEmail},\n\nWe regret to inform you that we were unable to verify your payment.\n\nPayment UTR: ${paymentUTR}\nAmount: ₹${amount}\nStatus: Rejected\n\nThis could be due to incorrect payment details or a failed transaction. Please check your payment information and try again.\n\nIf you believe this is an error, please contact our support team.\n\nThank you for your understanding.`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${userEmail},</h2>
                    <p>We regret to inform you that we were unable to verify your payment.</p>
                    <p><strong>Order ID:</strong> ${orderId}<br>
                    <strong>Payment UTR:</strong> ${paymentUTR}<br>
                    <strong>Amount:</strong> ₹${amount}<br>
                    <strong>Status:</strong> <span style="color: red;">✗ Rejected</span></p>
                    <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
                        <p style="margin: 0; color: #721c24;"><strong>⚠️ Reason:</strong> This could be due to incorrect payment details or a failed transaction. Please check your payment information and try again.</p>
                    </div>
                    <p>If you believe this is an error, please contact our support team.</p>
                    <p>Thank you for your understanding.</p>
                </div>
            `
    });
};

export const sendEventPassVerifiedEmail = async (userEmail, orderId, paymentUTR, qrData, qrCodeBuffer) => {
    if (!qrData || !qrCodeBuffer) {
        throw new Error('QR data and QR code buffer are required for event pass email');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define email options with attachment
    const mailOptions = {
        from: `Parsec Team <${process.env.EMAIL_FROM}>`,
        to: userEmail,
        subject: `Your Parsec ${qrData.passType === 'event-pass1' ? 'Event Pass 1' : 'Event Pass 2'} is Verified`,
        text: `Hello ${userEmail},\n\nGreat news! Your payment has been verified successfully.\n\nPayment UTR: ${paymentUTR}\nPass Type: ${qrData.passType === 'event-pass1' ? 'Event Pass 1' : 'Event Pass 2'}\nPass Price: ₹${qrData.passPrice}\nStatus: Verified\n\nYour Event Pass QR code is attached in the email. Please show this QR code at the event venue for entry.\n\nThank you for your purchase!`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${userEmail},</h2>
                    <p><strong>Great news!</strong> Your payment has been verified successfully.</p>
                    <p><strong>Order ID:</strong> ${orderId}<br>
                    <strong>Payment UTR:</strong> ${paymentUTR}<br>
                    <strong>Pass Type:</strong> ${qrData.passType === 'event-pass1' ? 'Event Pass 1' : 'Event Pass 2'} (valid only on 24 jan or 26 jan)<br>
                    <strong>Pass Price:</strong> ₹${qrData.passPrice}<br>
                    <strong>Status:</strong> <span style="color: green;">✓ Verified</span></p>
                    <div style="margin-top: 20px; padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
                        <h3 style="color: #333;">Your ${qrData.passType === 'event-pass1' ? 'Event Pass 1' : 'Event Pass 2'} QR Code</h3>
                        <p>Please show this QR code at the event venue for entry:</p>
                        <img src="cid:qrcode" alt="Event Pass QR Code" style="display: block; margin: 20px auto; max-width: 300px; border: 2px solid #333; border-radius: 8px;">
                        <p style="font-size: 12px; color: #666; text-align: center;"><strong>⚠️ Keep this email safe. You'll need this QR code for event entry.</strong></p>
                    </div>
                    <p>Thank you for your purchase!</p>
                </div>
            `,
        attachments: [{
            filename: 'event-pass-qr.png',
            content: qrCodeBuffer,
            cid: 'qrcode'
        }]
    };

    await transporter.sendMail(mailOptions);
};

export const sendAccommodationPaymentUnderReviewEmail = async (userEmail, bookingId, paymentUTR, amount, bookingDetails) => {
    await sendEmail({
        email: userEmail,
        subject: `Your Parsec Accommodation Booking (ID: ${bookingId}) is Under Review`,
        message: `Hello ${userEmail},\n\nWe have received your accommodation booking payment and it is currently under review.\n\nPayment UTR: ${paymentUTR}\nAmount: ₹${amount}\nCheck-in: ${new Date(bookingDetails.checkInDate).toDateString()}\nCheck-out: ${new Date(bookingDetails.checkOutDate).toDateString()}\nNumber of Nights: ${bookingDetails.numberOfNights}\n\nYou will receive a confirmation email once the payment is verified by our team.\n\nThank you for your patience!`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${userEmail},</h2>
                    <p>We have received your accommodation booking payment (ID: ${bookingId}) and it is currently under review.</p>
                    <p><strong>Payment UTR:</strong> ${paymentUTR}<br>
                    <strong>Amount:</strong> ₹${amount}<br>
                    <strong>Check-in Date:</strong> ${new Date(bookingDetails.checkInDate).toDateString()}<br>
                    <strong>Check-out Date:</strong> ${new Date(bookingDetails.checkOutDate).toDateString()}<br>
                    <strong>Number of Nights:</strong> ${bookingDetails.numberOfNights}</p>
                    <p>You will receive a confirmation email once the payment is verified by our team.</p>
                    <p>Thank you for your patience!</p>
                </div>
            `
    });
};

export const sendAccommodationConfirmedEmail = async (userEmail, bookingId, paymentUTR, amount, bookingDetails) => {
    await sendEmail({
        email: userEmail,
        subject: `Your Parsec Accommodation Booking (ID: ${bookingId}) is Confirmed`,
        message: `Hello ${userEmail},\n\nGreat news! Your accommodation booking has been confirmed.\n\nPayment UTR: ${paymentUTR}\nAmount: ₹${amount}\nCheck-in: ${new Date(bookingDetails.checkInDate).toDateString()}\nCheck-out: ${new Date(bookingDetails.checkOutDate).toDateString()}\nNumber of Nights: ${bookingDetails.numberOfNights}\nStatus: Confirmed\n\nPlease arrive at the venue on your check-in date. Carry a valid ID for verification. Your room number will be provided upon reaching IIT Dharwad.\n\nThank you for booking with us!`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${userEmail},</h2>
                    <p><strong>Great news!</strong> Your accommodation booking has been confirmed.</p>
                    <p><strong>Booking ID:</strong> ${bookingId}<br>
                    <strong>Payment UTR:</strong> ${paymentUTR}<br>
                    <strong>Amount:</strong> ₹${amount}<br>
                    <strong>Check-in Date:</strong> ${new Date(bookingDetails.checkInDate).toDateString()}<br>
                    <strong>Check-out Date:</strong> ${new Date(bookingDetails.checkOutDate).toDateString()}<br>
                    <strong>Number of Nights:</strong> ${bookingDetails.numberOfNights}<br>
                    <strong>Status:</strong> <span style="color: green;">✓ Confirmed</span></p>
                    <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <p style="margin: 0;"><strong>⚠️ Important:</strong> Please arrive at the venue on your check-in date and carry a valid ID for verification. Your room number will be provided upon reaching IIT Dharwad.</p>
                    </div>
                    <p>Thank you !!</p>
                </div>
            `
    });
};

export const sendAccommodationRejectedEmail = async (userEmail, bookingId, paymentUTR, amount, bookingDetails) => {
    await sendEmail({
        email: userEmail,
        subject: `Your Parsec Accommodation Booking (ID: ${bookingId}) Payment Was Not Verified`,
        message: `Hello ${userEmail},\n\nWe regret to inform you that we were unable to verify your accommodation booking payment.\n\nPayment UTR: ${paymentUTR}\nAmount: ₹${amount}\nCheck-in: ${new Date(bookingDetails.checkInDate).toDateString()}\nCheck-out: ${new Date(bookingDetails.checkOutDate).toDateString()}\nNumber of Nights: ${bookingDetails.numberOfNights}\nStatus: Rejected\n\nThis could be due to incorrect payment details or a failed transaction. Please check your payment information and try again.\n\nIf you believe this is an error, please contact our support team.\n\nThank you for your understanding.`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${userEmail},</h2>
                    <p>We regret to inform you that we were unable to verify your accommodation booking payment.</p>
                    <p><strong>Booking ID:</strong> ${bookingId}<br>
                    <strong>Payment UTR:</strong> ${paymentUTR}<br>
                    <strong>Amount:</strong> ₹${amount}<br>
                    <strong>Check-in Date:</strong> ${new Date(bookingDetails.checkInDate).toDateString()}<br>
                    <strong>Check-out Date:</strong> ${new Date(bookingDetails.checkOutDate).toDateString()}<br>
                    <strong>Number of Nights:</strong> ${bookingDetails.numberOfNights}<br>
                    <strong>Status:</strong> <span style="color: red;">✗ Rejected</span></p>
                    <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
                        <p style="margin: 0; color: #721c24;"><strong>⚠️ Reason:</strong> This could be due to incorrect payment details or a failed transaction. Please check your payment information and try again.</p>
                    </div>
                    <p>If you believe this is an error, please contact our support team.</p>
                    <p>Thank you for your understanding.</p>
                </div>
            `
    });
};

export default sendEmail;
