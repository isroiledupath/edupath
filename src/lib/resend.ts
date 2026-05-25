import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder');
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@edupath.uz';

export async function sendApplicationNotification({
  to,
  applicantName,
  listingTitle,
  status,
}: {
  to: string;
  applicantName: string;
  listingTitle: string;
  status: string;
}) {
  const statusMessages: Record<string, { subject: string; body: string }> = {
    under_review: {
      subject: `Your application for "${listingTitle}" is under review`,
      body: `Dear ${applicantName},\n\nYour application for "${listingTitle}" is now under review. We'll notify you of any updates.\n\nBest regards,\nEduPath Team`,
    },
    approved: {
      subject: `🎉 Congratulations! Your application for "${listingTitle}" was approved`,
      body: `Dear ${applicantName},\n\nCongratulations! Your application for "${listingTitle}" has been approved. The organizer will contact you with next steps.\n\nBest regards,\nEduPath Team`,
    },
    rejected: {
      subject: `Update on your application for "${listingTitle}"`,
      body: `Dear ${applicantName},\n\nThank you for applying to "${listingTitle}". Unfortunately, your application was not selected this time. Keep applying — there are many opportunities waiting for you on EduPath!\n\nBest regards,\nEduPath Team`,
    },
  };

  const message = statusMessages[status];
  if (!message) return;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: message.subject,
    text: message.body,
  });
}

export async function sendBookingNotification({
  to,
  studentName,
  mentorName,
  scheduledAt,
  status,
  meetingLink,
}: {
  to: string;
  studentName: string;
  mentorName: string;
  scheduledAt: string;
  status: string;
  meetingLink?: string;
}) {
  const dateStr = new Date(scheduledAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  if (status === 'confirmed') {
    return getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your mentoring session with ${mentorName} is confirmed`,
      text: `Dear ${studentName},\n\nYour mentoring session with ${mentorName} on ${dateStr} has been confirmed.\n\n${meetingLink ? `Meeting link: ${meetingLink}` : ''}\n\nBest regards,\nEduPath Team`,
    });
  }
}
