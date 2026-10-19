import "server-only";

/**
 * Envoi des e-mails du formulaire. Avec RESEND_API_KEY : API REST de Resend (sans dépendance).
 * Sans clé (développement local) : le message est écrit dans la console du serveur.
 */
export interface Mail {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}

export async function sendMail(mail: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !from) {
    console.info(
      `\n[contact] E-mail non envoyé (RESEND_API_KEY ou CONTACT_FROM_EMAIL absent) → ${mail.to}\n` +
        `Objet : ${mail.subject}\n${mail.text}\n` +
        (mail.attachments?.length ? `Pièces jointes : ${mail.attachments.map((a) => a.filename).join(", ")}\n` : ""),
    );
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [mail.to],
      reply_to: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      attachments: mail.attachments,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend ${response.status} : ${await response.text()}`);
  }
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** Corps texte et HTML sobres à partir de lignes « libellé : valeur ». */
export function renderMail(intro: string[], rows: [string, string][], outro: string[] = []) {
  const text = [...intro, "", ...rows.map(([label, value]) => `${label} : ${value}`), "", ...outro].join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#382B2B">
${intro.map((line) => `<p>${escape(line)}</p>`).join("\n")}
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="vertical-align:top;color:#6B5F59;white-space:nowrap">${escape(label)}</td><td>${escape(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>
${outro.map((line) => `<p>${escape(line)}</p>`).join("\n")}
</div>`;
  return { text, html };
}
