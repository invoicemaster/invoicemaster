/* Bot-safe email wireup.
   The email address is never written as plain text in the HTML — only as
   split data-* attributes that JS assembles into a mailto: at runtime.
   Bots that don't execute JS won't see a scrapable address. */

export function wireEmailLinks() {
  document.querySelectorAll('.email-link[data-u][data-d]').forEach((a) => {
    if (a.dataset.wired) return;
    const user = a.dataset.u;
    const domain = a.dataset.d;
    const address = `${user}@${domain}`;
    a.href = `mailto:${address}`;
    a.dataset.wired = '1';
  });
}
