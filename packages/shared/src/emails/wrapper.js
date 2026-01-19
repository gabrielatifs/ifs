const DEFAULT_LOGO_URL =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d92daf168696381e05/7b850198a_27May-BoardofTrusteesMeeting6.png';

const DEFAULT_BRAND_NAME = 'Independent Federation for Safeguarding';
const DEFAULT_FOOTER_ADDRESS = '6-8 Revenge Road, Chatham, ME5 8UD';
const DEFAULT_FOOTER_NOTE = 'This is an automated message, please do not reply to this email.';
const DEFAULT_CONTACT_EMAIL = 'info@ifs-safeguarding.co.uk';

const buildHeader = ({ logoUrl, brandName }) => {
  const headerContent = logoUrl
    ? `<img src="${logoUrl}" alt="${brandName} Logo" style="width: 100%; max-width: 250px; height: auto;">`
    : `<h1 style="color: white; margin: 0; font-size: 24px;">${brandName}</h1>`;

  return `<td align="center" style="padding: 20px; background-color: #5e028f;">${headerContent}</td>`;
};

const buildFooter = ({ year, address, note, contactEmail }) => {
  const contactLine = contactEmail
    ? `<p style="margin: 5px 0 0 0;"><a href="mailto:${contactEmail}" style="color: #5e028f;">${contactEmail}</a></p>`
    : '';
  const noteLine = note ? `<p style="margin: 5px 0 0 0;">${note}</p>` : '';

  return `<td align="center" style="padding: 20px; background-color: #f4f4f7; font-size: 12px; color: #777777; border-top: 1px solid #e2e2e2;">
    <p style="margin: 0;">&copy; ${year} ${DEFAULT_BRAND_NAME}. All rights reserved.</p>
    <p style="margin: 5px 0 0 0;">${address}</p>
    ${contactLine}
    ${noteLine}
  </td>`;
};

const wrapContent = (content) => {
  const safeContent = String(content ?? '').trim();
  if (!safeContent) {
    return '<tr><td style="padding: 30px 40px; color: #333; line-height: 1.6;"></td></tr>';
  }
  if (/<tr[\s>]/i.test(safeContent)) {
    return safeContent;
  }
  if (/<td[\s>]/i.test(safeContent)) {
    return `<tr>${safeContent}</tr>`;
  }
  return `<tr><td style="padding: 30px 40px; color: #333; line-height: 1.6;">${safeContent}</td></tr>`;
};

export const wrapEmailHtml = (content, options = {}) => {
  const {
    logoUrl = DEFAULT_LOGO_URL,
    brandName = DEFAULT_BRAND_NAME,
    address = DEFAULT_FOOTER_ADDRESS,
    note = DEFAULT_FOOTER_NOTE,
    contactEmail = DEFAULT_CONTACT_EMAIL,
    year = new Date().getFullYear(),
  } = options;

  const header = buildHeader({ logoUrl, brandName });
  const footer = buildFooter({ year, address, note, contactEmail });
  const bodyRows = wrapContent(content);

  return `<!DOCTYPE html><html lang="en"><body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f4f4f7;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f7" style="padding: 20px 0;">
      <tr><td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e2e2;">
          <tr>${header}</tr>
          ${bodyRows}
          <tr>${footer}</tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
};
