// helpers.js
// export function formatCurrency(value, locale, currency ) {
//   return new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency,
//   }).format(value);
// }

// helpers.js
export function formatCurrency(value, locale = "en-PH", currency = "PHP") {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });

  const formatted = formatter.format(value);

  // Force currency symbol to the front
  const currencySymbol = formatter.formatToParts(0).find(p => p.type === "currency")?.value || "";

  // Remove any existing symbol from formatted string to avoid duplication
  const numberPart = formatted.replace(currencySymbol, "").trim();

  // Combine symbol + number manually
  return `${currencySymbol}${numberPart}`;
}
