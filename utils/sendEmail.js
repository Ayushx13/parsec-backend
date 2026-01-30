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

export const sendEventPassVerifiedEmail = async (userEmail, orderId, paymentUTR, qrData) => {
    if (!qrData || !qrData.qrCodesList || qrData.qrCodesList.length === 0) {
        throw new Error('QR data with QR code list is required for event pass email');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Build QR code sections by pass type
    let qrCodesHTML = '';
    const attachments = [];
    let attachmentIndex = 0;

    const pass1Items = qrData.qrCodesList.filter(item => item.passType === 'event-pass1');
    const pass2Items = qrData.qrCodesList.filter(item => item.passType === 'event-pass2');

    // Event Pass 1 section
    if (pass1Items.length > 0) {
        qrCodesHTML += `
            <div style="margin-top: 20px; padding: 20px; background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px;">
                <h3 style="color: #333;">Event Pass 1 (valid only on 24 Jan or 26 Jan)</h3>
                <p style="color: #555;"><strong>Quantity:</strong> ${pass1Items.length} | <strong>Price per Ticket:</strong> ₹${pass1Items[0].passPrice}</p>
        `;

        pass1Items.forEach((qrItem) => {
            const cid = `qrcode${attachmentIndex}`;
            qrCodesHTML += `
                <div style="margin: 15px 0; padding: 15px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
                    <h4 style="color: #333;">Pass ${qrItem.passNumber} of ${qrItem.totalPasses}</h4>
                    <img src="cid:${cid}" alt="Event Pass 1 QR Code ${qrItem.passNumber}" style="display: block; margin: 15px auto; max-width: 250px; border: 2px solid #333; border-radius: 8px;">
                </div>
            `;

            attachments.push({
                filename: `event-pass1-qr-${qrItem.passNumber}.png`,
                content: qrItem.qrCodeBuffer,
                cid: cid
            });
            attachmentIndex++;
        });

        qrCodesHTML += `</div>`;
    }

    // Event Pass 2 section
    if (pass2Items.length > 0) {
        qrCodesHTML += `
            <div style="margin-top: 20px; padding: 20px; background-color: #d1ecf1; border: 2px solid #17a2b8; border-radius: 8px;">
                <h3 style="color: #333;">Event Pass 2 (valid only on 25 Jan or 27 Jan)</h3>
                <p style="color: #555;"><strong>Quantity:</strong> ${pass2Items.length} | <strong>Price per Ticket:</strong> ₹${pass2Items[0].passPrice}</p>
        `;

        pass2Items.forEach((qrItem) => {
            const cid = `qrcode${attachmentIndex}`;
            qrCodesHTML += `
                <div style="margin: 15px 0; padding: 15px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
                    <h4 style="color: #333;">Pass ${qrItem.passNumber} of ${qrItem.totalPasses}</h4>
                    <img src="cid:${cid}" alt="Event Pass 2 QR Code ${qrItem.passNumber}" style="display: block; margin: 15px auto; max-width: 250px; border: 2px solid #333; border-radius: 8px;">
                </div>
            `;

            attachments.push({
                filename: `event-pass2-qr-${qrItem.passNumber}.png`,
                content: qrItem.qrCodeBuffer,
                cid: cid
            });
            attachmentIndex++;
        });

        qrCodesHTML += `</div>`;
    }

    // Define email options with attachments
    const mailOptions = {
        from: `Parsec Team <${process.env.EMAIL_FROM}>`,
        to: userEmail,
        subject: `Your Parsec Event Passes (${pass1Items.length + pass2Items.length} Total) is Verified`,
        text: `Hello ${userEmail},\n\nGreat news! Your payment has been verified successfully.\n\nPayment UTR: ${paymentUTR}\nEvent Pass 1 Quantity: ${pass1Items.length}\nEvent Pass 2 Quantity: ${pass2Items.length}\nStatus: Verified\n\nYour Event Pass QR codes are attached in the email. Please show these QR codes at the event venue for entry.\n\nThank you for your purchase!`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${userEmail},</h2>
                    <p><strong>Great news!</strong> Your payment has been verified successfully.</p>
                    <p><strong>Order ID:</strong> ${orderId}<br>
                    <strong>Payment UTR:</strong> ${paymentUTR}<br>
                    <strong>Status:</strong> <span style="color: green;">✓ Verified</span></p>
                    <div style="margin-top: 20px; padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
                        <h3 style="color: #333;">Your Event Passes</h3>
                        <p>Please show these QR codes at the event venue for entry:</p>
                        ${qrCodesHTML}
                        <p style="font-size: 12px; color: #666; margin-top: 20px; text-align: center;"><strong>⚠️ Keep this email safe. You'll need these QR codes for event entry.</strong></p>
                    </div>
                    <p>Thank you for your purchase!</p>
                </div>
            `,
        attachments: attachments
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

export const sendFreePassVerifiedEmail = async (userEmail, orderId, paymentUTR, qrData) => {
    if (!qrData || !qrData.qrCodesList || qrData.qrCodesList.length === 0) {
        throw new Error('QR data with QR code list is required for free pass email');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Build QR code sections
    let qrCodesHTML = '';
    const attachments = [];
    let attachmentIndex = 0;

    // Process all passes
    qrData.qrCodesList.forEach((qrItem) => {
        const cid = `qrcode${attachmentIndex}`;
        qrCodesHTML += `
            <div style="margin: 15px 0; padding: 15px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                <h4 style="color: #333;">Pass ${qrItem.passNumber} of ${qrItem.totalPasses}</h4>
                <img src="cid:${cid}" alt="Event Pass QR Code ${qrItem.passNumber}" style="display: block; margin: 15px auto; max-width: 250px; border: 2px solid #333; border-radius: 8px;">
            </div>
        `;

        attachments.push({
            filename: `event-pass-qr-${qrItem.passNumber}.png`,
            content: qrItem.qrCodeBuffer,
            cid: cid
        });
        attachmentIndex++;
    });

    // Define email options with attachments
    const mailOptions = {
        from: `Parsec Team <${process.env.EMAIL_FROM}>`,
        to: userEmail,
        subject: `Your Parsec Opening Ceremony Free Pass (ID: ${orderId})`,
        text: `Hello ${userEmail},\n\nThank you for attending the Opening Ceremony!\n\nYour free event pass has been issued successfully.\n\nOrder ID: ${orderId}\nPayment UTR: ${paymentUTR}\nTotal Passes: ${qrData.qrCodesList.length}\n\nPlease show these QR codes at the event venue for entry.\n\nThank you!`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hello ${userEmail},</h2>
                    <div style="margin: 20px 0; padding: 20px; background-color: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 4px;">
                        <p style="margin: 0; font-size: 18px; color: #0c5460;"><strong>🎉 Thank you for attending the Opening Ceremony!</strong></p>
                    </div>
                    <p style="color: #555; font-size: 16px;">Your free event pass has been issued successfully. Please show the QR code below at the event venue for entry.</p>
                    <div style="margin-top: 20px; padding: 20px; background-color: #ffffff; border: 2px solid #17a2b8; border-radius: 8px;">
                        <h3 style="color: #333; text-align: center;">Your Event Pass</h3>
                        <p style="text-align: center; color: #666;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="text-align: center; color: #666;"><strong>Payment UTR:</strong> ${paymentUTR}</p>
                        <p style="text-align: center; color: #666;"><strong>Total Passes:</strong> ${qrData.qrCodesList.length}</p>
                        ${qrCodesHTML}
                        <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;"><strong>⚠️ Keep this email safe. You'll need these QR codes for event entry.</strong></p>
                    </div>
                    <p style="margin-top: 20px; color: #666; text-align: center;">Thank you for being part of Parsec!</p>
                </div>
            `,
        attachments: attachments
    };

    await transporter.sendMail(mailOptions);
};

export const sendAccommodationComplementaryPassEmail = async (userEmail, orderId, paymentUTR, qrData) => {
    if (!qrData || !qrData.qrCodesList || qrData.qrCodesList.length === 0) {
        throw new Error('QR data with QR code list is required for accommodation pass email');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Build QR code sections
    let qrCodesHTML = '';
    const attachments = [];
    let attachmentIndex = 0;

    // Process all passes
    qrData.qrCodesList.forEach((qrItem) => {
        const cid = `qrcode${attachmentIndex}`;
        qrCodesHTML += `
            <div style="margin: 15px 0; padding: 15px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
                <h4 style="color: #333;">Pass ${qrItem.passNumber} of ${qrItem.totalPasses}</h4>
                <img src="cid:${cid}" alt="Accommodation Pass QR Code ${qrItem.passNumber}" style="display: block; margin: 15px auto; max-width: 250px; border: 2px solid #333; border-radius: 8px;">
            </div>
        `;

        attachments.push({
            filename: `accommodation-cultural-pass-qr-${qrItem.passNumber}.png`,
            content: qrItem.qrCodeBuffer,
            cid: cid
        });
        attachmentIndex++;
    });

    // Define email options with attachments
    const mailOptions = {
        from: `Parsec Team <${process.env.EMAIL_FROM}>`,
        to: userEmail,
        subject: `Your Parsec Accommodation Cultural Event Pass (ID: ${orderId})`,
        text: `Hello ${userEmail},\n\nWelcome to Parsec! As an accommodation guest, you have been issued a complimentary cultural event pass.\n\nOrder ID: ${orderId}\nPayment UTR: ${paymentUTR}\nTotal Passes: ${qrData.qrCodesList.length}\n\nPlease show this QR code at the cultural event venue for entry.\n\nThank you!`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hello ${userEmail},</h2>
                    <div style="margin: 20px 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <p style="margin: 0; font-size: 18px; color: #856404;"><strong>🎭 Welcome to Parsec!</strong></p>
                    </div>
                    <p style="color: #555; font-size: 16px;">With the accommodation booking you have been issued a complimentary cultural event pass. This pass grants you access to our exclusive cultural events during the PARSEC 6.0 Fest.</p>
                    <div style="margin-top: 20px; padding: 20px; background-color: #ffffff; border: 2px solid #ffc107; border-radius: 8px;">
                        <h3 style="color: #333; text-align: center;">Your Accommodation Cultural Event Pass</h3>
                        <p style="text-align: center; color: #666;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="text-align: center; color: #666;"><strong>Payment UTR:</strong> ${paymentUTR}</p>
                        <p style="text-align: center; color: #666;"><strong>Total Passes:</strong> ${qrData.qrCodesList.length}</p>
                        <p style="text-align: center; color: #666; font-style: italic;"><strong>🎁 Complimentary Pass</strong></p>
                        ${qrCodesHTML}
                        <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;"><strong>⚠️ Keep this email safe. You'll need this QR code for event entry.</strong></p>
                    </div>
                    <p style="margin-top: 20px; color: #666; text-align: center;">Enjoy the cultural events and make the most of your stay at Parsec!</p>
                </div>
            `,
        attachments: attachments
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
